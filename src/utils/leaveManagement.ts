import { formatISO, getYear, parseISO } from "date-fns";
import type {
	LeaveBalance,
	LeaveHistory,
	LeaveReservation,
	LeaveSession,
	LeaveType,
} from "../types/leave";
import { deductLeaveByFIFO, getWeekday } from "./leave";

/**
 * 사용자의 연차 used 값을 수정하고 remain 값을 재계산합니다.
 */
export function updateLeaveUsed(
	balances: LeaveBalance[],
	userId: string,
	year: number,
	newUsed: number,
): LeaveBalance[] {
	return balances.map((balance) => {
		if (balance.user_id === userId && balance.year === year) {
			const newRemain = balance.total - newUsed;
			return {
				...balance,
				used: newUsed,
				remain: Math.max(newRemain, 0),
			};
		}
		return balance;
	});
}

/**
 * 연차를 추가하고 데이터를 업데이트합니다.
 */
export function addLeaveReservation(
	balances: LeaveBalance[],
	reservations: LeaveReservation[],
	history: LeaveHistory[],
	userId: string,
	date: string,
	type: LeaveType,
	session: LeaveSession,
	isApproved = false,
): {
	balances: LeaveBalance[];
	reservations: LeaveReservation[];
	history: LeaveHistory[];
} {
	const amount = type === "FULL" ? 1.0 : 0.5;

	const currentTime = Date.now();

	if (isApproved) {
		// 승인된 경우: FIFO로 연차 차감 및 히스토리 추가
		const userBalances = balances.filter((b) => b.user_id === userId);
		const deductionResult = deductLeaveByFIFO(userBalances, amount);

		if (!deductionResult.success) {
			throw new Error("잔여 연차가 부족합니다.");
		}

		// balances 업데이트
		const updatedBalances = balances.map((balance) => {
			const updated = deductionResult.remainingBalances.find(
				(b) => b.user_id === balance.user_id && b.year === balance.year,
			);
			return updated || balance;
		});

		// history 추가
		const requestDate = parseISO(date);
		const sourceYear =
			deductionResult.deductions.length > 0
				? deductionResult.deductions[0].year
				: getYear(currentTime);

		const newHistory: LeaveHistory = {
			id: Math.max(...history.map((h) => h.id), 0) + 1,
			user_id: userId,
			date,
			type,
			session,
			amount,
			weekday: getWeekday(requestDate),
			source_year: sourceYear,
			used_at: formatISO(currentTime),
		};

		return {
			balances: updatedBalances,
			reservations,
			history: [...history, newHistory],
		};
	}

	// 예약만 추가
	const newReservation: LeaveReservation = {
		id: Math.max(...reservations.map((r) => r.id), 0) + 1,
		user_id: userId,
		date,
		type,
		session,
		amount,
		status: "RESERVED",
		created_at: formatISO(currentTime),
	};

	return {
		balances,
		reservations: [...reservations, newReservation],
		history,
	};
}

/**
 * 예약된 연차를 승인하고 히스토리로 이동합니다.
 */
export function approveLeaveReservation(
	balances: LeaveBalance[],
	reservations: LeaveReservation[],
	history: LeaveHistory[],
	reservationId: number,
): {
	balances: LeaveBalance[];
	reservations: LeaveReservation[];
	history: LeaveHistory[];
} {
	const reservation = reservations.find((r) => r.id === reservationId);
	if (!reservation) {
		throw new Error("예약을 찾을 수 없습니다.");
	}

	// FIFO로 연차 차감
	const userBalances = balances.filter((b) => b.user_id === reservation.user_id);
	const deductionResult = deductLeaveByFIFO(userBalances, reservation.amount);

	if (!deductionResult.success) {
		throw new Error("잔여 연차가 부족합니다.");
	}

	// balances 업데이트
	const updatedBalances = balances.map((balance) => {
		const updated = deductionResult.remainingBalances.find(
			(b) => b.user_id === balance.user_id && b.year === balance.year,
		);
		return updated || balance;
	});

	// reservation 상태 변경
	const updatedReservations = reservations.map((r) =>
		r.id === reservationId ? { ...r, status: "USED" as const } : r,
	);

	// history 추가
	const requestDate = parseISO(reservation.date);
	const currentTime = Date.now();
	const sourceYear =
		deductionResult.deductions.length > 0
			? deductionResult.deductions[0].year
			: getYear(currentTime);

	const newHistory: LeaveHistory = {
		id: Math.max(...history.map((h) => h.id), 0) + 1,
		user_id: reservation.user_id,
		date: reservation.date,
		type: reservation.type,
		session: reservation.session,
		amount: reservation.amount,
		weekday: getWeekday(requestDate),
		source_year: sourceYear,
		used_at: formatISO(currentTime),
	};

	return {
		balances: updatedBalances,
		reservations: updatedReservations,
		history: [...history, newHistory],
	};
}

/**
 * 예약된 연차를 취소합니다.
 */
export function cancelLeaveReservation(
	reservations: LeaveReservation[],
	reservationId: number,
): LeaveReservation[] {
	return reservations.map((r) =>
		r.id === reservationId ? { ...r, status: "CANCELLED" as const } : r,
	);
}

/**
 * 사용된 연차(히스토리)를 취소하고 연차를 복구합니다.
 */
export function cancelLeaveHistory(
	balances: LeaveBalance[],
	history: LeaveHistory[],
	historyId: number,
): {
	balances: LeaveBalance[];
	history: LeaveHistory[];
} {
	const historyItem = history.find((h) => h.id === historyId);
	if (!historyItem) {
		throw new Error("히스토리를 찾을 수 없습니다.");
	}

	// 연차 복구
	const updatedBalances = balances.map((balance) => {
		if (
			balance.user_id === historyItem.user_id &&
			balance.year === historyItem.source_year
		) {
			return {
				...balance,
				used: balance.used - historyItem.amount,
				remain: balance.remain + historyItem.amount,
			};
		}
		return balance;
	});

	// 히스토리 삭제
	const updatedHistory = history.filter((h) => h.id !== historyId);

	return {
		balances: updatedBalances,
		history: updatedHistory,
	};
}

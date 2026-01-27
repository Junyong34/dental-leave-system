import {
	differenceInYears,
	getDay,
	isSunday as dateFnsIsSunday,
	parseISO,
	startOfToday,
} from "date-fns";
import type {
	LeaveBalance,
	LeaveDeductionResult,
	LeaveReservation,
	LeaveSession,
	LeaveStatus,
	LeaveType,
	LeaveValidationResult,
	Weekday,
} from "../types/leave";

/**
 * 근속연수를 기반으로 연차 일수를 계산합니다.
 * 기본 연차: 15일
 * 근속 2년 초과 시마다 +1일
 * 최대 연차: 25일
 *
 * 계산식: min(15 + floor((근속연수 - 1) / 2), 25)
 */
export function calculateAnnualLeave(yearsOfService: number): number {
	if (yearsOfService < 1) {
		return 0;
	}

	const baseLeave = 15;
	const additionalLeave = Math.floor((yearsOfService - 1) / 2);
	const totalLeave = baseLeave + additionalLeave;

	return Math.min(totalLeave, 25);
}

/**
 * 입사일을 기준으로 근속연수를 계산합니다.
 */
export function calculateYearsOfService(
	joinDate: Date,
	baseDate: Date = startOfToday(),
): number {
	return differenceInYears(baseDate, joinDate);
}

/**
 * 연차 잔액을 계산합니다.
 * 총 연차 - 사용 완료 - 사용 예정
 */
export function calculateLeaveBalance(
	totalLeave: number,
	usedLeave: number,
	reservedLeave: number,
): number {
	const balance = totalLeave - usedLeave - reservedLeave;

	return Math.max(balance, 0);
}

/**
 * 반차 사용 가능 여부를 확인합니다.
 * 최소 0.5일 이상 잔여 연차가 있어야 합니다.
 */
export function canUseHalfDayLeave(remainingLeave: number): boolean {
	return remainingLeave >= 0.5;
}

/**
 * 연차 사용 가능 여부를 확인합니다.
 * 최소 1.0일 이상 잔여 연차가 있어야 합니다.
 */
export function canUseFullDayLeave(remainingLeave: number): boolean {
	return remainingLeave >= 1.0;
}

/**
 * 요일이 일요일인지 확인합니다.
 * 일요일은 연차 사용이 불가능합니다.
 */
export function isSunday(date: Date): boolean {
	return dateFnsIsSunday(date);
}

/**
 * Date 객체를 Weekday 타입으로 변환합니다.
 */
export function getWeekday(date: Date): Weekday {
	const dayIndex = getDay(date);
	const weekdays: Weekday[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
	return weekdays[dayIndex];
}

/**
 * 사용자 연차 현황을 조회합니다.
 */
export function getLeaveStatus(
	userId: string,
	balances: LeaveBalance[],
	reservations: LeaveReservation[],
): LeaveStatus {
	// 사용자의 연차 잔액만 필터링
	const userBalances = balances.filter((b) => b.user_id === userId);

	// 전체 발생 연차 계산 (모든 연도 합계)
	const totalLeave = userBalances.reduce((sum, b) => sum + b.total, 0);

	// 사용 완료된 연차
	const usedLeave = userBalances.reduce((sum, b) => sum + b.used, 0);

	// 예약된 연차 (RESERVED 상태만)
	const reservedLeave = reservations
		.filter((r) => r.user_id === userId && r.status === "RESERVED")
		.reduce((sum, r) => sum + r.amount, 0);

	// 잔여 연차
	const remainLeave = userBalances.reduce((sum, b) => sum + b.remain, 0);

	// 가장 빨리 만료되는 연차 찾기
	const balancesWithRemaining = userBalances
		.filter((b) => b.remain > 0)
		.sort((a, b) => a.expire_at.localeCompare(b.expire_at));

	const nearestExpiry = balancesWithRemaining.length
		? {
				year: balancesWithRemaining[0].year,
				amount: balancesWithRemaining[0].remain,
				expire_at: balancesWithRemaining[0].expire_at,
			}
		: null;

	return {
		user_id: userId,
		total: totalLeave,
		used: usedLeave,
		reserved: reservedLeave,
		remain: remainLeave,
		balances: userBalances,
		nearest_expiry: nearestExpiry,
	};
}

/**
 * FIFO 방식으로 연차를 차감합니다.
 * 만료일이 가까운 연차부터 차감합니다.
 */
export function deductLeaveByFIFO(
	balances: LeaveBalance[],
	amount: number,
): LeaveDeductionResult {
	// 만료일 기준 오름차순 정렬 (오래된 것부터)
	const sortedBalances = [...balances]
		.filter((b) => b.remain > 0)
		.sort((a, b) => a.expire_at.localeCompare(b.expire_at));

	let remainingAmount = amount;
	const deductions: Array<{ year: number; amount: number }> = [];
	const updatedBalances = balances.map((b) => ({ ...b }));

	for (const balance of sortedBalances) {
		if (remainingAmount <= 0) break;

		const deductAmount = Math.min(balance.remain, remainingAmount);

		// 차감 기록
		deductions.push({
			year: balance.year,
			amount: deductAmount,
		});

		// 잔액 업데이트
		const targetBalance = updatedBalances.find(
			(b) => b.user_id === balance.user_id && b.year === balance.year,
		);
		if (targetBalance) {
			targetBalance.used += deductAmount;
			targetBalance.remain -= deductAmount;
		}

		remainingAmount -= deductAmount;
	}

	return {
		success: remainingAmount === 0,
		deductions,
		remainingBalances: updatedBalances,
	};
}

/**
 * 연차 신청의 유효성을 검증합니다.
 */
export function validateLeaveRequest(
	date: string,
	type: LeaveType,
	session: LeaveSession,
	remainingLeave: number,
	existingReservations: LeaveReservation[],
): LeaveValidationResult {
	// 날짜 파싱
	const requestDate = parseISO(date);

	// 1. 일요일 체크
	if (isSunday(requestDate)) {
		return {
			valid: false,
			error: "일요일에는 연차를 사용할 수 없습니다.",
			errorCode: "SUNDAY_NOT_ALLOWED",
		};
	}

	// 2. 잔여 연차 확인
	const requiredAmount = type === "FULL" ? 1.0 : 0.5;
	if (remainingLeave < requiredAmount) {
		return {
			valid: false,
			error: "잔여 연차가 부족합니다.",
			errorCode: "INSUFFICIENT_LEAVE",
		};
	}

	// 3. 중복 예약 확인
	const sameDateReservations = existingReservations.filter(
		(r) => r.date === date && r.status === "RESERVED",
	);

	if (sameDateReservations.length > 0) {
		// 연차가 이미 있는 경우
		if (sameDateReservations.some((r) => r.type === "FULL")) {
			return {
				valid: false,
				error: "해당 날짜에 이미 연차가 등록되어 있습니다.",
				errorCode: "DUPLICATE_RESERVATION",
			};
		}

		// 반차인 경우 같은 세션 체크
		if (type === "HALF" && session) {
			const sameSessionExists = sameDateReservations.some(
				(r) => r.type === "HALF" && r.session === session,
			);
			if (sameSessionExists) {
				return {
					valid: false,
					error: "해당 날짜의 같은 시간대에 이미 반차가 등록되어 있습니다.",
					errorCode: "INVALID_HALF_DAY",
				};
			}
		}
	}

	// 4. 반차의 경우 세션 필수
	if (type === "HALF" && !session) {
		return {
			valid: false,
			error: "반차는 오전(AM) 또는 오후(PM)를 선택해야 합니다.",
			errorCode: "INVALID_HALF_DAY",
		};
	}

	return { valid: true };
}

/**
 * 잔여 연차를 계산합니다 (모든 연도 합계)
 */
export function calculateRemainingLeave(balances: LeaveBalance[]): number {
	return balances.reduce((sum, b) => sum + b.remain, 0);
}

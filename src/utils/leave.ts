import { isSunday as dateFnsIsSunday, parseISO } from "date-fns";
import type {
	LeaveBalance,
	LeaveReservation,
	LeaveSession,
	LeaveStatus,
	LeaveType,
	LeaveValidationResult,
} from "../types/leave";

/**
 * 요일이 일요일인지 확인합니다.
 * 일요일은 연차 사용이 불가능합니다.
 */
function isSunday(date: Date): boolean {
	return dateFnsIsSunday(date);
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
		// 3-1. 종일 연차가 이미 있는 경우 - 어떤 신청도 불가
		if (sameDateReservations.some((r) => r.type === "FULL")) {
			return {
				valid: false,
				error: "해당 날짜에 이미 종일 연차가 등록되어 있습니다.",
				errorCode: "DUPLICATE_RESERVATION",
			};
		}

		// 3-2. 반차가 이미 있는 경우
		const hasHalfDay = sameDateReservations.some((r) => r.type === "HALF");

		if (hasHalfDay) {
			// 종일 연차 신청 시 차단 (0.5 + 1.0 = 1.5일이 되므로)
			if (type === "FULL") {
				return {
					valid: false,
					error:
						"해당 날짜에 이미 반차가 등록되어 있어 종일 연차를 신청할 수 없습니다.",
					errorCode: "DUPLICATE_RESERVATION",
				};
			}

			// 반차 신청 시 같은 세션 체크
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

/**
 * 연차 관리 시스템 타입 정의
 */

// 사용자 상태
export type UserStatus = "ACTIVE" | "INACTIVE" | "RESIGNED";

// 사용자 권한
export type UserRole = "ADMIN" | "USER" | "VIEW";

// 연차 타입
export type LeaveType = "FULL" | "HALF";

// 반차 세션
export type LeaveSession = "AM" | "PM" | null;

// 예약 상태
export type ReservationStatus = "RESERVED" | "USED" | "CANCELLED";

// 요일
export type Weekday = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

/**
 * 사용자 정보
 */
export interface User {
	user_id: string;
	name: string;
	join_date: string; // YYYY-MM-DD
	group_id: string;
	role: UserRole;
	status: UserStatus;
}

/**
 * 연차 잔액 (연도별)
 */
export interface LeaveBalance {
	user_id: string;
	year: number;
	total: number; // 해당 연도 발생 연차 (0.5 단위)
	used: number; // 사용한 연차 (0.5 단위)
	remain: number; // 잔여 연차 (0.5 단위)
	expire_at: string; // 만료일 YYYY-MM-DD
}

/**
 * 연차 예약
 */
export interface LeaveReservation {
	id: number;
	user_id: string;
	date: string; // YYYY-MM-DD
	type: LeaveType;
	session: LeaveSession; // HALF일 경우 AM/PM
	amount: number; // 1.0 or 0.5
	status: ReservationStatus;
	created_at: string; // ISO 8601
}

/**
 * 연차 사용 이력
 */
export interface LeaveHistory {
	id: number;
	user_id: string;
	date: string; // YYYY-MM-DD
	type: LeaveType;
	session: LeaveSession;
	amount: number; // 1.0 or 0.5
	weekday: Weekday;
	source_year: number; // 차감된 연차의 발생 연도 (FIFO)
	used_at: string; // ISO 8601
}

/**
 * 요일별 사용 통계
 */
export interface LeaveUsageStats {
	user_id: string;
	weekday: Weekday;
	total_used: number; // 해당 요일에 사용한 총 연차 (0.5 단위)
	count: number; // 사용 횟수
}

/**
 * 사용자 연차 현황 조회 결과
 */
export interface LeaveStatus {
	user_id: string;
	total: number; // 전체 발생 연차 (모든 연도 합계)
	used: number; // 사용 완료된 연차
	reserved: number; // 예약된 연차
	remain: number; // 잔여 연차
	balances: LeaveBalance[]; // 연도별 상세 잔액
	nearest_expiry: {
		year: number;
		amount: number;
		expire_at: string;
	} | null;
}

/**
 * 연차 신청 유효성 검증 결과
 */
export interface LeaveValidationResult {
	valid: boolean;
	error?: string;
	errorCode?:
		| "INSUFFICIENT_LEAVE"
		| "SUNDAY_NOT_ALLOWED"
		| "DUPLICATE_RESERVATION"
		| "INVALID_DATE"
		| "GROUP_LIMIT_EXCEEDED"
		| "INVALID_HALF_DAY";
}

/**
 * 연차 차감 결과
 */
export interface LeaveDeductionResult {
	success: boolean;
	deductions: Array<{
		year: number;
		amount: number;
	}>;
	remainingBalances: LeaveBalance[];
}

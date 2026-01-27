import {
  isSunday as dateFnsIsSunday,
  differenceInYears,
  startOfToday,
} from 'date-fns'

/**
 * 근속연수를 기반으로 연차 일수를 계산합니다.
 * 기본 연차: 15일
 * 근속 2년 초과 시마다 +1일
 * 최대 연차: 25일
 */
export function calculateAnnualLeave(yearsOfService: number): number {
  if (yearsOfService < 1) {
    return 0
  }

  const baseLeave = 15
  const additionalLeave = Math.floor((yearsOfService - 1) / 2)
  const totalLeave = baseLeave + additionalLeave

  return Math.min(totalLeave, 25)
}

/**
 * 입사일을 기준으로 근속연수를 계산합니다.
 */
export function calculateYearsOfService(
  joinDate: Date,
  baseDate: Date = startOfToday(),
): number {
  return differenceInYears(baseDate, joinDate)
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
  const balance = totalLeave - usedLeave - reservedLeave

  return Math.max(balance, 0)
}

/**
 * 반차 사용 가능 여부를 확인합니다.
 * 최소 0.5일 이상 잔여 연차가 있어야 합니다.
 */
export function canUseHalfDayLeave(remainingLeave: number): boolean {
  return remainingLeave >= 0.5
}

/**
 * 연차 사용 가능 여부를 확인합니다.
 * 최소 1.0일 이상 잔여 연차가 있어야 합니다.
 */
export function canUseFullDayLeave(remainingLeave: number): boolean {
  return remainingLeave >= 1.0
}

/**
 * 요일이 일요일인지 확인합니다.
 * 일요일은 연차 사용이 불가능합니다.
 */
export function isSunday(date: Date): boolean {
  return dateFnsIsSunday(date)
}

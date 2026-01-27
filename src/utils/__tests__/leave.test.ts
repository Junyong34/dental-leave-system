import { describe, it, expect } from 'vitest'
import {
	calculateAnnualLeave,
	calculateYearsOfService,
	calculateLeaveBalance,
	canUseHalfDayLeave,
	canUseFullDayLeave,
	isSunday,
} from '../leave'

describe('leave utils', () => {
	describe('calculateAnnualLeave', () => {
		it('근속 1년 미만이면 0일을 반환한다', () => {
			expect(calculateAnnualLeave(0)).toBe(0)
		})

		it('근속 1년이면 기본 연차 15일을 반환한다', () => {
			expect(calculateAnnualLeave(1)).toBe(15)
		})

		it('근속 2년이면 15일을 반환한다', () => {
			expect(calculateAnnualLeave(2)).toBe(15)
		})

		it('근속 3년이면 16일을 반환한다 (2년 초과마다 +1일)', () => {
			expect(calculateAnnualLeave(3)).toBe(16)
		})

		it('근속 5년이면 17일을 반환한다', () => {
			expect(calculateAnnualLeave(5)).toBe(17)
		})

		it('근속 21년 이상이면 최대 25일을 반환한다', () => {
			expect(calculateAnnualLeave(21)).toBe(25)
			expect(calculateAnnualLeave(30)).toBe(25)
		})

		it('근속연수에 따른 연차 계산이 올바르다', () => {
			const testCases = [
				{ years: 1, expected: 15 },
				{ years: 2, expected: 15 },
				{ years: 3, expected: 16 },
				{ years: 4, expected: 16 },
				{ years: 5, expected: 17 },
				{ years: 10, expected: 19 },
				{ years: 15, expected: 22 },
				{ years: 20, expected: 24 },
			]

			for (const { years, expected } of testCases) {
				expect(calculateAnnualLeave(years)).toBe(expected)
			}
		})
	})

	describe('calculateYearsOfService', () => {
		it('입사일로부터 정확한 근속연수를 계산한다', () => {
			const joinDate = new Date('2020-01-01')
			const baseDate = new Date('2025-01-01')

			expect(calculateYearsOfService(joinDate, baseDate)).toBe(5)
		})

		it('1년 미만인 경우 0을 반환한다', () => {
			const joinDate = new Date('2024-06-01')
			const baseDate = new Date('2024-12-31')

			expect(calculateYearsOfService(joinDate, baseDate)).toBe(0)
		})

		it('정확히 1년인 경우 1을 반환한다', () => {
			const joinDate = new Date('2024-01-01')
			const baseDate = new Date('2025-01-01')

			expect(calculateYearsOfService(joinDate, baseDate)).toBe(1)
		})

		it('baseDate가 없으면 현재 날짜를 기준으로 계산한다', () => {
			const joinDate = new Date('2023-01-01')
			const years = calculateYearsOfService(joinDate)

			expect(years).toBeGreaterThanOrEqual(1)
		})
	})

	describe('calculateLeaveBalance', () => {
		it('잔여 연차를 올바르게 계산한다', () => {
			expect(calculateLeaveBalance(15, 5, 2)).toBe(8)
		})

		it('사용 연차가 없으면 전체 연차를 반환한다', () => {
			expect(calculateLeaveBalance(15, 0, 0)).toBe(15)
		})

		it('연차를 모두 사용하면 0을 반환한다', () => {
			expect(calculateLeaveBalance(15, 10, 5)).toBe(0)
		})

		it('음수 잔액은 0으로 처리한다', () => {
			expect(calculateLeaveBalance(15, 10, 10)).toBe(0)
		})

		it('반차(0.5) 단위 계산이 올바르다', () => {
			expect(calculateLeaveBalance(16, 5.5, 2)).toBe(8.5)
		})
	})

	describe('canUseHalfDayLeave', () => {
		it('잔여 연차가 0.5일 이상이면 true를 반환한다', () => {
			expect(canUseHalfDayLeave(0.5)).toBe(true)
			expect(canUseHalfDayLeave(1)).toBe(true)
			expect(canUseHalfDayLeave(10)).toBe(true)
		})

		it('잔여 연차가 0.5일 미만이면 false를 반환한다', () => {
			expect(canUseHalfDayLeave(0)).toBe(false)
			expect(canUseHalfDayLeave(0.4)).toBe(false)
		})
	})

	describe('canUseFullDayLeave', () => {
		it('잔여 연차가 1일 이상이면 true를 반환한다', () => {
			expect(canUseFullDayLeave(1)).toBe(true)
			expect(canUseFullDayLeave(1.5)).toBe(true)
			expect(canUseFullDayLeave(10)).toBe(true)
		})

		it('잔여 연차가 1일 미만이면 false를 반환한다', () => {
			expect(canUseFullDayLeave(0)).toBe(false)
			expect(canUseFullDayLeave(0.5)).toBe(false)
			expect(canUseFullDayLeave(0.9)).toBe(false)
		})
	})

	describe('isSunday', () => {
		it('일요일이면 true를 반환한다', () => {
			const sunday = new Date('2026-01-25') // 일요일
			expect(isSunday(sunday)).toBe(true)
		})

		it('일요일이 아니면 false를 반환한다', () => {
			const monday = new Date('2026-01-26') // 월요일
			const friday = new Date('2026-01-30') // 금요일
			const saturday = new Date('2026-01-31') // 토요일

			expect(isSunday(monday)).toBe(false)
			expect(isSunday(friday)).toBe(false)
			expect(isSunday(saturday)).toBe(false)
		})
	})
})

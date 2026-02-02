import type { Weekday } from '@/types/nightShift'

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  MON: '월요일',
  TUE: '화요일',
  WED: '수요일',
  THU: '목요일',
  FRI: '금요일',
  SAT: '토요일',
  SUN: '일요일',
}

export const WEEKDAY_ORDER: Weekday[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

export const MAX_RECENT_RECORDS = 20

// 야간 진료 관리 타입 정의

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE'

export type Weekday = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

export interface Employee {
  id: number
  name: string
  user_id: string | null
  status: EmployeeStatus
  created_at: string | null
  updated_at: string | null
}

export interface NightShiftConfig {
  id: number
  weekday: Weekday
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

export interface NightShiftRecord {
  id: number
  employee_id: number
  work_date: string
  weekday: Weekday
  created_at: string | null
}

// 통계 타입
export interface NightShiftStats {
  [weekday: string]: number // 요일별 근무 횟수
}

export interface EmployeeNightShiftStats {
  employee_id: number
  employee_name: string
  user_id: string | null
  stats: NightShiftStats
}

// API 응답 타입
export interface ApiResponse {
  success: boolean
  message: string
}

// 폼 데이터 타입
export interface EmployeeFormData {
  name: string
  status: EmployeeStatus
}

export interface NightShiftRecordFormData {
  employee_id: number
  work_date: string
}

export interface NightShiftConfigFormData {
  weekday: Weekday
  is_active: boolean
}

export type EmployeeLeaveType = 'FULL' | 'HALF' | 'QUARTER'

export type EmployeeLeaveSession = 'AM' | 'PM' | null

export type EmployeeLeaveWeekday =
  | 'MON'
  | 'TUE'
  | 'WED'
  | 'THU'
  | 'FRI'
  | 'SAT'
  | 'SUN'

export interface EmployeeLeaveRecord {
  id: number
  employee_id: number
  leave_date: string
  leave_type: EmployeeLeaveType
  session: EmployeeLeaveSession
  leave_unit: number
  weekday: EmployeeLeaveWeekday
  created_by_name: string | null
  created_at: string | null
  updated_by_name: string | null
  updated_at: string | null
}

export interface EmployeeLeaveCalendarEventRow {
  event_id: string
  record_id: number
  employee_id: number
  employee_name: string
  leave_date: string
  leave_type: EmployeeLeaveType
  session: EmployeeLeaveSession
  leave_unit: number
  weekday: EmployeeLeaveWeekday
  employee_status: 'ACTIVE' | 'INACTIVE'
}

export interface EmployeeLeaveApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
}

export interface EmployeeLeaveMutationPayload {
  employeeId: number
  leaveDate: string
  leaveType: EmployeeLeaveType
  session: EmployeeLeaveSession
}

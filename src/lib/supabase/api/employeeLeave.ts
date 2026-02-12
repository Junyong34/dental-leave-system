import type {
  EmployeeLeaveApiResponse,
  EmployeeLeaveCalendarEventRow,
  EmployeeLeaveMutationPayload,
} from '@/types/employeeLeave'
import { supabase } from '../client'

const getRpcPayload = <T extends Record<string, unknown>>(
  data: unknown,
): T | null => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return null
  }

  return data as T
}

const normalizeSession = (session: string | null): string => session ?? ''

export async function getEmployeeLeaveCalendarEvents(
  startDate?: string,
  endDate?: string,
  employeeId?: number,
): Promise<EmployeeLeaveApiResponse<EmployeeLeaveCalendarEventRow[]>> {
  try {
    const { data, error } = await supabase.rpc(
      'get_employee_leave_calendar_events',
      {
        p_start_date: startDate ?? null,
        p_end_date: endDate ?? null,
        p_employee_id: typeof employeeId === 'number' ? employeeId : null,
      },
    )

    if (error) {
      return { success: false, message: error.message }
    }

    const rows = Array.isArray(data)
      ? (data as Array<Partial<EmployeeLeaveCalendarEventRow>>)
      : []

    const normalized = rows
      .map((row) => {
        const recordId = Number(row.record_id)
        const targetEmployeeId = Number(row.employee_id)
        const leaveUnit = Number(row.leave_unit)

        if (
          Number.isNaN(recordId) ||
          Number.isNaN(targetEmployeeId) ||
          Number.isNaN(leaveUnit) ||
          !row.leave_type ||
          !row.weekday ||
          !row.leave_date ||
          !row.employee_name
        ) {
          return null
        }

        if (
          row.leave_type !== 'FULL' &&
          row.leave_type !== 'HALF' &&
          row.leave_type !== 'QUARTER'
        ) {
          return null
        }

        if (
          row.weekday !== 'MON' &&
          row.weekday !== 'TUE' &&
          row.weekday !== 'WED' &&
          row.weekday !== 'THU' &&
          row.weekday !== 'FRI' &&
          row.weekday !== 'SAT' &&
          row.weekday !== 'SUN'
        ) {
          return null
        }

        return {
          event_id: String(row.event_id ?? `employee-leave-${recordId}`),
          record_id: recordId,
          employee_id: targetEmployeeId,
          employee_name: row.employee_name,
          leave_date: row.leave_date,
          leave_type: row.leave_type,
          session:
            row.session === 'AM' || row.session === 'PM' ? row.session : null,
          leave_unit: leaveUnit,
          weekday: row.weekday,
          employee_status:
            row.employee_status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
        } satisfies EmployeeLeaveCalendarEventRow
      })
      .filter((row): row is EmployeeLeaveCalendarEventRow => row !== null)

    return {
      success: true,
      message: 'Employee leave calendar events fetched.',
      data: normalized,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function createEmployeeLeaveRecord(
  payload: EmployeeLeaveMutationPayload,
): Promise<EmployeeLeaveApiResponse<{ record_id?: number }>> {
  try {
    const { data, error } = await supabase.rpc('create_employee_leave_record', {
      p_employee_id: payload.employeeId,
      p_leave_date: payload.leaveDate,
      p_leave_type: payload.leaveType,
      p_session: normalizeSession(payload.session),
    })

    if (error) {
      return { success: false, message: error.message }
    }

    const response = getRpcPayload<{
      success?: boolean
      message?: string
      record_id?: number
    }>(data)

    return {
      success: response?.success === true,
      message: response?.message ?? 'Failed to create employee leave record.',
      data: response ? { record_id: response.record_id } : undefined,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function updateEmployeeLeaveRecord(
  recordId: number,
  payload: EmployeeLeaveMutationPayload,
): Promise<EmployeeLeaveApiResponse<{ record_id?: number }>> {
  try {
    const { data, error } = await supabase.rpc('update_employee_leave_record', {
      p_record_id: recordId,
      p_employee_id: payload.employeeId,
      p_leave_date: payload.leaveDate,
      p_leave_type: payload.leaveType,
      p_session: normalizeSession(payload.session),
    })

    if (error) {
      return { success: false, message: error.message }
    }

    const response = getRpcPayload<{
      success?: boolean
      message?: string
      record_id?: number
    }>(data)

    return {
      success: response?.success === true,
      message: response?.message ?? 'Failed to update employee leave record.',
      data: response ? { record_id: response.record_id } : undefined,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function deleteEmployeeLeaveRecord(
  recordId: number,
): Promise<EmployeeLeaveApiResponse> {
  try {
    const { data, error } = await supabase.rpc('delete_employee_leave_record', {
      p_record_id: recordId,
    })

    if (error) {
      return { success: false, message: error.message }
    }

    const response = getRpcPayload<{
      success?: boolean
      message?: string
    }>(data)

    return {
      success: response?.success === true,
      message: response?.message ?? 'Failed to delete employee leave record.',
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

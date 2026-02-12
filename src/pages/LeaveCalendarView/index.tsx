import type {
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  EventSourceFunc,
} from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Box, Button, Flex, Text } from '@radix-ui/themes'
import { format, subDays } from 'date-fns'
import { Plus } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import useUserProfile from '@/hooks/useUserProfile'
import {
  createEmployeeLeaveRecord,
  deleteEmployeeLeaveRecord,
  getEmployeeLeaveCalendarEvents,
  updateEmployeeLeaveRecord,
} from '@/lib/supabase/api/employeeLeave'
import { getAllEmployees } from '@/lib/supabase/api/nightShift'
import type {
  EmployeeLeaveMutationPayload,
  EmployeeLeaveSession,
  EmployeeLeaveType,
  EmployeeLeaveWeekday,
} from '@/types/employeeLeave'
import type { Employee } from '@/types/nightShift'
import { EmployeeLeaveEventDialog } from './EmployeeLeaveEventDialog'
import { EmployeeLeaveFilters } from './EmployeeLeaveFilters'
import { EmployeeLeaveFormDialog } from './EmployeeLeaveFormDialog'
import './styles.css'

interface CalendarEvent {
  id: string
  title: string
  start: string
  allDay: boolean
  backgroundColor: string
  borderColor: string
  extendedProps: {
    recordId: number
    employeeId: number
    employeeName: string
    leaveDate: string
    leaveType: EmployeeLeaveType
    session: EmployeeLeaveSession
    leaveUnit: number
    weekday: EmployeeLeaveWeekday
    employeeStatus: 'ACTIVE' | 'INACTIVE'
  }
}

function getEmployeeColor(employeeId: number): {
  backgroundColor: string
  borderColor: string
} {
  const id = String(employeeId)
  let hash = 0

  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = Math.abs(hash % 360)

  return {
    backgroundColor: `hsla(${hue}, 70%, 70%, 0.75)`,
    borderColor: `hsl(${hue}, 35%, 85%)`,
  }
}

function formatLeaveType(
  type: EmployeeLeaveType,
  session: EmployeeLeaveSession,
) {
  if (type === 'FULL') return '연차'
  if (type === 'HALF') return session === 'AM' ? '반차(오전)' : '반차(오후)'
  return '반반차'
}

function getBadgeLabel(type: EmployeeLeaveType) {
  if (type === 'FULL') return '8H'
  if (type === 'HALF') return '4H'
  return '2H'
}

function getBadgeClass(type: EmployeeLeaveType) {
  if (type === 'FULL') return 'fc-employee-leave-badge-full'
  if (type === 'HALF') return 'fc-employee-leave-badge-half'
  return 'fc-employee-leave-badge-quarter'
}

export default function LeaveCalendarView() {
  const calendarRef = useRef<FullCalendar>(null)
  const { user, loading: isProfileLoading } = useUserProfile()

  const [allEmployees, setAllEmployees] = useState<Employee[]>([])
  const [activeEmployees, setActiveEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('all')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null)
  const [formInitialValue, setFormInitialValue] =
    useState<EmployeeLeaveMutationPayload>()
  const [formInitialDate, setFormInitialDate] = useState<string>()
  const [isMutating, setIsMutating] = useState(false)

  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [isCompactMobile, setIsCompactMobile] = useState(
    window.innerWidth <= 480,
  )

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
      setIsCompactMobile(window.innerWidth <= 480)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const loadEmployees = async () => {
      const [allEmployeesResult, activeEmployeesResult] = await Promise.all([
        getAllEmployees(),
        getAllEmployees('ACTIVE'),
      ])

      if (allEmployeesResult.success && allEmployeesResult.data) {
        setAllEmployees(allEmployeesResult.data)
      } else {
        setError(allEmployeesResult.message)
      }

      if (activeEmployeesResult.success && activeEmployeesResult.data) {
        setActiveEmployees(activeEmployeesResult.data)
      } else {
        setError(activeEmployeesResult.message)
      }
    }

    loadEmployees()
  }, [])

  useEffect(() => {
    if (!success) return

    const timer = window.setTimeout(() => setSuccess(''), 2500)
    return () => window.clearTimeout(timer)
  }, [success])

  useEffect(() => {
    if (!error) return

    const timer = window.setTimeout(() => setError(''), 4000)
    return () => window.clearTimeout(timer)
  }, [error])

  const refetchEvents = useCallback(() => {
    if (calendarRef.current) {
      calendarRef.current.getApi().refetchEvents()
    }
  }, [])

  const fetchEvents: EventSourceFunc = useCallback(
    async (fetchInfo, successCallback, failureCallback) => {
      setIsLoading(true)
      try {
        const startDate = format(fetchInfo.start, 'yyyy-MM-dd')
        const endDate = format(subDays(fetchInfo.end, 1), 'yyyy-MM-dd')
        const employeeId =
          selectedEmployeeId === 'all' ? undefined : Number(selectedEmployeeId)

        const result = await getEmployeeLeaveCalendarEvents(
          startDate,
          endDate,
          employeeId,
        )

        if (!result.success || !result.data) {
          successCallback([])
          setError(result.message)
          return
        }

        const events: CalendarEvent[] = result.data.map((row) => {
          const colors = getEmployeeColor(row.employee_id)
          const displayName = isMobile
            ? row.employee_name.charAt(0)
            : row.employee_name
          return {
            id: row.event_id,
            title: `${displayName} - ${formatLeaveType(row.leave_type, row.session)}`,
            start: row.leave_date,
            allDay: true,
            backgroundColor: colors.backgroundColor,
            borderColor: colors.borderColor,
            extendedProps: {
              recordId: row.record_id,
              employeeId: row.employee_id,
              employeeName: row.employee_name,
              leaveDate: row.leave_date,
              leaveType: row.leave_type,
              session: row.session,
              leaveUnit: row.leave_unit,
              weekday: row.weekday,
              employeeStatus: row.employee_status,
            },
          }
        })

        successCallback(events)
      } catch (fetchError) {
        failureCallback(fetchError as Error)
        setError('연차 캘린더 데이터를 불러오지 못했습니다.')
      } finally {
        setIsLoading(false)
      }
    },
    [isMobile, selectedEmployeeId],
  )

  const handleDatesSet = (dateInfo: DatesSetArg) => {
    setCurrentDate(dateInfo.view.currentStart)
  }

  useEffect(() => {
    if (selectedEmployeeId) {
      refetchEvents()
    }
  }, [selectedEmployeeId, refetchEvents])

  useEffect(() => {
    if (!isMobile || !calendarRef.current) return

    const api = calendarRef.current.getApi()
    if (api.view.type !== 'dayGridMonth') {
      api.changeView('dayGridMonth')
    }
  }, [isMobile])

  const handleEmployeeFilterChange = (value: string) => {
    setSelectedEmployeeId(value)
  }

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      allDay: clickInfo.event.allDay,
      backgroundColor: clickInfo.event.backgroundColor || '',
      borderColor: clickInfo.event.borderColor || '',
      extendedProps: clickInfo.event
        .extendedProps as CalendarEvent['extendedProps'],
    })
    setIsEventDialogOpen(true)
  }

  const openCreateDialog = (initialDate?: string) => {
    setFormMode('create')
    setEditingRecordId(null)
    setFormInitialValue(undefined)
    setFormInitialDate(initialDate)
    setIsFormDialogOpen(true)
  }

  const openEditDialog = () => {
    if (!selectedEvent) return

    setFormMode('edit')
    setEditingRecordId(selectedEvent.extendedProps.recordId)
    setFormInitialDate(undefined)
    setFormInitialValue({
      employeeId: selectedEvent.extendedProps.employeeId,
      leaveDate: selectedEvent.extendedProps.leaveDate,
      leaveType: selectedEvent.extendedProps.leaveType,
      session: selectedEvent.extendedProps.session,
    })
    setIsEventDialogOpen(false)
    setIsFormDialogOpen(true)
  }

  const handleDateClick = (dateClickInfo: DateClickArg) => {
    if (!isAdmin) return
    openCreateDialog(dateClickInfo.dateStr)
  }

  const renderEventContent = (eventInfo: EventContentArg) => {
    const { employeeName, leaveType, session } = eventInfo.event.extendedProps
    const displayName = isCompactMobile ? employeeName.charAt(0) : employeeName
    const typeText = formatLeaveType(leaveType, session)
    const badgeLabel = getBadgeLabel(leaveType)
    const badgeClass = getBadgeClass(leaveType)

    if (isMobile) {
      return {
        html: `
          <div class="fc-event-content-wrapper fc-event-content-mobile">
            <span class="fc-event-title">${displayName} - ${typeText}</span>
          </div>
        `,
      }
    }

    return {
      html: `
        <div class="fc-event-content-wrapper">
          <div class="fc-event-main-content">
            <span class="fc-event-title">${displayName} - ${typeText}</span>
          </div>
          <span class="fc-employee-leave-badge ${badgeClass}">${badgeLabel}</span>
        </div>
      `,
    }
  }

  const handleFormSubmit = async (payload: EmployeeLeaveMutationPayload) => {
    setError('')
    setSuccess('')
    setIsMutating(true)

    const result =
      formMode === 'edit' && editingRecordId
        ? await updateEmployeeLeaveRecord(editingRecordId, payload)
        : await createEmployeeLeaveRecord(payload)

    setIsMutating(false)

    if (!result.success) {
      throw new Error(result.message)
    }

    setSuccess(
      formMode === 'edit'
        ? '연차 기록이 수정되었습니다.'
        : '연차 기록이 추가되었습니다.',
    )

    setIsFormDialogOpen(false)
    refetchEvents()
  }

  const handleDeleteRecord = async () => {
    if (!selectedEvent) return

    if (
      !confirm(
        `${selectedEvent.extendedProps.employeeName}의 ${selectedEvent.extendedProps.leaveDate} 연차 기록을 삭제하시겠습니까?`,
      )
    ) {
      return
    }

    setIsMutating(true)
    const result = await deleteEmployeeLeaveRecord(
      selectedEvent.extendedProps.recordId,
    )
    setIsMutating(false)

    if (!result.success) {
      setError(result.message)
      return
    }

    setSuccess('연차 기록이 삭제되었습니다.')
    setIsEventDialogOpen(false)
    setSelectedEvent(null)
    refetchEvents()
  }

  const calendarHeaderToolbar = isMobile
    ? {
        left: 'prev,next',
        center: 'title',
        right: 'today',
      }
    : {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek',
      }

  return (
    <div className="rt-r-p-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <Flex direction="column" gap="4">
        <Flex align="end" justify="between" gap="3" wrap="wrap">
          <Box>
            <h1 className="rt-r-mb-2">연차 캘린더 뷰</h1>
            <Text size="2" style={{ color: 'var(--gray-11)' }}>
              직원별 연차 사용 내역을 확인하고 등록/수정/삭제할 수 있습니다.
            </Text>
          </Box>

          {isProfileLoading ? null : isAdmin ? (
            <Button onClick={() => openCreateDialog()}>
              <Plus size={16} />
              연차 추가
            </Button>
          ) : (
            <Text size="2" style={{ color: 'var(--gray-11)' }}>
              조회 전용 권한
            </Text>
          )}
        </Flex>

        <EmployeeLeaveFilters
          allEmployees={allEmployees}
          selectedEmployeeId={selectedEmployeeId}
          onSelectedEmployeeIdChange={handleEmployeeFilterChange}
        />

        {error && (
          <Box
            p="3"
            style={{
              backgroundColor: 'var(--red-a2)',
              border: '1px solid var(--red-a6)',
              borderRadius: 'var(--radius-2)',
            }}
          >
            <Text size="2" style={{ color: 'var(--red-11)' }}>
              {error}
            </Text>
          </Box>
        )}

        {success && (
          <Box
            p="3"
            style={{
              backgroundColor: 'var(--green-a2)',
              border: '1px solid var(--green-a6)',
              borderRadius: 'var(--radius-2)',
            }}
          >
            <Text size="2" style={{ color: 'var(--green-11)' }}>
              {success}
            </Text>
          </Box>
        )}

        <Box
          style={{
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--gray-a6)',
            borderRadius: 'var(--radius-3)',
            padding: 'var(--space-4)',
            boxShadow: 'var(--shadow-2)',
            position: 'relative',
          }}
        >
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            initialDate={currentDate}
            headerToolbar={calendarHeaderToolbar}
            locale="ko"
            buttonText={{ today: '오늘', month: '월', week: '주' }}
            events={fetchEvents}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            datesSet={handleDatesSet}
            dateClick={handleDateClick}
            height="auto"
            dayMaxEvents={true}
            moreLinkClick="popover"
            eventDisplay="block"
            aspectRatio={isMobile ? 1 : 1.8}
          />

          {isLoading && (
            <Flex
              justify="center"
              align="center"
              style={{
                position: 'absolute',
                inset: 'var(--space-4)',
                backgroundColor:
                  'color-mix(in srgb, var(--color-background) 80%, transparent)',
                borderRadius: 'var(--radius-2)',
                pointerEvents: 'none',
              }}
            >
              <Text size="3" style={{ color: 'var(--gray-11)' }}>
                로딩 중...
              </Text>
            </Flex>
          )}
        </Box>
      </Flex>

      <EmployeeLeaveEventDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        event={selectedEvent}
        isAdmin={isAdmin}
        onEdit={openEditDialog}
        onDelete={handleDeleteRecord}
        isMutating={isMutating}
      />

      <EmployeeLeaveFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        mode={formMode}
        employees={activeEmployees}
        initialValue={formInitialValue}
        initialDate={formInitialDate}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}

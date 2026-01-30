import type {
  DateSelectArg,
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  EventSourceInput,
} from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useEffect, useRef, useState } from 'react'
import './styles.css'
import { Box, Flex, Text } from '@radix-ui/themes'
import {
  getAllLeaveHistory,
  getAllLeaveReservations,
} from '@/lib/supabase/api/leave'
import { getAllUsers } from '@/lib/supabase/api/user'
import type {
  LeaveHistory,
  LeaveReservation,
  LeaveSession,
  LeaveType,
  User,
} from '@/types/leave'
import { LeaveCalendarFilters } from './LeaveCalendarFilters'
import { LeaveEventDialog } from './LeaveEventDialog'
import { LeaveRequestDialog } from './LeaveRequestDialog'

/**
 * FullCalendar에서 사용하는 이벤트 타입
 */
interface CalendarEvent {
  id: string
  title: string
  start: string
  allDay: boolean
  backgroundColor: string
  borderColor: string
  extendedProps: {
    userId: string
    userName: string
    type: LeaveType
    session: LeaveSession
    amount: number
    status: 'RESERVED' | 'USED'
    sourceYear?: number
    date: string
  }
}

/**
 * 사용자 ID를 해시하여 고유 색상 생성
 * 배경색과 테두리색을 각각 생성 (배경은 투명하고 부드럽게)
 */
function getUserColor(userId: string): {
  backgroundColor: string
  borderColor: string
} {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)

  // 배경색: 낮은 채도, 높은 명도, 투명도 적용 (부드럽고 연함)
  const backgroundColor = `hsla(${hue}, 70%, 70%, 0.7)`
  // 테두리색: 중간 채도, 중간 명도 (구분 가능하도록)
  const borderColor = `hsl(${hue}, 35%, 85%)`

  return { backgroundColor, borderColor }
}

/**
 * 연차 타입과 세션을 문자열로 변환
 */
function formatLeaveType(type: LeaveType, session: LeaveSession): string {
  if (type === 'FULL') return '종일'
  return session === 'AM' ? '반차(오전)' : '반차(오후)'
}

/**
 * LeaveHistory를 CalendarEvent로 변환
 */
function historyToEvent(
  history: LeaveHistory,
  userName: string,
  isMobile: boolean,
): CalendarEvent {
  const colors = getUserColor(history.user_id)
  const displayName = isMobile ? userName.charAt(0) : userName
  const typeText = formatLeaveType(history.type, history.session)

  return {
    id: `history-${history.id}`,
    title: `${displayName} - ${typeText}`,
    start: history.date,
    allDay: true,
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    extendedProps: {
      userId: history.user_id,
      userName,
      type: history.type,
      session: history.session,
      amount: history.amount,
      status: 'USED',
      sourceYear: history.source_year,
      date: history.date,
    },
  }
}

/**
 * LeaveReservation을 CalendarEvent로 변환
 */
function reservationToEvent(
  reservation: LeaveReservation,
  userName: string,
  isMobile: boolean,
): CalendarEvent {
  const colors = getUserColor(reservation.user_id)
  const displayName = isMobile ? userName.charAt(0) : userName
  const typeText = formatLeaveType(reservation.type, reservation.session)

  return {
    id: `reservation-${reservation.id}`,
    title: `${displayName} - ${typeText}`,
    start: reservation.date,
    allDay: true,
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    extendedProps: {
      userId: reservation.user_id,
      userName,
      type: reservation.type,
      session: reservation.session,
      amount: reservation.amount,
      status: 'RESERVED',
      date: reservation.date,
    },
  }
}

export default function LeaveCalendar() {
  // FullCalendar ref
  const calendarRef = useRef<FullCalendar>(null)

  const [allUsers, setAllUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // 캘린더 현재 날짜 상태 (뷰 유지용)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  // 필터 상태
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<
    ('RESERVED' | 'USED')[]
  >(['RESERVED', 'USED'])
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  )

  // 다이얼로그 상태
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)

  // 모바일 감지
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 사용자 목록 로드 (초기 한 번만)
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true)
      try {
        const usersResult = await getAllUsers('ACTIVE')
        if (usersResult.success && usersResult.data) {
          setAllUsers(usersResult.data)
        }
      } catch (err) {
        console.error('사용자 목록 조회 실패:', err)
        setError('사용자 목록을 불러올 수 없습니다.')
      } finally {
        setIsLoading(false)
      }
    }
    loadUsers()
  }, [])

  // 이벤트 로드 함수 (FullCalendar events prop용)
  const fetchEvents: EventSourceInput = async (
    _fetchInfo,
    successCallback,
    failureCallback,
  ) => {
    try {
      // 연도 범위 계산
      const startDate = `${selectedYear}-01-01`
      const endDate = `${selectedYear}-12-31`

      const calendarEvents: CalendarEvent[] = []

      // 사용 완료 이력 조회
      if (selectedStatuses.includes('USED')) {
        const historyResult = await getAllLeaveHistory(startDate, endDate)
        if (historyResult.success && historyResult.data) {
          for (const history of historyResult.data) {
            const user = allUsers.find((u) => u.user_id === history.user_id)
            if (user) {
              calendarEvents.push(historyToEvent(history, user.name, isMobile))
            }
          }
        }
      }

      // 예약 조회
      if (selectedStatuses.includes('RESERVED')) {
        const reservationsResult = await getAllLeaveReservations('RESERVED')
        if (reservationsResult.success && reservationsResult.data) {
          for (const reservation of reservationsResult.data) {
            // 선택된 연도에 해당하는 예약만 필터링
            const reservationYear = new Date(reservation.date).getFullYear()
            if (reservationYear === selectedYear) {
              const user = allUsers.find(
                (u) => u.user_id === reservation.user_id,
              )
              if (user) {
                calendarEvents.push(
                  reservationToEvent(reservation, user.name, isMobile),
                )
              }
            }
          }
        }
      }

      successCallback(calendarEvents)
    } catch (err) {
      console.error('이벤트 로드 실패:', err)
      failureCallback(err as Error)
    }
  }

  // 필터 변경 시 이벤트 다시 로드
  useEffect(() => {
    if (calendarRef.current && allUsers.length > 0) {
      calendarRef.current.getApi().refetchEvents()
    }
  }, [allUsers])

  // 이벤트 클릭 핸들러
  const handleEventClick = (clickInfo: EventClickArg) => {
    // FullCalendar 이벤트에서 extendedProps 가져오기
    const { extendedProps } = clickInfo.event
    setSelectedEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      allDay: clickInfo.event.allDay,
      backgroundColor: clickInfo.event.backgroundColor || '',
      borderColor: clickInfo.event.borderColor || '',
      extendedProps: extendedProps as CalendarEvent['extendedProps'],
    })
    setIsEventDialogOpen(true)
  }

  // 캘린더 날짜 변경 핸들러 (뷰 유지용)
  const handleDatesSet = (dateInfo: DatesSetArg) => {
    setCurrentDate(dateInfo.view.currentStart)
  }

  // 날짜 클릭 핸들러 (단일 클릭)
  const handleDateClick = (dateClickInfo: DateClickArg) => {
    setSelectedDate(dateClickInfo.dateStr)
    setIsRequestDialogOpen(true)
  }

  // 날짜 선택 핸들러 (드래그)
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDate(selectInfo.startStr)
    setIsRequestDialogOpen(true)
  }

  // 이벤트 커스텀 렌더링 (뱃지 포함)
  const renderEventContent = (eventInfo: EventContentArg) => {
    const { status, userName, type, session } = eventInfo.event.extendedProps
    const displayName = isMobile ? userName.charAt(0) : userName
    const typeText = formatLeaveType(type, session)

    // 상태 뱃지 텍스트 및 스타일
    const badgeText = status === 'RESERVED' ? '예정' : '완료'
    const badgeClass =
      status === 'RESERVED' ? 'fc-event-badge-reserved' : 'fc-event-badge-used'

    return {
      html: `
        <div class="fc-event-content-wrapper">
          <div class="fc-event-main-content">
            <span class="fc-event-title">${displayName} - ${typeText}</span>
          </div>
          <span class="fc-event-badge ${badgeClass}">${badgeText}</span>
        </div>
      `,
    }
  }

  return (
    <div className="rt-r-p-6" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <Flex direction="column" gap="4">
        {/* 헤더 */}
        <Box>
          <h1 className="rt-r-mb-2">연차 캘린더</h1>
          <Text size="2" style={{ color: 'var(--gray-11)' }}>
            팀원들의 연차 일정을 한눈에 확인하고 연차를 신청할 수 있습니다.
          </Text>
        </Box>

        {/* 필터 */}
        <LeaveCalendarFilters
          allUsers={allUsers}
          selectedUserIds={selectedUserIds}
          onUserIdsChange={setSelectedUserIds}
          selectedStatuses={selectedStatuses}
          onStatusesChange={setSelectedStatuses}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />

        {/* 에러 메시지 */}
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

        {/* 캘린더 */}
        <Box
          style={{
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--gray-a6)',
            borderRadius: 'var(--radius-3)',
            padding: 'var(--space-4)',
            boxShadow: 'var(--shadow-2)',
          }}
        >
          {isLoading ? (
            <Flex
              justify="center"
              align="center"
              style={{ minHeight: '400px' }}
            >
              <Text size="3" style={{ color: 'var(--gray-11)' }}>
                로딩 중...
              </Text>
            </Flex>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              initialDate={currentDate}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek',
              }}
              events={fetchEvents}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              dateClick={handleDateClick}
              datesSet={handleDatesSet}
              selectable={true}
              select={handleDateSelect}
              locale="ko"
              height="auto"
              aspectRatio={1.8}
              buttonText={{
                today: '오늘',
                month: '월',
                week: '주',
              }}
            />
          )}
        </Box>
      </Flex>

      {/* 이벤트 상세 다이얼로그 */}
      <LeaveEventDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        event={selectedEvent}
      />

      {/* 연차 신청 다이얼로그 */}
      <LeaveRequestDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        initialDate={selectedDate}
        onSuccess={() => {
          setIsRequestDialogOpen(false)
          // 캘린더 이벤트만 다시 로드 (깜빡임 없음)
          if (calendarRef.current) {
            calendarRef.current.getApi().refetchEvents()
          }
        }}
      />
    </div>
  )
}

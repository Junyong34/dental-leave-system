import { Box, Button, Dialog, Flex, Text } from '@radix-ui/themes'
import type {
  EmployeeLeaveSession,
  EmployeeLeaveType,
  EmployeeLeaveWeekday,
} from '@/types/employeeLeave'

interface EmployeeLeaveCalendarEvent {
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

interface EmployeeLeaveEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: EmployeeLeaveCalendarEvent | null
  isAdmin: boolean
  onEdit: () => void
  onDelete: () => void
  isMutating: boolean
}

const WEEKDAY_LABELS: Record<EmployeeLeaveWeekday, string> = {
  MON: '월요일',
  TUE: '화요일',
  WED: '수요일',
  THU: '목요일',
  FRI: '금요일',
  SAT: '토요일',
  SUN: '일요일',
}

function formatLeaveType(
  type: EmployeeLeaveType,
  session: EmployeeLeaveSession,
) {
  if (type === 'FULL') return '연차 (8시간)'
  if (type === 'HALF')
    return session === 'AM' ? '반차 오전 (4시간)' : '반차 오후 (4시간)'
  return '반반차 (2시간)'
}

export function EmployeeLeaveEventDialog({
  open,
  onOpenChange,
  event,
  isAdmin,
  onEdit,
  onDelete,
  isMutating,
}: EmployeeLeaveEventDialogProps) {
  if (!event) return null

  const leaveHours = event.extendedProps.leaveUnit * 2

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="520px">
        <Dialog.Title>연차 상세 정보</Dialog.Title>

        <Box
          mt="4"
          p="4"
          style={{
            backgroundColor: 'var(--gray-a2)',
            borderRadius: 'var(--radius-3)',
            border: '1px solid var(--gray-a5)',
          }}
        >
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Text size="2" style={{ color: 'var(--gray-11)' }}>
                직원
              </Text>
              <Text size="3" weight="bold">
                {event.extendedProps.employeeName}
              </Text>
            </Flex>

            <Flex justify="between" align="center">
              <Text size="2" style={{ color: 'var(--gray-11)' }}>
                날짜
              </Text>
              <Text size="3" weight="medium">
                {event.extendedProps.leaveDate}
              </Text>
            </Flex>

            <Flex justify="between" align="center">
              <Text size="2" style={{ color: 'var(--gray-11)' }}>
                요일
              </Text>
              <Text size="3" weight="medium">
                {WEEKDAY_LABELS[event.extendedProps.weekday]}
              </Text>
            </Flex>

            <Flex justify="between" align="center">
              <Text size="2" style={{ color: 'var(--gray-11)' }}>
                연차 타입
              </Text>
              <Text size="3" weight="medium">
                {formatLeaveType(
                  event.extendedProps.leaveType,
                  event.extendedProps.session,
                )}
              </Text>
            </Flex>

            <Flex justify="between" align="center">
              <Text size="2" style={{ color: 'var(--gray-11)' }}>
                사용 시간
              </Text>
              <Text size="3" weight="medium">
                {leaveHours}시간
              </Text>
            </Flex>

            <Flex justify="between" align="center">
              <Text size="2" style={{ color: 'var(--gray-11)' }}>
                직원 상태
              </Text>
              <Text
                size="2"
                weight="medium"
                style={{
                  color:
                    event.extendedProps.employeeStatus === 'ACTIVE'
                      ? 'var(--green-11)'
                      : 'var(--gray-11)',
                }}
              >
                {event.extendedProps.employeeStatus === 'ACTIVE'
                  ? '재직'
                  : '비재직'}
              </Text>
            </Flex>
          </Flex>
        </Box>

        <Flex justify="end" gap="3" mt="5">
          {isAdmin && (
            <>
              <Button variant="soft" onClick={onEdit} disabled={isMutating}>
                수정
              </Button>
              <Button
                variant="solid"
                color="red"
                onClick={onDelete}
                disabled={isMutating}
              >
                삭제
              </Button>
            </>
          )}

          <Dialog.Close>
            <Button variant="soft" color="gray" disabled={isMutating}>
              닫기
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

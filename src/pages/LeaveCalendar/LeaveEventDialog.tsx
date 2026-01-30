import { Box, Dialog, Flex, Text } from '@radix-ui/themes'
import type { LeaveSession, LeaveType } from '@/types/leave'

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

interface LeaveEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: CalendarEvent | null
}

/**
 * 연차 타입과 세션을 문자열로 변환
 */
function formatLeaveType(type: LeaveType, session: LeaveSession): string {
  if (type === 'FULL') return '종일'
  return session === 'AM' ? '반차 (오전)' : '반차 (오후)'
}

/**
 * 상태를 문자열로 변환
 */
function formatStatus(status: 'RESERVED' | 'USED'): string {
  return status === 'RESERVED' ? '사용 예정' : '사용 완료'
}

export function LeaveEventDialog({
  open,
  onOpenChange,
  event,
}: LeaveEventDialogProps) {
  if (!event) return null

  const { extendedProps } = event

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="500px">
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
            {/* 사용자 정보 */}
            <Flex
              align="center"
              justify="between"
              p="3"
              style={{
                backgroundColor: 'var(--color-background)',
                borderRadius: 'var(--radius-2)',
                border: '1px solid var(--gray-a4)',
              }}
            >
              <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
                사용자
              </Text>
              <Text size="3" weight="bold">
                {extendedProps.userName}
              </Text>
            </Flex>

            {/* 날짜 */}
            <Flex
              align="center"
              justify="between"
              p="3"
              style={{
                backgroundColor: 'var(--color-background)',
                borderRadius: 'var(--radius-2)',
                border: '1px solid var(--gray-a4)',
              }}
            >
              <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
                날짜
              </Text>
              <Text size="3" weight="medium">
                {extendedProps.date}
              </Text>
            </Flex>

            {/* 연차 타입 */}
            <Flex
              align="center"
              justify="between"
              p="3"
              style={{
                backgroundColor: 'var(--color-background)',
                borderRadius: 'var(--radius-2)',
                border: '1px solid var(--gray-a4)',
              }}
            >
              <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
                연차 종류
              </Text>
              <Text size="3" weight="medium">
                {formatLeaveType(extendedProps.type, extendedProps.session)}
              </Text>
            </Flex>

            {/* 차감량 */}
            <Flex
              align="center"
              justify="between"
              p="3"
              style={{
                backgroundColor: 'var(--color-background)',
                borderRadius: 'var(--radius-2)',
                border: '1px solid var(--gray-a4)',
              }}
            >
              <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
                차감량
              </Text>
              <Text size="3" weight="medium">
                {extendedProps.amount}일
              </Text>
            </Flex>

            {/* 상태 */}
            <Flex
              align="center"
              justify="between"
              p="3"
              style={{
                backgroundColor: 'var(--color-background)',
                borderRadius: 'var(--radius-2)',
                border: '1px solid var(--gray-a4)',
              }}
            >
              <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
                상태
              </Text>
              <Box
                px="3"
                py="1"
                style={{
                  backgroundColor:
                    extendedProps.status === 'RESERVED'
                      ? 'var(--amber-a3)'
                      : 'var(--green-a3)',
                  border: `1px solid ${
                    extendedProps.status === 'RESERVED'
                      ? 'var(--amber-a6)'
                      : 'var(--green-a6)'
                  }`,
                  borderRadius: 'var(--radius-2)',
                }}
              >
                <Text
                  size="2"
                  weight="medium"
                  style={{
                    color:
                      extendedProps.status === 'RESERVED'
                        ? 'var(--amber-11)'
                        : 'var(--green-11)',
                  }}
                >
                  {formatStatus(extendedProps.status)}
                </Text>
              </Box>
            </Flex>

            {/* 차감 연도 (사용 완료인 경우) */}
            {extendedProps.status === 'USED' && extendedProps.sourceYear && (
              <Flex
                align="center"
                justify="between"
                p="3"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderRadius: 'var(--radius-2)',
                  border: '1px solid var(--gray-a4)',
                }}
              >
                <Text
                  size="2"
                  weight="medium"
                  style={{ color: 'var(--gray-11)' }}
                >
                  차감 연도
                </Text>
                <Text size="3" weight="medium">
                  {extendedProps.sourceYear}년
                </Text>
              </Flex>
            )}
          </Flex>
        </Box>

        <Flex gap="3" mt="5" justify="end">
          <Dialog.Close>
            <button
              type="button"
              style={{
                padding: '10px 20px',
                backgroundColor: 'var(--gray-a3)',
                border: '1px solid var(--gray-a7)',
                borderRadius: 'var(--radius-2)',
                color: 'var(--gray-12)',
                fontSize: 'var(--font-size-2)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--gray-a4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--gray-a3)'
              }}
            >
              닫기
            </button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

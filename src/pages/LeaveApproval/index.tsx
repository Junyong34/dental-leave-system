import { Badge, Box, Button, Card, Flex, Text } from '@radix-ui/themes'
import { Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { sampleData } from '@/data/sampleData.ts'
import {
  cancelLeaveHistory,
  cancelLeaveReservation,
} from '@/utils/leaveManagement.ts'

export default function LeaveApproval() {
  const [success, setSuccess] = useState<string>('')
  const [error, setError] = useState<string>('')

  // RESERVED 상태의 예약만 필터링
  const reservedLeaves = sampleData.reservations.filter(
    (r) => r.status === 'RESERVED',
  )

  // 사용 완료된 연차 (취소 가능)
  const usedLeaves = sampleData.history

  const handleCancel = (reservationId: number) => {
    try {
      const updatedReservations = cancelLeaveReservation(
        sampleData.reservations,
        reservationId,
      )
      sampleData.reservations = updatedReservations
      setSuccess('연차 예약이 취소되었습니다.')
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '취소에 실패했습니다.')
      setSuccess('')
    }
  }

  const handleCancelHistory = (historyId: number) => {
    try {
      const result = cancelLeaveHistory(
        sampleData.balances,
        sampleData.history,
        historyId,
      )
      sampleData.balances = result.balances
      sampleData.history = result.history
      setSuccess('사용된 연차가 취소되고 복구되었습니다.')
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '취소에 실패했습니다.')
      setSuccess('')
    }
  }

  return (
    <div className="rt-r-p-6" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="rt-r-mb-2">연차 승인</h1>
      <p className="rt-r-mb-6" style={{ color: 'var(--gray-11)' }}>
        직원들의 연차 신청을 확인하고 취소할 수 있습니다.
      </p>

      {/* 메시지 */}
      {success && (
        <Box
          p="3"
          mb="4"
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

      {error && (
        <Box
          p="3"
          mb="4"
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

      {/* 예약된 연차 목록 */}
      <Card mb="6">
        <Flex direction="column" gap="3">
          <Text size="4" weight="bold">
            예약된 연차
          </Text>

          {reservedLeaves.length === 0 ? (
            <Text size="2" style={{ color: 'var(--gray-11)' }}>
              예약된 연차가 없습니다.
            </Text>
          ) : (
            <Flex direction="column" gap="2">
              {reservedLeaves.map((reservation) => {
                const user = sampleData.users.find(
                  (u) => u.user_id === reservation.user_id,
                )
                return (
                  <Box
                    key={reservation.id}
                    p="3"
                    style={{
                      border: '1px solid var(--gray-a6)',
                      borderRadius: 'var(--radius-2)',
                      backgroundColor: 'var(--gray-a2)',
                    }}
                  >
                    <Flex justify="between" align="center">
                      <Flex direction="column" gap="1">
                        <Flex align="center" gap="2">
                          <Text size="3" weight="regular">
                            {user?.name || '알 수 없음'}
                          </Text>
                          <Badge color="blue">{reservation.status}</Badge>
                        </Flex>
                        <Text size="2" style={{ color: 'var(--gray-11)' }}>
                          {reservation.date} •{' '}
                          {reservation.type === 'FULL'
                            ? '종일'
                            : `반차 (${reservation.session})`}{' '}
                          • {reservation.amount}일
                        </Text>
                        <Text size="1" style={{ color: 'var(--gray-10)' }}>
                          신청일:{' '}
                          {new Date(reservation.created_at).toLocaleDateString(
                            'ko-KR',
                          )}
                        </Text>
                      </Flex>

                      <Button
                        color="red"
                        variant="soft"
                        onClick={() => handleCancel(reservation.id)}
                      >
                        <X size={16} />
                        취소
                      </Button>
                    </Flex>
                  </Box>
                )
              })}
            </Flex>
          )}
        </Flex>
      </Card>

      {/* 사용 완료된 연차 목록 */}
      <Card>
        <Flex direction="column" gap="3">
          <Text size="4" weight="bold">
            사용 완료된 연차
          </Text>

          {usedLeaves.length === 0 ? (
            <Text size="2" style={{ color: 'var(--gray-11)' }}>
              사용 완료된 연차가 없습니다.
            </Text>
          ) : (
            <Flex direction="column" gap="2">
              {usedLeaves.map((history) => {
                const user = sampleData.users.find(
                  (u) => u.user_id === history.user_id,
                )
                return (
                  <Box
                    key={history.id}
                    p="3"
                    style={{
                      border: '1px solid var(--gray-a6)',
                      borderRadius: 'var(--radius-2)',
                      backgroundColor: 'var(--gray-a2)',
                    }}
                  >
                    <Flex justify="between" align="center">
                      <Flex direction="column" gap="1">
                        <Flex align="center" gap="2">
                          <Text size="3" weight="regular">
                            {user?.name || '알 수 없음'}
                          </Text>
                          <Badge color="green">사용완료</Badge>
                        </Flex>
                        <Text size="2" style={{ color: 'var(--gray-11)' }}>
                          {history.date} •{' '}
                          {history.type === 'FULL'
                            ? '종일'
                            : `반차 (${history.session})`}{' '}
                          • {history.amount}일
                        </Text>
                        <Text size="1" style={{ color: 'var(--gray-10)' }}>
                          사용일:{' '}
                          {new Date(history.used_at).toLocaleDateString(
                            'ko-KR',
                          )}{' '}
                          • {history.source_year}년 연차에서 차감
                        </Text>
                      </Flex>

                      <Button
                        color="orange"
                        variant="soft"
                        onClick={() => handleCancelHistory(history.id)}
                      >
                        <Trash2 size={16} />
                        취소 및 복구
                      </Button>
                    </Flex>
                  </Box>
                )
              })}
            </Flex>
          )}
        </Flex>
      </Card>
    </div>
  )
}

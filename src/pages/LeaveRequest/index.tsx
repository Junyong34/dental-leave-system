import {
  Box,
  Button,
  Card,
  Flex,
  Select,
  Text,
  TextField,
} from '@radix-ui/themes'
import { isPast, parseISO, startOfToday } from 'date-fns'
import { AlertCircle, Calendar } from 'lucide-react'
import { useState } from 'react'
import { sampleData } from '@/data/sampleData.ts'
import type { LeaveSession, LeaveType } from '@/types/leave.ts'
import { getLeaveStatus, validateLeaveRequest } from '@/utils/leave.ts'
import { addLeaveReservation } from '@/utils/leaveManagement.ts'

export default function LeaveRequest() {
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [leaveType, setLeaveType] = useState<LeaveType>('FULL')
  const [session, setSession] = useState<LeaveSession>(null)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  const activeUsers = sampleData.users.filter((u) => u.status === 'ACTIVE')

  const selectedUser = sampleData.users.find(
    (u) => u.user_id === selectedUserId,
  )
  const leaveStatus = selectedUserId
    ? getLeaveStatus(
        selectedUserId,
        sampleData.balances,
        sampleData.reservations,
      )
    : null

  const handleSubmit = () => {
    setError('')
    setSuccess('')

    if (!selectedUserId || !selectedDate) {
      setError('사용자와 날짜를 선택해주세요.')
      return
    }

    // 유효성 검증
    const userReservations = sampleData.reservations.filter(
      (r) => r.user_id === selectedUserId,
    )

    const validation = validateLeaveRequest(
      selectedDate,
      leaveType,
      session,
      leaveStatus?.remain || 0,
      userReservations,
    )

    if (!validation.valid) {
      setError(validation.error || '연차 신청에 실패했습니다.')
      return
    }

    // 과거/미래 날짜 판별
    const requestDate = parseISO(selectedDate)
    const today = startOfToday()
    const isPastDate = isPast(requestDate) && requestDate < today

    // 연차 추가
    try {
      const result = addLeaveReservation(
        sampleData.balances,
        sampleData.reservations,
        sampleData.history,
        selectedUserId,
        selectedDate,
        leaveType,
        session,
        isPastDate, // 과거 날짜면 즉시 사용(true), 미래면 예약(false)
      )

      // 데이터 업데이트 (실제로는 상태 관리 필요)
      if (isPastDate) {
        sampleData.balances = result.balances
        sampleData.history = result.history
      } else {
        sampleData.reservations = result.reservations
      }

      const actionText = isPastDate ? '사용 처리' : '예약'
      setSuccess(
        `${selectedUser?.name}님의 연차가 ${actionText}되었습니다. (${selectedDate}, ${leaveType === 'FULL' ? '종일' : `반차 ${session}`})`,
      )

      // 폼 초기화
      setSelectedDate('')
      setLeaveType('FULL')
      setSession(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '연차 신청에 실패했습니다.')
    }
  }

  return (
    <div className="rt-r-p-6" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="rt-r-mb-2">연차 신청</h1>
      <p className="rt-r-mb-6" style={{ color: 'var(--gray-11)' }}>
        직원의 연차를 신청할 수 있습니다.
      </p>

      {/* 사용자 선택 */}
      <Card className="rt-r-mb-4">
        <Flex direction="column" gap="4">
          <Box>
            <Text
              as="label"
              size="2"
              weight="medium"
              style={{ display: 'block', marginBottom: '8px' }}
            >
              직원 선택
            </Text>
            <Select.Root
              value={selectedUserId}
              onValueChange={setSelectedUserId}
            >
              <Select.Trigger placeholder="직원을 선택하세요" />
              <Select.Content
                position="popper"
                sideOffset={5}
                collisionPadding={10}
                align="start"
                side="bottom"
                style={{
                  maxHeight: '300px',
                  minWidth: '200px',
                  width: 'var(--radix-select-trigger-width)',
                }}
              >
                {activeUsers.map((user) => (
                  <Select.Item key={user.user_id} value={user.user_id}>
                    {user.name} ({user.user_id})
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          {/* 선택된 사용자 정보 */}
          {leaveStatus && selectedUser && (
            <Box
              p="3"
              style={{
                backgroundColor: 'var(--blue-a2)',
                border: '1px solid var(--blue-a6)',
                borderRadius: 'var(--radius-2)',
              }}
            >
              <Flex direction="column" gap="2">
                <Text size="2" weight="regular">
                  {selectedUser.name}님의 연차 현황
                </Text>
                <Flex gap="4">
                  <Text size="2">
                    총 연차: <strong>{leaveStatus.total}일</strong>
                  </Text>
                  <Text size="2">
                    사용: <strong>{leaveStatus.used}일</strong>
                  </Text>
                  <Text size="2">
                    예약: <strong>{leaveStatus.reserved}일</strong>
                  </Text>
                  <Text size="2" style={{ color: 'var(--blue-11)' }}>
                    잔여: <strong>{leaveStatus.remain}일</strong>
                  </Text>
                </Flex>
              </Flex>
            </Box>
          )}

          {/* 날짜 선택 */}
          <Box>
            <Text
              as="label"
              size="2"
              weight="medium"
              style={{ display: 'block', marginBottom: '8px' }}
            >
              날짜
            </Text>
            <TextField.Root
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              placeholder="날짜를 선택하세요"
              style={{ maxWidth: '170px' }}
            >
              <TextField.Slot>
                <Calendar size={16} />
              </TextField.Slot>
            </TextField.Root>
          </Box>

          {/* 연차 종류 */}
          <Box>
            <Text
              as="label"
              size="2"
              weight="medium"
              style={{ display: 'block', marginBottom: '8px' }}
            >
              연차 종류
            </Text>
            <Select.Root
              value={leaveType}
              onValueChange={(value) => {
                setLeaveType(value as LeaveType)
                if (value === 'FULL') setSession(null)
              }}
            >
              <Select.Trigger />
              <Select.Content
                position="popper"
                sideOffset={5}
                collisionPadding={10}
                align="start"
                side="bottom"
                style={{
                  maxHeight: '300px',
                  minWidth: '200px',
                  width: 'var(--radix-select-trigger-width)',
                }}
              >
                <Select.Item value="FULL">종일</Select.Item>
                <Select.Item value="HALF">반차</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>

          {/* 반차 세션 */}
          {leaveType === 'HALF' && (
            <Box>
              <Text
                as="label"
                size="2"
                weight="medium"
                style={{ display: 'block', marginBottom: '8px' }}
              >
                반차 시간
              </Text>
              <Select.Root
                value={session || ''}
                onValueChange={(value) => setSession(value as LeaveSession)}
              >
                <Select.Trigger placeholder="오전/오후 선택" />
                <Select.Content
                  position="popper"
                  sideOffset={5}
                  collisionPadding={10}
                  align="start"
                  side="bottom"
                  style={{
                    maxHeight: '300px',
                    minWidth: '200px',
                    width: 'var(--radix-select-trigger-width)',
                  }}
                >
                  <Select.Item value="AM">오전 (AM)</Select.Item>
                  <Select.Item value="PM">오후 (PM)</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
          )}

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
              <Flex align="center" gap="2">
                <AlertCircle size={16} color="var(--red-9)" />
                <Text size="2" style={{ color: 'var(--red-11)' }}>
                  {error}
                </Text>
              </Flex>
            </Box>
          )}

          {/* 성공 메시지 */}
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

          {/* 신청 버튼 */}
          <Button size="3" onClick={handleSubmit}>
            연차 신청
          </Button>
        </Flex>
      </Card>
    </div>
  )
}

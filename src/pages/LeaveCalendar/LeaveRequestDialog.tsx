import {
  Box,
  Button,
  Dialog,
  Flex,
  Select,
  Text,
  TextField,
} from '@radix-ui/themes'
import { AlertCircle, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  getLeaveBalances,
  getLeaveReservations,
  reserveLeave,
} from '@/lib/supabase/api/leave'
import { getAllUsers } from '@/lib/supabase/api/user'
import type {
  LeaveSession,
  LeaveStatus,
  LeaveType,
  User,
} from '@/types/leave.ts'
import { getLeaveStatus, validateLeaveRequest } from '@/utils/leave.ts'

interface LeaveRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDate: string
  onSuccess?: () => void
}

export function LeaveRequestDialog({
  open,
  onOpenChange,
  initialDate,
  onSuccess,
}: LeaveRequestDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [leaveType, setLeaveType] = useState<LeaveType>('FULL')
  const [session, setSession] = useState<LeaveSession>(null)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 사용자 목록 및 연차 정보
  const [activeUsers, setActiveUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [leaveStatus, setLeaveStatus] = useState<LeaveStatus | null>(null)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)

  // 다이얼로그가 열릴 때 초기 날짜 설정
  useEffect(() => {
    if (open && initialDate) {
      setSelectedDate(initialDate)
    }
  }, [open, initialDate])

  // 다이얼로그가 닫힐 때 폼 초기화
  useEffect(() => {
    if (!open) {
      setSelectedUserId('')
      setSelectedDate('')
      setLeaveType('FULL')
      setSession(null)
      setError('')
      setSuccess('')
      setSelectedUser(null)
      setLeaveStatus(null)
    }
  }, [open])

  // 사용자 목록 조회
  useEffect(() => {
    if (open) {
      const loadUsers = async () => {
        setIsLoadingUsers(true)
        try {
          const result = await getAllUsers('ACTIVE')
          if (result.success && result.data) {
            setActiveUsers(result.data)
          }
        } catch (err) {
          console.error('사용자 목록 조회 실패:', err)
        } finally {
          setIsLoadingUsers(false)
        }
      }
      loadUsers()
    }
  }, [open])

  // 선택된 사용자의 연차 정보 조회
  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUser(null)
      setLeaveStatus(null)
      return
    }

    const loadUserLeaveInfo = async () => {
      try {
        const user = activeUsers.find((u) => u.user_id === selectedUserId)
        if (!user) return

        const [balancesResult, reservationsResult] = await Promise.all([
          getLeaveBalances(selectedUserId),
          getLeaveReservations(selectedUserId, 'RESERVED'),
        ])

        const balances =
          balancesResult.success && balancesResult.data
            ? balancesResult.data
            : []
        const reservations =
          reservationsResult.success && reservationsResult.data
            ? reservationsResult.data
            : []

        setSelectedUser(user)
        setLeaveStatus(getLeaveStatus(selectedUserId, balances, reservations))
      } catch (err) {
        console.error('연차 정보 조회 실패:', err)
      }
    }

    loadUserLeaveInfo()
  }, [selectedUserId, activeUsers])

  const handleSubmit = async () => {
    setError('')
    setSuccess('')

    if (!selectedUserId || !selectedDate) {
      setError('사용자와 날짜를 선택해주세요.')
      return
    }

    // 유효성 검증 (로컬)
    if (!leaveStatus) {
      setError('연차 정보를 불러오는 중입니다.')
      return
    }

    // 기본 유효성 검증 (클라이언트 측)
    const reservationsResult = await getLeaveReservations(
      selectedUserId,
      'RESERVED',
    )
    const userReservations =
      reservationsResult.success && reservationsResult.data
        ? reservationsResult.data
        : []

    const validation = validateLeaveRequest(
      selectedDate,
      leaveType,
      session,
      leaveStatus.remain,
      userReservations,
    )

    if (!validation.valid) {
      setError(validation.error || '연차 신청에 실패했습니다.')
      return
    }

    // 연차 신청
    setIsSubmitting(true)
    try {
      const result = await reserveLeave(
        selectedUserId,
        selectedDate,
        leaveType,
        session,
      )

      if (result.success) {
        setSuccess(
          `${selectedUser?.name}님의 연차가 신청되었습니다. (${selectedDate}, ${leaveType === 'FULL' ? '종일' : `반차 ${session}`})`,
        )

        // 성공 후 콜백 호출
        setTimeout(() => {
          if (onSuccess) {
            onSuccess()
          }
        }, 1500)
      } else {
        setError(result.error || '연차 신청에 실패했습니다.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '연차 신청에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="500px">
        <Dialog.Title>연차 신청</Dialog.Title>

        <Flex direction="column" gap="4" mt="4">
          {/* 사용자 선택 */}
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
                    {user.name}
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
        </Flex>

        <Flex gap="3" mt="6" justify="end">
          <Dialog.Close>
            <button
              type="button"
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--gray-a3)',
                border: '1px solid var(--gray-a7)',
                borderRadius: 'var(--radius-2)',
                color: 'var(--gray-12)',
                fontSize: 'var(--font-size-2)',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              취소
            </button>
          </Dialog.Close>
          <Button
            size="3"
            onClick={handleSubmit}
            disabled={isSubmitting || isLoadingUsers}
          >
            {isSubmitting ? '신청 중...' : '연차 신청'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

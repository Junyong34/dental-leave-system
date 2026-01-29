import {
  Box,
  Button,
  Dialog,
  Flex,
  IconButton,
  Select,
  Text,
  TextField,
} from '@radix-ui/themes'
import { X } from 'lucide-react'
import { useState } from 'react'
import type { LeaveBalance } from '../../types/leave'

interface EditLeaveUsedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  balances: LeaveBalance[]
  onSave: (userId: string, year: number, newUsed: number) => void
}

export function EditLeaveUsedDialog({
  open,
  onOpenChange,
  userId,
  userName,
  balances,
  onSave,
}: EditLeaveUsedDialogProps) {
  const userBalances = balances.filter((b) => b.user_id === userId)
  const [selectedYear, setSelectedYear] = useState<string>(
    userBalances.length > 0 ? String(userBalances[0].year) : '',
  )
  const [newUsed, setNewUsed] = useState<string>('')
  const [error, setError] = useState<string>('')

  const selectedBalance = userBalances.find(
    (b) => String(b.year) === selectedYear,
  )

  const handleSave = () => {
    setError('')

    if (!selectedYear || !newUsed) {
      setError('연도와 사용 연차를 모두 입력해주세요.')
      return
    }

    const usedValue = Number.parseFloat(newUsed)

    if (Number.isNaN(usedValue) || usedValue < 0) {
      setError('올바른 숫자를 입력해주세요.')
      return
    }

    if (selectedBalance && usedValue > selectedBalance.total) {
      setError(
        `사용 연차는 총 연차(${selectedBalance.total}일)를 초과할 수 없습니다.`,
      )
      return
    }

    onSave(userId, Number.parseInt(selectedYear, 10), usedValue)
    onOpenChange(false)
    setNewUsed('')
    setError('')
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="500px">
        <Dialog.Title>{userName}님의 연차 사용 수정</Dialog.Title>
        <Dialog.Close>
          <IconButton
            size="1"
            variant="ghost"
            color="gray"
            style={{ position: 'absolute', top: '16px', right: '16px' }}
          >
            <X size={16} />
          </IconButton>
        </Dialog.Close>

        <Flex direction="column" gap="4" mt="4">
          {/* 연도 선택 */}
          <Box>
            <Text as="label" size="2" weight="medium" mb="2">
              연도
            </Text>
            <Select.Root value={selectedYear} onValueChange={setSelectedYear}>
              <Select.Trigger placeholder="연도를 선택하세요" />
              <Select.Content>
                {userBalances.map((balance) => (
                  <Select.Item key={balance.year} value={String(balance.year)}>
                    {balance.year}년
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          {/* 선택된 연도 정보 */}
          {selectedBalance && (
            <Box
              p="3"
              style={{
                backgroundColor: 'var(--blue-a2)',
                border: '1px solid var(--blue-a6)',
                borderRadius: 'var(--radius-2)',
              }}
            >
              <Flex direction="column" gap="1">
                <Text size="2">
                  총 연차: <strong>{selectedBalance.total}일</strong>
                </Text>
                <Text size="2">
                  현재 사용: <strong>{selectedBalance.used}일</strong>
                </Text>
                <Text size="2">
                  현재 잔여: <strong>{selectedBalance.remain}일</strong>
                </Text>
              </Flex>
            </Box>
          )}

          {/* 새 사용 연차 입력 */}
          <Box>
            <Text as="label" size="2" weight="medium" mb="2">
              새로운 사용 연차 (일)
            </Text>
            <TextField.Root
              type="number"
              step="0.5"
              min="0"
              max={selectedBalance?.total || 100}
              value={newUsed}
              onChange={(e) => setNewUsed(e.target.value)}
              placeholder="예: 5.5"
            />
            <Text
              size="1"
              style={{ color: 'var(--gray-11)', marginTop: '4px' }}
            >
              0.5 단위로 입력 가능합니다 (반차 포함)
            </Text>
          </Box>

          {/* 미리보기 */}
          {newUsed && selectedBalance && (
            <Box
              p="3"
              style={{
                backgroundColor: 'var(--green-a2)',
                border: '1px solid var(--green-a6)',
                borderRadius: 'var(--radius-2)',
              }}
            >
              <Text size="2" weight="medium">
                변경 후 잔여 연차:{' '}
                {selectedBalance.total - Number.parseFloat(newUsed)}일
              </Text>
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
              <Text size="2" style={{ color: 'var(--red-11)' }}>
                {error}
              </Text>
            </Box>
          )}

          {/* 버튼 */}
          <Flex gap="2" justify="end">
            <Button
              variant="soft"
              color="gray"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button onClick={handleSave}>저장</Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

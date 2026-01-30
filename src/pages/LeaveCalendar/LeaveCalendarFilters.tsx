import { Box, Checkbox, Flex, Select, Text } from '@radix-ui/themes'
import { useState } from 'react'
import type { User } from '@/types/leave'

interface LeaveCalendarFiltersProps {
  allUsers: User[]
  selectedUserIds: string[]
  onUserIdsChange: (userIds: string[]) => void
  selectedStatuses: ('RESERVED' | 'USED')[]
  onStatusesChange: (statuses: ('RESERVED' | 'USED')[]) => void
  selectedYear: number
  onYearChange: (year: number) => void
}

export function LeaveCalendarFilters({
  allUsers,
  selectedUserIds,
  onUserIdsChange,
  selectedStatuses,
  onStatusesChange,
  selectedYear,
  onYearChange,
}: LeaveCalendarFiltersProps) {
  const [showUserFilter, setShowUserFilter] = useState(false)

  // 연도 옵션 생성 (현재 연도 기준 -2 ~ +2)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  // 사용자 선택 토글
  const toggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onUserIdsChange(selectedUserIds.filter((id) => id !== userId))
    } else {
      onUserIdsChange([...selectedUserIds, userId])
    }
  }

  // 전체 선택/해제
  const toggleAllUsers = () => {
    if (selectedUserIds.length === allUsers.length) {
      onUserIdsChange([])
    } else {
      onUserIdsChange(allUsers.map((u) => u.user_id))
    }
  }

  // 상태 필터 토글
  const toggleStatus = (status: 'RESERVED' | 'USED') => {
    if (selectedStatuses.includes(status)) {
      const newStatuses = selectedStatuses.filter((s) => s !== status)
      if (newStatuses.length > 0) {
        onStatusesChange(newStatuses)
      }
    } else {
      onStatusesChange([...selectedStatuses, status])
    }
  }

  return (
    <Box
      p="4"
      style={{
        backgroundColor: 'var(--gray-a2)',
        border: '1px solid var(--gray-a5)',
        borderRadius: 'var(--radius-3)',
      }}
    >
      <Flex direction="column" gap="4">
        <Text size="3" weight="medium">
          필터
        </Text>

        <Flex gap="4" wrap="wrap">
          {/* 연도 필터 */}
          <Box style={{ minWidth: '120px' }}>
            <Text
              as="label"
              size="2"
              weight="medium"
              style={{ display: 'block', marginBottom: '8px' }}
            >
              연도
            </Text>
            <Select.Root
              value={String(selectedYear)}
              onValueChange={(value) => onYearChange(Number(value))}
            >
              <Select.Trigger style={{ width: '120px' }} />
              <Select.Content
                position="popper"
                sideOffset={5}
                collisionPadding={10}
                align="start"
                side="bottom"
              >
                {years.map((year) => (
                  <Select.Item key={year} value={String(year)}>
                    {year}년
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          {/* 상태 필터 */}
          <Box>
            <Text
              size="2"
              weight="medium"
              style={{ display: 'block', marginBottom: '8px' }}
            >
              상태
            </Text>
            <Flex gap="3">
              <Flex align="center" gap="2" style={{ cursor: 'pointer' }}>
                <Checkbox
                  checked={selectedStatuses.includes('RESERVED')}
                  onCheckedChange={() => toggleStatus('RESERVED')}
                />
                <Text size="2">사용 예정</Text>
              </Flex>
              <Flex align="center" gap="2" style={{ cursor: 'pointer' }}>
                <Checkbox
                  checked={selectedStatuses.includes('USED')}
                  onCheckedChange={() => toggleStatus('USED')}
                />
                <Text size="2">사용 완료</Text>
              </Flex>
            </Flex>
          </Box>

          {/* 사용자 필터 */}
          <Box style={{ flex: 1, minWidth: '200px' }}>
            <Flex
              justify="between"
              align="center"
              style={{ marginBottom: '8px' }}
            >
              <Text as="label" size="2" weight="medium">
                사용자 필터
              </Text>
              <button
                type="button"
                onClick={() => setShowUserFilter(!showUserFilter)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-11)',
                  fontSize: 'var(--font-size-1)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {showUserFilter ? '숨기기' : '표시'}
              </button>
            </Flex>

            {selectedUserIds.length > 0 && (
              <Text
                size="1"
                style={{ color: 'var(--gray-11)', marginBottom: '8px' }}
              >
                {selectedUserIds.length}명 선택됨
              </Text>
            )}

            {showUserFilter && (
              <Box
                p="3"
                style={{
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--gray-a6)',
                  borderRadius: 'var(--radius-2)',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                <Flex direction="column" gap="2">
                  <label
                    htmlFor={'total'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px',
                      borderBottom: '1px solid var(--gray-a5)',
                    }}
                  >
                    <Checkbox
                      id={'total'}
                      checked={
                        selectedUserIds.length === allUsers.length &&
                        allUsers.length > 0
                      }
                      onCheckedChange={toggleAllUsers}
                    />
                    <Text size="2" weight="medium">
                      전체 선택
                    </Text>
                  </label>

                  {allUsers.map((user) => (
                    <label
                      htmlFor={user.user_id}
                      key={user.user_id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      <Checkbox
                        id={user.user_id}
                        checked={selectedUserIds.includes(user.user_id)}
                        onCheckedChange={() => toggleUser(user.user_id)}
                      />
                      <Text size="2">{user.name}</Text>
                    </label>
                  ))}
                </Flex>
              </Box>
            )}
          </Box>
        </Flex>
      </Flex>
    </Box>
  )
}

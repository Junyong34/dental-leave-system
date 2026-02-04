import { Box, Checkbox, Flex, Select, Text } from '@radix-ui/themes'
import type { LeaveCalendarUser } from '@/types/leave'

interface LeaveCalendarFiltersProps {
  allUsers: LeaveCalendarUser[]
  showOnlyMine: boolean
  onShowOnlyMineChange: (checked: boolean) => void
  selectedStatuses: ('RESERVED' | 'USED')[]
  onStatusesChange: (statuses: ('RESERVED' | 'USED')[]) => void
  selectedYear: number
  onYearChange: (year: number) => void
}

export function LeaveCalendarFilters({
  allUsers,
  showOnlyMine,
  onShowOnlyMineChange,
  selectedStatuses,
  onStatusesChange,
  selectedYear,
  onYearChange,
}: LeaveCalendarFiltersProps) {
  // 연도 옵션 생성 (현재 연도 기준 -2 ~ +2)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

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
        <Flex direction="column" gap="2">
          <Text size="3" weight="medium">
            필터
          </Text>
          <Flex align="center" gap="2" style={{ cursor: 'pointer' }}>
            <Checkbox
              checked={showOnlyMine}
              onCheckedChange={(checked) =>
                onShowOnlyMineChange(checked === true)
              }
            />
            <Text size="2">내 연차만 보기</Text>
          </Flex>
        </Flex>

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

          {allUsers.length > 0 && (
            <Text size="1" style={{ color: 'var(--gray-11)' }}>
              {allUsers.length}명 조회됨
            </Text>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}

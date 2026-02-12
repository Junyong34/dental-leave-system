import { Box, Flex, Text } from '@radix-ui/themes'
import { SearchableEmployeeSelect } from '@/components/common/SearchableEmployeeSelect'
import type { Employee } from '@/types/nightShift'

interface EmployeeLeaveFiltersProps {
  allEmployees: Employee[]
  selectedEmployeeId: string
  onSelectedEmployeeIdChange: (value: string) => void
}

export function EmployeeLeaveFilters({
  allEmployees,
  selectedEmployeeId,
  onSelectedEmployeeIdChange,
}: EmployeeLeaveFiltersProps) {
  return (
    <Box
      p="4"
      style={{
        backgroundColor: 'var(--gray-a2)',
        border: '1px solid var(--gray-a5)',
        borderRadius: 'var(--radius-3)',
      }}
    >
      <Flex direction="column" gap="3">
        <Text size="3" weight="medium">
          필터
        </Text>

        <Flex align="end" justify="between" gap="3" wrap="wrap">
          <Box
            style={{ minWidth: '220px', flex: '1 1 220px', maxWidth: '420px' }}
          >
            <SearchableEmployeeSelect
              employees={allEmployees}
              value={selectedEmployeeId}
              onValueChange={onSelectedEmployeeIdChange}
              label="직원 선택"
              placeholder="직원을 선택하세요"
              showAllOption
              allOptionLabel="전체 직원"
            />
          </Box>

          <Text size="1" style={{ color: 'var(--gray-11)' }}>
            {allEmployees.length}명 조회 가능
          </Text>
        </Flex>
      </Flex>
    </Box>
  )
}

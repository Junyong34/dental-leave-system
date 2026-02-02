import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  IconButton,
  Switch,
  Table,
  Text,
} from '@radix-ui/themes'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { deleteEmployee, updateEmployee } from '@/lib/supabase/api/nightShift'
import type { Employee } from '@/types/nightShift'

interface EmployeeManagementSectionProps {
  employees: Employee[]
  onSuccess: (message: string) => void
  onError: (message: string) => void
  onReload: () => void
  onAddClick: () => void
  onAddMultipleClick: () => void
}

export function EmployeeManagementSection({
  employees,
  onSuccess,
  onError,
  onReload,
  onAddClick,
  onAddMultipleClick,
}: EmployeeManagementSectionProps) {
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)

  const handleDeleteEmployee = async (id: number, name: string) => {
    if (
      !confirm(
        `${name} 직원을 삭제하시겠습니까?\n관련된 모든 야간 진료 기록도 함께 삭제됩니다.`,
      )
    ) {
      return
    }

    const result = await deleteEmployee(id)

    if (result.success) {
      onSuccess('직원이 삭제되었습니다.')
      onReload()
    } else {
      onError(result.message)
    }
  }

  const handleToggleEmployeeStatus = async (employee: Employee) => {
    const nextStatus = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    setStatusUpdatingId(employee.id)
    const result = await updateEmployee(employee.id, { status: nextStatus })
    setStatusUpdatingId(null)

    if (result.success) {
      onSuccess('직원 상태가 변경되었습니다.')
      onReload()
    } else {
      onError(result.message)
    }
  }

  return (
    <Card>
      <Flex direction="column" gap="3">
        <Flex justify="between" align="center">
          <Heading size="4">직원 관리</Heading>
          <Flex gap="2">
            <Button variant="soft" onClick={onAddMultipleClick}>
              여러 명 추가
            </Button>
            <Button onClick={onAddClick}>
              <Plus size={16} />
              직원 추가
            </Button>
          </Flex>
        </Flex>

        <Text size="2" color="gray">
          야간 진료를 담당하는 직원을 관리합니다.
        </Text>

        {employees.length === 0 ? (
          <Text color="gray">등록된 직원이 없습니다.</Text>
        ) : (
          <Box
            style={{
              maxHeight: '420px',
              minHeight: '240px',
              overflowY: 'auto',
            }}
          >
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>이름</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>계정 연동</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>상태</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>퇴사/재직</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>작업</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {employees.map((emp) => (
                  <Table.Row key={emp.id}>
                    <Table.Cell>
                      <Text weight="bold">{emp.name}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={emp.user_id ? 'green' : 'gray'}>
                        {emp.user_id ? '연동됨' : '미연동'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={emp.status === 'ACTIVE' ? 'blue' : 'gray'}>
                        {emp.status === 'ACTIVE' ? '재직' : '퇴사'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Switch
                        checked={emp.status === 'ACTIVE'}
                        disabled={statusUpdatingId === emp.id}
                        onCheckedChange={() => handleToggleEmployeeStatus(emp)}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <IconButton
                        size="1"
                        variant="ghost"
                        color="red"
                        onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}
      </Flex>
    </Card>
  )
}

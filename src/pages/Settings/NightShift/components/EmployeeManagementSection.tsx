import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Switch,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
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

const MOBILE_BREAKPOINT = 768

export function EmployeeManagementSection({
  employees,
  onSuccess,
  onError,
  onReload,
  onAddClick,
  onAddMultipleClick,
}: EmployeeManagementSectionProps) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT,
  )
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(
    null,
  )
  const [editingName, setEditingName] = useState('')
  const [nameUpdatingId, setNameUpdatingId] = useState<number | null>(null)
  const editingEmployee =
    employees.find((employee) => employee.id === editingEmployeeId) ?? null

  const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ')

  const handleOpenEditDialog = (employee: Employee) => {
    setEditingEmployeeId(employee.id)
    setEditingName(employee.name)
  }

  const handleCloseEditDialog = () => {
    setEditingEmployeeId(null)
    setEditingName('')
  }

  const handleSaveName = async () => {
    if (!editingEmployee) {
      return
    }

    const normalizedName = normalizeName(editingName)

    if (!normalizedName) {
      onError('직원 이름을 입력해주세요.')
      return
    }

    const duplicateExists = employees.some(
      (item) =>
        item.id !== editingEmployee.id &&
        normalizeName(item.name) === normalizedName,
    )

    if (duplicateExists) {
      onError('이미 등록된 직원 이름입니다.')
      return
    }

    const originalName = normalizeName(editingEmployee.name)
    if (normalizedName === originalName) {
      handleCloseEditDialog()
      return
    }

    setNameUpdatingId(editingEmployee.id)
    const result = await updateEmployee(editingEmployee.id, {
      name: normalizedName,
    })
    setNameUpdatingId(null)

    if (result.success) {
      onSuccess('직원 이름이 수정되었습니다.')
      handleCloseEditDialog()
      onReload()
    } else {
      onError(result.message)
    }
  }

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <Card>
      <Flex direction="column" gap="3">
        <Flex
          justify="between"
          align={isMobile ? 'start' : 'center'}
          direction={isMobile ? 'column' : 'row'}
          gap="2"
        >
          <Heading size="4">직원 관리</Heading>
          <Flex gap="2" justify={isMobile ? 'start' : 'end'}>
            <Button
              size={isMobile ? '1' : '2'}
              variant="soft"
              onClick={onAddMultipleClick}
            >
              여러 명 추가
            </Button>
            <Button size={isMobile ? '1' : '2'} onClick={onAddClick}>
              <Plus size={isMobile ? 14 : 16} />
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
                        disabled={
                          statusUpdatingId === emp.id ||
                          nameUpdatingId === emp.id
                        }
                        onCheckedChange={() => handleToggleEmployeeStatus(emp)}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Flex gap="2" align="center">
                        <Button
                          size="1"
                          variant="soft"
                          disabled={
                            statusUpdatingId === emp.id ||
                            nameUpdatingId === emp.id
                          }
                          onClick={() => handleOpenEditDialog(emp)}
                        >
                          수정
                        </Button>
                        <IconButton
                          size="1"
                          variant="ghost"
                          color="red"
                          disabled={
                            statusUpdatingId === emp.id ||
                            nameUpdatingId === emp.id
                          }
                          onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}
      </Flex>

      <Dialog.Root
        open={editingEmployeeId !== null}
        onOpenChange={(open) => {
          if (!open && nameUpdatingId === null) {
            handleCloseEditDialog()
          }
        }}
      >
        <Dialog.Content>
          <Dialog.Title>직원 이름 수정</Dialog.Title>
          <Dialog.Description>
            직원 이름만 수정할 수 있습니다.
          </Dialog.Description>

          <Flex direction="column" gap="3" mt="4">
            <Box>
              <Text size="2" weight="bold" as="label">
                이름
              </Text>
              <TextField.Root
                placeholder="직원 이름"
                value={editingName}
                disabled={nameUpdatingId !== null}
                onChange={(event) => setEditingName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    void handleSaveName()
                  }
                  if (event.key === 'Escape' && nameUpdatingId === null) {
                    event.preventDefault()
                    handleCloseEditDialog()
                  }
                }}
              />
            </Box>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Button
              variant="soft"
              color="gray"
              onClick={handleCloseEditDialog}
              disabled={nameUpdatingId !== null}
            >
              취소
            </Button>
            <Button
              onClick={() => void handleSaveName()}
              disabled={nameUpdatingId !== null || !editingEmployee}
            >
              {nameUpdatingId !== null ? '저장 중...' : '저장'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Card>
  )
}

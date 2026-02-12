import {
  Box,
  Button,
  Dialog,
  Flex,
  Select,
  Text,
  TextField,
} from '@radix-ui/themes'
import { Calendar } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { SearchableEmployeeSelect } from '@/components/common/SearchableEmployeeSelect'
import type {
  EmployeeLeaveMutationPayload,
  EmployeeLeaveSession,
  EmployeeLeaveType,
} from '@/types/employeeLeave'
import type { Employee } from '@/types/nightShift'

interface EmployeeLeaveFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  employees: Employee[]
  initialValue?: EmployeeLeaveMutationPayload
  initialDate?: string
  onSubmit: (payload: EmployeeLeaveMutationPayload) => Promise<void>
}

export function EmployeeLeaveFormDialog({
  open,
  onOpenChange,
  mode,
  employees,
  initialValue,
  initialDate,
  onSubmit,
}: EmployeeLeaveFormDialogProps) {
  const [employeeId, setEmployeeId] = useState<string>('')
  const [leaveDate, setLeaveDate] = useState('')
  const [leaveType, setLeaveType] = useState<EmployeeLeaveType>('FULL')
  const [session, setSession] = useState<EmployeeLeaveSession>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    if (initialValue) {
      setEmployeeId(String(initialValue.employeeId))
      setLeaveDate(initialValue.leaveDate)
      setLeaveType(initialValue.leaveType)
      setSession(initialValue.session)
      setError('')
      return
    }

    setEmployeeId('')
    setLeaveDate(initialDate ?? '')
    setLeaveType('FULL')
    setSession(null)
    setError('')
  }, [initialDate, initialValue, open])

  useEffect(() => {
    if (leaveType !== 'HALF') {
      setSession(null)
    }
  }, [leaveType])

  const dialogTitle = mode === 'create' ? '연차 추가' : '연차 수정'
  const submitLabel = mode === 'create' ? '추가' : '수정'

  const selectedEmployee = useMemo(
    () => employees.find((employee) => String(employee.id) === employeeId),
    [employeeId, employees],
  )

  const handleSubmit = async () => {
    setError('')

    if (!employeeId) {
      setError('직원을 선택해주세요.')
      return
    }

    if (!leaveDate) {
      setError('날짜를 선택해주세요.')
      return
    }

    if (leaveType === 'HALF' && !session) {
      setError('반차는 오전/오후를 선택해주세요.')
      return
    }

    if (!selectedEmployee) {
      setError('재직 중인 직원을 선택해주세요.')
      return
    }

    setLoading(true)

    try {
      await onSubmit({
        employeeId: Number(employeeId),
        leaveDate,
        leaveType,
        session: leaveType === 'HALF' ? session : null,
      })
      onOpenChange(false)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : '연차 저장에 실패했습니다.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="520px">
        <Dialog.Title>{dialogTitle}</Dialog.Title>

        <Flex direction="column" gap="4" mt="4">
          <Box>
            <SearchableEmployeeSelect
              employees={employees}
              value={employeeId}
              onValueChange={setEmployeeId}
              label="직원"
              placeholder="재직 중인 직원을 선택하세요"
            />
          </Box>

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
              value={leaveDate}
              onChange={(event) => setLeaveDate(event.target.value)}
              style={{ maxWidth: '190px' }}
            >
              <TextField.Slot>
                <Calendar size={16} />
              </TextField.Slot>
            </TextField.Root>
          </Box>

          <Box>
            <Text
              as="label"
              size="2"
              weight="medium"
              style={{ display: 'block', marginBottom: '8px' }}
            >
              연차 타입
            </Text>
            <Select.Root
              value={leaveType}
              onValueChange={(value) =>
                setLeaveType(value as EmployeeLeaveType)
              }
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="FULL">연차 (8시간)</Select.Item>
                <Select.Item value="HALF">반차 (4시간)</Select.Item>
                <Select.Item value="QUARTER">반반차 (2시간)</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>

          {leaveType === 'HALF' && (
            <Box>
              <Text
                as="label"
                size="2"
                weight="medium"
                style={{ display: 'block', marginBottom: '8px' }}
              >
                반차 구분
              </Text>
              <Select.Root
                value={session ?? ''}
                onValueChange={(value) =>
                  setSession(value as EmployeeLeaveSession)
                }
              >
                <Select.Trigger placeholder="오전/오후 선택" />
                <Select.Content>
                  <Select.Item value="AM">오전 (AM)</Select.Item>
                  <Select.Item value="PM">오후 (PM)</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
          )}

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
        </Flex>

        <Flex justify="end" gap="3" mt="5">
          <Dialog.Close>
            <Button variant="soft" color="gray" disabled={loading}>
              취소
            </Button>
          </Dialog.Close>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? `${submitLabel} 중...` : submitLabel}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

import { Box, Button, Dialog, Flex, Text } from '@radix-ui/themes'
import { useRef, useState } from 'react'
import { createEmployees } from '@/lib/supabase/api/nightShift'
import { EmployeeTagInput } from './EmployeeTagInput'

interface AddEmployeesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
  onReload: () => void
}

export function AddEmployeesDialog({
  open,
  onOpenChange,
  onSuccess,
  onError,
  onReload,
}: AddEmployeesDialogProps) {
  const [names, setNames] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const submittingRef = useRef(false)

  const handleSubmit = async () => {
    if (submittingRef.current) return

    if (names.length === 0) {
      onError('직원 이름을 입력해주세요.')
      return
    }

    submittingRef.current = true
    setLoading(true)
    const result = await createEmployees(names)
    setLoading(false)
    submittingRef.current = false

    if (result.success) {
      const count = result.data?.length ?? names.length
      onSuccess(`${count}명의 직원이 추가되었습니다.`)
      setNames([])
      onOpenChange(false)
      onReload()
    } else {
      onError(result.message)
    }
  }

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setNames([])
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Content>
        <Dialog.Title>여러 명 직원 추가</Dialog.Title>
        <Dialog.Description>
          여러 명의 직원을 한 번에 추가합니다. 이름을 입력한 뒤 Enter 또는
          쉼표로 태그를 추가해주세요.
        </Dialog.Description>

        <Flex direction="column" gap="3" mt="4">
          <Box>
            <Text size="2" weight="bold" as="label">
              이름 목록
            </Text>
            <EmployeeTagInput
              value={names}
              onChange={setNames}
              disabled={loading}
            />
          </Box>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              취소
            </Button>
          </Dialog.Close>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '추가 중...' : '여러 명 추가'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

import { Box, Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes'
import { useRef, useState } from 'react'
import { createEmployee } from '@/lib/supabase/api/nightShift'

interface AddEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
  onReload: () => void
}

export function AddEmployeeDialog({
  open,
  onOpenChange,
  onSuccess,
  onError,
  onReload,
}: AddEmployeeDialogProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const submittingRef = useRef(false)

  const handleSubmit = async () => {
    if (submittingRef.current) return

    if (!name.trim()) {
      onError('직원 이름을 입력해주세요.')
      return
    }

    submittingRef.current = true
    setLoading(true)
    const result = await createEmployee(name.trim())
    setLoading(false)
    submittingRef.current = false

    if (result.success) {
      onSuccess('직원이 추가되었습니다.')
      setName('')
      onOpenChange(false)
      onReload()
    } else {
      onError(result.message)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Title>직원 추가</Dialog.Title>
        <Dialog.Description>
          새로운 직원을 추가합니다. 추후 회원가입 후 계정과 연동할 수 있습니다.
        </Dialog.Description>

        <Flex direction="column" gap="3" mt="4">
          <Box>
            <Text size="2" weight="bold" as="label">
              이름
            </Text>
            <TextField.Root
              placeholder="직원 이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
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
            {loading ? '추가 중...' : '추가'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

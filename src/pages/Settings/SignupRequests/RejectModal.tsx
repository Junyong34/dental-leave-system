import { Box, Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

type RejectModalProps = {
  open: boolean
  email?: string
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string, note?: string) => void
}

export default function RejectModal({
  open,
  email,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: RejectModalProps) {
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      setReason('')
      setNote('')
      setError('')
    }
  }, [open])

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('거부 사유를 입력해주세요.')
      return
    }
    setError('')
    onConfirm(reason.trim(), note.trim() || undefined)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Title>가입 요청 거부</Dialog.Title>
        <Dialog.Description>
          {email ? `${email} 요청을 거부합니다.` : '가입 요청을 거부합니다.'}
        </Dialog.Description>

        <Flex direction="column" gap="3" mt="4">
          <Box>
            <Text size="2" weight="bold" as="label">
              거부 사유
            </Text>
            <TextField.Root
              placeholder="거부 사유를 입력해주세요"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Box>

          <Box>
            <Text size="2" weight="bold" as="label">
              관리자 메모 (선택)
            </Text>
            <TextField.Root
              placeholder="필요한 경우 메모를 남겨주세요"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Box>

          {error && (
            <Text size="2" color="red">
              {error}
            </Text>
          )}
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              취소
            </Button>
          </Dialog.Close>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? '처리 중...' : '거부'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

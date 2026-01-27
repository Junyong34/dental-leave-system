import {
  Box,
  Dialog,
  Flex,
  IconButton,
  ScrollArea,
  Text,
} from '@radix-ui/themes'
import { X } from 'lucide-react'
import type { LeaveHistory } from '../../types/leave'

interface LeaveHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  history: LeaveHistory[]
}

export function LeaveHistoryModal({
  open,
  onOpenChange,
  userName,
  history,
}: LeaveHistoryModalProps) {
  // used_at 기준 최신순 정렬
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.used_at).getTime() - new Date(a.used_at).getTime(),
  )

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="600px">
        <Dialog.Title>{userName}님의 연차 사용 내역</Dialog.Title>
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

        <ScrollArea
          type="auto"
          scrollbars="vertical"
          style={{ maxHeight: '60vh', marginTop: '16px' }}
        >
          {sortedHistory.length === 0 ? (
            <Text
              as="p"
              align="center"
              color="gray"
              style={{ padding: '32px 0' }}
            >
              연차 사용 내역이 없습니다.
            </Text>
          ) : (
            <Flex direction="column" gap="2">
              {sortedHistory.map((item) => {
                const usedDate = new Date(item.used_at)
                const formattedTime = usedDate.toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <Box
                    key={item.id}
                    p="3"
                    style={{
                      border: '1px solid var(--gray-a6)',
                      borderRadius: 'var(--radius-2)',
                      backgroundColor: 'var(--gray-a2)',
                    }}
                  >
                    <Flex justify="between" align="center" mb="2">
                      <Text size="3" weight="semibold">
                        {item.date}
                      </Text>
                      <Text
                        size="2"
                        weight="semibold"
                        style={{
                          color:
                            item.type === 'FULL'
                              ? 'var(--blue-9)'
                              : 'var(--green-9)',
                        }}
                      >
                        {item.type === 'FULL'
                          ? '종일'
                          : `반차 (${item.session})`}
                      </Text>
                    </Flex>
                    <Flex justify="between" align="center" mb="1">
                      <Text size="1">
                        {item.weekday} • {item.amount}일 사용
                      </Text>
                      <Text size="1">{item.source_year}년 연차</Text>
                    </Flex>
                    <Text size="1" style={{ color: 'var(--gray-10)' }}>
                      사용 시간: {formattedTime}
                    </Text>
                  </Box>
                )
              })}
            </Flex>
          )}
        </ScrollArea>
      </Dialog.Content>
    </Dialog.Root>
  )
}

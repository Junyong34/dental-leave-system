import { Button, Flex, Table, Text } from '@radix-ui/themes'
import { Check, X } from 'lucide-react'
import type { SignupRequest } from '@/lib/supabase/api/signupRequest'

type RequestTableProps = {
  requests: SignupRequest[]
  isLoading: boolean
  actionLoadingId: number | null
  onApprove: (request: SignupRequest) => void
  onReject: (request: SignupRequest) => void
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ko-KR')
}

const formatStatusLabel = (status: SignupRequest['status']) => {
  if (status === 'PENDING') return '대기'
  if (status === 'APPROVED') return '승인'
  if (status === 'REJECTED') return '거부'
  return status
}

export default function RequestTable({
  requests,
  isLoading,
  actionLoadingId,
  onApprove,
  onReject,
}: RequestTableProps) {
  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>이메일</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>이름</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>요청일</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>상태</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>처리일</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>액션</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {isLoading ? (
          <Table.Row>
            <Table.Cell colSpan={6}>데이터를 불러오는 중...</Table.Cell>
          </Table.Row>
        ) : requests.length === 0 ? (
          <Table.Row>
            <Table.Cell colSpan={6}>표시할 요청이 없습니다.</Table.Cell>
          </Table.Row>
        ) : (
          requests.map((request) => {
            const isPending = request.status === 'PENDING'
            const isRowLoading = actionLoadingId === request.id

            return (
              <Table.Row key={request.id}>
                <Table.Cell>{request.email}</Table.Cell>
                <Table.Cell>{request.requested_name || '-'}</Table.Cell>
                <Table.Cell>{formatDateTime(request.requested_at)}</Table.Cell>
                <Table.Cell>
                  <Text size="2">{formatStatusLabel(request.status)}</Text>
                </Table.Cell>
                <Table.Cell>{formatDateTime(request.processed_at)}</Table.Cell>
                <Table.Cell>
                  {isPending ? (
                    <Flex gap="2">
                      <Button
                        size="2"
                        onClick={() => onApprove(request)}
                        disabled={isRowLoading}
                      >
                        <Check size={14} />
                        {isRowLoading ? '처리 중...' : '승인'}
                      </Button>
                      <Button
                        size="2"
                        variant="soft"
                        color="red"
                        onClick={() => onReject(request)}
                        disabled={isRowLoading}
                      >
                        <X size={14} />
                        거부
                      </Button>
                    </Flex>
                  ) : (
                    <Text size="2" color="gray">
                      -
                    </Text>
                  )}
                </Table.Cell>
              </Table.Row>
            )
          })
        )}
      </Table.Body>
    </Table.Root>
  )
}

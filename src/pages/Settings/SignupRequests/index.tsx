import {
  Box,
  Callout,
  Card,
  Flex,
  Heading,
  Select,
  Text,
} from '@radix-ui/themes'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  approveSignupRequest,
  getSignupRequests,
  rejectSignupRequest,
  type SignupRequest,
  type SignupRequestStatus,
} from '@/lib/supabase/api/signupRequest'
import RejectModal from './RejectModal'
import RequestTable from './RequestTable'

type FilterValue = 'ALL' | SignupRequestStatus

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING', label: '대기' },
  { value: 'APPROVED', label: '승인' },
  { value: 'REJECTED', label: '거부' },
]

export default function SignupRequests() {
  const [filter, setFilter] = useState<FilterValue>('PENDING')
  const [requests, setRequests] = useState<SignupRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [rejectTarget, setRejectTarget] = useState<SignupRequest | null>(null)
  const [isRejecting, setIsRejecting] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadRequests = async () => {
      setIsLoading(true)
      setError('')

      const result = await getSignupRequests(
        filter === 'ALL' ? undefined : filter,
      )

      if (!isMounted) return

      if (!result.success || !result.data) {
        setError(result.error || '가입 요청 목록을 불러오지 못했습니다.')
        setRequests([])
      } else {
        setRequests(result.data)
      }

      setIsLoading(false)
    }

    void loadRequests()

    return () => {
      isMounted = false
    }
  }, [filter])

  const reloadRequests = async () => {
    const result = await getSignupRequests(
      filter === 'ALL' ? undefined : filter,
    )
    if (!result.success || !result.data) {
      setError(result.error || '가입 요청 목록을 불러오지 못했습니다.')
      setRequests([])
      return
    }
    setRequests(result.data)
  }

  const handleApprove = async (request: SignupRequest) => {
    setActionLoadingId(request.id)
    setActionError('')
    setActionSuccess('')

    const result = await approveSignupRequest(request.id)
    if (!result.success) {
      setActionError(result.error || '승인 처리에 실패했습니다.')
    } else {
      setActionSuccess('승인 처리되었습니다.')
      await reloadRequests()
    }

    setActionLoadingId(null)
  }

  const handleReject = async (reason: string, note?: string) => {
    if (!rejectTarget) return

    setIsRejecting(true)
    setActionError('')
    setActionSuccess('')

    const result = await rejectSignupRequest(rejectTarget.id, reason, note)
    setIsRejecting(false)

    if (!result.success) {
      setActionError(result.error || '거부 처리에 실패했습니다.')
      return
    }

    setActionSuccess('거부 처리되었습니다.')
    setRejectTarget(null)
    await reloadRequests()
  }

  const handleCloseReject = (open: boolean) => {
    if (!open) {
      setRejectTarget(null)
    }
  }

  return (
    <Box>
      <Heading size="4" mb="4">
        가입 요청 관리
      </Heading>
      <Text color="gray" size="2" mb="6">
        신규 가입 초대 요청을 확인하고 승인 또는 거부할 수 있습니다.
      </Text>

      <Card>
        <Flex direction="column" gap="4">
          <Box style={{ width: '180px' }}>
            <Text
              size="2"
              weight="medium"
              mb="2"
              as="label"
              style={{ display: 'block', marginBottom: '8px' }}
            >
              상태 필터
            </Text>
            <Select.Root
              value={filter}
              onValueChange={(value) => setFilter(value as FilterValue)}
            >
              <Select.Trigger />
              <Select.Content>
                {FILTER_OPTIONS.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          {error && (
            <Callout.Root color="red" size="2">
              <Callout.Icon>
                <AlertCircle size={16} />
              </Callout.Icon>
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}

          {actionError && (
            <Callout.Root color="red" size="2">
              <Callout.Icon>
                <AlertCircle size={16} />
              </Callout.Icon>
              <Callout.Text>{actionError}</Callout.Text>
            </Callout.Root>
          )}

          {actionSuccess && (
            <Callout.Root color="green" size="2">
              <Callout.Icon>
                <CheckCircle2 size={16} />
              </Callout.Icon>
              <Callout.Text>{actionSuccess}</Callout.Text>
            </Callout.Root>
          )}

          <RequestTable
            requests={requests}
            isLoading={isLoading}
            actionLoadingId={actionLoadingId}
            onApprove={handleApprove}
            onReject={(request) => setRejectTarget(request)}
          />
        </Flex>
      </Card>

      <RejectModal
        open={Boolean(rejectTarget)}
        email={rejectTarget?.email}
        onOpenChange={handleCloseReject}
        onConfirm={handleReject}
        isSubmitting={isRejecting}
      />
    </Box>
  )
}

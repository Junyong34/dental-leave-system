import { Box, Button, Callout, Flex, Text, TextField } from '@radix-ui/themes'
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react'
import { useState } from 'react'
import { createSignupRequest } from '@/lib/supabase/api/signupRequest'
import {
  ALLOWED_EMAIL_DOMAINS,
  normalizeEmail,
  validateSignupEmail,
} from '@/utils/emailValidator'
import {
  hasSignupRequestAttempt,
  recordSignupRequestAttempt,
} from '@/utils/signupRequestStorage'

export default function SignupRequestTab() {
  const [email, setEmail] = useState('')
  const [requestedName, setRequestedName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const validation = validateSignupEmail(email)
    if (!validation.valid) {
      setError(validation.reason ?? '이메일을 확인해주세요.')
      return
    }

    const normalizedEmail = validation.normalized ?? normalizeEmail(email)
    if (hasSignupRequestAttempt(normalizedEmail)) {
      setError('이미 이 세션에서 요청한 이메일입니다.')
      return
    }

    setIsSubmitting(true)
    const result = await createSignupRequest(
      normalizedEmail,
      requestedName.trim() || undefined,
    )
    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error || '가입 요청에 실패했습니다.')
      return
    }

    recordSignupRequestAttempt(normalizedEmail)
    setSuccess('가입 요청이 접수되었습니다. 승인 후 메일이 발송됩니다.')
    setEmail('')
    setRequestedName('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="4">
        <Box>
          <Text
            as="label"
            size="2"
            weight="medium"
            mb="2"
            className="block text-gray-700"
          >
            이메일
          </Text>
          <TextField.Root
            size="3"
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </Box>

        <Box>
          <Text
            as="label"
            size="2"
            weight="medium"
            mb="2"
            className="block text-gray-700"
          >
            이름 (선택)
          </Text>
          <TextField.Root
            size="3"
            type="text"
            placeholder="이름을 입력하세요"
            value={requestedName}
            onChange={(e) => setRequestedName(e.target.value)}
            autoComplete="name"
          />
        </Box>

        <Text size="1" color="gray">
          허용 도메인: {ALLOWED_EMAIL_DOMAINS.join(', ')}
        </Text>

        {error && (
          <Callout.Root color="red" size="2">
            <Callout.Icon>
              <AlertCircle size={16} />
            </Callout.Icon>
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}

        {success && (
          <Callout.Root color="green" size="2">
            <Callout.Icon>
              <CheckCircle2 size={16} />
            </Callout.Icon>
            <Callout.Text>{success}</Callout.Text>
          </Callout.Root>
        )}

        <Button
          type="submit"
          size="3"
          className="cursor-pointer"
          disabled={isSubmitting}
        >
          <Mail size={16} />
          {isSubmitting ? '요청 중...' : '가입 초대 요청'}
        </Button>
      </Flex>
    </form>
  )
}

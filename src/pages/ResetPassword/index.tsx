import {
  Box,
  Button,
  Callout,
  Card,
  Flex,
  IconButton,
  Text,
  TextField,
} from '@radix-ui/themes'
import {
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { getCurrentUser, getSession, updatePassword } from '@/lib/supabase/api/auth'
import { useAuthStore } from '@/store/authStore'
import { setFlashNotice } from '@/utils/flashNotice'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    let isMounted = true

    const loadSession = async () => {
      setIsLoadingUser(true)
      const [session, user] = await Promise.all([getSession(), getCurrentUser()])
      if (!isMounted) return

      setHasSession(!!session)
      setUserEmail(user?.email ?? null)
      setIsLoadingUser(false)
    }

    loadSession()

    return () => {
      isMounted = false
    }
  }, [])

  const passwordsMatch =
    password.length > 0 && passwordConfirm.length > 0 && password === passwordConfirm
  const showMismatch =
    passwordConfirm.length > 0 && password.length > 0 && password !== passwordConfirm
  const isSessionMissing = hasSession === false

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isSessionMissing) {
      return
    }

    if (!password || !passwordConfirm) {
      setError('새 비밀번호를 입력해주세요.')
      return
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updatePassword(password)
      if (!result.success) {
        setError(result.error || '비밀번호 변경에 실패했습니다.')
        return
      }

      await logout()
      setFlashNotice({
        message: '비밀번호가 변경되었습니다. 다시 로그인해 주세요.',
        tone: 'green',
      })
      navigate('/login', { replace: true })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Flex
      align="center"
      justify="center"
      className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 px-4 py-10"
    >
      <Card size="4" className="w-full max-w-[460px] shadow-xl">
        <Flex direction="column" gap="6" p="6">
          <Flex direction="column" align="center" gap="3">
            <Box className="rounded-full bg-indigo-100 p-4">
              <KeyRound size={40} className="text-indigo-600" />
            </Box>
            <Text size="6" weight="bold" align="center" className="text-gray-900">
              비밀번호 변경
            </Text>
            <Text size="2" align="center" className="text-gray-600">
              새로운 비밀번호를 안전하게 설정해 주세요
            </Text>
          </Flex>

          <Box className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
            <Flex align="center" gap="2">
              <ShieldCheck size={16} className="text-indigo-600" />
              <Text size="2" weight="medium" className="text-indigo-900">
                보안 권장 사항
              </Text>
            </Flex>
            <Text size="1" className="text-indigo-700">
              영문과 숫자를 조합해 예측하기 어려운 비밀번호를 사용하세요.
            </Text>
          </Box>

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
                  계정 이메일
                </Text>
                <TextField.Root
                  size="3"
                  type="email"
                  value={userEmail ?? ''}
                  placeholder={isLoadingUser ? '세션 확인 중...' : '이메일을 확인할 수 없습니다'}
                  readOnly
                  className="bg-gray-50"
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
                  새 비밀번호
                </Text>
                <TextField.Root
                  size="3"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="새 비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={isLoadingUser || isSessionMissing || isSubmitting}
                >
                  <TextField.Slot side="right">
                    <IconButton
                      type="button"
                      variant="ghost"
                      color="gray"
                      aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  </TextField.Slot>
                </TextField.Root>
              </Box>

              <Box>
                <Text
                  as="label"
                  size="2"
                  weight="medium"
                  mb="2"
                  className="block text-gray-700"
                >
                  새 비밀번호 확인
                </Text>
                <TextField.Root
                  size="3"
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  autoComplete="new-password"
                  disabled={isLoadingUser || isSessionMissing || isSubmitting}
                >
                  <TextField.Slot side="right">
                    <IconButton
                      type="button"
                      variant="ghost"
                      color="gray"
                      aria-label={
                        showPasswordConfirm
                          ? '비밀번호 확인 숨기기'
                          : '비밀번호 확인 표시'
                      }
                      onClick={() => setShowPasswordConfirm((prev) => !prev)}
                    >
                      {showPasswordConfirm ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </IconButton>
                  </TextField.Slot>
                </TextField.Root>
                {showMismatch && (
                  <Text size="1" className="mt-2 block text-red-600">
                    비밀번호가 일치하지 않습니다.
                  </Text>
                )}
                {passwordsMatch && (
                  <Text size="1" className="mt-2 block text-emerald-600">
                    비밀번호가 일치합니다.
                  </Text>
                )}
              </Box>

              {isSessionMissing && (
                <Callout.Root color="red" size="2">
                  <Callout.Icon>
                    <AlertCircle size={16} />
                  </Callout.Icon>
                  <Callout.Text>
                    유효한 세션이 없습니다. 비밀번호 재설정 링크를 다시
                    확인해주세요.
                  </Callout.Text>
                </Callout.Root>
              )}

              {error && (
                <Callout.Root color="red" size="2">
                  <Callout.Icon>
                    <AlertCircle size={16} />
                  </Callout.Icon>
                  <Callout.Text>{error}</Callout.Text>
                </Callout.Root>
              )}

              <Flex direction="column" gap="2">
                <Button
                  type="submit"
                  size="3"
                  className="cursor-pointer"
                  disabled={isSubmitting || isLoadingUser || isSessionMissing}
                >
                  {isSubmitting ? '변경 중...' : '비밀번호 변경'}
                </Button>
                {isSessionMissing && (
                  <Button
                    type="button"
                    variant="soft"
                    color="gray"
                    onClick={() => navigate('/login', { replace: true })}
                  >
                    로그인 페이지로 이동
                  </Button>
                )}
              </Flex>
            </Flex>
          </form>
        </Flex>
      </Card>
    </Flex>
  )
}

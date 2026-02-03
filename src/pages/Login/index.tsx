import {
  Box,
  Button,
  Callout,
  Card,
  Flex,
  IconButton,
  SegmentedControl,
  Text,
  TextField,
} from '@radix-ui/themes'
import { AlertCircle, Eye, EyeOff, Hospital, LogIn } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { getSession } from '@/lib/supabase/api/auth'
import SignupRequestTab from '@/pages/Login/SignupRequestTab'
import { useAuthStore } from '@/store/authStore.ts'
import {
  consumeFlashNotice,
  type FlashNotice,
  setFlashNotice,
} from '@/utils/flashNotice'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState<FlashNotice | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  useEffect(() => {
    const flash = consumeFlashNotice()
    if (flash?.message) {
      setNotice(flash)
    }
  }, [])

  const handleTabChange = (tab: 'login' | 'signup') => {
    setActiveTab(tab)
    setError('')
    setNotice(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setNotice(null)

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const success = await login(email, password)
      if (success) {
        const session = await getSession()
        if (!session) {
          setError('세션을 확인하지 못했습니다. 다시 시도해주세요.')
          return
        }
        setFlashNotice({ message: '로그인되었습니다.', tone: 'green' })
        navigate('/')
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Flex
      align="center"
      justify="center"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4"
    >
      <Card size="4" className="w-full max-w-[420px] shadow-xl">
        <Flex direction="column" gap="6" p="6">
          <Flex direction="column" align="center" gap="3">
            <Box className="bg-blue-100 rounded-full p-4">
              <Hospital size={40} className="text-blue-600" />
            </Box>
            <Text
              size="7"
              weight="bold"
              align="center"
              className="text-gray-900"
            >
              연차 관리 시스템
            </Text>
            <Text size="2" align="center" className="text-gray-600">
              로그인하여 시스템을 사용하세요
            </Text>
          </Flex>

          <SegmentedControl.Root
            value={activeTab}
            onValueChange={(value) =>
              handleTabChange(value as 'login' | 'signup')
            }
            radius="full"
            size={{ initial: '3', sm: '2' }}
            className="w-full"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}
            aria-label="로그인 및 가입 요청 탭"
          >
            <SegmentedControl.Item value="login">
              로그인
            </SegmentedControl.Item>
            <SegmentedControl.Item value="signup">
              가입 초대 요청
            </SegmentedControl.Item>
          </SegmentedControl.Root>

          {activeTab === 'login' ? (
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
                    비밀번호
                  </Text>
                  <TextField.Root
                    size="3"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  >
                    <TextField.Slot side="right">
                      <IconButton
                        type="button"
                        variant="ghost"
                        color="gray"
                        aria-label={
                          showPassword ? '비밀번호 숨기기' : '비밀번호 표시'
                        }
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </IconButton>
                    </TextField.Slot>
                  </TextField.Root>
                </Box>

                {error && (
                  <Callout.Root color="red" size="2">
                    <Callout.Icon>
                      <AlertCircle size={16} />
                    </Callout.Icon>
                    <Callout.Text>{error}</Callout.Text>
                  </Callout.Root>
                )}

                {notice && (
                  <Callout.Root color={notice.tone ?? 'blue'} size="2">
                    <Callout.Text>{notice.message}</Callout.Text>
                  </Callout.Root>
                )}

                <Button
                  type="submit"
                  size="3"
                  className="cursor-pointer"
                  disabled={isSubmitting}
                >
                  <LogIn size={16} />
                  {isSubmitting ? '로그인 중...' : '로그인'}
                </Button>
              </Flex>
            </form>
          ) : (
            <SignupRequestTab />
          )}
        </Flex>
      </Card>
    </Flex>
  )
}

import {
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Text,
  TextField,
} from '@radix-ui/themes'
import { AlertCircle, Database, Hospital, LogIn } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { getSession } from '@/lib/supabase/api/auth'
import { seedAll } from '@/lib/supabase/seed'
import {
  consumeFlashNotice,
  type FlashNotice,
  setFlashNotice,
} from '@/utils/flashNotice'
import { useAuthStore } from '../../store/authStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState<FlashNotice | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  useEffect(() => {
    const flash = consumeFlashNotice()
    if (flash?.message) {
      setNotice(flash)
    }
  }, [])

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

  const handleSeedData = async () => {
    setError('')
    setNotice(null)
    setIsSeeding(true)
    try {
      await seedAll()
      setNotice({
        message: '샘플 데이터가 성공적으로 삽입되었습니다.',
        tone: 'green',
      })
    } catch (err) {
      setError('샘플 데이터 삽입에 실패했습니다. 콘솔을 확인해주세요.')
      console.error(err)
    } finally {
      setIsSeeding(false)
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
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
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

              <Button
                type="button"
                size="3"
                variant="outline"
                className="cursor-pointer"
                disabled={isSeeding}
                onClick={handleSeedData}
              >
                <Database size={16} />
                {isSeeding ? '데이터 삽입 중...' : '샘플 데이터 삽입'}
              </Button>

              <Box className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <Text size="1" align="center" className="text-gray-600">
                  테스트 계정:{' '}
                  <span className="font-semibold">
                    {/*admin@support.com / admin!2*/}
                  </span>
                </Text>
              </Box>
            </Flex>
          </form>
        </Flex>
      </Card>
    </Flex>
  )
}

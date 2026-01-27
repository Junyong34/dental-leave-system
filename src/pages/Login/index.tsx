import {
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Text,
  TextField,
} from '@radix-ui/themes'
import { AlertCircle, Hospital, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../../store/authStore'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('아이디와 비밀번호를 입력해주세요.')
      return
    }

    const success = login(username, password)
    if (success) {
      navigate('/')
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
    }
  }

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
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
                  아이디
                </Text>
                <TextField.Root
                  size="3"
                  placeholder="아이디를 입력하세요"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
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

              <Button type="submit" size="3" className="cursor-pointer">
                <LogIn size={16} />
                로그인
              </Button>

              <Box className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <Text size="1" align="center" className="text-gray-600">
                  테스트 계정:{' '}
                  <span className="font-semibold">admin / admin</span>
                </Text>
              </Box>
            </Flex>
          </form>
        </Flex>
      </Card>
    </Box>
  )
}

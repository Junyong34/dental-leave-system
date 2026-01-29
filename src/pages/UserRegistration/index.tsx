import {
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Text,
  TextField,
} from '@radix-ui/themes'
import { AlertCircle, UserPlus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { getCurrentUser, updatePassword } from '@/lib/supabase/api/auth'
import { createUser, getUserByIdOptional } from '@/lib/supabase/api/user'
import { setFlashNotice } from '@/utils/flashNotice'

export default function UserRegistration() {
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [name, setName] = useState('')
  const [joinDate, setJoinDate] = useState('')
  const [groupId, setGroupId] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const navigate = useNavigate()

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      setIsLoadingUser(true)
      const user = await getCurrentUser()
      if (!isMounted) return

      if (!user?.id || !user.email) {
        setError('인증 정보를 확인할 수 없습니다. 다시 로그인해주세요.')
        setIsLoadingUser(false)
        return
      }

      setUserId(user.id)
      setEmail(user.email)

      const existing = await getUserByIdOptional(user.id)
      if (!isMounted) return

      if (!existing.success) {
        setError(existing.error || '사용자 정보를 확인할 수 없습니다.')
        setIsLoadingUser(false)
        return
      }

      if (existing.data) {
        setFlashNotice({ message: '이미 등록된 사용자입니다.', tone: 'yellow' })
        navigate('/', { replace: true })
        return
      }

      setIsLoadingUser(false)
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!userId) {
      setError('인증 정보를 확인할 수 없습니다. 다시 로그인해주세요.')
      return
    }

    if (!name.trim() || !joinDate || !groupId.trim()) {
      setError('이름, 입사일, 그룹 ID는 필수 입력 항목입니다.')
      return
    }

    if (joinDate > today) {
      setError('입사일은 오늘 이전 날짜여야 합니다.')
      return
    }

    if (!password || !passwordConfirm) {
      setError('비밀번호와 비밀번호 확인을 입력해주세요.')
      return
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setIsSubmitting(true)
    try {
      const existing = await getUserByIdOptional(userId)
      if (!existing.success) {
        setError(existing.error || '중복 사용자 확인에 실패했습니다.')
        return
      }

      if (existing.data) {
        setError('이미 등록된 사용자입니다.')
        return
      }

      const passwordUpdate = await updatePassword(password)
      if (!passwordUpdate.success) {
        setError(passwordUpdate.error || '비밀번호 설정에 실패했습니다.')
        return
      }

      const result = await createUser({
        user_id: userId,
        name: name.trim(),
        join_date: joinDate,
        group_id: groupId.trim(),
        role: 'USER',
        status: 'ACTIVE',
      })

      if (result.success) {
        setFlashNotice({
          message: '회원 정보가 등록되었습니다.',
          tone: 'green',
        })
        navigate('/', { replace: true })
        return
      }

      setError(result.error || '회원 등록에 실패했습니다.')
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
      <Card size="4" className="w-full max-w-[520px] shadow-xl">
        <Flex direction="column" gap="6" p="6">
          <Flex direction="column" align="center" gap="3">
            <Box className="bg-blue-100 rounded-full p-4">
              <UserPlus size={40} className="text-blue-600" />
            </Box>
            <Text
              size="6"
              weight="bold"
              align="center"
              className="text-gray-900"
            >
              회원 정보 등록
            </Text>
            <Text size="2" align="center" className="text-gray-600">
              기본 정보를 입력해 주세요
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
                  이메일 (읽기 전용)
                </Text>
                <TextField.Root
                  size="3"
                  type="email"
                  value={email}
                  readOnly
                  placeholder="이메일을 불러오는 중입니다"
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
                  이름
                </Text>
                <TextField.Root
                  size="3"
                  placeholder="이름을 입력하세요"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoadingUser || isSubmitting}
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
                  입사일
                </Text>
                <TextField.Root
                  size="3"
                  type="date"
                  max={today}
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  disabled={isLoadingUser || isSubmitting}
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
                  그룹 ID
                </Text>
                <TextField.Root
                  size="3"
                  placeholder="예: G01"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  disabled={isLoadingUser || isSubmitting}
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
                  disabled={isLoadingUser || isSubmitting}
                  autoComplete="new-password"
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
                  비밀번호 확인
                </Text>
                <TextField.Root
                  size="3"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  disabled={isLoadingUser || isSubmitting}
                  autoComplete="new-password"
                />
              </Box>

              <Box className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <Text size="1" align="center" className="text-gray-600">
                  권한은 <span className="font-semibold">USER</span>, 상태는{' '}
                  <span className="font-semibold">ACTIVE</span>로 등록됩니다.
                </Text>
              </Box>

              {error && (
                <Callout.Root color="red" size="2">
                  <Callout.Icon>
                    <AlertCircle size={16} />
                  </Callout.Icon>
                  <Callout.Text>{error}</Callout.Text>
                </Callout.Root>
              )}

              <Button
                type="submit"
                size="3"
                className="cursor-pointer"
                disabled={isSubmitting || isLoadingUser}
              >
                <UserPlus size={16} />
                {isSubmitting ? '등록 중...' : '등록하기'}
              </Button>
            </Flex>
          </form>
        </Flex>
      </Card>
    </Flex>
  )
}

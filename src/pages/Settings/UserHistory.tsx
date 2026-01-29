import {
  Box,
  Callout,
  Card,
  Flex,
  Heading,
  Select,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes'
import { AlertCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getAllLeaveHistory } from '@/lib/supabase/api/leave'
import { getAllUsers } from '@/lib/supabase/api/user'
import type { LeaveHistory } from '@/types/leave'
import type { User } from '@/types/leave'

type UserNameMap = Record<string, string>

const formatTypeLabel = (type: LeaveHistory['type'], session: LeaveHistory['session']) => {
  if (type === 'FULL') return '전일'
  if (type === 'HALF') {
    if (session === 'AM') return '반차(오전)'
    if (session === 'PM') return '반차(오후)'
    return '반차'
  }
  return type
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ko-KR')
}

export default function UserHistory() {
  const [history, setHistory] = useState<LeaveHistory[]>([])
  const [userNameMap, setUserNameMap] = useState<UserNameMap>({})
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState('all')
  const [userQuery, setUserQuery] = useState('')
  const [error, setError] = useState('')
  const [nameLoadError, setNameLoadError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setIsLoading(true)
      setError('')
      setNameLoadError('')

      const [historyResult, usersResult] = await Promise.all([
        getAllLeaveHistory(),
        getAllUsers('ACTIVE'),
      ])

      if (!isMounted) return

      if (!historyResult.success || !historyResult.data) {
        setError(
          historyResult.error || '유저 히스토리 데이터를 불러오지 못했습니다.',
        )
        setHistory([])
      } else {
        setHistory(historyResult.data)
      }

      if (!usersResult.success || !usersResult.data) {
        setNameLoadError(
          usersResult.error || '사용자 이름 정보를 불러오지 못했습니다.',
        )
        setUserNameMap({})
        setUsers([])
      } else {
        const map = usersResult.data.reduce<UserNameMap>((acc, user) => {
          acc[user.user_id] = user.name
          return acc
        }, {})
        setUserNameMap(map)
        setUsers(usersResult.data)
      }

      setIsLoading(false)
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredHistory = useMemo(() => {
    const query = userQuery.trim().toLowerCase()

    return history.filter((item) => {
      if (selectedUserId !== 'all' && item.user_id !== selectedUserId) {
        return false
      }

      if (!query) return true

      const name = userNameMap[item.user_id] ?? ''
      return name.toLowerCase().includes(query)
    })
  }, [history, selectedUserId, userQuery, userNameMap])

  const filteredUsers = useMemo(() => {
    const query = userQuery.trim().toLowerCase()
    if (!query) return users
    return users.filter((user) => user.name.toLowerCase().includes(query))
  }, [userQuery, users])

  return (
    <Box>
      <Heading size="4" mb="4">
        유저 히스토리 데이터 조회
      </Heading>
      <Text color="gray" size="2" mb="6">
        연차 사용 이력을 사용자 이름 기준으로 조회할 수 있습니다.
      </Text>

      <Card mt="4">
        <Flex direction="column" gap="4">
          <Box style={{ width: '260px' }}>
            <Text
              as="label"
              size="2"
              weight="medium"
              style={{ display: 'block', marginBottom: '8px' }}
            >
              사용자 선택
            </Text>
            <TextField.Root
              placeholder="이름 검색..."
              value={userQuery}
              onChange={(event) => setUserQuery(event.target.value)}
              mb="2"
            />
            <Select.Root
              value={selectedUserId}
              onValueChange={setSelectedUserId}
            >
              <Select.Trigger placeholder="사용자를 선택하세요" />
              <Select.Content
                position="popper"
                sideOffset={5}
                collisionPadding={10}
                align="start"
                side="bottom"
                style={{
                  maxHeight: '300px',
                  minWidth: '200px',
                  width: 'var(--radix-select-trigger-width)',
                }}
              >
                <Select.Item value="all">전체</Select.Item>
                {filteredUsers.length === 0 ? (
                  <Select.Item disabled value="empty">
                    검색 결과 없음
                  </Select.Item>
                ) : (
                  filteredUsers.map((user) => (
                    <Select.Item key={user.user_id} value={user.user_id}>
                      {user.name}
                    </Select.Item>
                  ))
                )}
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

          {nameLoadError && (
            <Callout.Root color="yellow" size="2">
              <Callout.Icon>
                <AlertCircle size={16} />
              </Callout.Icon>
              <Callout.Text>{nameLoadError}</Callout.Text>
            </Callout.Root>
          )}

          <Box style={{ maxHeight: '520px', overflow: 'auto' }}>
            <Table.Root variant="surface">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>사용일</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>이름</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>유형</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>사용량</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>차감 연도</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>처리 시각</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {isLoading ? (
                  <Table.Row>
                    <Table.Cell colSpan={6}>데이터를 불러오는 중...</Table.Cell>
                  </Table.Row>
                ) : filteredHistory.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={6}>
                      표시할 히스토리 데이터가 없습니다.
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filteredHistory.map((item) => (
                    <Table.Row key={item.id}>
                      <Table.Cell>{item.date}</Table.Cell>
                      <Table.Cell>
                        {userNameMap[item.user_id] ?? '알 수 없음'}
                      </Table.Cell>
                      <Table.Cell>
                        {formatTypeLabel(item.type, item.session)}
                      </Table.Cell>
                      <Table.Cell>{item.amount}</Table.Cell>
                      <Table.Cell>{item.source_year}</Table.Cell>
                      <Table.Cell>{formatDateTime(item.used_at)}</Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>
          </Box>
        </Flex>
      </Card>
    </Box>
  )
}

import {
  Box,
  Button,
  Callout,
  Card,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes'
import { AlertCircle, CheckCircle2, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getLeaveBalances, updateLeaveBalance } from '@/lib/supabase/api/leave'
import { getAllUsers } from '@/lib/supabase/api/user'
import type { LeaveBalance, User } from '@/types/leave'

type UserLeaveRow = { user: User; balance: LeaveBalance | null }

export default function UserLeaveManagement() {
  const [rows, setRows] = useState<UserLeaveRow[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<{
    user: User
    balance: LeaveBalance
  } | null>(null)
  const [newTotal, setNewTotal] = useState('')
  const [saveError, setSaveError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setIsLoading(true)
      setLoadError('')
      setSaveSuccess('')

      const usersResult = await getAllUsers()

      if (!isMounted) return

      if (!usersResult.success || !usersResult.data) {
        setLoadError(usersResult.error || '사용자 정보를 불러오지 못했습니다.')
        setRows([])
        setIsLoading(false)
        return
      }

      const users = usersResult.data
      const balanceResults = await Promise.all(
        users.map((user) => getLeaveBalances(user.user_id)),
      )

      if (!isMounted) return

      let hasBalanceError = false
      const nextRows: UserLeaveRow[] = users.flatMap(
        (user, index): UserLeaveRow[] => {
          const result = balanceResults[index]
          if (!result.success) {
            hasBalanceError = true
            return [{ user, balance: null }]
          }

          const balances = result.data ?? []
          if (balances.length === 0) {
            return [{ user, balance: null }]
          }

          return balances.map((balance) => ({ user, balance }))
        },
      )

      setRows(nextRows)
      if (hasBalanceError) {
        setLoadError('연차 데이터를 일부 불러오지 못했습니다.')
      }
      setIsLoading(false)
    }

    void loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredRows = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return rows
    return rows.filter(({ user }) => {
      return (
        user.name.toLowerCase().includes(keyword) ||
        user.group_id.toLowerCase().includes(keyword)
      )
    })
  }, [rows, query])

  const handleOpenEdit = (row: UserLeaveRow) => {
    if (!row.balance) return

    setEditTarget({ user: row.user, balance: row.balance })
    setNewTotal(String(row.balance.total))
    setSaveError('')
    setIsDialogOpen(true)
  }

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditTarget(null)
      setNewTotal('')
      setSaveError('')
    }
  }

  const handleSave = async () => {
    if (!editTarget) return

    const totalValue = Number.parseFloat(newTotal)
    if (Number.isNaN(totalValue) || totalValue < 0) {
      setSaveError('0 이상의 숫자를 입력해주세요.')
      return
    }

    if (!Number.isInteger(totalValue * 2)) {
      setSaveError('0.5 단위로 입력해주세요.')
      return
    }

    if (totalValue < editTarget.balance.used) {
      setSaveError(
        `총 연차는 사용 연차(${editTarget.balance.used}일)보다 작을 수 없습니다.`,
      )
      return
    }

    setIsSaving(true)
    setSaveError('')

    const result = await updateLeaveBalance(
      editTarget.user.user_id,
      editTarget.balance.year,
      totalValue,
    )

    if (!result.success || !result.data) {
      setSaveError(result.error || '수정에 실패했습니다.')
      setIsSaving(false)
      return
    }

    const updatedBalance = result.data

    setRows((prev) =>
      prev.map((row) => {
        if (
          row.user.user_id !== editTarget.user.user_id ||
          row.balance?.year !== editTarget.balance.year
        ) {
          return row
        }
        return {
          ...row,
          balance: updatedBalance,
        }
      }),
    )

    setSaveSuccess('연차 총량이 수정되었습니다.')
    setIsSaving(false)
    handleDialogChange(false)
  }

  return (
    <Box>
      <Heading size="4" mb="4">
        유저 별 연차 개수 수정
      </Heading>
      <Text color="gray" size="2" mb="6">
        사용자별 연차 할당량을 관리하고 수정할 수 있습니다.
      </Text>

      <Card mt="4">
        <Flex direction="column" gap="4">
          <Flex justify="between" align="center">
            <Box style={{ width: '300px' }}>
              <TextField.Root
                placeholder="이름 또는 부서 검색..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              >
                <TextField.Slot>
                  <Search size={16} />
                </TextField.Slot>
              </TextField.Root>
            </Box>
          </Flex>

          {saveSuccess && (
            <Callout.Root color="green" size="2">
              <Callout.Icon>
                <CheckCircle2 size={16} />
              </Callout.Icon>
              <Callout.Text>{saveSuccess}</Callout.Text>
            </Callout.Root>
          )}

          {loadError && (
            <Callout.Root color="red" size="2">
              <Callout.Icon>
                <AlertCircle size={16} />
              </Callout.Icon>
              <Callout.Text>{loadError}</Callout.Text>
            </Callout.Root>
          )}

          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>이름</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>부서</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>연도</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>총 연차</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>사용 연차</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>잔여 연차</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>관리</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {isLoading ? (
                <Table.Row>
                  <Table.Cell colSpan={7}>데이터를 불러오는 중...</Table.Cell>
                </Table.Row>
              ) : filteredRows.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7}>표시할 사용자가 없습니다.</Table.Cell>
                </Table.Row>
              ) : (
                filteredRows.map((row) => (
                  <Table.Row
                    key={`${row.user.user_id}-${row.balance?.year ?? 'none'}`}
                  >
                    <Table.RowHeaderCell>{row.user.name}</Table.RowHeaderCell>
                    <Table.Cell>{row.user.group_id}</Table.Cell>
                    <Table.Cell>{row.balance?.year ?? '-'}</Table.Cell>
                    <Table.Cell>{row.balance?.total ?? '-'}</Table.Cell>
                    <Table.Cell>{row.balance?.used ?? '-'}</Table.Cell>
                    <Table.Cell>{row.balance?.remain ?? '-'}</Table.Cell>
                    <Table.Cell>
                      <Button
                        size="1"
                        variant="outline"
                        disabled={!row.balance}
                        onClick={() => handleOpenEdit(row)}
                      >
                        수정
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>
        </Flex>
      </Card>

      <Dialog.Root open={isDialogOpen} onOpenChange={handleDialogChange}>
        <Dialog.Content maxWidth="520px">
          <Dialog.Title>
            {editTarget?.user.name ? `${editTarget.user.name}님 연차 수정` : ''}
          </Dialog.Title>
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

          {editTarget && (
            <Flex direction="column" gap="4" mt="4">
              <Box>
                <Text size="2" weight="medium">
                  {editTarget.balance.year}년 연차 현황
                </Text>
              </Box>

              <Box
                p="3"
                style={{
                  backgroundColor: 'var(--blue-a2)',
                  border: '1px solid var(--blue-a6)',
                  borderRadius: 'var(--radius-2)',
                }}
              >
                <Flex direction="column" gap="1">
                  <Text size="2">
                    총 연차: <strong>{editTarget.balance.total}일</strong>
                  </Text>
                  <Text size="2">
                    사용 연차: <strong>{editTarget.balance.used}일</strong>
                  </Text>
                  <Text size="2">
                    잔여 연차: <strong>{editTarget.balance.remain}일</strong>
                  </Text>
                </Flex>
              </Box>

              <Box>
                <Text as="label" size="2" weight="medium" mb="2">
                  수정할 총 연차 (일)
                </Text>
                <TextField.Root
                  type="number"
                  step="0.5"
                  min="0"
                  value={newTotal}
                  onChange={(event) => setNewTotal(event.target.value)}
                  placeholder="예: 15.5"
                />
                <Text size="1" style={{ color: 'var(--gray-11)' }} mt="1">
                  0.5 단위로 입력 가능합니다.
                </Text>
              </Box>

              {newTotal && (
                <Box
                  p="3"
                  style={{
                    backgroundColor: 'var(--green-a2)',
                    border: '1px solid var(--green-a6)',
                    borderRadius: 'var(--radius-2)',
                  }}
                >
                  <Text size="2" weight="medium">
                    변경 후 잔여 연차:{' '}
                    {Number.isNaN(Number.parseFloat(newTotal))
                      ? '-'
                      : Number(
                          (
                            Number.parseFloat(newTotal) -
                            editTarget.balance.used
                          ).toFixed(1),
                        )}
                    일
                  </Text>
                </Box>
              )}

              {saveError && (
                <Box
                  p="3"
                  style={{
                    backgroundColor: 'var(--red-a2)',
                    border: '1px solid var(--red-a6)',
                    borderRadius: 'var(--radius-2)',
                  }}
                >
                  <Text size="2" style={{ color: 'var(--red-11)' }}>
                    {saveError}
                  </Text>
                </Box>
              )}

              <Flex gap="2" justify="end">
                <Button
                  variant="soft"
                  color="gray"
                  onClick={() => handleDialogChange(false)}
                  disabled={isSaving}
                >
                  취소
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? '저장 중...' : '저장'}
                </Button>
              </Flex>
            </Flex>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}

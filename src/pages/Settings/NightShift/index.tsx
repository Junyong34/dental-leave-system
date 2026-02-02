import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Switch,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes'
import { AlertCircle, CheckCircle2, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  createEmployee,
  createNightShiftRecord,
  deleteEmployee,
  deleteNightShiftRecordByDate,
  getAllEmployees,
  getNightShiftConfig,
  getNightShiftRecords,
  updateNightShiftConfig,
} from '@/lib/supabase/api/nightShift'
import type {
  Employee,
  NightShiftConfig,
  NightShiftRecord,
  Weekday,
} from '@/types/nightShift'

const WEEKDAY_LABELS: Record<Weekday, string> = {
  MON: '월요일',
  TUE: '화요일',
  WED: '수요일',
  THU: '목요일',
  FRI: '금요일',
  SAT: '토요일',
  SUN: '일요일',
}

const WEEKDAY_ORDER: Weekday[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

export default function NightShiftManagementPage() {
  // 상태
  const [employees, setEmployees] = useState<Employee[]>([])
  const [config, setConfig] = useState<NightShiftConfig[]>([])
  const [records, setRecords] = useState<NightShiftRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // 직원 추가 Dialog
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [newEmployeeName, setNewEmployeeName] = useState('')
  const [addEmployeeLoading, setAddEmployeeLoading] = useState(false)

  // 야간 근무 기록 추가 Dialog
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null,
  )
  const [selectedDate, setSelectedDate] = useState('')
  const [addRecordLoading, setAddRecordLoading] = useState(false)

  // 데이터 로드
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [employeesResult, configResult, recordsResult] = await Promise.all([
      getAllEmployees('ACTIVE'),
      getNightShiftConfig(),
      getNightShiftRecords(),
    ])

    if (employeesResult.success && employeesResult.data) {
      setEmployees(employeesResult.data)
    }

    if (configResult.success && configResult.data) {
      setConfig(configResult.data)
    } else {
      // 초기 설정이 없으면 기본값 생성
      const defaultConfig = WEEKDAY_ORDER.map((weekday) => ({
        id: 0,
        weekday,
        is_active: false,
        created_at: null,
        updated_at: null,
      }))
      setConfig(defaultConfig)
    }

    if (recordsResult.success && recordsResult.data) {
      setRecords(recordsResult.data)
    }

    if (!employeesResult.success) {
      setError(employeesResult.message)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 알림 자동 제거
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // 야간 요일 설정 토글
  const handleToggleWeekday = async (weekday: Weekday, isActive: boolean) => {
    const result = await updateNightShiftConfig(weekday, isActive)

    if (result.success) {
      setSuccess(
        `${WEEKDAY_LABELS[weekday]} ${isActive ? '활성화' : '비활성화'} 완료`,
      )
      loadData()
    } else {
      setError(result.message)
    }
  }

  // 직원 추가
  const handleAddEmployee = async () => {
    if (!newEmployeeName.trim()) {
      setError('직원 이름을 입력해주세요.')
      return
    }

    setAddEmployeeLoading(true)
    const result = await createEmployee(newEmployeeName.trim())
    setAddEmployeeLoading(false)

    if (result.success) {
      setSuccess('직원이 추가되었습니다.')
      setNewEmployeeName('')
      setIsAddEmployeeOpen(false)
      loadData()
    } else {
      setError(result.message)
    }
  }

  // 직원 삭제
  const handleDeleteEmployee = async (id: number, name: string) => {
    if (
      !confirm(
        `${name} 직원을 삭제하시겠습니까?\n관련된 모든 야간 근무 기록도 함께 삭제됩니다.`,
      )
    ) {
      return
    }

    const result = await deleteEmployee(id)

    if (result.success) {
      setSuccess('직원이 삭제되었습니다.')
      loadData()
    } else {
      setError(result.message)
    }
  }

  // 야간 근무 기록 추가
  const handleAddRecord = async () => {
    if (!selectedEmployeeId) {
      setError('직원을 선택해주세요.')
      return
    }

    if (!selectedDate) {
      setError('날짜를 선택해주세요.')
      return
    }

    setAddRecordLoading(true)
    const result = await createNightShiftRecord(
      selectedEmployeeId,
      selectedDate,
    )
    setAddRecordLoading(false)

    if (result.success) {
      setSuccess('야간 근무 기록이 추가되었습니다.')
      setSelectedEmployeeId(null)
      setSelectedDate('')
      setIsAddRecordOpen(false)
      loadData()
    } else {
      setError(result.message)
    }
  }

  // 야간 근무 기록 삭제
  const handleDeleteRecord = async (
    employeeId: number,
    workDate: string,
    employeeName: string,
  ) => {
    if (
      !confirm(
        `${employeeName}의 ${workDate} 야간 근무 기록을 삭제하시겠습니까?`,
      )
    ) {
      return
    }

    const result = await deleteNightShiftRecordByDate(employeeId, workDate)

    if (result.success) {
      setSuccess('야간 근무 기록이 삭제되었습니다.')
      loadData()
    } else {
      setError(result.message)
    }
  }

  // 직원 이름 찾기
  const getEmployeeName = (employeeId: number) => {
    return employees.find((e) => e.id === employeeId)?.name || '알 수 없음'
  }

  // 최근 20개 기록만 표시
  const recentRecords = records.slice(0, 20)

  return (
    <div className="rt-r-p-6" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Flex direction="column" gap="4">
        {/* 헤더 */}
        <div>
          <h1 className="rt-r-mb-2">야간 근무 관리</h1>
          <Text color="gray">
            야간 진료 요일 설정, 직원 관리, 야간 근무 기록을 관리합니다.
          </Text>
        </div>

        {/* 알림 */}
        {success && (
          <Callout.Root color="green">
            <Callout.Icon>
              <CheckCircle2 size={16} />
            </Callout.Icon>
            <Callout.Text>{success}</Callout.Text>
          </Callout.Root>
        )}

        {error && (
          <Callout.Root color="red">
            <Callout.Icon>
              <AlertCircle size={16} />
            </Callout.Icon>
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}

        {/* 로딩 */}
        {loading && (
          <Card>
            <Text color="gray">데이터를 불러오는 중...</Text>
          </Card>
        )}

        {!loading && (
          <>
            {/* 섹션 1: 야간 요일 설정 */}
            <Card>
              <Flex direction="column" gap="3">
                <Heading size="4">야간 진료 요일 설정</Heading>
                <Text size="2" color="gray">
                  야간 진료를 실시하는 요일을 활성화하세요.
                </Text>

                <Box>
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell>요일</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>상태</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>활성화</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {WEEKDAY_ORDER.map((weekday) => {
                        const cfg = config.find((c) => c.weekday === weekday)
                        const isActive = cfg?.is_active || false

                        return (
                          <Table.Row key={weekday}>
                            <Table.Cell>
                              <Text weight="bold">
                                {WEEKDAY_LABELS[weekday]}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Badge color={isActive ? 'green' : 'gray'}>
                                {isActive ? '활성' : '비활성'}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              <Switch
                                checked={isActive}
                                onCheckedChange={(checked) =>
                                  handleToggleWeekday(weekday, checked)
                                }
                              />
                            </Table.Cell>
                          </Table.Row>
                        )
                      })}
                    </Table.Body>
                  </Table.Root>
                </Box>
              </Flex>
            </Card>

            {/* 섹션 2: 직원 관리 */}
            <Card>
              <Flex direction="column" gap="3">
                <Flex justify="between" align="center">
                  <Heading size="4">직원 관리</Heading>
                  <Button onClick={() => setIsAddEmployeeOpen(true)}>
                    <Plus size={16} />
                    직원 추가
                  </Button>
                </Flex>

                <Text size="2" color="gray">
                  야간 근무를 담당하는 직원을 관리합니다.
                </Text>

                {employees.length === 0 ? (
                  <Text color="gray">등록된 직원이 없습니다.</Text>
                ) : (
                  <Box>
                    <Table.Root>
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeaderCell>이름</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>
                            계정 연동
                          </Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>상태</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>작업</Table.ColumnHeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {employees.map((emp) => (
                          <Table.Row key={emp.id}>
                            <Table.Cell>
                              <Text weight="bold">{emp.name}</Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Badge color={emp.user_id ? 'green' : 'gray'}>
                                {emp.user_id ? '연동됨' : '미연동'}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              <Badge
                                color={
                                  emp.status === 'ACTIVE' ? 'blue' : 'gray'
                                }
                              >
                                {emp.status === 'ACTIVE' ? '재직' : '퇴사'}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              <IconButton
                                size="1"
                                variant="ghost"
                                color="red"
                                onClick={() =>
                                  handleDeleteEmployee(emp.id, emp.name)
                                }
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Box>
                )}
              </Flex>
            </Card>

            {/* 섹션 3: 야간 근무 기록 */}
            <Card>
              <Flex direction="column" gap="3">
                <Flex justify="between" align="center">
                  <Heading size="4">야간 근무 기록</Heading>
                  <Button onClick={() => setIsAddRecordOpen(true)}>
                    <Plus size={16} />
                    기록 추가
                  </Button>
                </Flex>

                <Text size="2" color="gray">
                  최근 20개의 야간 근무 기록을 표시합니다.
                </Text>

                {recentRecords.length === 0 ? (
                  <Text color="gray">등록된 야간 근무 기록이 없습니다.</Text>
                ) : (
                  <Box>
                    <Table.Root>
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeaderCell>직원</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>날짜</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>요일</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>작업</Table.ColumnHeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {recentRecords.map((record) => (
                          <Table.Row key={record.id}>
                            <Table.Cell>
                              <Text weight="bold">
                                {getEmployeeName(record.employee_id)}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>{record.work_date}</Table.Cell>
                            <Table.Cell>
                              <Badge>
                                {WEEKDAY_LABELS[record.weekday as Weekday]}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              <IconButton
                                size="1"
                                variant="ghost"
                                color="red"
                                onClick={() =>
                                  handleDeleteRecord(
                                    record.employee_id,
                                    record.work_date,
                                    getEmployeeName(record.employee_id),
                                  )
                                }
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Box>
                )}
              </Flex>
            </Card>
          </>
        )}
      </Flex>

      {/* 직원 추가 Dialog */}
      <Dialog.Root open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
        <Dialog.Content>
          <Dialog.Title>직원 추가</Dialog.Title>
          <Dialog.Description>
            새로운 직원을 추가합니다. 추후 회원가입 후 계정과 연동할 수
            있습니다.
          </Dialog.Description>

          <Flex direction="column" gap="3" mt="4">
            <Box>
              <Text size="2" weight="bold" as="label">
                이름
              </Text>
              <TextField.Root
                placeholder="직원 이름"
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddEmployee()
                }}
              />
            </Box>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                취소
              </Button>
            </Dialog.Close>
            <Button onClick={handleAddEmployee} disabled={addEmployeeLoading}>
              {addEmployeeLoading ? '추가 중...' : '추가'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* 야간 근무 기록 추가 Dialog */}
      <Dialog.Root open={isAddRecordOpen} onOpenChange={setIsAddRecordOpen}>
        <Dialog.Content>
          <Dialog.Title>야간 근무 기록 추가</Dialog.Title>
          <Dialog.Description>
            직원의 야간 근무 날짜를 기록합니다.
          </Dialog.Description>

          <Flex direction="column" gap="3" mt="4">
            <Box>
              <Text size="2" weight="bold" as="label">
                직원
              </Text>
              <select
                value={selectedEmployeeId || ''}
                onChange={(e) =>
                  setSelectedEmployeeId(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid var(--gray-6)',
                }}
              >
                <option value="">직원 선택</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </Box>

            <Box>
              <Text size="2" weight="bold" as="label">
                날짜
              </Text>
              <TextField.Root
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </Box>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                취소
              </Button>
            </Dialog.Close>
            <Button onClick={handleAddRecord} disabled={addRecordLoading}>
              {addRecordLoading ? '추가 중...' : '추가'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  )
}

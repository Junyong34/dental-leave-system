import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Dialog,
  Flex,
  Select,
  Text,
  TextField,
} from '@radix-ui/themes'
import { addDays, format, isValid, parseISO, startOfDay } from 'date-fns'
import { AlertCircle, CheckCircle2, Download, Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SearchableEmployeeSelect } from '@/components/common/SearchableEmployeeSelect'
import {
  createNightShiftRecord,
  getAllEmployees,
  getAllEmployeesNightShiftStats,
  getNightShiftConfig,
  getNightShiftRecords,
} from '@/lib/supabase/api/nightShift'
import type {
  Employee,
  EmployeeNightShiftStats,
  NightShiftConfig,
  NightShiftStats,
  Weekday,
} from '@/types/nightShift'

const WEEKDAY_LABELS: Record<string, string> = {
  MON: '월',
  TUE: '화',
  WED: '수',
  THU: '목',
  FRI: '금',
  SAT: '토',
  SUN: '일',
}

const WEEKDAY_FULL_LABELS: Record<Weekday, string> = {
  MON: '월요일',
  TUE: '화요일',
  WED: '수요일',
  THU: '목요일',
  FRI: '금요일',
  SAT: '토요일',
  SUN: '일요일',
}

const WEEKDAY_BY_INDEX: Weekday[] = [
  'SUN',
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
]

const WEEKDAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const CURRENT_YEAR = new Date().getFullYear()
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

function NightShiftStatsPage() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState<number | null>(null)
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([])

  const [employees, setEmployees] = useState<Employee[]>([])
  const [config, setConfig] = useState<NightShiftConfig[]>([])
  const [stats, setStats] = useState<EmployeeNightShiftStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false)
  const [selectedRecordEmployeeId, setSelectedRecordEmployeeId] = useState<
    number | null
  >(null)
  const [selectedRecordDate, setSelectedRecordDate] = useState('')
  const [addRecordLoading, setAddRecordLoading] = useState(false)
  const [isRecordDuplicate, setIsRecordDuplicate] = useState(false)
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false)

  const activeWeekdays = useMemo(() => {
    return new Set(
      config.filter((item) => item.is_active).map((item) => item.weekday),
    )
  }, [config])

  const selectedRecordWeekday = useMemo<Weekday | null>(() => {
    if (!selectedRecordDate) return null
    const localDate = parseISO(selectedRecordDate)
    if (!isValid(localDate)) return null
    return WEEKDAY_BY_INDEX[localDate.getDay()]
  }, [selectedRecordDate])

  const isSelectedDateActive =
    !selectedRecordWeekday || activeWeekdays.has(selectedRecordWeekday)

  const nextActiveDates = useMemo(() => {
    if (activeWeekdays.size === 0) return []

    const results: { value: string; label: string }[] = []
    const baseDate = startOfDay(new Date())

    for (let offset = 0; results.length < 5 && offset < 365; offset += 1) {
      const candidate = addDays(baseDate, offset)
      const weekday = WEEKDAY_BY_INDEX[candidate.getDay()]

      if (activeWeekdays.has(weekday)) {
        results.push({
          value: format(candidate, 'yyyy-MM-dd'),
          label: `${format(candidate, 'M/d')} (${WEEKDAY_LABELS[weekday]})`,
        })
      }
    }

    return results
  }, [activeWeekdays])

  // 직원 목록 로드
  useEffect(() => {
    const loadMeta = async () => {
      const [employeesResult, configResult] = await Promise.all([
        getAllEmployees('ACTIVE'),
        getNightShiftConfig(),
      ])

      if (employeesResult.success && employeesResult.data) {
        setEmployees(employeesResult.data)
      } else if (!employeesResult.success) {
        setActionError(employeesResult.message)
      }

      if (configResult.success && configResult.data) {
        setConfig(configResult.data)
      } else if (!configResult.success) {
        setActionError(configResult.message)
      }
    }

    loadMeta()
  }, [])

  // 통계 데이터 로드
  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await getAllEmployeesNightShiftStats(
      year,
      month || undefined,
    )

    if (result.success && result.data) {
      setStats(result.data)
    } else {
      setError(result.message)
    }

    setLoading(false)
  }, [month, year])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (actionError) {
      const timer = setTimeout(() => setActionError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [actionError])

  useEffect(() => {
    let isActive = true

    const checkDuplicate = async () => {
      if (!selectedRecordEmployeeId || !selectedRecordDate) {
        if (isActive) {
          setIsRecordDuplicate(false)
          setIsCheckingDuplicate(false)
        }
        return
      }

      setIsCheckingDuplicate(true)
      const result = await getNightShiftRecords({
        employeeId: selectedRecordEmployeeId,
        startDate: selectedRecordDate,
        endDate: selectedRecordDate,
      })

      if (!isActive) return

      if (result.success) {
        setIsRecordDuplicate((result.data ?? []).length > 0)
      } else {
        setIsRecordDuplicate(false)
      }
      setIsCheckingDuplicate(false)
    }

    checkDuplicate()

    return () => {
      isActive = false
    }
  }, [selectedRecordDate, selectedRecordEmployeeId])

  // 필터링된 통계
  const filteredStats =
    selectedEmployeeIds.length > 0
      ? stats.filter((s) => selectedEmployeeIds.includes(s.employee_id))
      : stats

  // CSV 내보내기
  const handleExportCSV = () => {
    const headers = ['직원명', ...WEEKDAY_ORDER.map((w) => WEEKDAY_LABELS[w])]
    const rows = filteredStats.map((emp) => {
      const counts = WEEKDAY_ORDER.map((w) => emp.stats[w] || 0)
      return [emp.employee_name, ...counts]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n')

    const blob = new Blob([`\ufeff${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `야간근무통계_${year}${month ? `_${month}월` : '년'}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleAddRecord = async () => {
    setActionError(null)

    if (!selectedRecordEmployeeId) {
      setActionError('직원을 선택해주세요.')
      return
    }

    if (!selectedRecordDate) {
      setActionError('날짜를 선택해주세요.')
      return
    }

    if (selectedRecordWeekday && !activeWeekdays.has(selectedRecordWeekday)) {
      setActionError('선택한 날짜는 야간 진료 비활성 요일입니다.')
      return
    }

    setAddRecordLoading(true)

    const existingRecordResult = await getNightShiftRecords({
      employeeId: selectedRecordEmployeeId,
      startDate: selectedRecordDate,
      endDate: selectedRecordDate,
    })

    if (!existingRecordResult.success) {
      setActionError(existingRecordResult.message)
      setAddRecordLoading(false)
      return
    }

    if ((existingRecordResult.data ?? []).length > 0) {
      setActionError('이미 해당 날짜에 등록된 야간 진료가 있습니다.')
      setAddRecordLoading(false)
      return
    }

    const result = await createNightShiftRecord(
      selectedRecordEmployeeId,
      selectedRecordDate,
    )
    setAddRecordLoading(false)

    if (result.success) {
      setSuccess('야간 진료가 추가되었습니다.')
      setSelectedRecordEmployeeId(null)
      setSelectedRecordDate('')
      setIsAddRecordOpen(false)
      loadStats()
    } else {
      setActionError(result.message)
    }
  }

  // 가장 많이 근무한 요일들 찾기 (동률 포함)
  const getMaxWeekdays = (
    stats: NightShiftStats,
  ): { weekdays: string[]; maxCount: number } | null => {
    const entries = Object.entries(stats)
    if (entries.length === 0) return null

    const maxCount = Math.max(...entries.map(([, count]) => count))
    if (maxCount === 0) return null

    const weekdays = entries
      .filter(([, count]) => count === maxCount)
      .map(([weekday]) => weekday)

    return { weekdays, maxCount }
  }

  // 통계 카드 컴포넌트
  const StatsCard = ({ emp }: { emp: EmployeeNightShiftStats }) => {
    const maxWeekdayInfo = getMaxWeekdays(emp.stats)
    const totalCount = Object.values(emp.stats).reduce(
      (sum, count) => sum + count,
      0,
    )

    const maxWeekdayLabel = maxWeekdayInfo
      ? maxWeekdayInfo.weekdays
          .map((weekday) => WEEKDAY_LABELS[weekday])
          .join(', ')
      : null

    return (
      <Card>
        <Flex direction="column" gap="3">
          <Flex justify="between" align="center">
            <Text size="4" weight="bold">
              {emp.employee_name}
            </Text>
            <Badge color="blue" variant="soft">
              총 {totalCount}회
            </Badge>
          </Flex>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
              gap: 'var(--space-2)',
            }}
          >
            {WEEKDAY_ORDER.map((weekday) => {
              const count = emp.stats[weekday] || 0
              const isMax =
                !!maxWeekdayInfo &&
                maxWeekdayInfo.weekdays.includes(weekday) &&
                count > 0

              return (
                <div
                  key={weekday}
                  style={{
                    textAlign: 'center',
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-2)',
                    backgroundColor: isMax
                      ? 'var(--accent-3)'
                      : 'var(--gray-3)',
                    border: isMax ? '2px solid var(--accent-9)' : 'none',
                  }}
                >
                  <Text size="1" color="gray">
                    {WEEKDAY_LABELS[weekday]}
                  </Text>
                  <Text size="5" weight="bold" style={{ display: 'block' }}>
                    {count}
                  </Text>
                </div>
              )
            })}
          </div>

          {maxWeekdayInfo && maxWeekdayLabel && totalCount > 0 && (
            <Text size="2" color="gray">
              <strong>{maxWeekdayLabel}요일</strong>에 가장 많이 근무 (
              {maxWeekdayInfo.maxCount}회)
            </Text>
          )}

          {totalCount === 0 && (
            <Text size="2" color="gray">
              기간 내 야간 진료 기록이 없습니다.
            </Text>
          )}
        </Flex>
      </Card>
    )
  }

  return (
    <div className="rt-r-p-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <Flex direction="column" gap="4">
        {/* 헤더 */}
        <div>
          <h1 className="rt-r-mb-2">야간 진료 통계</h1>
          <Text color="gray">
            직원별 야간 진료 요일 통계를 확인하여 공평한 배분을 지원합니다.
          </Text>
        </div>

        {success && (
          <Callout.Root color="green">
            <Callout.Icon>
              <CheckCircle2 size={16} />
            </Callout.Icon>
            <Callout.Text>{success}</Callout.Text>
          </Callout.Root>
        )}

        {actionError && (
          <Callout.Root color="red">
            <Callout.Icon>
              <AlertCircle size={16} />
            </Callout.Icon>
            <Callout.Text>{actionError}</Callout.Text>
          </Callout.Root>
        )}

        {/* 필터 */}
        <Card>
          <Flex gap="3" wrap="wrap" align="center">
            <Flex direction="column" gap="1">
              <Text size="2" weight="bold">
                연도
              </Text>
              <Select.Root
                value={year.toString()}
                onValueChange={(val) => setYear(Number(val))}
              >
                <Select.Trigger />
                <Select.Content>
                  {Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i).map(
                    (y) => (
                      <Select.Item key={y} value={y.toString()}>
                        {y}년
                      </Select.Item>
                    ),
                  )}
                </Select.Content>
              </Select.Root>
            </Flex>

            <Flex direction="column" gap="1">
              <Text size="2" weight="bold">
                월
              </Text>
              <Select.Root
                value={month?.toString() || 'all'}
                onValueChange={(val) =>
                  setMonth(val === 'all' ? null : Number(val))
                }
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="all">전체</Select.Item>
                  {MONTHS.map((m) => (
                    <Select.Item key={m} value={m.toString()}>
                      {m}월
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>

            <Flex direction="column" gap="1">
              <SearchableEmployeeSelect
                employees={employees}
                multiple
                values={selectedEmployeeIds.map((id) => id.toString())}
                onValuesChange={(values) =>
                  setSelectedEmployeeIds(values.map((val) => Number(val)))
                }
                label="직원"
                placeholder="직원을 선택하세요"
                showAllOption
                allOptionLabel="전체"
                getEmployeeId={(emp) => emp.id.toString()}
              />
            </Flex>

            <Flex gap="2" style={{ marginLeft: 'auto' }}>
              <Button size={'1'} onClick={() => setIsAddRecordOpen(true)}>
                <Plus size={16} />
                야간진료 추가
              </Button>
              <Button
                size={'1'}
                variant="soft"
                onClick={handleExportCSV}
                disabled={filteredStats.length === 0}
              >
                <Download size={16} />
                CSV 내보내기
              </Button>
            </Flex>
          </Flex>
        </Card>

        {/* 로딩 */}
        {loading && (
          <Card>
            <Text color="gray">통계를 불러오는 중...</Text>
          </Card>
        )}

        {/* 에러 */}
        {error && (
          <Card>
            <Text color="red">오류: {error}</Text>
          </Card>
        )}

        {/* 통계 카드 그리드 */}
        {!loading &&
          !error &&
          (filteredStats.length === 0 ? (
            <Card>
              <Text color="gray">
                조회된 통계가 없습니다. 야간 진료 기록을 먼저 등록해주세요.
              </Text>
            </Card>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 'var(--space-4)',
              }}
            >
              {filteredStats.map((emp) => (
                <StatsCard key={emp.employee_id} emp={emp} />
              ))}
            </div>
          ))}
      </Flex>

      <Dialog.Root open={isAddRecordOpen} onOpenChange={setIsAddRecordOpen}>
        <Dialog.Content>
          <Dialog.Title>야간진료 추가</Dialog.Title>
          <Dialog.Description>
            야간 진료 요일 설정에서 활성화된 요일만 등록할 수 있습니다.
          </Dialog.Description>

          <Flex direction="column" gap="3" mt="4">
            <Box>
              <SearchableEmployeeSelect
                employees={employees}
                value={selectedRecordEmployeeId?.toString() || ''}
                onValueChange={(value) =>
                  setSelectedRecordEmployeeId(value ? Number(value) : null)
                }
                label="직원"
                placeholder="직원 선택"
                getEmployeeId={(emp) => emp.id.toString()}
              />
            </Box>

            <Box>
              <Text size="2" weight="bold" as="label">
                날짜
              </Text>
              <TextField.Root
                type="date"
                value={selectedRecordDate}
                onChange={(e) => setSelectedRecordDate(e.target.value)}
              />
              {nextActiveDates.length > 0 && (
                <>
                  <Text size="1" color="gray" mt="2">
                    다음 활성 요일
                  </Text>
                  <Flex gap="2" wrap="wrap" mt="1">
                    {nextActiveDates.map((dateOption) => (
                      <Button
                        key={dateOption.value}
                        size="1"
                        variant={
                          selectedRecordDate === dateOption.value
                            ? 'solid'
                            : 'soft'
                        }
                        onClick={() => setSelectedRecordDate(dateOption.value)}
                      >
                        {dateOption.label}
                      </Button>
                    ))}
                  </Flex>
                </>
              )}
            </Box>

            <Box>
              <Text size="2" weight="bold" as="label">
                활성 요일
              </Text>
              <Flex gap="2" wrap="wrap" mt="1">
                {WEEKDAY_ORDER.map((weekday) => {
                  const isActive = activeWeekdays.has(weekday as Weekday)
                  return (
                    <Badge
                      key={weekday}
                      color={isActive ? 'green' : 'gray'}
                      variant={isActive ? 'solid' : 'soft'}
                    >
                      {WEEKDAY_LABELS[weekday]}
                    </Badge>
                  )
                })}
              </Flex>
              {activeWeekdays.size === 0 && (
                <Text size="2" color="red" mt="2">
                  활성화된 요일이 없습니다. 설정에서 요일을 먼저 활성화하세요.
                </Text>
              )}
            </Box>

            {selectedRecordWeekday && (
              <Text
                size="2"
                color={
                  !isSelectedDateActive || isRecordDuplicate ? 'red' : 'gray'
                }
              >
                선택한 날짜: {WEEKDAY_FULL_LABELS[selectedRecordWeekday]} ·{' '}
                {isSelectedDateActive ? '활성' : '비활성'}
                {isCheckingDuplicate ? ' · 중복 확인 중' : ''}
                {isRecordDuplicate ? ' · 이미 진료기록에 추가됨' : ''}
              </Text>
            )}
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                취소
              </Button>
            </Dialog.Close>
            <Button
              onClick={handleAddRecord}
              disabled={
                addRecordLoading ||
                isCheckingDuplicate ||
                isRecordDuplicate ||
                !selectedRecordEmployeeId ||
                !selectedRecordDate ||
                !isSelectedDateActive
              }
            >
              {addRecordLoading ? '추가 중...' : '추가'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  )
}

export default NightShiftStatsPage

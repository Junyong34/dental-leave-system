import { Badge, Button, Card, Flex, Select, Text } from '@radix-ui/themes'
import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  getAllEmployees,
  getAllEmployeesNightShiftStats,
} from '@/lib/supabase/api/nightShift'
import type {
  Employee,
  EmployeeNightShiftStats,
  NightShiftStats,
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

const WEEKDAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const CURRENT_YEAR = new Date().getFullYear()
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

function NightShiftStatsPage() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState<number | null>(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null,
  )

  const [employees, setEmployees] = useState<Employee[]>([])
  const [stats, setStats] = useState<EmployeeNightShiftStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 직원 목록 로드
  useEffect(() => {
    const loadEmployees = async () => {
      const result = await getAllEmployees('ACTIVE')
      if (result.success && result.data) {
        setEmployees(result.data)
      }
    }
    loadEmployees()
  }, [])

  // 통계 데이터 로드
  useEffect(() => {
    const loadStats = async () => {
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
    }

    loadStats()
  }, [year, month])

  // 필터링된 통계
  const filteredStats = selectedEmployeeId
    ? stats.filter((s) => s.employee_id === selectedEmployeeId)
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

  // 가장 많이 근무한 요일 찾기
  const getMaxWeekday = (stats: NightShiftStats): string | null => {
    const entries = Object.entries(stats)
    if (entries.length === 0) return null
    const max = entries.reduce((prev, curr) =>
      curr[1] > prev[1] ? curr : prev,
    )
    return max[0]
  }

  // 통계 카드 컴포넌트
  const StatsCard = ({ emp }: { emp: EmployeeNightShiftStats }) => {
    const maxWeekday = getMaxWeekday(emp.stats)
    const totalCount = Object.values(emp.stats).reduce(
      (sum, count) => sum + count,
      0,
    )

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
              const isMax = weekday === maxWeekday && count > 0

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

          {maxWeekday && totalCount > 0 && (
            <Text size="2" color="gray">
              <strong>{WEEKDAY_LABELS[maxWeekday]}요일</strong>에 가장 많이 근무
              ({emp.stats[maxWeekday]}회)
            </Text>
          )}

          {totalCount === 0 && (
            <Text size="2" color="gray">
              기간 내 야간 근무 기록이 없습니다.
            </Text>
          )}
        </Flex>
      </Card>
    )
  }

  return (
    <div className="rt-r-p-6" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <Flex direction="column" gap="4">
        {/* 헤더 */}
        <div>
          <h1 className="rt-r-mb-2">야간 근무 통계</h1>
          <Text color="gray">
            직원별 야간 근무 요일 통계를 확인하여 공평한 배분을 지원합니다.
          </Text>
        </div>

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
              <Text size="2" weight="bold">
                직원
              </Text>
              <Select.Root
                value={selectedEmployeeId?.toString() || 'all'}
                onValueChange={(val) =>
                  setSelectedEmployeeId(val === 'all' ? null : Number(val))
                }
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="all">전체</Select.Item>
                  {employees.map((emp) => (
                    <Select.Item key={emp.id} value={emp.id.toString()}>
                      {emp.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>

            <div style={{ marginLeft: 'auto' }}>
              <Button
                variant="soft"
                onClick={handleExportCSV}
                disabled={filteredStats.length === 0}
              >
                <Download size={16} />
                CSV 내보내기
              </Button>
            </div>
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
                조회된 통계가 없습니다. 야간 근무 기록을 먼저 등록해주세요.
              </Text>
            </Card>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 'var(--space-4)',
              }}
            >
              {filteredStats.map((emp) => (
                <StatsCard key={emp.employee_id} emp={emp} />
              ))}
            </div>
          ))}
      </Flex>
    </div>
  )
}

export default NightShiftStatsPage

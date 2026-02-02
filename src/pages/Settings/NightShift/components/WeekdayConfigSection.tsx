import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  Switch,
  Table,
  Text,
} from '@radix-ui/themes'
import { updateNightShiftConfig } from '@/lib/supabase/api/nightShift'
import type { NightShiftConfig, Weekday } from '@/types/nightShift'
import { WEEKDAY_LABELS, WEEKDAY_ORDER } from '../constants'

interface WeekdayConfigSectionProps {
  config: NightShiftConfig[]
  onSuccess: (message: string) => void
  onError: (message: string) => void
  onReload: () => void
}

export function WeekdayConfigSection({
  config,
  onSuccess,
  onError,
  onReload,
}: WeekdayConfigSectionProps) {
  const handleToggleWeekday = async (weekday: Weekday, isActive: boolean) => {
    const result = await updateNightShiftConfig(weekday, isActive)

    if (result.success) {
      onSuccess(
        `${WEEKDAY_LABELS[weekday]} ${isActive ? '활성화' : '비활성화'} 완료`,
      )
      onReload()
    } else {
      onError(result.message)
    }
  }

  return (
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
                      <Text weight="bold">{WEEKDAY_LABELS[weekday]}</Text>
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
  )
}

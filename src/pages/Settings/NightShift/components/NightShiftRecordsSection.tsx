import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  IconButton,
  Table,
  Text,
} from '@radix-ui/themes'
import { Trash2 } from 'lucide-react'
import { deleteNightShiftRecordByDate } from '@/lib/supabase/api/nightShift'
import type { Employee, NightShiftRecord, Weekday } from '@/types/nightShift'
import { MAX_RECENT_RECORDS, WEEKDAY_LABELS } from '../constants'

interface NightShiftRecordsSectionProps {
  records: NightShiftRecord[]
  employees: Employee[]
  onSuccess: (message: string) => void
  onError: (message: string) => void
  onReload: () => void
}

export function NightShiftRecordsSection({
  records,
  employees,
  onSuccess,
  onError,
  onReload,
}: NightShiftRecordsSectionProps) {
  const getEmployeeName = (employeeId: number) => {
    return employees.find((e) => e.id === employeeId)?.name || '알 수 없음'
  }

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
      onSuccess('야간 근무 기록이 삭제되었습니다.')
      onReload()
    } else {
      onError(result.message)
    }
  }

  const recentRecords = records.slice(0, MAX_RECENT_RECORDS)

  return (
    <Card>
      <Flex direction="column" gap="3">
        <Flex justify="between" align="center">
          <Heading size="4">야간 근무 기록</Heading>
        </Flex>

        <Text size="2" color="gray">
          최근 {MAX_RECENT_RECORDS}개의 야간 근무 기록을 표시합니다.
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
                      <Badge>{WEEKDAY_LABELS[record.weekday as Weekday]}</Badge>
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
  )
}

import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes'
import { Search } from 'lucide-react'

export default function UserLeaveManagement() {
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
              <TextField.Root placeholder="이름 또는 부서 검색...">
                <TextField.Slot>
                  <Search size={16} />
                </TextField.Slot>
              </TextField.Root>
            </Box>
            <Button variant="soft">일괄 수정</Button>
          </Flex>

          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>이름</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>부서</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>총 연차</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>사용 연차</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>잔여 연차</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>관리</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              <Table.Row>
                <Table.RowHeaderCell>홍길동</Table.RowHeaderCell>
                <Table.Cell>진료지원팀</Table.Cell>
                <Table.Cell>15</Table.Cell>
                <Table.Cell>3</Table.Cell>
                <Table.Cell>12</Table.Cell>
                <Table.Cell>
                  <Button size="1" variant="outline">
                    수정
                  </Button>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.RowHeaderCell>김철수</Table.RowHeaderCell>
                <Table.Cell>경영기획팀</Table.Cell>
                <Table.Cell>18</Table.Cell>
                <Table.Cell>5</Table.Cell>
                <Table.Cell>13</Table.Cell>
                <Table.Cell>
                  <Button size="1" variant="outline">
                    수정
                  </Button>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </Flex>
      </Card>
    </Box>
  )
}

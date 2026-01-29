import { Box, Heading, Text, Card, Flex, Table, TextField } from '@radix-ui/themes';
import { Search } from 'lucide-react';

export default function UserHistory() {
  return (
    <Box>
      <Heading size="4" mb="4">유저 히스토리 데이터 조회</Heading>
      <Text color="gray" size="2" mb="6">사용자의 활동 내역 및 변경 이력을 조회할 수 있습니다.</Text>
      
      <Card mt="4">
        <Flex direction="column" gap="4">
          <Box style={{ width: '300px' }}>
            <TextField.Root placeholder="이름 검색...">
              <TextField.Slot>
                <Search size={16} />
              </TextField.Slot>
            </TextField.Root>
          </Box>

          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>일시</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>이름</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>활동 유형</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>상세 내용</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>처리자</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              <Table.Row>
                <Table.Cell>2026-01-29 10:30</Table.Cell>
                <Table.Cell>홍길동</Table.Cell>
                <Table.Cell>연차 신청</Table.Cell>
                <Table.Cell>2026-02-05 연차 신청</Table.Cell>
                <Table.Cell>시스템</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>2026-01-28 15:20</Table.Cell>
                <Table.Cell>김철수</Table.Cell>
                <Table.Cell>정보 수정</Table.Cell>
                <Table.Cell>부서 변경 (기획 &rarr; 경영)</Table.Cell>
                <Table.Cell>관리자</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </Flex>
      </Card>
    </Box>
  );
}

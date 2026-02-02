import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Switch,
  Text,
} from '@radix-ui/themes'

export default function GeneralSettings() {
  return (
    <Box>
      <Heading size="4" mb="4">
        일반 설정
      </Heading>
      <Text color="gray" size="2" mb="6">
        시스템 전반에 적용되는 설정을 관리합니다.
      </Text>

      <Card mt="4">
        <Flex direction="column" gap="6" p="2">
          <Flex justify="between" align="center">
            <Box>
              <Text as="div" size="2" weight="bold">
                이메일 알림
              </Text>
              <Text as="div" size="2" color="gray">
                새로운 연차 신청 시 관리자에게 이메일을 발송합니다.
              </Text>
            </Box>
            <Switch defaultChecked />
          </Flex>

          <Flex justify="between" align="center">
            <Box>
              <Text as="div" size="2" weight="bold">
                자동 승인 모드
              </Text>
              <Text as="div" size="2" color="gray">
                특정 조건 만족 시 연차를 자동으로 승인합니다.
              </Text>
            </Box>
            <Switch />
          </Flex>

          <Flex justify="end" mt="4">
            <Button>설정 저장</Button>
          </Flex>
        </Flex>
      </Card>
    </Box>
  )
}

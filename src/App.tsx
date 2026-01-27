import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
  Switch,
  Badge,
  Avatar,
  Dialog,
  DropdownMenu,
  Callout,
  Separator,
} from '@radix-ui/themes'
import './App.css'

function App() {
  const [count, setCount] = useState<number>(0)
  const [checked, setChecked] = useState(false)

  return (
    <Box p="6" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Flex direction="column" gap="6">
        {/* Header Section */}
        <Box>
          <Heading size="8" mb="2">
            Radix UI 컴포넌트 예제
          </Heading>
          <Text size="3" color="gray">
            다양한 Radix UI Themes 컴포넌트들을 확인해보세요
          </Text>
        </Box>

        <Separator size="4" />

        {/* Buttons Section */}
        <Card>
          <Heading size="5" mb="3">
            Buttons
          </Heading>
          <Flex gap="3" wrap="wrap">
            <Button onClick={() => setCount((prev) => prev + 1)}>
              Count: {count}
            </Button>
            <Button variant="soft">Soft Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button color="red">Red Button</Button>
            <Button color="green">Green Button</Button>
          </Flex>
        </Card>

        {/* Form Elements */}
        <Card>
          <Heading size="5" mb="3">
            Form Elements
          </Heading>
          <Flex direction="column" gap="3">
            <Box>
              <Text size="2" weight="bold" mb="1">
                Text Input
              </Text>
              <TextField.Root placeholder="이름을 입력하세요" />
            </Box>
            <Box>
              <Flex align="center" gap="2">
                <Switch checked={checked} onCheckedChange={setChecked} />
                <Text size="2">알림 받기 {checked ? '켜짐' : '꺼짐'}</Text>
              </Flex>
            </Box>
          </Flex>
        </Card>

        {/* Badges and Avatars */}
        <Card>
          <Heading size="5" mb="3">
            Badges & Avatars
          </Heading>
          <Flex direction="column" gap="3">
            <Flex gap="2" wrap="wrap">
              <Badge color="blue">New</Badge>
              <Badge color="green">Active</Badge>
              <Badge color="red">Urgent</Badge>
              <Badge color="orange">Pending</Badge>
            </Flex>
            <Flex gap="3" align="center">
              <Avatar fallback="JD" size="3" />
              <Avatar
                src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=256&h=256&fit=crop"
                fallback="A"
                size="3"
              />
              <Avatar fallback="KS" size="3" color="blue" />
            </Flex>
          </Flex>
        </Card>

        {/* Dialog Example */}
        <Card>
          <Heading size="5" mb="3">
            Dialog
          </Heading>
          <Dialog.Root>
            <Dialog.Trigger>
              <Button>Open Dialog</Button>
            </Dialog.Trigger>
            <Dialog.Content maxWidth="450px">
              <Dialog.Title>알림</Dialog.Title>
              <Dialog.Description size="2" mb="4">
                이것은 Radix UI Dialog 컴포넌트 예제입니다.
              </Dialog.Description>
              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="gray">
                    취소
                  </Button>
                </Dialog.Close>
                <Dialog.Close>
                  <Button>확인</Button>
                </Dialog.Close>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>
        </Card>

        {/* Dropdown Menu */}
        <Card>
          <Heading size="5" mb="3">
            Dropdown Menu
          </Heading>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft">Options</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item>프로필 보기</DropdownMenu.Item>
              <DropdownMenu.Item>설정</DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item color="red">로그아웃</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Card>

        {/* Callout */}
        <Callout.Root color="blue">
          <Callout.Text>
            💡 Radix UI는 접근성과 사용자 경험에 중점을 둔 컴포넌트 라이브러리입니다.
          </Callout.Text>
        </Callout.Root>
      </Flex>
    </Box>
  )
}

export default App

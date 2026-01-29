import { Box, Button, Flex, Heading, Separator, Text } from '@radix-ui/themes'
import { History, Settings as SettingsIcon, UserCog } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'

export default function Settings() {
  const menuItems = [
    {
      label: '일반 설정',
      path: '/settings',
      icon: <SettingsIcon size={18} />,
      end: true,
    },
    {
      label: '연차 개수 관리',
      path: '/settings/leave-management',
      icon: <UserCog size={18} />,
    },
    {
      label: '유저 히스토리',
      path: '/settings/history',
      icon: <History size={18} />,
    },
  ]

  return (
    <Box>
      <Heading size="6" mb="5">
        설정
      </Heading>

      <Flex gap="6" direction={{ initial: 'column', md: 'row' }}>
        {/* 좌측 메뉴 리스트 */}
        <Box width={{ initial: '100%', md: '240px' }} style={{ flexShrink: 0 }}>
          <Flex direction="column" gap="1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                style={{ textDecoration: 'none' }}
              >
                {({ isActive }) => (
                  <Button
                    variant={isActive ? 'soft' : 'ghost'}
                    color={isActive ? undefined : 'gray'}
                    size="3"
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      gap: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {item.icon}
                    <Text size="2" weight={isActive ? 'bold' : 'regular'}>
                      {item.label}
                    </Text>
                  </Button>
                )}
              </NavLink>
            ))}
          </Flex>
        </Box>

        {/* 구분선 (데스크탑에서만 보임) */}
        <Box display={{ initial: 'none', md: 'block' }}>
          <Separator orientation="vertical" size="4" />
        </Box>

        {/* 우측 컨텐츠 영역 */}
        <Box style={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Flex>
    </Box>
  )
}

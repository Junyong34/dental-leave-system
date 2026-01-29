import { Callout, Text } from '@radix-ui/themes'
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import { consumeFlashNotice, type FlashNotice } from '@/utils/flashNotice'
import Header from './Header'

export default function Layout() {
  const [notice, setNotice] = useState<FlashNotice | null>(null)

  useEffect(() => {
    const flash = consumeFlashNotice()
    if (flash) {
      setNotice(flash)
      const timer = window.setTimeout(() => setNotice(null), 2500)
      return () => window.clearTimeout(timer)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col rt-r-gap-4 rt-r-m-6 ">
      <Header />

      <main className="max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {notice && (
            <Callout.Root color={notice.tone ?? 'blue'} size="2" mb="4">
              <Callout.Text>
                <Text size="2">{notice.message}</Text>
              </Callout.Text>
            </Callout.Root>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  )
}

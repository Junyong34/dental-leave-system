export type FlashNotice = {
  message: string
  tone?: 'blue' | 'green' | 'yellow' | 'red'
}

const FLASH_NOTICE_KEY = 'flash_notice'

export function setFlashNotice(notice: FlashNotice): void {
  sessionStorage.setItem(FLASH_NOTICE_KEY, JSON.stringify(notice))
}

export function consumeFlashNotice(): FlashNotice | null {
  const raw = sessionStorage.getItem(FLASH_NOTICE_KEY)
  if (!raw) return null

  sessionStorage.removeItem(FLASH_NOTICE_KEY)
  try {
    return JSON.parse(raw) as FlashNotice
  } catch {
    return { message: raw }
  }
}

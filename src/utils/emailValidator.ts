const BASIC_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'naver.com',
  'daum.net',
  'kakao.com',
  'outlook.com',
  'icloud.com',
  'nate.com',
] as const

const ALLOWED_DOMAIN_SET = new Set<string>(ALLOWED_EMAIL_DOMAINS)

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function getEmailDomain(email: string) {
  const normalized = normalizeEmail(email)
  const atIndex = normalized.lastIndexOf('@')
  if (atIndex <= 0 || atIndex === normalized.length - 1) {
    return null
  }
  return normalized.slice(atIndex + 1)
}

export function isAllowedEmailDomain(email: string) {
  const domain = getEmailDomain(email)
  if (!domain) return false
  return ALLOWED_DOMAIN_SET.has(domain)
}

export function validateSignupEmail(email: string) {
  const normalized = normalizeEmail(email)
  if (!normalized) {
    return { valid: false, reason: '이메일을 입력해주세요.' }
  }

  console.log('⭐️ normalized =>', normalized)
  if (!BASIC_EMAIL_REGEX.test(normalized)) {
    return { valid: false, reason: '올바른 이메일 형식을 입력해주세요.' }
  }

  if (!isAllowedEmailDomain(normalized)) {
    return {
      valid: false,
      reason: '허용된 이메일 도메인이 아닙니다.',
    }
  }

  return { valid: true, normalized }
}

const SIGNUP_REQUEST_STORAGE_KEY = 'signup_request_attempts'

type SignupRequestAttemptMap = Record<string, string>

const readStorage = (): SignupRequestAttemptMap => {
  const raw = sessionStorage.getItem(SIGNUP_REQUEST_STORAGE_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as SignupRequestAttemptMap
    return parsed ?? {}
  } catch {
    return {}
  }
}

const writeStorage = (data: SignupRequestAttemptMap) => {
  sessionStorage.setItem(SIGNUP_REQUEST_STORAGE_KEY, JSON.stringify(data))
}

export function hasSignupRequestAttempt(email: string) {
  const attempts = readStorage()
  return Boolean(attempts[email])
}

export function recordSignupRequestAttempt(email: string) {
  const attempts = readStorage()
  attempts[email] = new Date().toISOString()
  writeStorage(attempts)
}

export function clearSignupRequestAttempt(email: string) {
  const attempts = readStorage()
  if (attempts[email]) {
    delete attempts[email]
    writeStorage(attempts)
  }
}

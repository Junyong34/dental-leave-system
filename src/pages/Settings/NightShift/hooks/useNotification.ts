import { useEffect, useState } from 'react'

const SUCCESS_TIMEOUT = 3000
const ERROR_TIMEOUT = 5000

export function useNotification() {
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), SUCCESS_TIMEOUT)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), ERROR_TIMEOUT)
      return () => clearTimeout(timer)
    }
  }, [error])

  return {
    success,
    error,
    setSuccess,
    setError,
  }
}

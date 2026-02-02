import { useCallback, useEffect, useState } from 'react'
import {
  getAllEmployees,
  getNightShiftConfig,
  getNightShiftRecords,
} from '@/lib/supabase/api/nightShift'
import type {
  Employee,
  NightShiftConfig,
  NightShiftRecord,
} from '@/types/nightShift'
import { WEEKDAY_ORDER } from '../constants'

export function useNightShiftData() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [config, setConfig] = useState<NightShiftConfig[]>([])
  const [records, setRecords] = useState<NightShiftRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [employeesResult, configResult, recordsResult] = await Promise.all([
      getAllEmployees(),
      getNightShiftConfig(),
      getNightShiftRecords(),
    ])

    if (employeesResult.success && employeesResult.data) {
      setEmployees(employeesResult.data)
    }

    if (configResult.success && configResult.data) {
      setConfig(configResult.data)
    } else {
      // 초기 설정이 없으면 기본값 생성
      const defaultConfig = WEEKDAY_ORDER.map((weekday) => ({
        id: 0,
        weekday,
        is_active: false,
        created_at: null,
        updated_at: null,
      }))
      setConfig(defaultConfig)
    }

    if (recordsResult.success && recordsResult.data) {
      setRecords(recordsResult.data)
    }

    if (!employeesResult.success) {
      setError(employeesResult.message)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    employees,
    config,
    records,
    loading,
    error,
    loadData,
  }
}

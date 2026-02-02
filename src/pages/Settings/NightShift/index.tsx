import { Card, Flex, Text } from '@radix-ui/themes'
import { useState } from 'react'
import { AddEmployeeDialog } from './components/AddEmployeeDialog'
import { AddEmployeesDialog } from './components/AddEmployeesDialog'
import { EmployeeManagementSection } from './components/EmployeeManagementSection'
import { NightShiftRecordsSection } from './components/NightShiftRecordsSection'
import { NotificationCallout } from './components/NotificationCallout'
import { WeekdayConfigSection } from './components/WeekdayConfigSection'
import { useNightShiftData } from './hooks/useNightShiftData'
import { useNotification } from './hooks/useNotification'

export default function NightShiftManagementPage() {
  const { employees, config, records, loading, loadData } = useNightShiftData()
  const { success, error, setSuccess, setError } = useNotification()
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isAddEmployeesOpen, setIsAddEmployeesOpen] = useState(false)

  return (
    <div className="rt-r-p-6" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Flex direction="column" gap="4">
        <div>
          <h1 className="rt-r-mb-2">야간 진료 관리</h1>
          <Text color="gray">
            야간 진료 요일 설정, 직원 관리, 야간 진료 기록을 관리합니다.
          </Text>
        </div>

        {success && <NotificationCallout type="success" message={success} />}
        {error && <NotificationCallout type="error" message={error} />}

        {loading ? (
          <Card>
            <Text color="gray">데이터를 불러오는 중...</Text>
          </Card>
        ) : (
          <>
            <WeekdayConfigSection
              config={config}
              onSuccess={setSuccess}
              onError={setError}
              onReload={loadData}
            />

            <EmployeeManagementSection
              employees={employees}
              onSuccess={setSuccess}
              onError={setError}
              onReload={loadData}
              onAddClick={() => setIsAddEmployeeOpen(true)}
              onAddMultipleClick={() => setIsAddEmployeesOpen(true)}
            />

            <NightShiftRecordsSection
              records={records}
              employees={employees}
              onSuccess={setSuccess}
              onError={setError}
              onReload={loadData}
            />
          </>
        )}
      </Flex>

      <AddEmployeeDialog
        open={isAddEmployeeOpen}
        onOpenChange={setIsAddEmployeeOpen}
        onSuccess={setSuccess}
        onError={setError}
        onReload={loadData}
      />
      <AddEmployeesDialog
        open={isAddEmployeesOpen}
        onOpenChange={setIsAddEmployeesOpen}
        onSuccess={setSuccess}
        onError={setError}
        onReload={loadData}
      />
    </div>
  )
}

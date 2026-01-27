import { useState } from 'react'
import { useLoaderData } from 'react-router'
import { LeaveHistoryModal } from '../../components/dashboard/LeaveHistoryModal'
import { sampleData } from '../../data/sampleData'
import type { LeaveStatus, User } from '../../types/leave'
import { getLeaveStatus } from '../../utils/leave'

interface UserLeaveData {
  user: User
  leaveStatus: LeaveStatus
}

export async function loader() {
  // 샘플 데이터에서 3명의 사용자 연차 통계 조회
  const usersData: UserLeaveData[] = sampleData.users.map((user) => ({
    user,
    leaveStatus: getLeaveStatus(
      user.user_id,
      sampleData.balances,
      sampleData.reservations,
    ),
  }))

  console.log('⭐️ usersData =>', usersData)
  return { usersData }
}

export default function Dashboard() {
  const { usersData } = useLoaderData<typeof loader>()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  // 선택된 사용자의 연차 사용 이력 조회
  const selectedUserHistory = selectedUserId
    ? sampleData.history.filter((h) => h.user_id === selectedUserId)
    : []

  const selectedUser = usersData.find((u) => u.user.user_id === selectedUserId)

  return (
    <div className="rt-r-p-6" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <h1 className="rt-r-mb-4">대시보드</h1>
      <p className="rt-r-mb-8">
        팀원별 연차 현황 및 통계를 확인할 수 있습니다.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {usersData.map(({ user, leaveStatus }) => {
          const usageRate = (
            (leaveStatus.used / leaveStatus.total) *
            100
          ).toFixed(1)

          return (
            <section
              id={'user-card-section'}
              key={user.user_id}
              className="rt-r-p-4"
              style={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--gray-a6)',
                borderRadius: 'var(--radius-3)',
                boxShadow: 'var(--shadow-2)',
              }}
            >
              {/* 사용자 정보 */}
              <div className="rt-r-mb-3">
                <h3
                  className="rt-r-mb-1"
                  style={{ fontSize: 'var(--font-size-3)', fontWeight: 600 }}
                >
                  {user.name}
                </h3>
                <p
                  style={{
                    fontSize: 'var(--font-size-1)',
                    color: 'var(--gray-a11)',
                  }}
                >
                  입사일: {user.join_date}
                </p>
              </div>

              {/* 연차 통계 - Grid 레이아웃 */}
              <div className="rt-r-display-flex rt-r-fd-column rt-r-gap-3">
                {/* 총 연차 합산 */}
                <div>
                  <div
                    style={{
                      fontSize: 'var(--font-size-1)',
                      color: 'var(--gray-a11)',
                      marginBottom: '2px',
                    }}
                  >
                    총 연차 (합산)
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--font-size-5)',
                      fontWeight: 700,
                      color: 'var(--blue-9)',
                    }}
                  >
                    {leaveStatus.total}일
                  </div>
                </div>

                {/* 연도별 잔여 연차 */}
                <div
                  className="rt-r-p-2"
                  style={{
                    backgroundColor: 'var(--gray-a2)',
                    borderRadius: 'var(--radius-2)',
                    border: '1px solid var(--gray-a5)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 'var(--font-size-1)',
                      color: 'var(--gray-a11)',
                      marginBottom: '4px',
                      fontWeight: 600,
                    }}
                  >
                    연도별 잔여
                  </div>
                  {leaveStatus.balances
                    .filter((b) => b.remain > 0)
                    .sort((a, b) => a.year - b.year)
                    .map((balance) => (
                      <div
                        key={balance.year}
                        className="rt-r-display-flex rt-r-jc-between rt-r-ai-center"
                        style={{
                          fontSize: 'var(--font-size-1)',
                          marginBottom: '2px',
                        }}
                      >
                        <span style={{ color: 'var(--gray-11)' }}>
                          {balance.year}년 :
                        </span>
                        <span
                          style={{
                            fontWeight: 600,
                            color: 'var(--indigo-9)',
                          }}
                        >
                          {balance.remain}일
                        </span>
                      </div>
                    ))}
                </div>

                {/* 사용/예약/잔여 통계 */}
                <div className="rt-r-display-grid rt-r-grid-columns-3 rt-r-gap-2">
                  <div>
                    <div
                      style={{
                        fontSize: 'var(--font-size-1)',
                        color: 'var(--gray-a11)',
                        marginBottom: '2px',
                      }}
                    >
                      사용
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--font-size-3)',
                        fontWeight: 700,
                        color: 'var(--green-9)',
                      }}
                    >
                      {leaveStatus.used}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 'var(--font-size-1)',
                        color: 'var(--gray-a11)',
                        marginBottom: '2px',
                      }}
                    >
                      예약
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--font-size-3)',
                        fontWeight: 700,
                        color: 'var(--amber-9)',
                      }}
                    >
                      {leaveStatus.reserved}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 'var(--font-size-1)',
                        color: 'var(--gray-a11)',
                        marginBottom: '2px',
                      }}
                    >
                      잔여
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--font-size-3)',
                        fontWeight: 700,
                        color: 'var(--purple-9)',
                      }}
                    >
                      {leaveStatus.remain}
                    </div>
                  </div>
                </div>
              </div>

              {/* 사용률 바 */}
              <div className="rt-r-mt-3">
                <div className="rt-r-display-flex rt-r-jc-between rt-r-ai-center rt-r-mb-1">
                  <span
                    style={{
                      fontSize: 'var(--font-size-1)',
                      color: 'var(--gray-a11)',
                    }}
                  >
                    사용률
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--font-size-1)',
                      fontWeight: 500,
                      color: 'var(--gray-12)',
                    }}
                  >
                    {usageRate}%
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: 'var(--gray-a3)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${usageRate}%`,
                      height: '100%',
                      background:
                        'linear-gradient(to right, var(--blue-9), var(--purple-9))',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              {/* 만료 예정 연차 */}
              {leaveStatus.nearest_expiry && (
                <div
                  className="rt-r-mt-3 rt-r-p-2"
                  style={{
                    backgroundColor: 'var(--amber-a3)',
                    border: '1px solid var(--amber-a6)',
                    borderRadius: 'var(--radius-2)',
                  }}
                >
                  <p
                    style={{
                      fontSize: 'var(--font-size-1)',
                      color: 'var(--amber-a11)',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>
                      {leaveStatus.nearest_expiry.amount}일
                    </span>
                    이{' '}
                    <span style={{ fontWeight: 600 }}>
                      {leaveStatus.nearest_expiry.expire_at}
                    </span>
                    에 만료됩니다
                  </p>
                </div>
              )}

              {/* 히스토리 버튼 */}
              <button
                type="button"
                onClick={() => setSelectedUserId(user.user_id)}
                className="rt-r-mt-3"
                style={{
                  width: '100%',
                  padding: 'var(--space-2)',
                  backgroundColor: 'var(--accent-3)',
                  border: '1px solid var(--accent-7)',
                  borderRadius: 'var(--radius-2)',
                  color: 'var(--accent-11)',
                  fontSize: 'var(--font-size-2)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-3)'
                }}
              >
                연차 사용 내역
              </button>
            </section>
          )
        })}
      </div>

      {/* 모달 */}
      <LeaveHistoryModal
        open={selectedUserId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedUserId(null)
        }}
        userName={selectedUser?.user.name ?? ''}
        history={selectedUserHistory}
      />
    </div>
  )
}

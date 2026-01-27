import { useLoaderData } from 'react-router';

export async function loader() {
  // 실제로는 API에서 데이터를 가져옵니다
  return {
    totalLeave: 15,
    usedLeave: 5,
    remainingLeave: 10,
  };
}

export default function Dashboard() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">대시보드</h1>
      <p className="text-gray-600 mb-8">연차 현황 및 통계를 확인할 수 있습니다.</p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900">총 연차</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">{data.totalLeave}일</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900">사용 연차</h3>
          <p className="text-4xl font-bold text-green-600 mt-2">{data.usedLeave}일</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900">잔여 연차</h3>
          <p className="text-4xl font-bold text-purple-600 mt-2">{data.remainingLeave}일</p>
        </div>
      </div>
    </div>
  );
}

import  { useState, useEffect } from "react";

interface SubmissionStats {
  totalCards: number;
  submitted: number;
  pending: number;
  overdue: number;
  completionRate: number;
  avgSubmissionTime: string;
}

interface RealtimeMetrics {
  activeTeachers: number;
}

interface DepartmentStat {
  department: string;
  totalCards: number;
  completedCards: number;
  completionRate: string | number;
  display?: string;
}

interface DepartmentStorage {
  department: string;
  storageStatus: string;
  storagePercentage: number;
  totalStorage: string;
  maxStorageFormatted: string;
  staffCount: number;
  totalCards: number;
  totalSubmissions: number;
  totalFiles: number;
  completionRate: number;
}

interface Card {
  id: number;
  title: string;
  description?: string;
  department?: string;
  createdAt?: string;
  isPublic?: boolean;
  status?: string;
  submissionsCount?: number;
  submissions?: number;
  _count?: {
    submissions: number;
  };
  departments?: Array<{
    staffCount: number;
  }>;
}

interface Activity {
  id?: number;
  teacher?: string;
  user?: string;
  action?: string;
  card?: string;
  description?: string;
  time?: string;
  createdAt?: string;
  department?: string;
}

const CardSubmissionAnalytics = () => {
  const [submissionStats, setSubmissionStats] = useState<SubmissionStats>({
    totalCards: 0,
    submitted: 0,
    pending: 0,
    overdue: 0,
    completionRate: 0,
    avgSubmissionTime: "0 days",
  });

  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics>({
    activeTeachers: 0,
  });

  const [myCards, setMyCards] = useState<Card[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStat[]>([]);
  const [departmentStorage, setDepartmentStorage] = useState<DepartmentStorage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWithErrorHandling = async (url: string, endpointName: string, fallbackData: any = []) => {
    try {
      console.log(`🌐 Fetching ${endpointName}:`, url);
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const response = await fetch(url, { headers });

      console.log(`📊 ${endpointName} Response Status:`, response.status);

      if (!response.ok) {
        let errorDetails = '';
        try {
          const errorData = await response.json();
          errorDetails = JSON.stringify(errorData);
        } catch (e) {
          errorDetails = await response.text();
        }

        console.error(`❌ ${endpointName} failed:`, response.status, response.statusText);
        console.error(`❌ ${endpointName} error details:`, errorDetails);

        throw new Error(`${endpointName}: ${response.status} - ${errorDetails}`);
      }

      const data = await response.json();
      console.log(`✅ ${endpointName} success:`, data);
      return data;
    } catch (error) {
      console.error(`💥 ${endpointName} error:`, error);
      console.warn(`🔄 Using fallback data for ${endpointName}`);
      return fallbackData;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔐 Starting API calls with token');

      const [
        cardAnalytics,
        realtime,
        deptCompletion,
        activity,
        storage
      ] = await Promise.all([
        fetchWithErrorHandling('http://localhost:3000/cards/analytics', 'Card Analytics', {
          totalCards: 0,
          cardsByDepartment: {},
          totalSubmissions: 0,
          totalFiles: 0,
          recentCards: []
        }),
        fetchWithErrorHandling('http://localhost:3000/activities/stats/realtime', 'Realtime Stats', {
          activeTeachers: 0
        }),
        fetchWithErrorHandling('http://localhost:3000/departments/completion-rates', 'Department Completion Rates', []),
        fetchWithErrorHandling('http://localhost:3000/activities/recent?limit=8', 'Recent Activity', []),
        fetchWithErrorHandling('http://localhost:3000/departments/storage', 'Department Storage', [])
      ]);

      setSubmissionStats({
        totalCards: cardAnalytics.totalCards || 0,
        submitted: cardAnalytics.totalSubmissions || 0,
        pending: Math.max(0, (cardAnalytics.totalCards || 0) - (cardAnalytics.totalSubmissions || 0)),
        overdue: 0,
        completionRate: cardAnalytics.totalCards > 0 ?
          Math.round((cardAnalytics.totalSubmissions / cardAnalytics.totalCards) * 100) : 0,
        avgSubmissionTime: "0 days"
      });

      const cardsData = cardAnalytics.recentCards || [];
      setMyCards(cardsData);
      setRealtimeMetrics(realtime);
      setDepartmentStats(deptCompletion);
      setRecentActivity(activity);
      setDepartmentStorage(storage);

      console.log(`✅ All data loaded successfully`);
      console.log(`📊 Department completion rates:`, deptCompletion);

      setLoading(false);

    } catch (err) {
      console.error('💥 Main fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔍 DEBUG - submissionStats:', submissionStats);
    console.log('🔍 DEBUG - departmentStats:', departmentStats);
    console.log('🔍 DEBUG - recentActivity:', recentActivity);
    console.log('🔍 DEBUG - realtimeMetrics:', realtimeMetrics);
  }, [submissionStats, departmentStats, recentActivity, realtimeMetrics]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      fetch("http://localhost:3000/activities/stats/realtime", { headers })
        .then((res) => res.json())
        .then((data) => setRealtimeMetrics(data))
        .catch(console.error);

      fetch("http://localhost:3000/activities/recent?limit=8", { headers })
        .then((res) => res.json())
        .then((data) => setRecentActivity(data))
        .catch(console.error);

      fetch("http://localhost:3000/departments/storage", { headers })
        .then((res) => res.json())
        .then((data) => setDepartmentStorage(data))
        .catch(console.error);

      fetch("http://localhost:3000/departments/completion-rates", { headers })
        .then((res) => res.json())
        .then((data) => setDepartmentStats(data))
        .catch(console.error);

      fetch("http://localhost:3000/cards/analytics", { headers })
        .then((res) => res.json())
        .then((data) => {
          setSubmissionStats({
            totalCards: data.totalCards || 0,
            submitted: data.totalSubmissions || 0,
            pending: Math.max(0, (data.totalCards || 0) - (data.totalSubmissions || 0)),
            overdue: 0,
            completionRate: data.totalCards > 0 ?
              Math.round((data.totalSubmissions / data.totalCards) * 100) : 0,
            avgSubmissionTime: "0 days"
          });
          const cardsData = data.recentCards || [];
          setMyCards(cardsData);
        })
        .catch(console.error);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (departmentStats && departmentStats.length > 0) {
      console.log('🔍 FULL departmentStats data structure:', JSON.stringify(departmentStats, null, 2));

      departmentStats.forEach((dept, index) => {
        console.log(`=== DEPARTMENT ${index} DETAILED ANALYSIS ===`);
        console.log(`📊 Raw object:`, dept);
        console.log(`📊 All keys:`, Object.keys(dept));
        console.log(`📊 department property:`, dept.department);
        console.log(`📊 totalCards property:`, dept.totalCards);
        console.log(`📊 completedCards property:`, dept.completedCards);
        console.log(`📊 completionRate property:`, dept.completionRate);
        console.log(`📊 display property:`, dept.display);

        console.log(`📊 Has department?`, 'department' in dept);
        console.log(`📊 Has totalCards?`, 'totalCards' in dept);
        console.log(`📊 Has completedCards?`, 'completedCards' in dept);
        console.log(`📊 Has completionRate?`, 'completionRate' in dept);

        if (dept.totalCards > 0) {
          const calculatedRate = Math.round((dept.completedCards / dept.totalCards) * 100);
          console.log(`📊 Calculated completion rate:`, calculatedRate + '%');
        }
      });
    }
  }, [departmentStats]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-100 border-green-300";
      case "In Progress":
        return "text-blue-600 bg-blue-100 border-blue-300";
      case "Pending":
        return "text-orange-600 bg-orange-100 border-orange-300";
      case "Overdue":
        return "text-red-600 bg-red-100 border-red-300";
      default:
        return "text-gray-600 bg-gray-100 border-gray-300";
    }
  };

  interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color?: string;
  }

  const MetricCard = ({ title, value, subtitle, icon, color = "orange" }: MetricCardProps) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-base text-gray-600 mb-2">{title}</p>
          <h3 className="text-4xl font-bold text-gray-800">{value}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
        </div>
        <div className={`bg-${color}-100 p-4 rounded-lg text-3xl`}>{icon}</div>
      </div>
    </div>
  );

  interface RealtimeMetricCardProps {
    title: string;
    value: string | number;
    unit: string;
    color: string;
  }

  const RealtimeMetricCard = ({ title, value, unit, color }: RealtimeMetricCardProps) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-base text-gray-600">{title}</span>
        <span className="text-orange-500 animate-pulse text-2xl">●</span>
      </div>
      <div className="flex items-baseline">
        <span className="text-4xl font-bold" style={{ color }}>
          {value}
        </span>
        <span className="text-base text-gray-500 ml-2">{unit}</span>
      </div>
      <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${typeof value === "number" ? Math.min(value, 100) : 50}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">Error: {error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto">
      <div className="w-full mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Submission Analytics</h1>
              <p className="text-lg text-gray-600 mt-2">
                Administrator Dashboard • All Departments
              </p>
            </div>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <MetricCard
            title="Total Cards Posted"
            value={submissionStats.totalCards}
            subtitle="Cards in the system"
            icon="📋"
          />
          <MetricCard
            title="Completed"
            value={submissionStats.submitted}
            subtitle="All staff submitted"
            icon="✅"
            color="green"
          />
          <MetricCard
            title="In Progress"
            value={submissionStats.pending}
            subtitle="Awaiting submissions"
            icon="⏳"
          />
          <MetricCard
            title="Overdue"
            value={submissionStats.overdue}
            subtitle="Past deadline"
            icon="⚠️"
            color="red"
          />
        </div>

        {/* Real-time Metrics - Only Active Teachers */}
        <div className="mb-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Live Submission Activity
            </h2>
            <span className="flex items-center text-base text-gray-600">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></span>
              Updating in real-time
            </span>
          </div>
          <div className="grid grid-cols-1">
            <RealtimeMetricCard
              title="Active Teachers"
              value={realtimeMetrics.activeTeachers}
              unit="online now"
              color="#f59e0b"
            />
          </div>
        </div>

        {/* Department Storage Data */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Department Storage & Analytics
          </h2>

          {/* Global Storage Warning */}
          {departmentStorage.some(dept => dept.storageStatus === 'critical') && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-500 text-xl mr-3">⚠️</span>
                <div>
                  <h4 className="text-red-800 font-semibold">Storage Critical</h4>
                  <p className="text-red-600 text-sm">
                    Some departments are approaching storage limits. Consider archiving old files.
                  </p>
                </div>
              </div>
            </div>
          )}

          {departmentStorage.some(dept => dept.storageStatus === 'warning') &&
            !departmentStorage.some(dept => dept.storageStatus === 'critical') && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-yellow-500 text-xl mr-3">⚠️</span>
                  <div>
                    <h4 className="text-yellow-800 font-semibold">Storage Warning</h4>
                    <p className="text-yellow-600 text-sm">
                      Some departments are using high storage. Monitor usage closely.
                    </p>
                  </div>
                </div>
              </div>
            )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departmentStorage.length > 0 ? (
              departmentStorage.map((dept, idx) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-6 hover:shadow-lg transition-shadow ${dept.storageStatus === 'critical'
                    ? 'border-red-300 bg-red-50'
                    : dept.storageStatus === 'warning'
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-gray-200'
                    }`}
                >
                  {/* Department Header with Warning Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold text-gray-800">{dept.department}</h3>
                      {dept.storageStatus === 'critical' && (
                        <span className="ml-2 text-red-500 text-sm animate-pulse" title="Critical Storage">
                          🔴
                        </span>
                      )}
                      {dept.storageStatus === 'warning' && (
                        <span className="ml-2 text-yellow-500 text-sm" title="Storage Warning">
                          🟡
                        </span>
                      )}
                    </div>
                    <span className="text-3xl">📊</span>
                  </div>

                  <div className="space-y-3">
                    {/* Storage Progress Bar with Warning Colors */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Storage Usage</span>
                        <span className={`text-sm font-bold ${dept.storageStatus === 'critical' ? 'text-red-600' :
                          dept.storageStatus === 'warning' ? 'text-yellow-600' :
                            'text-gray-600'
                          }`}>
                          {dept.storagePercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${dept.storageStatus === 'critical' ? 'bg-red-500' :
                            dept.storageStatus === 'warning' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                          style={{ width: `${Math.min(dept.storagePercentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{dept.totalStorage}</span>
                        <span>Max: {dept.maxStorageFormatted}</span>
                      </div>
                    </div>

                    {/* Storage Warning Message */}
                    {dept.storageStatus === 'critical' && (
                      <div className="p-2 bg-red-100 border border-red-300 rounded text-center">
                        <p className="text-red-700 text-xs font-semibold">
                          🚨 CRITICAL: {dept.storagePercentage}% storage used
                        </p>
                      </div>
                    )}

                    {dept.storageStatus === 'warning' && (
                      <div className="p-2 bg-yellow-100 border border-yellow-300 rounded text-center">
                        <p className="text-yellow-700 text-xs font-semibold">
                          ⚠️ WARNING: {dept.storagePercentage}% storage used
                        </p>
                      </div>
                    )}

                    {/* Department Stats */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Staff</span>
                        <span className="font-bold text-gray-800">{dept.staffCount || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Cards</span>
                        <span className="font-bold text-gray-800">{dept.totalCards || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Submissions</span>
                        <span className="font-bold text-gray-800">{dept.totalSubmissions || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Files</span>
                        <span className="font-bold text-blue-600">{dept.totalFiles || 0}</span>
                      </div>
                    </div>

                    {/* Completion Progress */}
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Completion Rate</span>
                        <span className="text-gray-500">{dept.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${dept.completionRate || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                No department storage data available
              </div>
            )}
          </div>
        </div>

        {/* My Cards Table - SCROLLABLE VERSION */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            All Posted Cards
          </h3>
          <div 
            className="overflow-x-auto max-h-96 overflow-y-auto"
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: '#f59e0b #f3f4f6'
            }}
          >
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">
                    Card Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">
                    Created Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">
                    Submissions
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">
                    Card Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {myCards.length > 0 ? (
                  myCards.map((card) => {
                    const submissionCount = 
                      card.submissionsCount ||
                      card.submissions ||
                      card._count?.submissions ||
                      0;

                    const staffCount = card.departments?.reduce((total, dept) => 
                      total + (dept.staffCount || 0), 0) || 0;

                    return (
                      <tr key={card.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="text-orange-500 mr-3 text-2xl">
                              📄
                            </span>
                            <div>
                              <span className="font-medium text-gray-800 text-base block">
                                {card.title || 'Untitled Card'}
                              </span>
                              {card.department && (
                                <span className="text-xs text-gray-500 mt-1">
                                  {card.department}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-base text-gray-600 max-w-xs">
                          <div className="truncate">
                            {card.description || 'No description'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-base text-gray-600">
                          {card.createdAt ? new Date(card.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 text-sm rounded-full border ${
                              card.isPublic 
                                ? "text-green-600 bg-green-100 border-green-300"
                                : "text-blue-600 bg-blue-100 border-blue-300"
                            }`}
                          >
                            {card.isPublic ? "Public" : "Private"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-base font-medium text-gray-800">
                              {submissionCount} / {staffCount > 0 ? staffCount : 'N/A'}
                            </span>
                            <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className="bg-orange-500 h-2 rounded-full transition-all"
                                style={{
                                  width: staffCount > 0 
                                    ? `${Math.min((submissionCount / staffCount) * 100, 100)}%`
                                    : '0%'
                                }}
                              />
                            </div>
                            {staffCount === 0 && (
                              <span className="text-xs text-gray-500 mt-1">
                                No staff in department
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(
                              card.status || 'active'
                            )}`}
                          >
                            {card.status === 'active' ? 'Active' : (card.status || 'Active')}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No cards found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Overall Status Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Overall Status Breakdown
            </h3>
            <div className="space-y-6">
              {/* Completed */}
              <div>
                <div className="flex justify-between text-base mb-2">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">
                    {submissionStats.submitted}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all"
                    style={{
                      width: `${submissionStats.totalCards > 0
                          ? Math.min((submissionStats.submitted / submissionStats.totalCards) * 100, 100)
                          : 0
                        }%`,
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {submissionStats.submitted} / {submissionStats.totalCards} cards
                </p>
              </div>

              {/* In Progress */}
              <div>
                <div className="flex justify-between text-base mb-2">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-semibold text-orange-600">
                    {submissionStats.pending}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-orange-500 h-4 rounded-full transition-all"
                    style={{
                      width: `${submissionStats.totalCards > 0
                          ? Math.min((submissionStats.pending / submissionStats.totalCards) * 100, 100)
                          : 0
                        }%`,
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {submissionStats.pending} / {submissionStats.totalCards} cards
                </p>
              </div>

              {/* Overdue */}
              <div>
                <div className="flex justify-between text-base mb-2">
                  <span className="text-gray-600">Overdue</span>
                  <span className="font-semibold text-red-600">
                    {submissionStats.overdue}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-red-500 h-4 rounded-full transition-all"
                    style={{
                      width: `${submissionStats.totalCards > 0
                          ? Math.min((submissionStats.overdue / submissionStats.totalCards) * 100, 100)
                          : 0
                        }%`,
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {submissionStats.overdue} / {submissionStats.totalCards} cards
                </p>
              </div>
            </div>
          </div>

          {/* Department Completion Rates - FIXED VERSION */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Department Completion Rates
            </h3>
            <div className="space-y-6">
              {departmentStats && departmentStats.length > 0 ? (
                departmentStats.map((dept, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-base mb-2">
                      <span className="text-gray-600">
                        {dept.department}
                      </span>
                      <span className="font-semibold text-orange-600">
                        {dept.completionRate}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-orange-500 h-3 rounded-full transition-all"
                        style={{
                          width: `${parseInt(String(dept.completionRate)) || 0}%`
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {dept.completedCards} / {dept.totalCards} cards
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🏢</div>
                  <p className="text-gray-500">No department data available</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Department completion rates will appear here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Submissions - SCROLLABLE VERSION */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Recent Submissions
            </h3>
            <div 
              className="space-y-4 max-h-96 overflow-y-auto pr-2"
              style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: '#f59e0b #f3f4f6'
              }}
            >
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity, idx) => (
                  <div
                    key={activity.id || idx}
                    className="flex items-start space-x-3 pb-4 border-b last:border-b-0"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-base">✓</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base text-gray-800 font-medium truncate">
                        {activity.teacher || activity.user || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.action || 'Submitted'} • {activity.card || activity.description || 'Document'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.time || activity.createdAt || 'Recently'}
                      </p>
                      {activity.department && (
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.department}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400 mt-1">Submissions will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default CardSubmissionAnalytics;
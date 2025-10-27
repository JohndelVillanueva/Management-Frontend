import React, { useState, useEffect } from 'react';

const CardSubmissionAnalytics = () => {
  const [teacherInfo, setTeacherInfo] = useState({
    name: 'Dr. Sarah Johnson',
    department: 'Academics',
    employeeId: 'T-2024-001'
  });

  const [submissionStats, setSubmissionStats] = useState({
    totalCards: 12,
    submitted: 8,
    pending: 3,
    overdue: 1,
    completionRate: 66.7,
    avgSubmissionTime: '2.3 days'
  });

  const [realtimeMetrics, setRealtimeMetrics] = useState({
    activeTeachers: 23,
    submittedToday: 5,
    pendingNow: 47,
    dueToday: 8
  });

  const [myCards, setMyCards] = useState([
    {
      id: 1,
      title: 'Form 137',
      postedBy: 'Admin Office',
      deadline: '2025-10-28',
      status: 'Pending',
      priority: 'High',
      department: 'Academics',
      submissions: 12,
      totalStaff: 15
    },
    {
      id: 2,
      title: 'Student Progress Report',
      postedBy: 'Department Head',
      deadline: '2025-10-26',
      status: 'Overdue',
      priority: 'Urgent',
      department: 'Academics',
      submissions: 8,
      totalStaff: 15
    },
    {
      id: 3,
      title: 'Class Assessment Form',
      postedBy: 'Admin Office',
      deadline: '2025-10-30',
      status: 'In Progress',
      priority: 'Medium',
      department: 'Academics',
      submissions: 10,
      totalStaff: 15
    },
    {
      id: 4,
      title: 'Attendance Summary',
      postedBy: 'Department Head',
      deadline: '2025-10-24',
      status: 'Completed',
      priority: 'High',
      department: 'Academics',
      submissions: 15,
      totalStaff: 15,
      completedOn: '2025-10-23'
    },
    {
      id: 5,
      title: 'Grade Sheet Q1',
      postedBy: 'Admin Office',
      deadline: '2025-10-29',
      status: 'Completed',
      priority: 'High',
      department: 'Academics',
      submissions: 15,
      totalStaff: 15,
      completedOn: '2025-10-25'
    }
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, teacher: 'John Martinez', card: 'Form 137', action: 'Submitted', time: '5 min ago' },
    { id: 2, teacher: 'Lisa Chen', card: 'Grade Sheet', action: 'Submitted', time: '12 min ago' },
    { id: 3, teacher: 'You', card: 'Attendance Summary', action: 'Submitted', time: '1 hour ago' },
    { id: 4, teacher: 'Mike Davis', card: 'Student Report', action: 'Submitted', time: '2 hours ago' },
    { id: 5, teacher: 'Anna Garcia', card: 'Form 137', action: 'Submitted', time: '3 hours ago' }
  ]);

  const [departmentStats, setDepartmentStats] = useState([
    { department: 'Academics', rate: 85, submitted: 45, total: 53 },
    { department: 'Administration', rate: 73, submitted: 32, total: 44 },
    { department: 'Student Services', rate: 82, submitted: 28, total: 34 },
    { department: 'Support Services', rate: 83, submitted: 20, total: 24 }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeMetrics(prev => ({
        activeTeachers: Math.max(15, prev.activeTeachers + Math.floor(Math.random() * 6 - 3)),
        submittedToday: prev.submittedToday + (Math.random() > 0.8 ? 1 : 0),
        pendingNow: Math.max(30, prev.pendingNow + Math.floor(Math.random() * 4 - 2)),
        dueToday: prev.dueToday
      }));

      // Simulate submission activity
      if (Math.random() > 0.7) {
        const teachers = ['Maria Garcia', 'Tom Wilson', 'Sarah Lee', 'James Brown', 'Emma Taylor'];
        const cards = ['Form 137', 'Grade Sheet', 'Student Report', 'Assessment Form', 'Progress Report'];
        
        setRecentActivity(prev => [
          {
            id: Date.now(),
            teacher: teachers[Math.floor(Math.random() * teachers.length)],
            card: cards[Math.floor(Math.random() * cards.length)],
            action: 'Submitted',
            time: 'Just now'
          },
          ...prev.slice(0, 7)
        ]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'text-red-600 bg-red-100 border-red-300';
      case 'High': return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100 border-green-300';
      case 'In Progress': return 'text-blue-600 bg-blue-100 border-blue-300';
      case 'Pending': return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'Overdue': return 'text-red-600 bg-red-100 border-red-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const MetricCard = ({ title, value, subtitle, icon, color = 'orange' }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-base text-gray-600 mb-2">{title}</p>
          <h3 className="text-4xl font-bold text-gray-800">{value}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
        </div>
        <div className={`bg-${color}-100 p-4 rounded-lg text-3xl`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const RealtimeMetricCard = ({ title, value, unit, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-base text-gray-600">{title}</span>
        <span className="text-orange-500 animate-pulse text-2xl">●</span>
      </div>
      <div className="flex items-baseline">
        <span className="text-4xl font-bold" style={{ color }}>{value}</span>
        <span className="text-base text-gray-500 ml-2">{unit}</span>
      </div>
      <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-500"
          style={{ 
            width: `${typeof value === 'number' ? Math.min(value, 100) : 50}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto">
      <div className="w-full mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Card Submission Analytics</h1>
              <p className="text-lg text-gray-600 mt-2">Administrator Dashboard • All Departments</p>
            </div>
            <div className="bg-orange-100 px-6 py-3 rounded-lg">
              <p className="text-base text-gray-600">Overall Completion</p>
              <p className="text-3xl font-bold text-orange-700">{submissionStats.completionRate}%</p>
            </div>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="mb-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Live Submission Activity</h2>
            <span className="flex items-center text-base text-gray-600">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></span>
              Updating in real-time
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <RealtimeMetricCard 
              title="Active Teachers" 
              value={realtimeMetrics.activeTeachers} 
              unit="online now"
              color="#f59e0b"
            />
            <RealtimeMetricCard 
              title="Submitted Today" 
              value={realtimeMetrics.submittedToday} 
              unit="cards"
              color="#10b981"
            />
            <RealtimeMetricCard 
              title="Pending Department-Wide" 
              value={realtimeMetrics.pendingNow} 
              unit="cards"
              color="#f59e0b"
            />
            <RealtimeMetricCard 
              title="Due Today" 
              value={realtimeMetrics.dueToday} 
              unit="cards"
              color="#ef4444"
            />
          </div>
        </div>

        {/* My Submission Stats */}
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

        {/* My Cards Table */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">All Posted Cards</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Card Title</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Posted By</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Deadline</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Submissions</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {myCards.map((card) => (
                  <tr key={card.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-orange-500 mr-3 text-2xl">📄</span>
                        <span className="font-medium text-gray-800 text-base">{card.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-base text-gray-600">{card.postedBy}</td>
                    <td className="px-6 py-4 text-base text-gray-600">{card.deadline}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-sm rounded-full border ${getPriorityColor(card.priority)}`}>
                        {card.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-base font-medium text-gray-800">
                          {card.submissions} / {card.totalStaff}
                        </span>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-orange-500 h-2 rounded-full transition-all"
                            style={{ width: `${(card.submissions / card.totalStaff) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(card.status)}`}>
                        {card.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* My Status Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Overall Status Breakdown</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-base mb-2">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{submissionStats.submitted}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-green-500 h-4 rounded-full transition-all"
                    style={{ width: `${(submissionStats.submitted / submissionStats.totalCards) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-base mb-2">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-semibold text-orange-600">{submissionStats.pending}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-orange-500 h-4 rounded-full transition-all"
                    style={{ width: `${(submissionStats.pending / submissionStats.totalCards) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-base mb-2">
                  <span className="text-gray-600">Overdue</span>
                  <span className="font-semibold text-red-600">{submissionStats.overdue}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-red-500 h-4 rounded-full transition-all"
                    style={{ width: `${(submissionStats.overdue / submissionStats.totalCards) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Department Comparison */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Department Completion Rates</h3>
            <div className="space-y-6">
              {departmentStats.map((dept, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-base mb-2">
                    <span className="text-gray-600">{dept.department}</span>
                    <span className="font-semibold text-orange-600">{dept.rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        dept.department === teacherInfo.department ? 'bg-orange-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${dept.rate}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{dept.submitted} / {dept.total} cards</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Submissions</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-base">✓</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base text-gray-800 font-medium truncate">{activity.teacher}</p>
                    <p className="text-sm text-gray-600">{activity.action} • {activity.card}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
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
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  FolderIcon, 
  ClockIcon, 
  CheckCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const HeadWelcomePage = () => {
  const navigate = useNavigate();

  // Mock data - replace with actual API calls
  const departmentStats = {
    totalStaff: 15,
    activeStaff: 12,
    pendingSubmissions: 8,
    completedSubmissions: 45,
    totalCards: 20,
    activeCards: 18
  };

  const recentActivity = [
    { id: 1, type: 'submission', title: 'Monthly Report Submitted', user: 'John Doe', time: '2 hours ago', status: 'completed' },
    { id: 2, type: 'card', title: 'New Card Created', user: 'Admin', time: '4 hours ago', status: 'active' },
    { id: 3, type: 'submission', title: 'Student Records Updated', user: 'Jane Smith', time: '1 day ago', status: 'pending' },
    { id: 4, type: 'staff', title: 'New Staff Member Added', user: 'HR Department', time: '2 days ago', status: 'completed' },
  ];

  const upcomingDeadlines = [
    { id: 1, title: 'Department Quarterly Review', deadline: '2024-01-20', priority: 'high', assignedTo: 'All Staff' },
    { id: 2, title: 'Budget Report Submission', deadline: '2024-01-25', priority: 'high', assignedTo: 'Finance Team' },
    { id: 3, title: 'Staff Performance Reviews', deadline: '2024-01-30', priority: 'medium', assignedTo: 'Department Heads' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'submission':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'card':
        return <FolderIcon className="h-5 w-5 text-orange-500" />;
      case 'staff':
        return <UserGroupIcon className="h-5 w-5 text-green-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'active':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Department Head Dashboard</h1>
          <p className="text-gray-600">Manage your department's activities and staff performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{departmentStats.totalStaff}</p>
                <p className="text-xs text-green-600">+{departmentStats.activeStaff} active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{departmentStats.completedSubmissions}</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{departmentStats.pendingSubmissions}</p>
                <p className="text-xs text-orange-600">Requires attention</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FolderIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Cards</p>
                <p className="text-2xl font-bold text-gray-900">{departmentStats.activeCards}</p>
                <p className="text-xs text-gray-500">of {departmentStats.totalCards} total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Performance Score</p>
                <p className="text-2xl font-bold text-gray-900">92%</p>
                <p className="text-xs text-green-600">+5% this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-xs text-red-600">Needs immediate action</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {getActivityIcon(activity.type)}
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">by {activity.user} • {activity.time}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button 
                  onClick={() => navigate('/reports')}
                  className="w-full text-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  View All Activity
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Upcoming Deadlines</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{deadline.title}</p>
                        <p className="text-sm text-gray-500">Due: {deadline.deadline} • {deadline.assignedTo}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(deadline.priority)}`}>
                      {deadline.priority}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button 
                  onClick={() => navigate('/staff')}
                  className="w-full text-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Manage Staff
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/staff')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserGroupIcon className="h-6 w-6 text-blue-600 mr-3" />
              <span className="font-medium text-gray-900">Staff Management</span>
            </button>
            <button 
              onClick={() => navigate('/reports')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChartBarIcon className="h-6 w-6 text-green-600 mr-3" />
              <span className="font-medium text-gray-900">View Reports</span>
            </button>
            <button 
              onClick={() => navigate('/cards')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FolderIcon className="h-6 w-6 text-orange-600 mr-3" />
              <span className="font-medium text-gray-900">Manage Cards</span>
            </button>
            <button 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <DocumentTextIcon className="h-6 w-6 text-purple-600 mr-3" />
              <span className="font-medium text-gray-900">Create Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadWelcomePage;
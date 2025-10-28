import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DocumentTextIcon,
  FolderIcon,
  ClockIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";

const HeadWelcomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [departmentName, setDepartmentName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [departmentStats, setDepartmentStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    pendingSubmissions: 0,
    completedSubmissions: 0,
    totalCards: 0,
    activeCards: 0,
    overdueCount: 0,
    performance: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);

  // Fetch all department data
  const fetchDepartmentData = async () => {
    if (!user?.departmentId) {
      setError('No department assigned');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const [deptRes, statsRes, activityRes, deadlinesRes] = await Promise.all([
        fetch(`http://localhost:3000/departments/${user.departmentId}`),
        fetch(`http://localhost:3000/head/stats?departmentId=${user.departmentId}`),
        fetch(`http://localhost:3000/head/activity?departmentId=${user.departmentId}&limit=4`),
        fetch(`http://localhost:3000/head/deadlines?departmentId=${user.departmentId}&limit=3`)
      ]);

      if (!deptRes.ok || !statsRes.ok || !activityRes.ok || !deadlinesRes.ok) {
        throw new Error('Failed to fetch department data');
      }

      const [dept, stats, activity, deadlines] = await Promise.all([
        deptRes.json(),
        statsRes.json(),
        activityRes.json(),
        deadlinesRes.json()
      ]);

      setDepartmentName(dept.name || "Department");
      setDepartmentStats(stats);
      setRecentActivity(activity);
      setUpcomingDeadlines(deadlines);
      setError(null);
    } catch (err) {
      console.error('Error fetching department data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDepartmentData();
  }, [user?.departmentId]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user?.departmentId) return;

    const interval = setInterval(() => {
      // Refresh stats and activity
      fetch(`http://localhost:3000/head/stats?departmentId=${user.departmentId}`)
        .then(res => res.json())
        .then(data => setDepartmentStats(data))
        .catch(console.error);

      fetch(`http://localhost:3000/head/activity?departmentId=${user.departmentId}&limit=4`)
        .then(res => res.json())
        .then(data => setRecentActivity(data))
        .catch(console.error);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user?.departmentId]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "submission":
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case "card":
        return <FolderIcon className="h-5 w-5 text-orange-500" />;
      case "staff":
        return <UserGroupIcon className="h-5 w-5 text-green-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "active":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Close sidebar when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading && !departmentName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !departmentName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">Error: {error}</p>
          <button 
            onClick={fetchDepartmentData}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <div className="flex">
        {/* Mobile sidebar */}
        <div className={`fixed top-0 left-0 z-30 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button onClick={() => setIsSidebarOpen(false)}>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="p-4">
            <nav className="space-y-2">
              <button 
                onClick={() => navigate("/HeadDashboard")}
                className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100"
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigate("/staff")}
                className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100"
              >
                Staff Management
              </button>
              <button 
                onClick={() => navigate("/reports")}
                className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100"
              >
                Reports
              </button>
              <button 
                onClick={() => navigate("/cards")}
                className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100"
              >
                Cards
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full">
          <div className="p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-8">
              <div className="flex-1 mb-4 lg:mb-0">
                <div className="flex items-center mb-3">
                  <button 
                    className="lg:hidden p-2 rounded-lg bg-white shadow-sm mr-3"
                    onClick={() => setIsSidebarOpen(true)}
                  >
                    <Bars3Icon className="h-6 w-6" />
                  </button>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
                      {departmentName} Department
                    </h1>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3">
                  <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                    <span>{departmentName}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                    Live data updating every 30 seconds
                  </div>
                </div>
                
                <p className="text-gray-600 mt-3 text-base lg:text-lg max-w-3xl">
                  Manage your department's activities and staff performance in one centralized dashboard
                </p>
              </div>
              
              <div className="flex items-center justify-between lg:justify-end lg:ml-8">
                <div className="text-right mr-4">
                  <p className="text-lg font-semibold text-gray-800">
                    {user?.first_name} {user?.last_name}
                  </p>
                  {/* <p className="text-sm text-gray-600">Department Head</p> */}
                  <p className="text-xs text-gray-500 mt-1">{departmentName} Department</p>
                </div>
                {/* <div className="h-14 w-14 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {user?.first_name?.charAt(0) || 'U'}
                </div> */}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <UserGroupIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Staff</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {departmentStats.totalStaff}
                    </p>
                    <p className="text-xs text-green-600 font-medium">
                      {departmentStats.activeStaff} active now
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {departmentStats.completedSubmissions}
                    </p>
                    <p className="text-xs text-gray-500">Submissions</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {departmentStats.pendingSubmissions}
                    </p>
                    <p className="text-xs text-orange-600 font-medium">Needs attention</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <ChartBarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Performance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {departmentStats.performance}%
                    </p>
                    <p className="text-xs text-green-600 font-medium">Completion rate</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {departmentStats.overdueCount}
                    </p>
                    <p className="text-xs text-red-600 font-medium">Immediate action</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-5 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Recent Activity
                    </h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      Last 24 hours
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center">
                            {getActivityIcon(activity.type)}
                            <div className="ml-4">
                              <p className="text-base font-medium text-gray-900">
                                {activity.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                by {activity.user} • {activity.time}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                              activity.status
                            )}`}
                          >
                            {activity.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-lg">No recent activity</p>
                        <p className="text-gray-400 text-sm mt-1">Activity will appear here as it happens</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => navigate("/reports")}
                      className="w-full py-3 px-4 border-2 border-gray-300 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      View All Activity
                    </button>
                  </div>
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-5 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Upcoming Deadlines
                    </h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      Next 7 days
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="space-y-4">
                    {upcomingDeadlines.length > 0 ? (
                      upcomingDeadlines.map((deadline) => (
                        <div
                          key={deadline.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center">
                            <ClockIcon className="h-5 w-5 text-gray-400 mr-4" />
                            <div>
                              <p className="text-base font-medium text-gray-900">
                                {deadline.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                Due: {deadline.deadline} • {deadline.assignedTo}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(
                              deadline.priority
                            )}`}
                          >
                            {deadline.priority}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-lg">No upcoming deadlines</p>
                        <p className="text-gray-400 text-sm mt-1">All caught up for now</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => navigate("/staff")}
                      className="w-full py-3 px-4 border-2 border-gray-300 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      Manage Staff & Deadlines
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate("/staff")}
                  className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
                >
                  <UserGroupIcon className="h-6 w-6 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
                  <span className="text-base font-semibold text-gray-900">
                    Staff Management
                  </span>
                </button>
                <button
                  onClick={() => navigate("/reports")}
                  className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all duration-200 group"
                >
                  <ChartBarIcon className="h-6 w-6 text-green-600 mr-3 group-hover:scale-110 transition-transform" />
                  <span className="text-base font-semibold text-gray-900">
                    Reports & Analytics
                  </span>
                </button>
                <button
                  onClick={() => navigate("/cards")}
                  className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 group"
                >
                  <FolderIcon className="h-6 w-6 text-orange-600 mr-3 group-hover:scale-110 transition-transform" />
                  <span className="text-base font-semibold text-gray-900">
                    Card Management
                  </span>
                </button>
                <button 
                  onClick={() => navigate("/reports/create")}
                  className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 group"
                >
                  <DocumentTextIcon className="h-6 w-6 text-purple-600 mr-3 group-hover:scale-110 transition-transform" />
                  <span className="text-base font-semibold text-gray-900">
                    Create Report
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadWelcomePage;
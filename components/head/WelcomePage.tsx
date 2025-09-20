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
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";

const HeadWelcomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [departmentStats, setDepartmentStats] = useState({
    totalStaff: 15,
    activeStaff: 12,
    pendingSubmissions: 8,
    completedSubmissions: 45,
    totalCards: 0,
    activeCards: 0,
  });

  const recentActivity = [
    {
      id: 1,
      type: "submission",
      title: "Monthly Report Submitted",
      user: "John Doe",
      time: "2 hours ago",
      status: "completed",
    },
    {
      id: 2,
      type: "card",
      title: "New Card Created",
      user: "Admin",
      time: "4 hours ago",
      status: "active",
    },
    {
      id: 3,
      type: "submission",
      title: "Student Records Updated",
      user: "Jane Smith",
      time: "1 day ago",
      status: "pending",
    },
    {
      id: 4,
      type: "staff",
      title: "New Staff Member Added",
      user: "HR Department",
      time: "2 days ago",
      status: "completed",
    },
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      title: "Department Quarterly Review",
      deadline: "2024-01-20",
      priority: "high",
      assignedTo: "All Staff",
    },
    {
      id: 2,
      title: "Budget Report Submission",
      deadline: "2024-01-25",
      priority: "high",
      assignedTo: "Finance Team",
    },
    {
      id: 3,
      title: "Staff Performance Reviews",
      deadline: "2024-01-30",
      priority: "medium",
      assignedTo: "Department Heads",
    },
  ];

  const getActivityIcon = (type) => {
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

  const getStatusColor = (status) => {
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

  const getPriorityColor = (priority) => {
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

  // Close sidebar when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
              <button className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100">
                Dashboard
              </button>
              <button className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100">
                Staff Management
              </button>
              <button className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100">
                Reports
              </button>
              <button className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100">
                Cards
              </button>
            </nav>
          </div>
        </div>

        <div className="flex-1 p-4 lg:ml-0">
          <div className="max-w-7xl mx-auto">
            {/* Header with mobile menu button */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <button 
                  className="lg:hidden p-2 rounded-lg bg-white shadow-sm mr-2"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                  Department Head Dashboard
                </h1>
                <p className="text-gray-600 mt-1 text-sm lg:text-base">
                  Manage your department's activities and staff performance
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Welcome, {user?.name}</span>
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserGroupIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Total Staff</p>
                    <p className="text-xl font-bold text-gray-900">
                      {departmentStats.totalStaff}
                    </p>
                    <p className="text-xs text-green-600">
                      +{departmentStats.activeStaff} active
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">
                      Completed
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {departmentStats.completedSubmissions}
                    </p>
                    <p className="text-xs text-gray-500">This month</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <ClockIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">
                      Pending
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {departmentStats.pendingSubmissions}
                    </p>
                    <p className="text-xs text-orange-600">Needs attention</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 lg:col-span-1 xl:col-span-1">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ChartBarIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">
                      Performance
                    </p>
                    <p className="text-xl font-bold text-gray-900">92%</p>
                    <p className="text-xs text-green-600">+5% this month</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 sm:col-span-2 lg:col-span-1 xl:col-span-1">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">
                      Overdue Tasks
                    </p>
                    <p className="text-xl font-bold text-gray-900">3</p>
                    <p className="text-xs text-red-600">Immediate action</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Recent Activity
                  </h2>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          {getActivityIcon(activity.type)}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              by {activity.user} • {activity.time}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            activity.status
                          )}`}
                        >
                          {activity.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => navigate("/reports")}
                      className="w-full text-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View All Activity
                    </button>
                  </div>
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Upcoming Deadlines
                  </h2>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {upcomingDeadlines.map((deadline) => (
                      <div
                        key={deadline.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {deadline.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              Due: {deadline.deadline} • {deadline.assignedTo}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                            deadline.priority
                          )}`}
                        >
                          {deadline.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => navigate("/staff")}
                      className="w-full text-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Manage Staff
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => navigate("/staff")}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <UserGroupIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    Staff
                  </span>
                </button>
                <button
                  onClick={() => navigate("/reports")}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChartBarIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    Reports
                  </span>
                </button>
                <button
                  onClick={() => navigate("/cards")}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FolderIcon className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    Cards
                  </span>
                </button>
                <button className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <DocumentTextIcon className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
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
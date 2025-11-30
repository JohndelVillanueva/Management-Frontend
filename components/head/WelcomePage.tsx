import { useState, useEffect } from "react";
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

interface DepartmentStats {
  totalStaff: number;
  activeStaff: number;
  pendingSubmissions: number;
  completedSubmissions: number;
  totalCards: number;
  activeCards: number;
  overdueCount: number;
  performance: number;
}

interface Activity {
  id: string | number;
  type: string;
  title: string;
  user: string;
  time: string;
  status: string;
}

interface Deadline {
  id: string | number;
  title: string;
  deadline: string;
  assignedTo: string;
  priority: string;
}

interface Card {
  id: string | number;
  title: string;
  expiresAt?: string;
  createdAt?: string;
}

interface Submission {
  id: string | number;
  card?: Card;
  user?: {
    first_name?: string;
    last_name?: string;
  };
  createdAt: string;
}

interface Department {
  name: string;
  _count?: {
    users: number;
  };
}

const HeadWelcomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [departmentName, setDepartmentName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const baseUrl: string = (import.meta as any).env?.VITE_API_URL ?? "";
  
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats>({
    totalStaff: 0,
    activeStaff: 0,
    pendingSubmissions: 0,
    completedSubmissions: 0,
    totalCards: 0,
    activeCards: 0,
    overdueCount: 0,
    performance: 0
  });

  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Deadline[]>([]);

  // Fetch all department data
  const fetchDepartmentData = async () => {
    if (!user?.departmentId) {
      setError('No department assigned');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const [deptRes, cardsRes] = await Promise.all([
        fetch(`${baseUrl}/departments/${user.departmentId}`),
        fetch(`${baseUrl}/cards?departmentId=${user.departmentId}`)
      ]);

      if (!deptRes.ok || !cardsRes.ok) {
        throw new Error('Failed to fetch department data');
      }

      const [dept, cards] = await Promise.all([
        deptRes.json() as Promise<Department>,
        cardsRes.json() as Promise<Card[]>
      ]);

      const totalStaff = dept._count?.users || 0;
      const totalCards = cards.length;
      const now = new Date();

      // Get submissions for each card to calculate completion stats
      const submissionsPromises = cards.map((card: Card) => 
        fetch(`${baseUrl}/submissions/${card.id}`).then(res => res.json())
      );
      
      const allSubmissionsArrays = await Promise.all(submissionsPromises);
      const allSubmissions: Submission[] = allSubmissionsArrays.flat();

      const completedSubmissions = allSubmissions.length;
      
      // FIX: Define totalExpectedSubmissions before using it
      const totalExpectedSubmissions = totalStaff * totalCards;
      const pendingSubmissions = Math.max(0, totalExpectedSubmissions - completedSubmissions);
      
      const performance = totalExpectedSubmissions > 0 
        ? Math.round((completedSubmissions / totalExpectedSubmissions) * 100)
        : 0;

      const overdueCount = cards.filter((card: Card) => 
        card.expiresAt && new Date(card.expiresAt) < now
      ).length;

      setDepartmentName(dept.name || "Department");
      setDepartmentStats({
        totalStaff,
        activeStaff: totalStaff,
        pendingSubmissions,
        completedSubmissions,
        totalCards,
        activeCards: totalCards,
        overdueCount,
        performance
      });

      // Transform submissions into recent activity
      const recentActivityData: Activity[] = allSubmissions
        .slice(0, 4)
        .map((sub: Submission) => ({
          id: sub.id,
          type: "submission",
          title: `Submission for ${sub.card?.title || 'Card'}`,
          user: `${sub.user?.first_name || ''} ${sub.user?.last_name || ''}`.trim() || 'Unknown User',
          time: getTimeAgo(new Date(sub.createdAt)),
          status: "completed"
        }));

      setRecentActivity(recentActivityData);

      // Transform cards into upcoming deadlines with proper staff count
      const upcomingDeadlinesData: Deadline[] = cards
        .filter((card: Card) => card.expiresAt && new Date(card.expiresAt) > now)
        .slice(0, 3)
        .map((card: Card) => {
          return {
            id: card.id,
            title: card.title,
            deadline: new Date(card.expiresAt!).toLocaleDateString(),
            assignedTo: `${totalStaff} staff members`, // Use the actual department staff count
            priority: getCardPriority(card.expiresAt!)
          };
        });

      setUpcomingDeadlines(upcomingDeadlinesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching department data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getCardPriority = (expiresAt: string): string => {
    const now = new Date();
    const dueDate = new Date(expiresAt);
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 1) return 'high';
    if (daysUntilDue <= 3) return 'medium';
    return 'low';
  };

  // Initial fetch
  useEffect(() => {
    fetchDepartmentData();
  }, [user?.departmentId]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user?.departmentId) return;

    const interval = setInterval(() => {
      // Refresh stats and activity - REMOVED /api/ prefix
      fetch(`${baseUrl}/head/stats?departmentId=${user.departmentId}`)
        .then(res => res.json())
        .then((data: DepartmentStats) => setDepartmentStats(data))
        .catch(console.error);

      fetch(`${baseUrl}/head/activity?departmentId=${user.departmentId}&limit=4`)
        .then(res => res.json())
        .then((data: Activity[]) => setRecentActivity(data))
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
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <div className="flex flex-1 overflow-hidden">
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

        {/* Main Content - Scrollable Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
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
                    <p className="text-xs text-gray-500 mt-1">{departmentName} Department</p>
                  </div>
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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

              {/* Additional Content to Make it Scrollable */}
              {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Department Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Active Projects</span>
                      <span className="text-lg font-bold text-blue-600">12</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Completed Tasks</span>
                      <span className="text-lg font-bold text-green-600">45</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Pending Reviews</span>
                      <span className="text-lg font-bold text-yellow-600">8</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Team Meetings</span>
                      <span className="text-lg font-bold text-purple-600">3</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Training Sessions</span>
                      <span className="text-lg font-bold text-indigo-600">2</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Team Events</span>
                      <span className="text-lg font-bold text-pink-600">1</span>
                    </div>
                  </div>
                </div>
              </div> */}

              {/* Even More Content */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Recent Announcements
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <h3 className="font-semibold text-gray-800">Quarterly Review Meeting</h3>
                    <p className="text-sm text-gray-600 mt-1">Scheduled for next Friday at 2:00 PM in Conference Room A</p>
                    <p className="text-xs text-gray-500 mt-2">Posted 2 days ago</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                    <h3 className="font-semibold text-gray-800">New Submission Guidelines</h3>
                    <p className="text-sm text-gray-600 mt-1">Updated submission guidelines have been published. Please review before your next submission.</p>
                    <p className="text-xs text-gray-500 mt-2">Posted 1 week ago</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500">
                    <h3 className="font-semibold text-gray-800">System Maintenance</h3>
                    <p className="text-sm text-gray-600 mt-1">Scheduled maintenance this Saturday from 10 PM to 2 AM. System may be unavailable.</p>
                    <p className="text-xs text-gray-500 mt-2">Posted 3 days ago</p>
                  </div>
                </div>
              </div>

              {/* White space at the bottom */}
              <div className="h-32 bg-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadWelcomePage;
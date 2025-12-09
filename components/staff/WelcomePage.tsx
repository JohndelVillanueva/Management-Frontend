import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DocumentTextIcon,
  FolderIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ArrowUpTrayIcon,
  PlusCircleIcon,
  BuildingLibraryIcon,
  PaperAirplaneIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

// Define the structure of submissions returned by the new API endpoint
interface Submission {
  id: number;
  title: string;
  description?: string;
  submission_date: string; // Updated from submitted_at
  status: "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW"; // Uppercase status from backend
  department: { id: number; name: string }; // New nested object
  cardType: { id: number; name: string }; // New nested object (replaces 'card')
  submitted_by: { id: number; first_name: string; last_name: string };
  files_count: number;
  last_updated: string;
}

interface Card {
  id: number;
  name: string;
  description?: string;
  deadline?: string;
  expiresAt?: string; // Changed from Date to string to match API response
  department_id: number;
  is_active: boolean;
  created_at: string;
  priority?: string;
  title?: string;
  status: string;
  department?: {
    id: number;
    name: string;
  };
}

interface DashboardStats {
  totalSubmissions: number;
  approvedSubmissions: number;
  pendingSubmissions: number;
  activeCards: number;
}

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSubmissions: 0,
    approvedSubmissions: 0,
    pendingSubmissions: 0,
    activeCards: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [pendingDeadlines, setPendingDeadlines] = useState<Card[]>([]);
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const submissionsRes = await fetch(
        `${baseUrl}/submissions/my-submissions?recent=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const cardsRes = await fetch(`${baseUrl}/cards/department`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        const submissions = submissionsData.data || [];

        setRecentSubmissions(submissions);
        calculateStats(submissions);
      } else {
        toast.error("Failed to load recent submissions.");
      }

      if (cardsRes.ok) {
        const cardsData: Card[] = await cardsRes.json();
        setAvailableCards(cardsData);

        const cardsWithDeadlines = cardsData.filter(
          (card: Card) => card.deadline || card.expiresAt
        );
        
        const upcomingDeadlines = cardsWithDeadlines
          .filter((card: Card) => {
            const deadlineStr = card.deadline || card.expiresAt;
            if (!deadlineStr) return false;
            
            const deadlineDate = new Date(deadlineStr);
            const today = new Date();
            const thirtyDaysFromNow = new Date(today);
            thirtyDaysFromNow.setDate(today.getDate() + 30);
            
            return deadlineDate >= today && deadlineDate <= thirtyDaysFromNow;
          })
          .sort((a: Card, b: Card) => {
            const deadlineA = a.deadline || a.expiresAt || '';
            const deadlineB = b.deadline || b.expiresAt || '';
            return new Date(deadlineA).getTime() - new Date(deadlineB).getTime();
          })
          .slice(0, 5);

        if (upcomingDeadlines.length === 0 && cardsData.length > 0) {
          const recentActiveCards = cardsData
            .filter((card: Card) => card.is_active)
            .sort((a: Card, b: Card) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            .slice(0, 5);
          
          setPendingDeadlines(recentActiveCards);
        } else {
          setPendingDeadlines(upcomingDeadlines);
        }

        setStats((prevStats) => ({
          ...prevStats,
          activeCards: cardsData.length,
        }));
      } else {
        toast.error("Failed to load available cards.");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (submissions: Submission[]) => {
    const totalSubmissions = submissions.length;
    const approvedSubmissions = submissions.filter(
      (s) => s.status === "APPROVED"
    ).length;
    const pendingSubmissions = submissions.filter(
      (s) => s.status === "PENDING" || s.status === "UNDER_REVIEW"
    ).length;

    setStats((prevStats) => ({
      ...prevStats,
      totalSubmissions,
      approvedSubmissions,
      pendingSubmissions,
    }));
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return "text-gray-600 bg-gray-100";

    switch (priority.toLowerCase()) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntilDeadline = (deadlineStr?: string) => {
    if (!deadlineStr) return null;
    const deadlineDate = new Date(deadlineStr);
    const today = new Date();
    // Set time of both dates to 00:00:00 for accurate day counting
    deadlineDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const timeDiff = deadlineDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    // FULL WIDTH CONTAINER
    <div className="p-6 bg-gray-50 min-h-screen"> 
      
      {/* Top Section - Header & Stats in one row */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-3">
            <BuildingLibraryIcon className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              Staff Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Welcome back,{" "}
            <span className="font-semibold text-orange-600">
              {user?.first_name || user?.username}
            </span>
            {user?.department && (
              <span className="ml-3 inline-flex items-center text-sm text-gray-500">
                <BriefcaseIcon className="h-4 w-4 mr-1" />
                {user.department.name}
              </span>
            )}
          </p>
        </div>

        {/* Stats Cards - Now full width, optimized grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Submissions"
            value={stats.totalSubmissions}
            icon={PaperAirplaneIcon}
            color="blue"
          />
          <StatCard
            title="Approved"
            value={stats.approvedSubmissions}
            icon={CheckCircleIcon}
            color="green"
          />
          <StatCard
            title="Pending Review"
            value={stats.pendingSubmissions}
            icon={ClockIcon}
            color="yellow"
          />
          <StatCard
            title="Active Cards"
            value={stats.activeCards}
            icon={FolderIcon}
            color="orange"
          />
           <StatCard 
            title="Drafts/New"
            value={availableCards.length - recentSubmissions.length} 
            icon={PlusCircleIcon}
            color="purple"
          />
           <StatCard 
            title="Quick Action"
            value="Submit Now"
            icon={ArrowUpTrayIcon}
            color="red"
            onClick={() => navigate("/cards")}
          />
        </div>
      </div>

      {/* Main Content - Full-Width Columns (Ratio 5:4:3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Available Cards - Left/Middle Section (5/12 width) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FolderIcon className="h-5 w-5 text-orange-600 mr-2" />
                Available Cards
              </h2>
              <button
                onClick={() => navigate("/cards")}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Browse All
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {availableCards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableCards.map((card) => (
                    <div
                      key={card.id}
                      className="border border-gray-100 bg-gray-50 rounded-lg p-3 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 cursor-pointer"
                      onClick={() => navigate(`/cardDetails/${card.id}`)} 
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 text-sm truncate pr-2">
                          {card.name}
                        </h3>
                        {card.priority && (
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${getPriorityColor(
                              card.priority
                            )}`}
                          >
                            {card.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {card.title || card.description || "No description available"}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        {(card.deadline || card.expiresAt) && (
                          <p className="text-xs text-gray-500">
                            Deadline: {formatDate(card.deadline || card.expiresAt!)}
                          </p>
                        )}
                        {/* <ArrowUpTrayIcon className="h-4 w-4 text-orange-400" /> */}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={FolderIcon} message="No Submission Cards available for your department." actionText="Create a new card" actionClick={() => navigate("/cards/new")} />
              )}
            </div>
          </div>
        </div>

        {/* Recent Submissions - Center Section (4/12 width) */}
        {/* Recent Submissions - Center Section (4/12 width) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <PaperAirplaneIcon className="h-5 w-5 text-blue-600 mr-2" />
                Your Recent Submissions
              </h2>
              <button
                onClick={() => navigate("/my-submissions")}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View Status
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {recentSubmissions.length > 0 ? (
                <div className="space-y-3">
                  {recentSubmissions.slice(0, 10).map((submission) => (
                    <div
                      key={submission.id}
                      // Removed: onClick={() => navigate(`/submissions/${submission.id}`)}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-default border border-gray-100" // Changed cursor-pointer to cursor-default
                    >
                      <div className="min-w-0 pr-3">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {submission.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {submission.cardType.name} • Submitted: {formatDate(submission.submission_date)}
                        </p>
                      </div>
                      <SubmissionStatusTag status={submission.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={DocumentTextIcon} message="You haven't made any recent submissions." actionText="Browse Cards" actionClick={() => navigate("/cards")} />
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Deadlines & Quick Actions (3/12 width) */}
        <div className="lg:col-span-3 h-full flex flex-col gap-6">
          
          {/* Card Deadlines */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex-1 flex flex-col min-h-64">
            <div className="p-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <ClockIcon className="h-5 w-5 text-yellow-600 mr-2" />
                Upcoming Deadlines
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {pendingDeadlines.length > 0 ? (
                <div className="space-y-3">
                  {pendingDeadlines.map((card) => {
                    const deadlineStr = card.deadline || card.expiresAt;
                    const daysUntil = getDaysUntilDeadline(deadlineStr);
                    
                    const isUrgent = daysUntil !== null && daysUntil <= 7 && daysUntil >= 0;
                    const isOverdue = daysUntil !== null && daysUntil < 0;

                    const deadlineClass = isOverdue 
                        ? "text-red-600 font-bold" 
                        : isUrgent 
                        ? "text-orange-600 font-bold" 
                        : "text-gray-700";

                    return (
                      <div
                        key={card.id}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-yellow-50 transition-colors cursor-pointer border border-gray-100"
                        onClick={() => navigate(`/cardDetails/${card.id}`)}

                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {card.name}
                          </p>
                           {card.priority && (
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${getPriorityColor(
                                card.priority
                              )}`}
                            >
                              {card.priority}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className={`text-xs ${deadlineClass}`}>
                            {isOverdue ? "OVERDUE" : "Due"}: {formatDate(deadlineStr!)}
                          </p>
                          {daysUntil !== null && daysUntil >= 0 && (
                            <span className={`text-xs font-semibold ${isUrgent ? 'text-red-500' : 'text-gray-500'}`}>
                              {daysUntil} Days Left
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState icon={ClockIcon} message="No urgent deadlines found." actionText="Review all active cards" actionClick={() => navigate("/cards")} />
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex-shrink-0">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">
                Quick Actions
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <ActionButton 
                  icon={FolderIcon} 
                  label="Browse All Cards" 
                  color="orange" 
                  onClick={() => navigate("/cards")}
                />
                <ActionButton 
                  icon={DocumentTextIcon} 
                  label="My Submissions" 
                  color="blue" 
                  onClick={() => navigate("/my-submissions")}
                />
                <ActionButton 
                  icon={PlusCircleIcon} 
                  label="New Submission" 
                  color="green" 
                  onClick={() => navigate("/submit/new")}
                />
                <ActionButton 
                  icon={UserGroupIcon} 
                  label="My Profile & Settings" 
                  color="purple" 
                  onClick={() => navigate("/profile")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;


// --- Helper Components for Cleanliness ---

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: "blue" | "green" | "yellow" | "orange" | "purple" | "red";
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, onClick }) => {
  const colorMap = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    yellow: "text-yellow-600 bg-yellow-100",
    orange: "text-orange-600 bg-orange-100",
    purple: "text-purple-600 bg-purple-100",
    red: "text-red-600 bg-red-100",
  };
  const hoverClass = onClick ? "hover:shadow-xl hover:scale-[1.02] cursor-pointer" : "";

  return (
    <div 
        className={`bg-white rounded-xl shadow p-4 border border-gray-200 transition-all duration-300 ${hoverClass}`}
        onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`p-2 rounded-xl ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-3 min-w-0">
          <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  color: "blue" | "green" | "yellow" | "orange" | "purple" | "red";
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, color, onClick }) => {
  const colorMap = {
    blue: "text-blue-600 border-blue-200 hover:bg-blue-50",
    green: "text-green-600 border-green-200 hover:bg-green-50",
    yellow: "text-yellow-600 border-yellow-200 hover:bg-yellow-50",
    orange: "text-orange-600 border-orange-200 hover:bg-orange-50",
    purple: "text-purple-600 border-purple-200 hover:bg-purple-50",
    red: "text-red-600 border-red-200 hover:bg-red-50",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center p-3 border rounded-xl transition-all duration-200 shadow-sm ${colorMap[color]}`}
    >
      <Icon className={`h-5 w-5 mr-3 flex-shrink-0`} />
      <span className="font-semibold text-gray-800 text-sm text-left flex-1">{label}</span>
      <span className="text-gray-400 text-lg">→</span>
    </button>
  );
};

interface EmptyStateProps {
  icon: React.ElementType;
  message: string;
  actionText: string;
  actionClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, message, actionText, actionClick }) => (
  <div className="text-center py-10 h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
    <Icon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
    <p className="text-gray-600 text-sm font-medium">{message}</p>
    <button
      onClick={actionClick}
      className="mt-3 text-sm font-medium text-orange-600 hover:text-orange-700"
    >
      {actionText}
    </button>
  </div>
);

interface SubmissionStatusTagProps {
  status: Submission['status'];
}

const SubmissionStatusTag: React.FC<SubmissionStatusTagProps> = ({ status }) => {
    const statusMap = {
        PENDING: { color: "yellow", icon: ClockIcon },
        UNDER_REVIEW: { color: "blue", icon: ExclamationTriangleIcon },
        APPROVED: { color: "green", icon: CheckCircleIcon },
        REJECTED: { color: "red", icon: ExclamationTriangleIcon },
    };

    const { color, icon: Icon } = statusMap[status] || statusMap.PENDING;
    const colorClass = `text-${color}-600 bg-${color}-100`;

    return (
        <span 
            className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 inline-flex items-center ${colorClass}`}
        >
            <Icon className="h-3 w-3 mr-1" />
            {status.replace('_', ' ')}
        </span>
    );
};
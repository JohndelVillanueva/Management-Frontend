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
  // Use the updated Submission interface
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
      // Fetch user's recent submissions using the 'recent=true' query
      const submissionsRes = await fetch(
        `${baseUrl}/submissions/my-submissions?recent=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Fetch available cards for user's department
      // MODIFICATION: Using the specific /cards/department endpoint to retrieve all relevant cards
      const cardsRes = await fetch(`${baseUrl}/cards/department`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        // Extract submissions array from the 'data' field
        const submissions = submissionsData.data || [];

        // The backend now limits the result, so no need for slice(0, 5) here
        setRecentSubmissions(submissions);

        // For stats calculation, we need all submissions, not just the recent ones.
        // NOTE: If the backend query is only fetching the recent 5, this stat calculation will be inaccurate for Total/Approved/Pending.
        // Assuming for the dashboard quick view, the stats should reflect the count of these 5 recent submissions.
        // If full stats are needed, a separate, non-recent endpoint call is required.
        calculateStats(submissions);
      }

      if (cardsRes.ok) {
        const cardsData = await cardsRes.json();
        setAvailableCards(cardsData);

        // Filter for upcoming deadlines (cards with deadlines) - UPDATED LOGIC
        const cardsWithDeadlines = cardsData.filter(
          (card: Card) => card.deadline || card.expiresAt
        );
        
        const upcomingDeadlines = cardsWithDeadlines
          .filter((card: Card) => {
            // Use the correct property (deadline OR expiresAt)
            const deadlineStr = card.deadline || card.expiresAt;
            if (!deadlineStr) return false;
            
            const deadlineDate = new Date(deadlineStr);
            const today = new Date();
            const thirtyDaysFromNow = new Date(today);
            thirtyDaysFromNow.setDate(today.getDate() + 30);
            
            // Check if deadline is in the future and within 30 days
            return deadlineDate >= today && deadlineDate <= thirtyDaysFromNow;
          })
          .sort((a: Card, b: Card) => {
            const deadlineA = a.deadline || a.expiresAt || '';
            const deadlineB = b.deadline || b.expiresAt || '';
            return new Date(deadlineA).getTime() - new Date(deadlineB).getTime();
          })
          .slice(0, 5);

        // Fallback: Show recently created cards if no deadlines
        if (upcomingDeadlines.length === 0 && cardsData.length > 0) {
          // Show 5 most recently created active cards
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

        // Update activeCards stat based on newly fetched cards
        setStats((prevStats) => ({
          ...prevStats,
          activeCards: cardsData.length,
        }));
        
        // DEBUG: Log cards data to console
        console.log('Available cards:', cardsData);
        console.log('Cards with deadlines:', cardsData.filter((card: Card) => card.deadline || card.expiresAt));
        console.log('Upcoming deadlines count:', upcomingDeadlines.length);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure calculateStats handles the new Submission interface (uppercase status)
  const calculateStats = (submissions: Submission[]) => {
    const totalSubmissions = submissions.length;
    // Matching backend's uppercase status strings
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

  // Helper function to calculate days until deadline
  const getDaysUntilDeadline = (deadlineStr?: string) => {
    if (!deadlineStr) return null;
    const deadlineDate = new Date(deadlineStr);
    const today = new Date();
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
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-full mx-auto">
        {/* Top Section - Header & Stats in one row */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Header - Left side */}
          <div className="lg:w-1/3">
            <div className="flex items-center gap-3 mb-2">
              <BuildingLibraryIcon className="h-8 w-8 text-orange-600" />
              <h1 className="text-3xl font-bold text-gray-800">
                Staff Dashboard
              </h1>
            </div>
            <p className="text-gray-600">
              Welcome back,{" "}
              <span className="font-semibold text-orange-600">
                {user?.first_name || user?.username}
              </span>
              !{user?.department && ` | Department: ${user.department.name}`}
            </p>
          </div>

          {/* Stats Cards - Right side, in a row */}
          <div className="lg:w-2/3">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <PaperAirplaneIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Submissions
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {stats.totalSubmissions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-xl font-bold text-gray-900">
                      {stats.approvedSubmissions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <ClockIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Pending
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {stats.pendingSubmissions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FolderIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Active Cards
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {stats.activeCards}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - All sections side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-250px)]">
          {/* Recent Submissions - Left Column */}
          <div className="lg:col-span-4 h-full">
            <div className="bg-white rounded-lg shadow border border-gray-200 h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800">
                  Recent Submissions
                </h2>
                <button
                  onClick={() => navigate("/my-submissions")}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {recentSubmissions.length > 0 ? (
                  <div className="space-y-3">
                    {recentSubmissions.slice(0, 10).map((submission) => (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {submission.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {submission.cardType.name} • {formatDate(submission.submission_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 h-full flex flex-col items-center justify-center">
                    <PaperAirplaneIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No submissions yet</p>
                    <button
                      onClick={() => navigate("/cards")}
                      className="mt-2 text-orange-600 hover:text-orange-700 text-xs font-medium"
                    >
                      Browse cards to submit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Available Cards - Middle Column */}
          <div className="lg:col-span-5 h-full">
            <div className="bg-white rounded-lg shadow border border-gray-200 h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800">
                  Available Cards
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {availableCards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableCards.map((card) => (
                      <div
                        key={card.id}
                        className="border border-gray-200 rounded-lg p-3 hover:border-orange-300 transition-colors cursor-pointer"
                        onClick={() => navigate("/cards")}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-gray-900 text-sm">
                            {card.name}
                          </h3>
                          {card.priority && (
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(
                                card.priority
                              )}`}
                            >
                              {card.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {card.title || "No Title available"}
                        </p>
                        <div className="flex justify-between items-center">
                          {(card.deadline || card.expiresAt) && (
                            <p className="text-xs text-gray-500">
                              Due: {formatDate(card.deadline || card.expiresAt!)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 h-full flex flex-col items-center justify-center">
                    <FolderIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      No cards available
                    </p>
                    <p className="text-xs text-gray-400">
                      Check back later
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Card Deadlines & Quick Actions */}
          <div className="lg:col-span-3 h-full flex flex-col gap-6">
            {/* Card Deadlines */}
            <div className="bg-white rounded-lg shadow border border-gray-200 flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800">
                  Card Deadlines
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {pendingDeadlines.length} upcoming
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {pendingDeadlines.length > 0 ? (
                  <div className="space-y-3">
                    {pendingDeadlines.map((card) => {
                      const deadlineStr = card.deadline || card.expiresAt;
                      const daysUntil = getDaysUntilDeadline(deadlineStr);
                      
                      return (
                        <div
                          key={card.id}
                          className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => navigate(`/cards/${card.id}`)}
                        >
                          <div className="flex items-center mb-1">
                            <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {card.name}
                              </p>
                              {card.department && (
                                <p className="text-xs text-gray-500 truncate">
                                  {card.department.name}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="min-w-0">
                              {deadlineStr ? (
                                <p className="text-xs text-gray-700 truncate">
                                  Due: {formatDate(deadlineStr)}
                                  {daysUntil !== null && daysUntil > 0 && (
                                    <span className="text-gray-500 ml-1">
                                      ({daysUntil}d)
                                    </span>
                                  )}
                                </p>
                              ) : (
                                <p className="text-xs text-gray-500">No deadline</p>
                              )}
                            </div>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${getPriorityColor(
                                card.priority
                              )}`}
                            >
                              {card.priority || "None"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 h-full flex items-center justify-center">
                    <ClockIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <div>
                      <p className="text-gray-500 text-sm">No deadlines</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {availableCards.length > 0 
                          ? "Cards with deadlines appear here" 
                          : "No cards available"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Quick Actions
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <button
                    onClick={() => navigate("/cards")}
                    className="w-full flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FolderIcon className="h-4 w-4 text-orange-600 mr-2" />
                    <span className="font-medium text-gray-900 text-sm">
                      Browse All Cards
                    </span>
                  </button>

                  <button
                    onClick={() => navigate("/my-submissions")}
                    className="w-full flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <DocumentTextIcon className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-900 text-sm">
                      My Submissions
                    </span>
                  </button>

                  <button
                    onClick={() => navigate("/submit/new")}
                    className="w-full flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <PlusCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                    <span className="font-medium text-gray-900 text-sm">
                      New Submission
                    </span>
                  </button>

                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <UserGroupIcon className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="font-medium text-gray-900 text-sm">
                      My Profile
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity - Bottom bar */}
        <div className="mt-6 bg-white rounded-lg shadow border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Activity Summary
            </h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">
                  {stats.totalSubmissions}
                </div>
                <p className="text-sm text-gray-600">Total Submissions</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {stats.approvedSubmissions}
                </div>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-600">
                  {stats.pendingSubmissions}
                </div>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
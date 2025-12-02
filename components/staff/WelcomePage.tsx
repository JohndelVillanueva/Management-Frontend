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
  department_id: number;
  is_active: boolean;
  created_at: string;
  priority?: string;
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

        // Filter for upcoming deadlines (cards with deadlines)
        const cardsWithDeadlines = cardsData.filter(
          (card: Card) => card.deadline
        );
        const upcomingDeadlines = cardsWithDeadlines
          .filter((card: Card) => {
            if (!card.deadline) return false;
            const deadlineDate = new Date(card.deadline);
            const today = new Date();
            const thirtyDaysFromNow = new Date(today);
            thirtyDaysFromNow.setDate(today.getDate() + 30);
            return deadlineDate >= today && deadlineDate <= thirtyDaysFromNow;
          })
          .sort(
            (a: Card, b: Card) =>
              new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
          )
          .slice(0, 5);

        setPendingDeadlines(upcomingDeadlines);

        // Update activeCards stat based on newly fetched cards
        setStats((prevStats) => ({
          ...prevStats,
          activeCards: cardsData.length,
        }));
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

  const handleViewSubmission = (submissionId: number) => {
    navigate(`/submissions/${submissionId}`);
  };

  const handleSubmitToCard = (cardId: number) => {
    navigate(`/cards/${cardId}/submit`);
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <PaperAirplaneIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Submissions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSubmissions}
                </p>
              </div>
            </div>
          </div>

{/*           <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cards</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCards}
                </p>
              </div>
            </div>
          </div> */}

{/*           <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Pending/Review
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingSubmissions}
                </p>
              </div>
              </div>
          </div> */}

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FolderIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Cards
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeCards}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Submissions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
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
              <div className="p-6">
                {recentSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    {recentSubmissions.slice(0, 3).map((submission) => (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        // onClick={() => handleViewSubmission(submission.id)}
                      >
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {submission.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {/* Use cardType.name and submission_date */}
                              Card: {submission.cardType.name} • Submitted:{" "}
                              {formatDate(submission.submission_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <PaperAirplaneIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No submissions yet</p>
                    <button
                      onClick={() => navigate("/cards")}
                      className="mt-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
                    >
                      Browse available cards to submit
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Available Cards */}
<div className="bg-white rounded-lg shadow border border-gray-200 mt-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Available Cards
                </h2>
              </div>
              <div className="p-6">
                {availableCards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableCards.map((card) => (
                      <div
                        key={card.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors cursor-pointer"
                        onClick={() => navigate("/cards")}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">
                            {card.name}
                          </h3>
                          {card.priority && (
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                                card.priority
                              )}`}
                            >
                              {card.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {card.description || "No description available"}
                        </p>
                        <div className="flex justify-between items-center">
                          {card.deadline && (
                            <p className="text-xs text-gray-500">
                              Due: {formatDate(card.deadline)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FolderIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No cards available at the moment
                    </p>
                    <p className="text-sm text-gray-400">
                      Check back later for new cards
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Card Deadlines
                </h2>
              </div>
              <div className="p-6">
                {pendingDeadlines.length > 0 ? (
                  <div className="space-y-4">
                    {pendingDeadlines.map((card) => (
                      <div
                        key={card.id}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => navigate(`/cards/${card.id}`)}
                      >
                        <div className="flex items-center mb-2">
                          <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {card.name}
                            </p>
                            {card.priority && (
                              <p className="text-xs text-gray-500">
                                Priority: {card.priority}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-700">
                            Due: {formatDate(card.deadline || "")}
                          </p>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                              card.priority
                            )}`}
                          >
                            {card.priority || "No priority"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming deadlines</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Quick Actions
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/cards")}
                    className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FolderIcon className="h-5 w-5 text-orange-600 mr-3" />
                    <span className="font-medium text-gray-900">
                      Browse All Cards
                    </span>
                  </button>

                  <button
                    onClick={() => navigate("/my-submissions")}
                    className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="font-medium text-gray-900">
                      My Submissions
                    </span>
                  </button>

                  <button
                    onClick={() => navigate("/submit/new")}
                    className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <PlusCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="font-medium text-gray-900">
                      New Submission
                    </span>
                  </button>

                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <UserGroupIcon className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="font-medium text-gray-900">
                      My Profile
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Recent Activity */}
        <div className="mt-6 bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Activity
            </h2>
            </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.totalSubmissions}
                </div>
                <p className="text-sm text-gray-600">Total Submissions</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stats.approvedSubmissions}
                </div>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
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
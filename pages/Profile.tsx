import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaCalendar,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaClock,
  FaIdBadge,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

type UserProfile = {
  id: number;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  user_type: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login: string | null;
  avatar: string | null;
  bio: string | null;
  department: {
    id: number;
    name: string;
    code: string;
  } | null;
};

const DEFAULT_PROFILE_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJzNC40NzcgMTAgMTAgMTAgMTAtNC40NzcgMTAtMTBTMTcuNTIzIDIgMTIgMnptMCAyYzQuNDE4IDAgOCAzLjU4MiA4IDhzLTMuNTgyIDgtOCA4LTgtMy41ODItOC04IDMuNTgyLTggOC04eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const baseUrl: string = (import.meta as any).env?.VITE_API_URL ?? "";

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    if (!user?.id) {
      setError("User not authenticated");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/users/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      setUserProfile(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = DEFAULT_PROFILE_IMAGE;
    target.onerror = null;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "ADMIN":
        return "bg-red-100 text-red-800 border-red-200";
      case "HEAD":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "STAFF":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-4xl px-6">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center space-x-6">
                <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-4xl px-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <FaTimesCircle className="text-red-500 text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Failed to Load Profile
            </h2>
            <p className="text-red-600 mb-4">{error || "Unknown error occurred"}</p>
            <button
              onClick={fetchUserProfile}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = userProfile.first_name && userProfile.last_name
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : userProfile.username;

  return (
    <div className="h-screen overflow-y-auto bg-gray-50">
      <div className="w-full h-full p-6">
        {/* Header with Edit Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <button
            onClick={() => navigate("/profile/edit")}
            className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
          >
            <FaEdit />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <img
                src={userProfile.avatar || DEFAULT_PROFILE_IMAGE}
                alt={displayName}
                className="w-32 h-32 rounded-full border-4 border-orange-500 object-cover shadow-lg"
                onError={handleImageError}
              />
              <div className="absolute bottom-0 right-0 flex space-x-1">
                {userProfile.is_verified && (
                  <FaCheckCircle className="text-green-500 text-2xl bg-white rounded-full" title="Verified" />
                )}
                {userProfile.is_active && (
                  <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white" title="Active"></div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {displayName}
              </h2>
              <p className="text-gray-600 mb-2">@{userProfile.username}</p>
              
              {/* User Type Badge */}
              <div className="inline-flex items-center space-x-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getUserTypeColor(userProfile.user_type)}`}>
                  {userProfile.user_type}
                </span>
                {!userProfile.is_active && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-200 text-gray-700 border border-gray-300">
                    Inactive
                  </span>
                )}
              </div>

              {/* Bio */}
              {userProfile.bio && (
                <p className="text-gray-700 mt-3 max-w-2xl">
                  {userProfile.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <FaEnvelope className="text-orange-600 text-xl mt-1" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Email</p>
                <p className="text-gray-800">{userProfile.email}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaPhone className="text-orange-600 text-xl mt-1" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Phone</p>
                <p className="text-gray-800">
                  {userProfile.phone_number || "Not provided"}
                </p>
              </div>
            </div>

            {userProfile.department && (
              <>
                <div className="flex items-start space-x-3">
                  <FaBuilding className="text-orange-600 text-xl mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Department</p>
                    <p className="text-gray-800">{userProfile.department.name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FaIdBadge className="text-orange-600 text-xl mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Department Code</p>
                    <p className="text-gray-800">{userProfile.department.code}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <FaCalendar className="text-orange-600 text-xl mt-1" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Member Since</p>
                <p className="text-gray-800">{formatDate(userProfile.created_at)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaClock className="text-orange-600 text-xl mt-1" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Last Login</p>
                <p className="text-gray-800">{formatDateTime(userProfile.last_login)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaCheckCircle className={`text-xl mt-1 ${userProfile.is_verified ? "text-green-600" : "text-gray-400"}`} />
              <div>
                <p className="text-sm text-gray-500 font-medium">Verification Status</p>
                <p className={`${userProfile.is_verified ? "text-green-600" : "text-gray-600"}`}>
                  {userProfile.is_verified ? "Verified" : "Not Verified"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaUserCircle className={`text-xl mt-1 ${userProfile.is_active ? "text-green-600" : "text-red-600"}`} />
              <div>
                <p className="text-sm text-gray-500 font-medium">Account Status</p>
                <p className={`${userProfile.is_active ? "text-green-600" : "text-red-600"}`}>
                  {userProfile.is_active ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaSave,
  FaTimes,
  FaCamera,
  FaSpinner,
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
  avatar: string | null;
  bio: string | null;
  department: {
    id: number;
    name: string;
    code: string;
  } | null;
};

type Department = {
  id: number;
  name: string;
  code: string;
};

const DEFAULT_PROFILE_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJzNC40NzcgMTAgMTAgMTAgMTAtNC40NzcgMTAtMTBTMTcuNTIzIDIgMTIgMnptMCAyYzQuNDE4IDAgOCAzLjU4MiA4IDhzLTMuNTgyIDgtOCA4LTgtMy41ODItOC04IDMuNTgyLTggOC04eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

const EditProfile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const baseUrl: string = (import.meta as any).env?.VITE_API_URL ?? "";

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    bio: "",
    user_type: "",
    departmentId: "",
  });

  useEffect(() => {
    fetchUserProfile();
    fetchDepartments();
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
      setAvatarPreview(data.avatar);
      
      // Populate form data
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone_number: data.phone_number || "",
        bio: data.bio || "",
        user_type: data.user_type || "",
        departmentId: data.department?.id?.toString() || "",
      });
      
      setError(null);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/departments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");

      // Upload avatar if changed
      let avatarUrl = userProfile?.avatar;
      if (avatarFile) {
        const formDataAvatar = new FormData();
        formDataAvatar.append("avatar", avatarFile);

        const avatarResponse = await fetch(`${baseUrl}/users/${user?.id}/avatar`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataAvatar,
        });

        if (avatarResponse.ok) {
          const avatarData = await avatarResponse.json();
          avatarUrl = avatarData.avatar;
        }
      }

      // Update user profile
      const updateData = {
        ...formData,
        departmentId: formData.departmentId || null,
      };

      const response = await fetch(`${baseUrl}/users/${user?.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

    //   const updatedUser = await response.json();
      setSuccess("Profile updated successfully!");
      
      // Redirect to profile page after 1.5 seconds
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = DEFAULT_PROFILE_IMAGE;
    target.onerror = null;
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-orange-600 text-5xl mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error || "Failed to load profile"}</p>
            <button
              onClick={() => navigate("/profile")}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto bg-gray-50">
      <div className="w-full h-full p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
          <p className="text-gray-600 mt-1">Update your personal information</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 flex items-center">
              <FaSave className="mr-2" />
              {success}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Profile Picture Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Profile Picture</h3>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={avatarPreview || DEFAULT_PROFILE_IMAGE}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-orange-500 object-cover"
                  onError={handleImageError}
                />
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700 transition-colors shadow-lg"
                >
                  <FaCamera />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Click the camera icon to upload a new profile picture
                </p>
                <p className="text-xs text-gray-500">
                  Accepted formats: JPG, PNG, GIF (Max size: 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <FaUserCircle className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter first name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <div className="relative">
                  <FaUserCircle className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {user?.user_type === "ADMIN" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Type *
                    </label>
                    <select
                      name="user_type"
                      value={formData.user_type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="HEAD">Head</option>
                      <option value="STAFF">Staff</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <div className="relative">
                      <FaBuilding className="absolute left-3 top-3 text-gray-400" />
                      <select
                        name="departmentId"
                        value={formData.departmentId}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">No Department</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <FaTimes />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
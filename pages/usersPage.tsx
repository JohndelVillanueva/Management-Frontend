import React, { useState, useEffect } from "react";
import { FaUsers } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import EditUserModal from "../modals/EditUserModal";
import { 
  PencilIcon, 
  TrashIcon,
  ComputerDesktopIcon,
  CalculatorIcon,
  BeakerIcon,
  PaintBrushIcon,
  BuildingOfficeIcon,
  HeartIcon,
  WrenchScrewdriverIcon,
  ScaleIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  BuildingLibraryIcon,
  XMarkIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_type: string;
  department?: { name: string; id?: number };
  departmentId?: number | null;
  avatar?: string | null;
}

// Toast notification component
const Toast: React.FC<{ 
  message: string; 
  type: 'error' | 'success'; 
  onClose: () => void 
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
      type === 'error' 
        ? 'bg-red-50 border border-red-200 text-red-800' 
        : 'bg-green-50 border border-green-200 text-green-800'
    } rounded-lg shadow-lg p-4 animate-in slide-in-from-right-full duration-300`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${
          type === 'error' ? 'text-red-400' : 'text-green-400'
        }`}>
          {type === 'error' ? (
            <ExclamationTriangleIcon className="h-5 w-5" />
          ) : (
            <CheckCircleIcon className="h-5 w-5" />
          )}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${
            type === 'error' ? 'text-red-800' : 'text-green-800'
          }`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`ml-4 flex-shrink-0 rounded-md inline-flex ${
            type === 'error' 
              ? 'text-red-400 hover:text-red-500 hover:bg-red-100' 
              : 'text-green-400 hover:text-green-500 hover:bg-green-100'
          } transition-colors p-1`}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const UserAvatar: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
        <FaUsers className="h-5 w-5" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-10 w-10 rounded-full object-cover border"
      onError={() => setHasError(true)}
    />
  );
};

// Department icon component
const DepartmentIcon: React.FC<{ departmentName?: string }> = ({ departmentName }) => {
  const getDepartmentIcon = (deptName?: string) => {
    if (!deptName) return BuildingLibraryIcon;
    const name = deptName.toLowerCase();
    if (name.includes('computer') || name.includes('cs') || name.includes('tech')) return ComputerDesktopIcon;
    if (name.includes('math')) return CalculatorIcon;
    if (name.includes('science')) return BeakerIcon;
    if (name.includes('art') || name.includes('design')) return PaintBrushIcon;
    if (name.includes('business')) return BuildingOfficeIcon;
    if (name.includes('medical') || name.includes('health')) return HeartIcon;
    if (name.includes('engineering')) return WrenchScrewdriverIcon;
    if (name.includes('law')) return ScaleIcon;
    if (name.includes('education')) return AcademicCapIcon;
    return BuildingLibraryIcon;
  };

  const IconComponent = getDepartmentIcon(departmentName);

  return (
    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
      <IconComponent className="h-4 w-4" />
    </div>
  );
};

// Loading shimmer component for user cards
const UserCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-pulse">
      <div className="flex items-center mb-3">
        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
        <div className="ml-3 flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
      <div className="flex items-center p-2 bg-gray-50 rounded-md">
        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
        <div className="ml-2 flex-1">
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
          <div className="h-2 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success';
  } | null>(null);

  // Animation states
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [updatedUsers, setUpdatedUsers] = useState<Set<number>>(new Set());

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const res = await fetch("http://localhost:3000/users", {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        const userData = await res.json();
        console.log("Fetched users:", userData);
        setUsers(userData);
      } catch (err) {
        const errorMessage = "Error loading users. Please try again.";
        setError(errorMessage);
        showToast(errorMessage, 'error');
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const baseUrl: string = (import.meta as any).env?.VITE_API_URL ?? "";
  const getAvatarSrc = (avatar?: string | null) => {
    const DEFAULT = "data:image/svg+xml;base64,PHN2Zy...";
    if (!avatar) return DEFAULT;
    if (avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("data:")) return avatar;
    const trimmedBase = (baseUrl || "").replace(/\/$/, "");
    return `${trimmedBase}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
  };

  // Open modal
  const handleEditUser = (userData: User) => {
    setSelectedUser(userData);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId: number, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      console.log("Delete user:", userId);
    }
  };

  // ✅ FIXED: Save updates from modal with API call
  const handleSaveUser = async (updatedUser: any) => {
    setIsSaving(true);
    setUpdatingUserId(updatedUser.id);
    
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      console.log("🟡 Updating user:", updatedUser);

      const response = await fetch(`http://localhost:3000/users/${updatedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          email: updatedUser.email,
          user_type: updatedUser.user_type,
          departmentId: updatedUser.departmentId
        }),
      });

      const result = await response.json();
      console.log("🟡 Update response:", result);

      if (!response.ok) {
        throw new Error(result.error || `Failed to update user: ${response.status}`);
      }

      // Add to updated users set for animation
      setUpdatedUsers(prev => new Set(prev.add(updatedUser.id)));

      // Update local state with the updated user after a brief delay for animation
      setTimeout(() => {
        setUsers(prev => prev.map(u => 
          u.id === updatedUser.id 
            ? { ...u, ...result.user } // Use the returned user data from API
            : u
        ));
        
        // Remove from updating state
        setUpdatingUserId(null);
        
        setIsModalOpen(false);
        showToast('User updated successfully!', 'success');

        // Remove highlight after 2 seconds
        setTimeout(() => {
          setUpdatedUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(updatedUser.id);
            return newSet;
          });
        }, 2000);
      }, 500);
      
    } catch (error) {
      console.error("🔴 Error updating user:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update user";
      showToast(errorMessage, 'error');
      setUpdatingUserId(null);
    } finally {
      setIsSaving(false);
    }
  };

  const renderSection = (title: string, type: string) => {
    const filtered = users.filter((user) => user.user_type.toLowerCase() === type.toLowerCase());
    if (filtered.length === 0) return null;
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {filtered.length} {filtered.length === 1 ? "user" : "users"}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
          {filtered.map((user) => (
            <div 
              key={user.id} 
              className={`
                bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 relative
                ${updatingUserId === user.id ? 'scale-95 opacity-60' : 'scale-100 opacity-100'}
                ${updatedUsers.has(user.id) ? 'ring-2 ring-green-500 ring-opacity-50 bg-green-50' : ''}
                transform transition-all duration-300 ease-in-out
              `}
            >
              {/* Loading overlay for updating user */}
              {updatingUserId === user.id && (
                <div className="absolute inset-0 bg-white bg-opacity-80 rounded-lg flex items-center justify-center z-10">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-xs text-gray-600">Updating...</p>
                  </div>
                </div>
              )}

              {/* Success checkmark for updated user */}
              {updatedUsers.has(user.id) && (
                <div className="absolute top-2 right-2 z-20">
                  <div className="bg-green-500 text-white rounded-full p-1 animate-bounce">
                    <CheckCircleIcon className="h-4 w-4" />
                  </div>
                </div>
              )}

              <div className="absolute top-3 right-3 flex space-x-1 z-20">
                <button
                  onClick={() => handleEditUser(user)}
                  disabled={updatingUserId === user.id}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Edit user"
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                  disabled={updatingUserId === user.id}
                  className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete user"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center mb-3">
                <UserAvatar src={getAvatarSrc(user.avatar)} alt={`${user.first_name} ${user.last_name}`} />
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-gray-800">{user.first_name} {user.last_name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{user.user_type.toLowerCase()}</p>
                  <p className="text-xs text-gray-700 mt-1"><span className="font-medium">Email:</span> {user.email}</p>
                </div>
              </div>

              <div className="flex items-center p-2 bg-gray-50 rounded-md">
                <DepartmentIcon departmentName={user.department?.name} />
                <div className="ml-2">
                  <p className="text-xs font-medium text-gray-700">{user.department?.name || "No Department"}</p>
                  <p className="text-xs text-gray-500">{user.department?.name ? "Department" : "Unassigned"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderNoDepartmentSection = () => {
    const noDeptStaffUsers = users.filter(
      (user) => user.user_type.toLowerCase() === "staff" && !user.department && !user.departmentId
    );
    
    if (noDeptStaffUsers.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-700">Staff Without Department</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {noDeptStaffUsers.length} staff
          </span>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 mt-0.5 mr-2" />
            <div>
              <h3 className="text-xs font-medium text-yellow-800">Unassigned Staff Members</h3>
              <p className="text-xs text-yellow-700 mt-0.5">
                These staff members are not assigned to any department.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-3 border border-yellow-200 rounded-lg bg-yellow-50/30">
          {noDeptStaffUsers.map((user) => (
            <div 
              key={user.id} 
              className={`
                bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 relative border-l-2 border-yellow-400
                ${updatingUserId === user.id ? 'scale-95 opacity-60' : 'scale-100 opacity-100'}
                ${updatedUsers.has(user.id) ? 'ring-2 ring-green-500 ring-opacity-50 bg-green-50' : ''}
                transform transition-all duration-300 ease-in-out
              `}
            >
              {/* Loading overlay for updating user */}
              {updatingUserId === user.id && (
                <div className="absolute inset-0 bg-white bg-opacity-80 rounded-lg flex items-center justify-center z-10">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-xs text-gray-600">Updating...</p>
                  </div>
                </div>
              )}

              {/* Success checkmark for updated user */}
              {updatedUsers.has(user.id) && (
                <div className="absolute top-2 right-2 z-20">
                  <div className="bg-green-500 text-white rounded-full p-1 animate-bounce">
                    <CheckCircleIcon className="h-4 w-4" />
                  </div>
                </div>
              )}

              <div className="absolute top-3 right-3 flex space-x-1 z-20">
                <button
                  onClick={() => handleEditUser(user)}
                  disabled={updatingUserId === user.id}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Edit user"
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                  disabled={updatingUserId === user.id}
                  className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete user"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center mb-3">
                <UserAvatar src={getAvatarSrc(user.avatar)} alt={`${user.first_name} ${user.last_name}`} />
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-gray-800">{user.first_name} {user.last_name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{user.user_type.toLowerCase()}</p>
                  <p className="text-xs text-gray-700 mt-1"><span className="font-medium">Email:</span> {user.email}</p>
                </div>
              </div>
              <div className="flex items-center p-2 bg-yellow-50 rounded-md border border-yellow-200">
                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                </div>
                <div className="ml-2">
                  <p className="text-xs font-medium text-yellow-700">No Department</p>
                  <p className="text-xs text-yellow-600">Unassigned</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <UserCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      <div className="flex-1 overflow-y-auto p-6 chat-scrollbar scroll-smooth">
        {user?.user_type === "HEAD" || user?.user_type === "DepartmentHead" ? (
          <>
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
              <h3 className="font-medium">Staff Management</h3>
              <p className="text-sm mt-1">
                As a department head, you can manage your staff members through the Staff Management page.
              </p>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Your Department Staff</h1>
            {renderSection("Staff", "STAFF")}
          </>
        ) : (
          <>
            {renderSection("Admins", "ADMIN")}
            {renderSection("Heads", "HEAD")}
            {renderSection("Staff", "STAFF")}
            {renderNoDepartmentSection()}
          </>
        )}
        {/* ✅ Spacer added to the main container - always visible */}
        <div className="h-24"></div>
      </div>

      {/* Modal */}
      <EditUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userData={selectedUser}
        onSave={handleSaveUser}
        isLoading={isSaving}
      />
    </div>
  );
};

export default UsersPage;
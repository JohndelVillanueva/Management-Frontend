import React, { useState, useEffect } from "react";
import { FaUsers } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import EditUserModal from "../modals/EditUserModal"; // ✅ Added modal import
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
  BuildingLibraryIcon
} from "@heroicons/react/24/outline";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_type: string;
  department?: { name: string };
  departmentId?: number | null;
  avatar?: string | null;
}

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

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  // ✅ Added modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
      } catch {
        setError("Error loading users.");
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

  // ✅ Open modal instead of console.log
  const handleEditUser = (userData: User) => {
    setSelectedUser(userData);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId: number, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      console.log("Delete user:", userId);
    }
  };

  // ✅ Save updates from modal
  const handleSaveUser = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setIsModalOpen(false);
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
            <div key={user.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition relative">
              <div className="absolute top-3 right-3 flex space-x-1">
                <button
                  onClick={() => handleEditUser(user)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center mb-3">
                <UserAvatar src={getAvatarSrc(user.avatar)} alt={`${user.first_name} ${user.last_name}`} />
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-gray-800">{user.first_name} {user.last_name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{user.user_type.toLowerCase()}</p>
                  {/* ✅ Added Email display */}
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
            <div key={user.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition border-l-2 border-yellow-400">
              <div className="flex items-center mb-3">
                <UserAvatar src={getAvatarSrc(user.avatar)} alt={`${user.first_name} ${user.last_name}`} />
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-gray-800">{user.first_name} {user.last_name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{user.user_type.toLowerCase()}</p>
                  {/* ✅ Added Email display */}
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

        {/* ✅ Spacer added to ensure visible bottom scroll space */}
        <div className="h-24"></div>
      </div>
    );
  };

  if (loading) return <p className="p-4 text-gray-600">Loading users...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  // ✅ Scroll container
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
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
      </div>

      {/* ✅ Modal at bottom */}
      <EditUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userData={selectedUser}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UsersPage;

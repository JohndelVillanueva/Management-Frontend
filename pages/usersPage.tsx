import React, { useState, useEffect } from "react";
import { FaUsers } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_type: string;
  department?: { name: string };
  avatar?: string | null;
}

const UserAvatar: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
        <FaUsers className="h-6 w-6" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-12 w-12 rounded-full object-cover border"
      onError={() => setHasError(true)}
    />
  );
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const res = await fetch("http://localhost:3000/users", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        const userData = await res.json();
        console.log("UsersPage - Fetched users:", {
          totalUsers: userData.length,
          userTypes: userData.map((u: any) => ({ id: u.id, user_type: u.user_type, department: u.department?.name })),
          currentUser: user
        });
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
    const DEFAULT = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJzNC40NzcgMTAgMTAgMTAgMTAtNC40NzcgMTAtMTBTMTcuNTIzIDIgMTIgMnptMCAyYzQuNDE4IDAgOCAzLjU4MiA4IDhzLTMuNTgyIDgtOCA4LTgtMy41ODItOC04IDMuNTgyLTggOC04eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";
    if (!avatar) return DEFAULT;
    if (avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("data:")) return avatar;
    const trimmedBase = (baseUrl || "").replace(/\/$/, "");
    return `${trimmedBase}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
  };

  const renderSection = (title: string, type: string, largerHeight: boolean = false) => {
    const filtered = users.filter((user) => {
      const userType = user.user_type.toLowerCase();
      const targetType = type.toLowerCase();
      
      // Handle both old and new enum values
      if (targetType === 'admin') {
        return userType === 'admin';
      } else if (targetType === 'head') {
        return userType === 'head' || userType === 'departmenthead';
      } else if (targetType === 'staff') {
        return userType === 'staff';
      }
      return userType === targetType;
    });

    if (filtered.length === 0) return null;

    return (
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">{title}</h2>
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${largerHeight ? 'max-h-[600px]' : 'max-h-96'} overflow-y-auto p-4 border border-gray-200 rounded-lg`}>
          {filtered.map((user) => (
            <div
              key={user.id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-md transition"
            >
              <div className="flex items-center mb-4">
                <UserAvatar
                  src={getAvatarSrc(user.avatar)}
                  alt={`${user.first_name} ${user.last_name}`}
                />
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {user.user_type.toLowerCase()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Department:</span>{" "}
                {user.department?.name || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <p className="p-4 text-gray-600">Loading users...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  // Show different content for HEAD users
  if (user?.user_type === 'HEAD' || user?.user_type === 'DepartmentHead') {
    return (
      <div className="p-6 h-screen overflow-y-auto">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
          <h3 className="font-medium">Staff Management</h3>
          <p className="text-sm mt-1">
            As a department head, you can manage your staff members through the dedicated Staff Management page.
            The users shown here are filtered to show only staff from your department.
          </p>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Your Department Staff</h1>
        {renderSection("Staff", "STAFF", true)}
      </div>
    );
  }

  return (
    <div className="p-6 h-screen overflow-y-auto">
      {/* <h1 className="text-2xl font-semibold text-gray-800 mb-6">Users</h1> */}

      {renderSection("Admins", "ADMIN")}
      {renderSection("Heads", "HEAD")}
      {renderSection("Staff", "STAFF")}
    </div>
  );
};

export default UsersPage;
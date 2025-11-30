import React, { useState, useEffect } from "react";
import { FaUsers, FaUserCheck, FaUserTimes, FaEnvelope, FaPhone, FaBuilding } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

interface StaffMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_type: string;
  department?: { name: string };
  avatar?: string | null;
  phone_number?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

const StaffAvatar: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
        <FaUsers className="h-8 w-8" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
      onError={() => setHasError(true)}
    />
  );
};

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const baseUrl: string = (import.meta as any).env?.VITE_API_URL ?? "";
  
  // Check if user is HEAD (handle both old and new enum values)
  // const isHeadUser = user?.user_type === 'HEAD' || user?.user_type === 'DepartmentHead';

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const res = await fetch(`${baseUrl}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Unauthorized access");
          }
          throw new Error("Failed to fetch staff");
        }
        
        const data = await res.json();
        setStaff(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading staff.");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  

  const getAvatarSrc = (avatar?: string | null) => {
    const DEFAULT = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJzNC40NzcgMTAgMTAgMTAgMTAtNC40NzcgMTAtMTBTMTcuNTIzIDIgMTIgMnptMCAyYzQuNDE4IDAgOCAzLjU4MiA4IDhzLTMuNTgyIDgtOCA4LTgtMy41ODItOC04IDMuNTgyLTggOC04eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";
    if (!avatar) return DEFAULT;
    if (avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("data:")) return avatar;
    const trimmedBase = (baseUrl || "").replace(/\/$/, "");
    return `${trimmedBase}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
  };

  const getStatusBadge = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FaUserTimes className="mr-1" />
          Inactive
        </span>
      );
    }
    
    if (!isVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FaEnvelope className="mr-1" />
          Unverified
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <FaUserCheck className="mr-1" />
        Active
      </span>
    );
  };

  if (loading) {
    return (
      <div className="h-full p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <h3 className="font-medium">Error Loading Staff</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Section - Fixed */}
      <div className="flex-shrink-0 p-6 bg-white border-b border-gray-200">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Staff Management</h1>
          <p className="text-gray-600">
            Manage staff members in your department: <span className="font-semibold text-orange-600">
              {user?.departmentName || 'Your Department'}
            </span>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaUserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Staff</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staff.filter(member => member.is_active && member.is_verified).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaEnvelope className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staff.filter(member => !member.is_verified).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {staff.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
            <p className="text-gray-600">
              There are no staff members assigned to your department yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
            {staff.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <StaffAvatar
                        src={getAvatarSrc(member.avatar)}
                        alt={`${member.first_name} ${member.last_name}`}
                      />
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {member.first_name} {member.last_name}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {member.user_type.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(member.is_active, member.is_verified)}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaEnvelope className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    
                    {member.phone_number && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FaPhone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{member.phone_number}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <FaBuilding className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{member.department?.name || "No department"}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Joined: {new Date(member.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;
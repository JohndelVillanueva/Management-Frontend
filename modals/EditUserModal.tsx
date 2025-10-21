import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Department {
  id: number;
  name: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    user_type: string;
    department?: { id: number; name: string };
  } | null;
  onSave: (updatedUser: any) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  userData,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    first_name: userData?.first_name || "",
    last_name: userData?.last_name || "",
    email: userData?.email || "",
    user_type: userData?.user_type || "",
    departmentId: userData?.department?.id ? String(userData.department.id) : "",
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  // ✅ Load departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token =
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("authToken");
        const res = await fetch("http://localhost:3000/departments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch departments");
        const data = await res.json();
        setDepartments(data);
      } catch (error) {
        console.error("Error loading departments:", error);
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepartments();
  }, []);

  // ✅ Update form when modal opens
  useEffect(() => {
    if (userData) {
      setFormData({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        user_type: userData.user_type,
        departmentId: userData.department?.id
          ? String(userData.department.id)
          : "",
      });
    }
  }, [userData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...userData, ...formData });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Edit User</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 rounded-full p-1"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* User Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              User Type
            </label>
            <select
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ADMIN">Admin</option>
              <option value="HEAD">Head</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>

          {/* ✅ Department Dropdown */}
          {/* ✅ Department Dropdown (shows current + removes duplicates) */}
<div>
  <label className="block text-sm font-medium text-gray-700">
    Department
  </label>
  <select
    name="departmentId"
    value={formData.departmentId || userData?.department?.id?.toString() || ""}
    onChange={handleChange}
    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
  >
    {/* -- If user has a department, show it as "Current" at the top -- */}
    {userData?.department && (
      <option
        value={userData.department.id}
        disabled
        className="text-gray-500"
      >
        Current: {userData.department.name}
      </option>
    )}

    {/* Default select prompt */}
    <option value="">
      -- Select Department --
    </option>

    {/* ✅ Render all other departments except the current one */}
    {departments
      .filter((dept) => dept.id !== userData?.department?.id)
      .map((dept) => (
        <option key={dept.id} value={String(dept.id)}>
          {dept.name}
        </option>
      ))}
  </select>
</div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;

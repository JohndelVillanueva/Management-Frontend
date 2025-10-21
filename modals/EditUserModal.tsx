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
    department?: { name: string; id?: number }; // ✅ Fixed: made id optional
  } | null;
  onSave: (updatedUser: any) => void;
  isLoading?: boolean;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  userData,
  onSave,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    user_type: "",
    departmentId: "",
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ✅ Load departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const res = await fetch("http://localhost:3000/departments", {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch departments: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        setDepartments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading departments:", error);
        setFormErrors(prev => ({ ...prev, departments: "Failed to load departments" }));
      } finally {
        setLoadingDepts(false);
      }
    };

    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  // ✅ Update form when modal opens or userData changes
  useEffect(() => {
    if (userData) {
      setFormData({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        user_type: userData.user_type || "",
        departmentId: userData.department?.id ? String(userData.department.id) : "",
      });
      setFormErrors({});
    }
  }, [userData, isOpen]); // Added isOpen to dependency

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      errors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      errors.last_name = "Last name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.user_type) {
      errors.user_type = "User type is required";
    }

    // Department is required for HEAD users
    if (formData.user_type === "HEAD" && !formData.departmentId) {
      errors.departmentId = "Department is required for Head users";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const updatedUser = {
      ...userData,
      ...formData,
      departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
    };

    console.log("🟡 Sending updated user data:", updatedUser); // Debug log
    onSave(updatedUser);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Edit User</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 rounded-full p-1 disabled:opacity-50 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name *
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              disabled={isLoading}
              className={`mt-1 w-full border ${
                formErrors.first_name ? "border-red-300" : "border-gray-300"
              } rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 transition-colors`}
              placeholder="Enter first name"
            />
            {formErrors.first_name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.first_name}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name *
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              disabled={isLoading}
              className={`mt-1 w-full border ${
                formErrors.last_name ? "border-red-300" : "border-gray-300"
              } rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 transition-colors`}
              placeholder="Enter last name"
            />
            {formErrors.last_name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.last_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className={`mt-1 w-full border ${
                formErrors.email ? "border-red-300" : "border-gray-300"
              } rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 transition-colors`}
              placeholder="Enter email address"
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>

          {/* User Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              User Type *
            </label>
            <select
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              disabled={isLoading}
              className={`mt-1 w-full border ${
                formErrors.user_type ? "border-red-300" : "border-gray-300"
              } rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 transition-colors`}
            >
              <option value="">Select User Type</option>
              <option value="ADMIN">Admin</option>
              <option value="HEAD">Head</option>
              <option value="STAFF">Staff</option>
            </select>
            {formErrors.user_type && (
              <p className="mt-1 text-sm text-red-600">{formErrors.user_type}</p>
            )}
          </div>

          {/* ✅ FIXED Department Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Department {formData.user_type === "HEAD" && "*"}
            </label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              disabled={isLoading || loadingDepts}
              className={`mt-1 w-full border ${
                formErrors.departmentId ? "border-red-300" : "border-gray-300"
              } rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 transition-colors`}
            >
              <option value="">-- Select Department --</option>
              {loadingDepts ? (
                <option value="" disabled>Loading departments...</option>
              ) : (
                departments.map((dept) => (
                  <option 
                    key={dept.id} 
                    value={String(dept.id)}
                    className={dept.id === userData?.department?.id ? "font-semibold bg-gray-100" : ""}
                  >
                    {dept.name} {dept.id === userData?.department?.id && "(Current)"}
                  </option>
                ))
              )}
            </select>
            {formErrors.departmentId && (
              <p className="mt-1 text-sm text-red-600">{formErrors.departmentId}</p>
            )}
            {formErrors.departments && (
              <p className="mt-1 text-sm text-red-600">{formErrors.departments}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
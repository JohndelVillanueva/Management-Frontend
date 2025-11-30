import React, { useState, useEffect } from "react";
import { XMarkIcon, UserCircleIcon, BuildingOfficeIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

interface Department {
  id: number;
  name: string;
  code: string;
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
    department?: { name: string; id?: number };
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const baseUrl: string = (import.meta as any).env?.VITE_API_URL ?? "";

  // Load departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const res = await fetch(`${baseUrl}/departments`, {
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

  // Update form when modal opens or userData changes
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
      setTouched({});
    }
  }, [userData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
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
    
    // Mark all fields as touched on submit
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);
    
    if (!validateForm()) {
      return;
    }

    const updatedUser = {
      ...userData,
      ...formData,
      departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
    };

    onSave(updatedUser);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  // Helper to determine if field should show error
  const shouldShowError = (fieldName: string) => {
    return touched[fieldName] && formErrors[fieldName];
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 px-6 py-5 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <UserCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Edit User</h2>
                <p className="text-orange-100 text-sm mt-1">
                  Update user information and permissions
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-white/80 hover:text-white rounded-lg p-2 hover:bg-white/10 transition-all duration-200 disabled:opacity-50"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <UserCircleIcon className="h-4 w-4 text-gray-400 mr-2" />
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-200 ${
                  shouldShowError('first_name') 
                    ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    : "border-gray-300 bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="John"
              />
              {shouldShowError('first_name') && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                  {formErrors.first_name}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-200 ${
                  shouldShowError('last_name') 
                    ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    : "border-gray-300 bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="Doe"
              />
              {shouldShowError('last_name') && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                  {formErrors.last_name}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-200 ${
                shouldShowError('email') 
                  ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                  : "border-gray-300 bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="john.doe@example.com"
            />
            {shouldShowError('email') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                {formErrors.email}
              </p>
            )}
          </div>

          {/* User Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Role / User Type *
            </label>
            <div className="relative">
              <select
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none appearance-none transition-all duration-200 ${
                  shouldShowError('user_type') 
                    ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    : "border-gray-300 bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">Select a role</option>
                <option value="ADMIN" className="font-medium">👑 Administrator</option>
                <option value="HEAD" className="font-medium">👨‍💼 Department Head</option>
                <option value="STAFF" className="font-medium">👥 Staff Member</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {shouldShowError('user_type') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                {formErrors.user_type}
              </p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
              Department {formData.user_type === "HEAD" && "*"}
            </label>
            <div className="relative">
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading || loadingDepts}
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none appearance-none transition-all duration-200 ${
                  shouldShowError('departmentId') 
                    ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    : "border-gray-300 bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">Select department</option>
                {loadingDepts ? (
                  <option value="" disabled>Loading departments...</option>
                ) : (
                  departments.map((dept) => (
                    <option 
                      key={dept.id} 
                      value={String(dept.id)}
                      className={`${dept.id === userData?.department?.id ? "bg-orange-50 text-orange-700 font-semibold" : ""}`}
                    >
                      {dept.name} ({dept.code}) {dept.id === userData?.department?.id && "• Current"}
                    </option>
                  ))
                )}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {shouldShowError('departmentId') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                {formErrors.departmentId}
              </p>
            )}
            {formData.user_type === "HEAD" && !shouldShowError('departmentId') && (
              <p className="mt-2 text-xs text-gray-500 flex items-center">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span>
                Department heads must be assigned to a specific department
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 bg-white text-gray-700 text-sm font-medium rounded-xl border border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-medium rounded-xl hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center min-w-[140px]"
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
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  BuildingLibraryIcon,
  AcademicCapIcon,
  AtSymbolIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

export default function SignupPage() {
  const baseUrl = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    department: "",
    avatar: "" as string | undefined,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<"ADMIN" | "STAFF" | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false);
  const [departmentError, setDepartmentError] = useState("");

  // Fetch departments with AbortController
  useEffect(() => {
    const abortController = new AbortController();

    const fetchDepartments = async () => {
      setIsDepartmentsLoading(true);
      setDepartmentError("");

      try {
        const response = await fetch(`${baseUrl}/departments`, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setDepartments(data || []);
      } catch (err) {
        if (!abortController.signal.aborted) {
          setDepartmentError(
            err instanceof Error ? err.message : "Failed to load departments"
          );
          setDepartments([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsDepartmentsLoading(false);
        }
      }
    };

    fetchDepartments();
    return () => abortController.abort();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFormData((prev) => ({ ...prev, avatar: undefined }));
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData((prev) => ({ ...prev, avatar: result }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!userType) {
      setError("Please select your role");
      return false;
    }
    if (!formData.username) {
      setError("Username is required");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Set department to null for all users since HEAD is removed
    const departmentValue = null;

    const requestData = {
      username: formData.username,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      department: departmentValue,
      userType: userType?.toUpperCase(),
      avatar: formData.avatar,
    };
    
    console.log("Sending signup data:", requestData);

    try {
      const response = await fetch(`${baseUrl}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.log("Error response data:", errorData);
        } catch (jsonError) {
          console.error("Failed to parse error response:", jsonError);
          throw new Error(response.statusText || "Registration failed");
        }
        
        if (errorData.details && Array.isArray(errorData.details)) {
          const errorMessages = errorData.details.map((error: any) => {
            if (error.path && error.message) {
              return `${error.path.join('.')}: ${error.message}`;
            }
            return error.message || 'Validation error';
          }).join(', ');
          throw new Error(`${errorData.error}: ${errorMessages}`);
        } else if (errorData.details && typeof errorData.details === 'string') {
          throw new Error(`${errorData.error}: ${errorData.details}`);
        } else if (errorData.missing && typeof errorData.missing === 'object') {
          const missingFields = Object.entries(errorData.missing)
            .filter(([field, isMissing]) => isMissing)
            .map(([field]) => field)
            .join(', ');
          throw new Error(`${errorData.error}: Missing required fields: ${missingFields}`);
        } else if (errorData.details && typeof errorData.details === 'object') {
          const missingFields = Object.entries(errorData.details)
            .filter(([field, isMissing]) => isMissing)
            .map(([field]) => field)
            .join(', ');
          throw new Error(`${errorData.error}: Missing required fields: ${missingFields}`);
        } else if (errorData.error) {
          throw new Error(errorData.error);
        } else {
          throw new Error("Registration failed");
        }
      }

      const successData = await response.json();
      console.log("Success response:", successData);
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - School Theme */}
        <div className="md:w-2/5 bg-gradient-to-br from-orange-900 to-orange-800 text-white p-8 flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
          <div className="relative z-10 text-center mb-8">
            <div className="bg-white/10 p-4 rounded-full inline-block mb-4">
              <BuildingLibraryIcon className="h-16 w-16 text-orange-200" />
            </div>
            <h1 className="text-3xl font-bold mt-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-200 to-white">
              Pampanga State University
            </h1>
            <p className="mt-2 text-orange-100 text-lg">
              Administrative Portal Registration
            </p>
          </div>

          <div className="space-y-4 text-orange-100 relative z-10 w-full">
            <div className="flex items-start bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <AcademicCapIcon className="h-6 w-6 mt-1 mr-3 flex-shrink-0 text-orange-200" />
              <div>
                <h3 className="font-semibold text-base">Role-Based Access</h3>
                <p className="text-xs text-orange-200">
                  Different permissions for different roles
                </p>
              </div>
            </div>
            <div className="flex items-start bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <AcademicCapIcon className="h-6 w-6 mt-1 mr-3 flex-shrink-0 text-orange-200" />
              <div>
                <h3 className="font-semibold text-base">Secure Registration</h3>
                <p className="text-xs text-orange-200">
                  Accounts require verification
                </p>
              </div>
            </div>
            <div className="flex items-start bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <AcademicCapIcon className="h-6 w-6 mt-1 mr-3 flex-shrink-0 text-orange-200" />
              <div>
                <h3 className="font-semibold text-base">
                  Department Integration
                </h3>
                <p className="text-xs text-orange-200">
                  Connect with department resources
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-3/5 p-8 bg-white">
          <div className="text-center mb-6">
            <div className="bg-orange-100 p-3 rounded-full inline-block mb-3">
              <BuildingLibraryIcon className="h-10 w-10 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              Create Account
            </h2>
            <p className="text-sm text-gray-600">
              Register for administrative access
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          {isSuccess && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center">
              <svg
                className="h-5 w-5 mr-2 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Registration successful! Redirecting to login...
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture (optional)
              </label>
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar preview" className="h-full w-full object-cover" />
                  ) : (
                    <svg className="h-8 w-8 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.31 0-6 2.69-6 6h2a4 4 0 1 1 8 0h2c0-3.31-2.69-6-6-6z" />
                    </svg>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="block text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to ~2MB.</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name Field */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Sarah"
                  />
                </div>
              </div>

              {/* Last Name Field */}
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Johnson"
                  />
                </div>
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AtSymbolIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="sarahj"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Register as:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUserType("ADMIN")}
                  className={`flex items-center justify-center py-2 px-2 border rounded-lg text-xs font-medium transition-colors ${
                    userType === "ADMIN"
                      ? "bg-orange-100 border-orange-300 text-orange-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("STAFF")}
                  className={`flex items-center justify-center py-2 px-2 border rounded-lg text-xs font-medium transition-colors ${
                    userType === "STAFF"
                      ? "bg-orange-100 border-orange-300 text-orange-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <IdentificationIcon className="h-4 w-4 mr-1" />
                  Staff
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                School Email
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="faculty@school.edu"
                />
              </div>
            </div>

            {/* Department Dropdown - Removed since HEAD user type is removed */}
            {userType === "ADMIN" ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Admin Access:</strong> Administrators have access to all departments and don't need to be assigned to a specific department.
                    </p>
                  </div>
                </div>
              </div>
            ) : userType === "STAFF" ? (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-purple-700">
                      <strong>Staff Access:</strong> Staff members don't need to be assigned to a specific department.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="text-xs text-orange-600 hover:text-orange-500">
                      {showPassword ? "Hide" : "Show"}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <span className="text-xs text-orange-600 hover:text-orange-500">
                      {showConfirmPassword ? "Hide" : "Show"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !userType}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors ${
                  isLoading || !userType ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                Sign in instead
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
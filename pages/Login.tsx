import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, BuildingLibraryIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      console.log({ email, password, rememberMe });
      setIsLoading(false);
      navigate('/HeadDashboard'); // Redirect to Head Dashboard after successful login
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transform transition-all duration-300 hover:scale-[1.01]">
        {/* Left Side - School Theme */}
        <div className="md:w-1/2 bg-gradient-to-br from-orange-900 to-orange-800 text-white p-8 flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
          <div className="relative z-10 text-center mb-8">
            <div className="bg-white/10 p-4 rounded-full inline-block mb-4">
              <BuildingLibraryIcon className="h-16 w-16 text-orange-200" />
            </div>
            <h1 className="text-4xl font-bold mt-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-200 to-white">
              Pampanga State University
            </h1>
            <p className="mt-4 text-orange-100 text-lg">
              Comprehensive School Management Solution
            </p>
          </div>
          
          <div className="space-y-6 text-orange-100 relative z-10">
            <div className="flex items-start bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <AcademicCapIcon className="h-8 w-8 mt-1 mr-4 flex-shrink-0 text-orange-200" />
              <div>
                <h3 className="font-semibold text-lg">Student Management</h3>
                <p className="text-sm text-orange-200">Track academic progress and attendance</p>
              </div>
            </div>
            <div className="flex items-start bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <AcademicCapIcon className="h-8 w-8 mt-1 mr-4 flex-shrink-0 text-orange-200" />
              <div>
                <h3 className="font-semibold text-lg">Class Scheduling</h3>
                <p className="text-sm text-orange-200">Efficient timetable management</p>
              </div>
            </div>
            <div className="flex items-start bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <AcademicCapIcon className="h-8 w-8 mt-1 mr-4 flex-shrink-0 text-orange-200" />
              <div>
                <h3 className="font-semibold text-lg">Grade Reporting</h3>
                <p className="text-sm text-orange-200">Comprehensive performance analytics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 bg-white">
          <div className="text-center mb-8">
            <div className="bg-orange-100 p-4 rounded-full inline-block mb-4">
              <BuildingLibraryIcon className="h-12 w-12 text-orange-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              School Portal Login
            </h2>
            <p className="text-gray-600">
              Sign in to access the management system
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                School Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="faculty@school.edu"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="text-sm text-orange-600 hover:text-orange-500 transition-colors">
                    {showPassword ? 'Hide' : 'Show'}
                  </span>
                </button>
              </div>
              <div className="text-right mt-1">
                <a href="#" className="text-xs text-orange-600 hover:text-orange-500 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember this device
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-md font-medium text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  'Access School Portal'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a
                href="/signup"
                className="font-medium text-orange-600 hover:text-orange-500 focus:outline-none transition-colors"
              >
                Request access
              </a>
            </p>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-500 text-center">
              For student access, please use the student portal app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
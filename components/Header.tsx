import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCog,
  FaUserCircle,
  FaUserEdit,
} from "react-icons/fa";
import InfoSideBar from "./InfoSideBar";
import { useAuth } from "../context/AuthContext";

type MenuItem = {
  icon: React.ReactNode;
  label: string;
  path: string;
  className?: string;
  onClick?: () => void;
};

type NavIcon = {
  icon: React.ReactNode;
  label: string;
  path: string;
  onClick?: () => void;
};

type UserProfile = {
  id: number;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  user_type: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  avatar: string | null;
  department: {
    id: number;
    name: string;
  } | null;
};

const DEFAULT_PROFILE_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJzNC40NzcgMTAgMTAgMTAgMTAtNC40NzcgMTAtMTBTMTcuNTIzIDIgMTIgMnptMCAyYzQuNDE4IDAgOCAzLjU4MiA4IDhzLTMuNTgyIDgtOCA4LTgtMy41ODItOC04IDMuNTgyLTggOC04eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

const Header: React.FC = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isInfoSidebarOpen, setIsInfoSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const infoSidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const HeaderStyle = "Pampanga State University";
  const { user } = useAuth();
  const baseUrl: string = (import.meta as any).env?.VITE_API_URL ?? "";

  const dashboardPaths: Record<string, string> = {
    ADMIN: "/AdminDashboard",
    HEAD: "/HeadDashboard",
    STAFF: "/StaffDashboard",
  };

  // Fetch user profile data
  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingProfile(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/api/users/${user.id}`, {
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
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Fallback to user context data if API fails
      setUserProfile({
        id: user.id,
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || null,
        last_name: user.last_name || null,
        phone_number: null,
        user_type: user.user_type || "",
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
        avatar: user.avatar || null,
        department: null,
      });
    } finally {
      setIsLoadingProfile(false);
    }
  }, [user, baseUrl]);

  // Fetch profile when dropdown opens
  useEffect(() => {
    if (isProfileDropdownOpen && !userProfile) {
      fetchUserProfile();
    }
  }, [isProfileDropdownOpen, userProfile, fetchUserProfile]);

  // Fixed useEffect - only redirect to login if no user
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      const path = dashboardPaths[user.user_type];
      // Only navigate if we're on root or login page
      if (window.location.pathname === "/" || window.location.pathname === "/login") {
        navigate(path);
      }
    }
  }, [user, navigate]);

  const toggleInfoSidebar = useCallback(() => {
    setIsInfoSidebarOpen((prev) => !prev);
    if (!isInfoSidebarOpen) {
      setIsProfileDropdownOpen(false);
    }
  }, [isInfoSidebarOpen]);

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;
      target.src = DEFAULT_PROFILE_IMAGE;
      target.onerror = null;
    },
    []
  );

  const closeAllDropdowns = useCallback(() => {
    setIsProfileDropdownOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key === "Escape") {
        closeAllDropdowns();
        setIsInfoSidebarOpen(false);
        return;
      }

      if (!(event instanceof MouseEvent)) return;

      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }

      if (
        infoSidebarRef.current &&
        !infoSidebarRef.current.contains(event.target as Node)
      ) {
        setIsInfoSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleClickOutside);
    };
  }, [closeAllDropdowns]);

  const profileMenuItems = useMemo<MenuItem[]>(
    () => [
      { icon: <FaUserCircle />, label: "Profile", path: "/profile" },
      { icon: <FaUserEdit />, label: "Edit Account", path: "/profile/edit" },
      {
        icon: <FaCog />,
        label: "Settings",
        path: "/settings",
        onClick: () => navigate("/settings"),
      },
    ],
    [navigate]
  );

  const navIcons = useMemo<NavIcon[]>(() => [], []);

  const toggleProfileDropdown = useCallback(() => {
    setIsProfileDropdownOpen((prev) => {
      if (!prev) {
        setIsInfoSidebarOpen(false);
      }
      return !prev;
    });
  }, []);

  const profileImageSrc = useMemo(() => {
    // Use userProfile data if available, otherwise fall back to user context
    const avatar = userProfile?.avatar || (user?.avatar as string | undefined);
    if (!avatar) return DEFAULT_PROFILE_IMAGE;
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) return avatar;
    if (avatar.startsWith("data:image/")) return avatar;
    // Relative path from API
    const trimmedBase = (baseUrl || "").replace(/\/$/, "");
    return `${trimmedBase}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
  }, [userProfile?.avatar, user?.avatar, baseUrl]);

const displayName = useMemo(() => {
  // Check localStorage first for immediate access
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      // Check for both first_name and last_name
      if (parsedUser.first_name && parsedUser.last_name) {
        return `${parsedUser.first_name} ${parsedUser.last_name}`;
      }
      // Check for just first_name
      if (parsedUser.first_name) {
        return parsedUser.first_name;
      }
      // Check for just last_name
      if (parsedUser.last_name) {
        return parsedUser.last_name;
      }
      // Fallback to name field if exists
      if (parsedUser.name) {
        return parsedUser.name;
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
    }
  }
  
  // Fallback to other sources
  const profileName = [userProfile?.first_name, userProfile?.last_name].filter(Boolean).join(' ');
  if (profileName) return profileName;
  
  const authName = [user?.first_name, user?.last_name].filter(Boolean).join(' ');
  if (authName) return authName;
  
  // Final fallback
  return userProfile?.username || user?.username || "User";
}, [userProfile, user]);

  const renderDropdownItem = useCallback(
    (item: MenuItem) => (
      <button
        key={item.path}
        className={`flex items-center px-4 py-2 text-sm hover:bg-gray-600 transition-colors w-full text-left ${
          item.className || ""
        }`}
        onClick={(e) => {
          e.preventDefault();
          closeAllDropdowns();
          if (item.onClick) {
            item.onClick();
          } else {
            navigate(item.path);
          }
        }}
      >
        <span className="mr-2">{item.icon}</span>
        {item.label}
      </button>
    ),
    [closeAllDropdowns, navigate]
  );

  return (
    <>
      <header className="bg-white text-gray-800 p-4 flex justify-between items-center z-30 shadow-sm border-b border-gray-200">
        <div className="flex items-center">
          <img
            src="/Images/images.png"
            alt="Company Logo"
            className="h-8 w-8 mr-3 rounded-full object-cover"
            onError={handleImageError}
          />
          <h1 className="text-xl font-bold text-gray-800">{HeaderStyle}</h1>
        </div>

        <nav className="flex items-center space-x-4">
          {navIcons.map((navItem) => (
            <button
              key={navItem.path}
              onClick={navItem.onClick}
              className="hover:text-orange-600 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label={navItem.label}
            >
              {navItem.icon}
            </button>
          ))}

          <div className="relative" ref={profileDropdownRef}>
            <button
              type="button"
              className="flex items-center focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full"
              onClick={toggleProfileDropdown}
              aria-expanded={isProfileDropdownOpen}
              aria-haspopup="true"
              aria-label="Profile menu"
            >
              <img
                src={profileImageSrc}
                alt="User profile"
                className="h-8 w-8 rounded-full border-2 border-gray-300 hover:border-orange-500 transition-colors object-cover"
                onError={handleImageError}
              />
            </button>

            {isProfileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 border border-gray-200"
                role="menu"
              >
                {/* Profile Info Section */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  {isLoadingProfile ? (
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3">
                        <img
                          src={profileImageSrc}
                          alt={displayName}
                          className="h-12 w-12 rounded-full border-2 border-orange-500 object-cover"
                          onError={handleImageError}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {userProfile?.email || user?.email}
                          </p>
                          {userProfile?.department && (
                            <p className="text-xs text-gray-500 truncate">
                              {userProfile.department.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          {userProfile?.user_type || user?.user_type}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  {profileMenuItems.map((item, index) => (
                    <div key={index} role="none">
                      {renderDropdownItem(item)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      <InfoSideBar
        infoSidebarRef={infoSidebarRef as React.RefObject<HTMLDivElement>}
        isInfoSidebarOpen={isInfoSidebarOpen}
        toggleInfoSidebar={toggleInfoSidebar}
      />
    </>
  );
};

export default Header;
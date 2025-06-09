import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaChevronDown,
  FaTachometerAlt,
  FaCog,
  FaUserShield,
  FaUserCircle,
  FaSignOutAlt,
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

const DEFAULT_PROFILE_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJzNC40NzcgMTAgMTAgMTAgMTAtNC40NzcgMTAtMTBTMTcuNTIzIDIgMTIgMnptMCAyYzQuNDE4IDAgOCAzLjU4MiA4IDhzLTMuNTgyIDgtOCA4LTgtMy41ODItOC04IDMuNTgyLTggOC04eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isInfoSidebarOpen, setIsInfoSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const infoSidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const HeaderStyle = "Pampanga State University";
  const { user, logout } = useAuth();
  
  const dashboardPaths: Record<string, string> = {
    ADMIN: "/AdminDashboard",
    HEAD: "/HeadDashboard",
    STAFF: "/StaffDashboard",
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      const path = dashboardPaths[user.user_type];
      if (window.location.pathname === "/" || window.location.pathname === "/login") {
        navigate(path);
      }
    }
  }, [user, navigate]);

  const toggleInfoSidebar = useCallback(() => {
    setIsInfoSidebarOpen((prev) => !prev);
    if (!isInfoSidebarOpen) {
      setIsDropdownOpen(false);
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
    setIsDropdownOpen(false);
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
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }

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

  const mainMenuItems = useMemo<MenuItem[]>(() => {
    if (!user) return [];

    return [
      {
        icon: <FaTachometerAlt />,
        label: "Dashboard",
        path: dashboardPaths[user.user_type],
        onClick: () => navigate(dashboardPaths[user.user_type])
      },
      ...(user.user_type === 'ADMIN' ? [{
        icon: <FaUserShield />,
        label: "Admin Portal",
        path: "/admin/AdminDashboard",
        onClick: () => navigate("/admin/AdminDashboard"),
      }] : []),
    ];
  }, [navigate, user]);

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
      {
        icon: <FaSignOutAlt />,
        label: "Logout",
        path: "#",
        className: "text-red-400",
        onClick: () => {
          logout();
          navigate("/login");
        },
      },
    ],
    [logout, navigate]
  );

  const navIcons = useMemo(
    () => [
      { icon: <FaHome />, path: "/", label: "Home" },
      {
        icon: <FaInfoCircle />,
        path: "#",
        label: "About",
        onClick: toggleInfoSidebar,
      },
      { icon: <FaEnvelope />, path: "/contact", label: "Contact" },
    ],
    [toggleInfoSidebar]
  );

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => {
      if (!prev) {
        setIsProfileDropdownOpen(false);
        setIsInfoSidebarOpen(false);
      }
      return !prev;
    });
  }, []);

  const toggleProfileDropdown = useCallback(() => {
    setIsProfileDropdownOpen((prev) => {
      if (!prev) {
        setIsDropdownOpen(false);
        setIsInfoSidebarOpen(false);
      }
      return !prev;
    });
  }, []);

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
      <header className="fixed top-0 left-0 right-0 bg-gray-800 text-white p-4 flex justify-between items-center z-50 shadow-md">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            className="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            onClick={toggleDropdown}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            aria-label="Main menu"
          >
            <img
              src="/Images/images.png"
              alt="Company Logo"
              className="h-8 w-8 mr-3 rounded-full object-cover"
              onError={handleImageError}
            />
            <h1 className="text-2xl font-bold mr-2">{HeaderStyle}</h1>
            <FaChevronDown
              className={`transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {isDropdownOpen && (
            <div
              className="absolute left-0 top-full mt-2 bg-gray-700 rounded-md shadow-lg z-50 w-48"
              role="menu"
            >
              <ul>
                {mainMenuItems.map((item, index) => (
                  <li key={index} role="none">
                    {renderDropdownItem(item)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <nav className="flex items-center space-x-4">
          {navIcons.map((navItem) => (
            <button
              key={navItem.path}
              onClick={
                navItem.onClick || (() => (window.location.href = navItem.path))
              }
              className="hover:text-gray-300 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={navItem.label}
            >
              {navItem.icon}
            </button>
          ))}

          <div className="relative" ref={profileDropdownRef}>
            <button
              type="button"
              className="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
              onClick={toggleProfileDropdown}
              aria-expanded={isProfileDropdownOpen}
              aria-haspopup="true"
              aria-label="Profile menu"
            >
              <img
                src="/profile.jpg"
                alt="User profile"
                className="h-8 w-8 rounded-full border-2 border-gray-400 hover:border-white transition-colors object-cover"
                onError={handleImageError}
              />
            </button>

            {isProfileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-50"
                role="menu"
              >
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
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  FolderIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    // Only fetch cards for ADMIN or HEAD
    if (user?.user_type === 'ADMIN' || user?.user_type === 'HEAD') {
      fetch('http://localhost:3000/cards')
        .then(res => res.json())
        .then(data => setCards(data))
        .catch(() => setCards([]));
    }
  }, [user]);

  const getDashboardPath = () => {
    switch (user?.user_type) {
      case 'ADMIN':
        return '/AdminDashboard';
      case 'HEAD':
        return '/HeadDashboard';
      case 'STAFF':
        return '/StaffDashboard';
      default:
        return '/dashboard';
    }
  };

  const getNavItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        icon: HomeIcon,
        path: getDashboardPath(),
        active: location.pathname === getDashboardPath(),
      },
      {
        name: 'Cards',
        icon: FolderIcon,
        path: '/cards',
        active: location.pathname === '/cards',
      },
    ];

    // Add admin-specific items
    if (user?.user_type === 'ADMIN' || user?.user_type === 'Admin') {
      baseItems.push(
        {
          name: 'Users',
          icon: UserGroupIcon,
          path: '/users',
          active: location.pathname === '/users',
        },
        {
          name: 'Departments',
          icon: BuildingOfficeIcon,
          path: '/departments',
          active: location.pathname === '/departments',
        },
      );
    }

    // Add head-specific items
    if (user?.user_type === 'HEAD' || user?.user_type === 'DepartmentHead') {
      baseItems.push(
        {
          name: 'Staff Management',
          icon: UserGroupIcon,
          path: '/staff',
          active: location.pathname === '/staff',
        },
        {
          name: 'Reports',
          icon: DocumentTextIcon,
          path: '/reports',
          active: location.pathname === '/reports',
        }
      );
    }

    // Add staff-specific items
    if (user?.user_type === 'STAFF') {
      baseItems.push(
        {
          name: 'My Submissions',
          icon: DocumentTextIcon,
          path: '/my-submissions',
          active: location.pathname === '/my-submissions',
        }
      );
    }

    return baseItems;
  };

  const handleLogoClick = () => {
    navigate(getDashboardPath());
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = getNavItems();
  
  // Filter cards based on user type
  const filteredCards = cards.filter(card => {
    if (user?.user_type === 'HEAD') {
      return card.department?.id === user?.departmentId || card.headId === user?.id;
    }
    if (user?.user_type === 'ADMIN') {
      return true;
    }
    return false;
  });

  const showCardsSection = (user?.user_type === 'ADMIN' || user?.user_type === 'HEAD') && filteredCards.length > 0;

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-40 flex flex-col ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        {isOpen && (
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-orange-600 mr-2" />
            <button
              onClick={handleLogoClick}
              className="text-lg font-semibold text-gray-800 hover:text-orange-600 transition-colors cursor-pointer"
            >
              PSU Portal
            </button>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isOpen ? (
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-orange-600" />
          </div>
          {isOpen && (
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.user_type?.toLowerCase()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {/* Main Navigation Items */}
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {isOpen && <span className="ml-3 text-sm font-medium">{item.name}</span>}
              </button>
            </li>
          ))}
        </ul>

        {/* Cards Section - Separated */}
        {showCardsSection && (
          <div className="mt-6">
            {/* Section Divider */}
            <div className="mb-3">
              {isOpen ? (
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    My Cards
                  </span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>
              ) : (
                <div className="border-t border-gray-300"></div>
              )}
            </div>

            {/* Cards List */}
            <ul className="space-y-2">
              {filteredCards.map(card => {
                const isActive = location.pathname === `/CardDetails/${card.id}`;
                return (
                  <li key={card.id}>
                    <button
                      onClick={() => navigate(`/CardDetails/${card.id}`)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      title={isOpen ? card.title : `Card: ${card.title}`}
                    >
                      <RectangleStackIcon className="h-5 w-5 flex-shrink-0" />
                      {isOpen && (
                        <span className="ml-3 text-sm font-medium truncate">
                          {card.title}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* Footer - Logout Button */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
          {isOpen && <span className="ml-3 text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
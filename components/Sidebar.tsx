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
        {
          name: 'Analytics',
          icon: ChartBarIcon,
          path: '/analytics',
          active: location.pathname === '/analytics',
        }
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = getNavItems();

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-40 flex flex-col ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        {isOpen && (
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-orange-600 mr-2" />
            <span className="text-lg font-semibold text-gray-800">PSU Portal</span>
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
        <ul className="space-y-2">
          {navItems.map((item, idx) => (
            <React.Fragment key={item.name}>
              <li>
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
              {/* Insert cards after Reports */}
              {item.name === 'Reports' && cards.length > 0 && (
                cards
                  .filter(card => {
                    if (user?.user_type === 'HEAD') {
                      return card.department?.id === user?.departmentId || card.headId === user?.id;
                    }
                    if (user?.user_type === 'ADMIN') {
                      return true; // Admins see all; adjust if needed
                    }
                    return false;
                  })
                  .map(card => (
                  <li key={card.id}>
                    <button
                      onClick={() => navigate(`/CardDetails/${card.id}`)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100`}
                    >
                      <FolderIcon className="h-5 w-5 flex-shrink-0" />
                      {isOpen && <span className="ml-3 text-sm font-medium">{card.title}</span>}
                    </button>
                  </li>
                ))
              )}
            </React.Fragment>
          ))}
        </ul>
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
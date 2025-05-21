import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface InfoSideBarProps {
    infoSidebarRef?: React.RefObject<HTMLDivElement>; // Make it optional
    isInfoSidebarOpen: boolean;
    toggleInfoSidebar: () => void;
}

const InfoSideBar: React.FC<InfoSideBarProps> = ({
  infoSidebarRef,
  isInfoSidebarOpen,
  toggleInfoSidebar
}) => {
  return ( 
    <div 
      ref={infoSidebarRef}
      className={`fixed top-0 right-0 h-full w-80 bg-gray-800 text-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${isInfoSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ marginTop: '64px' }} // Adjust this to match your header height
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">School Information</h2>
          <button 
            onClick={toggleInfoSidebar}
            className="p-1 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">About SchoolEase</h3>
            <p className="text-gray-300 text-sm">
              SchoolEase is a comprehensive school management platform designed to streamline 
              administrative tasks, enhance communication, and improve the learning experience 
              for students, teachers, and parents.
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">School Details</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li><strong>Academic Year:</strong> 2023-2024</li>
              <li><strong>Term:</strong> Second Term</li>
              <li><strong>Total Students:</strong> 1,245</li>
              <li><strong>Total Staff:</strong> 87</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">System Specifications</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li><strong>Modules:</strong> Attendance, Grading, Scheduling, Fees</li>
              <li><strong>Frontend:</strong> React 18, TypeScript, Tailwind CSS</li>
              <li><strong>Backend:</strong> Node.js, Express</li>
              <li><strong>Database:</strong> PostgreSQL</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Contact Support</h3>
            <p className="text-gray-300 text-sm mb-2">
              For technical issues or school administration inquiries, please contact:
            </p>
            <a 
              href="mailto:support@schoolease.edu" 
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              support@schoolease.edu
            </a>
            <p className="text-gray-300 text-sm mt-2">
              <strong>School Hours:</strong> 8:00 AM - 4:00 PM, Mon-Fri
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4 mt-4">
          <p className="text-gray-400 text-xs text-center">
            © {new Date().getFullYear()} SchoolEase Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
 
export default InfoSideBar;
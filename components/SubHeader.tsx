import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

interface SubHeaderProps {
  pageTitle: string;
}

const SubHeader = ({ pageTitle }: SubHeaderProps) => {
  const navigate = useNavigate();

  return ( 
    <div className="flex items-center w-full h-16 px-4 bg-gray-200 dark:bg-white shadow-md">
      <button 
        onClick={() => navigate(-1)} // Go back one page
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 mr-4"
      >
        <FiArrowLeft className="text-gray-900 dark:text-black-500" />
      </button>
      <h2 className="text-lg font-semibold text-black-800 dark:text-black-200">
        {pageTitle}
      </h2>
    </div>
  );
}

export default SubHeader;
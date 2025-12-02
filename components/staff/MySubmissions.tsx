import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  DocumentIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon, // Add this import
  TrashIcon, // Optional: Add delete icon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface CardSubmission {
  id: number;
  title: string;
  description: string;
  submission_date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
  department: {
    id: number;
    name: string;
  };
  cardType: {
    id: number;
    name: string;
  };
  files_count: number;
  last_updated: string;
}

interface ApiResponse {
  success: boolean;
  data: CardSubmission[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

const SubmissionsTable: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [submissions, setSubmissions] = useState<CardSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortColumn, setSortColumn] = useState<string>('submission_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const baseUrl: string = (import.meta as any).env?.VITE_API_URL ?? "";

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }
      
      // Use localhost:3000 since that's where your backend is running
    //   const baseUrl = 'http://localhost:3000';
      const apiUrl = `${baseUrl}/submissions/my-submissions`;
      
      console.log('Fetching from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success && Array.isArray(data.data)) {
        setSubmissions(data.data);
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError(`Error: ${error instanceof Error ? error.message : 'Failed to fetch submissions'}`);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Filter and sort submissions
  const filteredSubmissions = submissions
    .filter(submission => {
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          submission.title.toLowerCase().includes(term) ||
          (submission.description && submission.description.toLowerCase().includes(term)) ||
          submission.department.name.toLowerCase().includes(term) ||
          submission.cardType.name.toLowerCase().includes(term)
        );
      }
      return true;
    })
    .filter(submission => {
      // Status filter
      if (statusFilter !== 'ALL') {
        return submission.status === statusFilter;
      }
      return true;
    })
    .sort((a, b) => {
      // Sorting
      let aValue, bValue;
      
      switch (sortColumn) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'department':
          aValue = a.department.name.toLowerCase();
          bValue = b.department.name.toLowerCase();
          break;
        case 'cardType':
          aValue = a.cardType.name.toLowerCase();
          bValue = b.cardType.name.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'last_updated':
          aValue = new Date(a.last_updated).getTime();
          bValue = new Date(b.last_updated).getTime();
          break;
        default: // submission_date
          aValue = new Date(a.submission_date).getTime();
          bValue = new Date(b.submission_date).getTime();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  // Handle sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Handle view details
  const handleViewDetails = (submissionId: number) => {
    navigate(`/submission/${submissionId}`);
  };

  // Handle edit submission
  const handleEditSubmission = (submissionId: number) => {
    navigate(`/edit-submission/${submissionId}`);
    // Or if you want to edit in a modal:
    // setEditingSubmissionId(submissionId);
    // setIsEditModalOpen(true);
  };

  // Handle delete submission (optional)
  const handleDeleteSubmission = async (submissionId: number) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/submissions/${submissionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Remove from local state
        setSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
        alert('Submission deleted successfully');
      } else {
        alert('Failed to delete submission');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Error deleting submission');
    }
  };

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'No date';
    }
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      // Format the date
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateString);
      return 'Date error';
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchSubmissions();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Table header with controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">My Submissions</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search input */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full sm:w-64"
              />
            </div>
            
            {/* Status filter */}
            {/* <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none w-full sm:w-auto"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="REVISION_REQUESTED">Revision Needed</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div> */}
            
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              disabled={loading}
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1">
                  Title
                  {sortColumn === 'title' && (
                    sortDirection === 'asc' ? 
                    <ChevronUpIcon className="h-4 w-4" /> : 
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('department')}
              >
                <div className="flex items-center gap-1">
                  Department
                  {sortColumn === 'department' && (
                    sortDirection === 'asc' ? 
                    <ChevronUpIcon className="h-4 w-4" /> : 
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('cardType')}
              >
                <div className="flex items-center gap-1">
                  Card Type
                  {sortColumn === 'cardType' && (
                    sortDirection === 'asc' ? 
                    <ChevronUpIcon className="h-4 w-4" /> : 
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('submission_date')}
              >
                <div className="flex items-center gap-1">
                  Submitted
                  {sortColumn === 'submission_date' && (
                    sortDirection === 'asc' ? 
                    <ChevronUpIcon className="h-4 w-4" /> : 
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('last_updated')}
              >
                <div className="flex items-center gap-1">
                  Last Updated
                  {sortColumn === 'last_updated' && (
                    sortDirection === 'asc' ? 
                    <ChevronUpIcon className="h-4 w-4" /> : 
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Files
              </th>
              {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th> */}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  </div>
                  <p className="mt-2 text-gray-500">Loading submissions...</p>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="text-red-600 mb-3">
                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-2">Error loading submissions</p>
                  <p className="text-sm text-gray-500 mb-4">{error}</p>
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Try Again
                  </button>
                </td>
              </tr>
            ) : filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm || statusFilter !== 'ALL' ? (
                    <>
                      <DocumentIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-lg font-medium mb-2">No matching submissions found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </>
                  ) : (
                    <>
                      <DocumentIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-lg font-medium mb-2">No submissions yet</p>
                      <p className="text-sm">Create your first card submission to get started</p>
                    </>
                  )}
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((submission) => (
                <tr 
                  key={submission.id} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="font-medium text-gray-900 truncate" title={submission.title}>
                        {submission.title}
                      </div>
                      {submission.description && (
                        <div className="text-sm text-gray-500 truncate mt-1" title={submission.description}>
                          {submission.description.length > 60 
                            ? `${submission.description.substring(0, 60)}...` 
                            : submission.description}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{submission.department.name}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{submission.cardType.name}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(submission.submission_date)}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(submission.last_updated)}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <DocumentIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{submission.files_count}</span>
                    </div>
                  </td>
                  
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"> */}
                    {/* <div className="flex items-center gap-3"> */}
                      {/* View Button */}
                      {/* <button
                        onClick={() => handleViewDetails(submission.id)}
                        className="text-orange-600 hover:text-orange-900 flex items-center gap-1 transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </button> */}
                      
                      {/* Edit Button - Only show for PENDING or REVISION_REQUESTED status */}
                      {/* {(submission.status === 'PENDING' || submission.status === 'REVISION_REQUESTED') && (
                        <button
                          onClick={() => handleEditSubmission(submission.id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1 transition-colors"
                          title="Edit Submission"
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                      )} */}
                      
                      {/* Optional: Delete Button */}
                      {/* <button
                        onClick={() => handleDeleteSubmission(submission.id)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1 transition-colors"
                        title="Delete Submission"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button> */}
                    {/* </div> */}
                  {/* </td> */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubmissionsTable;
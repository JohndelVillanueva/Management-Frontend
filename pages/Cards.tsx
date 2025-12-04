import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import CreateCardModal from '../modals/CreateCardModal';

type Department = {
  id: number;
  name: string;
};

type CardItem = {
  id: number;
  title: string;
  description?: string | null;
  departments?: Array<{
    department: Department;
  }>;
  files?: Array<any>;
  createdAt?: string;
  // For backward compatibility
  department?: Department | null;
};

const CardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  const baseUrl: string = (import.meta as any).env?.VITE_API_URL ?? "";

  const fetchCards = async () => {
    setLoading(true);
    setError('');
    try {
      let url = `${baseUrl}/cards`;
      const params = new URLSearchParams();

      if (user?.user_type === 'HEAD' || user?.user_type === 'STAFF') {
        const departmentId = (user as any).department?.id ?? (user as any).departmentId;
        if (departmentId) {
          params.set('departmentId', String(departmentId));
          console.log('Using main endpoint with department filter:', departmentId);
        }
      } else if (user?.user_type === 'ADMIN') {
        console.log('Using main endpoint for ADMIN (all cards)');
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('Fetching cards from URL:', url);

      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`HTTP ${res.status} error from ${url}:`, errorText);
        
        let errorMessage = `Failed to fetch cards (${res.status})`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await res.json();
      console.log(`Received ${data.length} cards from ${url}`, data);
      
      // Process the cards to handle the new structure
      const processedCards = data.map((card: any) => {
        // If card has departments array, use the first one for display
        // or handle multiple departments
        let displayDepartment = null;
        if (card.departments && card.departments.length > 0) {
          if (card.departments.length === 1) {
            displayDepartment = card.departments[0].department;
          } else {
            // For multiple departments, you might want to show something else
            displayDepartment = { 
              id: 0, 
              name: `${card.departments.length} Departments` 
            };
          }
        }
        
        return {
          ...card,
          department: displayDepartment,
          // Keep the original departments array for filtering
          departments: card.departments || []
        };
      });
      
      setCards(processedCards);
      // Reset to first page when new data is fetched
      setCurrentPage(1);
    } catch (err: any) {
      console.error('Error in fetchCards:', err);
      setError(err.message || 'Error loading cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [user]);

  const handleCreateCard = async (
    title: string, 
    description: string, 
    departmentIds: number[] | 'ALL',
    headId: number | null, 
    expiresAt: Date | null,
    allowedFileTypes: string[]
  ) => {
    try {
      setCreateLoading(true);
      setCreateError('');

      console.log('Creating card with:', {
        title,
        description,
        departmentIds,
        headId,
        expiresAt,
        allowedFileTypes
      });

      const response = await fetch(`${baseUrl}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title,
          description,
          departmentIds,
          headId,
          expiresAt,
          allowedFileTypes
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create card error response:', errorText);
        let errorMessage = 'Failed to create card';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const newCard = await response.json();
      console.log('Card created successfully:', newCard);

      // Refresh the cards list
      await fetchCards();
      return true;
    } catch (error: any) {
      console.error('Error creating card:', error);
      setCreateError(error.message);
      return false;
    } finally {
      setCreateLoading(false);
    }
  };

  const departmentOptions = useMemo(() => {
    const departments = new Set<string>();
    
    cards.forEach(card => {
      if (card.departments && card.departments.length > 0) {
        card.departments.forEach(deptRelation => {
          if (deptRelation.department?.name) {
            departments.add(deptRelation.department.name);
          }
        });
      }
      // Also check the legacy department field for backward compatibility
      if (card.department?.name) {
        departments.add(card.department.name);
      }
    });
    
    return Array.from(departments).sort();
  }, [cards]);

  const filtered = useMemo(() => {
    let list = cards.slice();
    
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.department?.name || '').toLowerCase().includes(q)
      );
    }
    
    if (deptFilter !== 'all') {
      list = list.filter((c) => {
        // Check both the display department and the departments array
        const displayDeptName = c.department?.name || '';
        const hasDeptInArray = c.departments?.some(
          deptRel => deptRel.department?.name === deptFilter
        );
        
        return displayDeptName === deptFilter || hasDeptInArray;
      });
    }
    
    if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    
    return list;
  }, [cards, query, deptFilter, sortBy]);

  // Pagination calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedCards = filtered.slice(startIndex, endIndex);

  const getUserDepartmentId = () => {
    if (!user) return undefined;
    return (user as any).department?.id ?? (user as any).departmentId;
  };

  const isStaff = user?.user_type === 'STAFF';

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of the table
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show limited pages with ellipsis
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // In the middle
        pageNumbers.push(1);
        pageNumbers.push('...');
        pageNumbers.push(currentPage - 1);
        pageNumbers.push(currentPage);
        pageNumbers.push(currentPage + 1);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  if (loading) return <div className="p-8 text-center text-gray-500 text-lg">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600 text-lg">{error}</div>;

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto">
      <div className="w-full p-8">
        {/* Header & Filters */}
        <div className="flex flex-col gap-6 mb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-gray-800">Cards</h1>
            {/* {!isStaff && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                <PlusIcon className="h-4 w-4" />
                New Card
              </button>
            )} */}
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <input
              type="text"
              placeholder="Search cards..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full md:w-80 border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            >
              <option value="all">All Departments</option>
              {departmentOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'title')}
              className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            >
              <option value="recent">Most Recent</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Items per page selector */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} - {endIndex} of {totalItems} cards
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
        </div>

        {/* List View */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-xl mb-4">No cards available.</p>
            {!isStaff && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-6 inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors text-base"
              >
                <PlusIcon className="h-6 w-6" />
                Create Your First Card
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            {/* Table Header */}
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-6 px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                <div className="col-span-4">Title</div>
                <div className="col-span-2">Department</div>
                <div className="col-span-2">Files</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {paginatedCards.map((card) => (
                <div 
                  key={card.id} 
                  className="grid grid-cols-12 gap-6 px-6 py-4 hover:bg-gray-50 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/cardDetails/${card.id}`)}
                >
                  {/* Title & Description */}
                  <div className="col-span-4 flex items-center">
                    <div className="flex items-center min-w-0">
                      <span className="text-2xl mr-4 text-gray-400 group-hover:text-orange-500 transition-colors">
                        📄
                      </span>
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                          {card.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate mt-1">
                          {card.description || 'No description'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="col-span-2 flex items-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
                      {card.department?.name || 'No Department'}
                    </div>
                  </div>

                  {/* Files Count */}
                  <div className="col-span-2 flex items-center">
                    <div className="text-base font-medium text-gray-900">
                      {card.files?.length || 0} files
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="col-span-2 flex items-center">
                    <div className="text-sm text-gray-900 font-medium">
                      {formatDate(card.createdAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end">
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm text-orange-600 font-medium">View</span>
                      <ChevronRightIcon className="h-4 w-4 text-orange-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer with Count */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} - {endIndex} of {totalItems} cards
                </div>
                {!isStaff && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add New Card
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-2 text-gray-400">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(page as number)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-orange-500 text-white font-medium'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Next
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Jump to page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Go to:</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (!isNaN(page) && page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                  }
                }}
                className="w-16 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition text-center"
              />
            </div>
          </div>
        )}

        {/* Create Card Modal */}
        {user && !isStaff && (
          <CreateCardModal
            open={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreateCard}
            loading={createLoading}
            error={createError}
            user_type={user.user_type as 'ADMIN' | 'HEAD'}
            user_department={getUserDepartmentId()}
          />
        )}

        {/* Bottom spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default CardsPage;
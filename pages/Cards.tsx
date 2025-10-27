import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlusIcon } from '@heroicons/react/24/outline';
import CreateCardModal from '../modals/CreateCardModal';

type CardItem = {
  id: number;
  title: string;
  description?: string | null;
  department?: { id: number; name: string } | null;
  files?: Array<any>;
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

  const fetchCards = async () => {
    setLoading(true);
    setError('');
    try {
      let url = 'http://localhost:3000/cards';
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
      console.log(`Received ${data.length} cards from ${url}`);
      setCards(data);
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

  const handleCreateCard = async (title: string, description: string, departmentId: number, headId: number | null) => {
    setCreateLoading(true);
    setCreateError('');
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);
      
      if (!token) {
        setCreateError('No authentication token found. Please log in again.');
        setCreateLoading(false);
        return false;
      }

      const requestBody: any = {
        title,
        description,
        departmentId,
      };

      if (headId) requestBody.headId = headId;

      console.log('Sending request with headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });

      const response = await fetch('http://localhost:3000/cards', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const createdCard = await response.json();
        console.log('Created card:', createdCard);
        await fetchCards();
        setCreateLoading(false);
        return true;
      } else {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          setCreateError(errorData.error || 'Failed to create card');
        } catch {
          setCreateError('Failed to create card');
        }
        setCreateLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Network error:', error);
      setCreateError('Network error occurred');
      setCreateLoading(false);
      return false;
    }
  };

  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    const options = cards
      .map((c) => c.department?.name)
      .filter(Boolean) as string[];
    options.forEach((n) => set.add(n));
    return Array.from(set).sort();
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
      list = list.filter((c) => (c.department?.name || '') === deptFilter);
    }
    if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list.sort((a, b) => b.id - a.id);
    }
    return list;
  }, [cards, query, deptFilter, sortBy]);

  const getUserDepartmentId = () => {
    if (!user) return undefined;
    return (user as any).department?.id ?? (user as any).departmentId;
  };

  const isStaff = user?.user_type === 'STAFF';

  if (loading) return <div className="p-8 text-center text-gray-500 text-lg">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600 text-lg">{error}</div>;

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto">
      <div className="w-full p-8">
        {/* Header & Filters */}
        <div className="flex flex-col gap-6 mb-8 md:flex-row md:items-center md:justify-between">
          <h1 className="text-4xl font-bold text-gray-800">Cards</h1>
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

        {/* Card Grid */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {/* Create Card Button */}
            {!isStaff && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-left bg-white rounded-xl shadow-sm p-6 hover:shadow-lg hover:-translate-y-0.5 transform transition border-2 border-dashed border-gray-300 group flex flex-col items-center justify-center min-h-[200px] text-gray-500 hover:text-orange-600 hover:border-orange-400"
              >
                <PlusIcon className="h-14 w-14 mb-3 text-gray-400 group-hover:text-orange-500" />
                <span className="font-medium text-base">Create New Card</span>
              </button>
            )}

            {filtered.map((card) => (
              <button
                key={card.id}
                onClick={() => navigate(`/cardDetails/${card.id}`)}
                className="text-left bg-white rounded-xl shadow-sm p-6 hover:shadow-lg hover:-translate-y-0.5 transform transition border border-gray-200 group min-h-[200px] flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl">📄</div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                    {(card.files?.length ?? 0)} files
                  </span>
                </div>
                <h3 className="font-semibold text-lg text-gray-800 truncate group-hover:text-orange-600 transition-colors mb-2">
                  {card.title}
                </h3>
                <div className="mt-auto text-sm text-gray-500 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-gray-300" />
                  <span>{card.department?.name || 'No Department'}</span>
                </div>
              </button>
            ))}
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
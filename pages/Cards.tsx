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
  const { user } = useAuth(); // This is currentUser from your context
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

      // Build query params similar to the sidebar filtering
      if (user?.user_type === 'HEAD') {
        const departmentId = (user as any).department?.id ?? (user as any).departmentId;
        const params = new URLSearchParams();
        params.set('userId', String((user as any).id));
        if (departmentId) params.set('departmentId', String(departmentId));
        url += `?${params.toString()}`;
      } else if (user?.user_type === 'STAFF') {
        const departmentId = (user as any)?.department?.id ?? (user as any)?.departmentId;
        if (departmentId) {
          const params = new URLSearchParams();
          params.set('departmentId', String(departmentId));
          url += `?${params.toString()}`;
        }
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch cards');
      const data = await res.json();
      setCards(data);
    } catch (err: any) {
      setError(err.message || 'Error loading cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [user]);

const handleCreateCard = async (title: string, description: string, departmentId: number, headId: number | null, expiresAt: Date | null) => {
  setCreateLoading(true);
  setCreateError('');
  
  try {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    
    if (!token) {
      setCreateError('No authentication token found. Please log in again.');
      setCreateLoading(false);
      return false;
    }

    // Decode the token to see what's in it (client-side)
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      console.log('Decoded token payload:', decoded);
    } catch (e) {
      console.log('Could not decode token:', e);
    }

    const requestBody: any = {
      title,
      description,
      departmentId,
    };

    if (headId) requestBody.headId = headId;
    if (expiresAt) requestBody.expiresAt = expiresAt.toISOString();

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
      // recent: assume returned in desc created order; fallback to id desc
      list.sort((a, b) => b.id - a.id);
    }
    return list;
  }, [cards, query, deptFilter, sortBy]);

  // Get user's department ID for HEAD users
  const getUserDepartmentId = () => {
    if (!user) return undefined;
    return (user as any).department?.id ?? (user as any).departmentId;
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header & Filters */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Cards</h1>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="text"
              placeholder="Search cards..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            >
              <option value="all">All Departments</option>
              {departmentOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'title')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            >
              <option value="recent">Most Recent</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Card Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No cards available.
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors mx-auto"
            >
              <PlusIcon className="h-5 w-5" />
              Create Your First Card
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {/* Create Card Button as the first card */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-left bg-white rounded-xl shadow-sm p-5 hover:shadow-lg hover:-translate-y-0.5 transform transition border-2 border-dashed border-gray-300 group flex flex-col items-center justify-center min-h-[180px] text-gray-500 hover:text-orange-600 hover:border-orange-400"
            >
              <PlusIcon className="h-12 w-12 mb-3 text-gray-400 group-hover:text-orange-500" />
              <span className="font-medium">Create New Card</span>
            </button>

            {filtered.map((card) => (
              <button
                key={card.id}
                onClick={() => navigate(`/CardDetails/${card.id}`)}
                className="text-left bg-white rounded-xl shadow-sm p-5 hover:shadow-lg hover:-translate-y-0.5 transform transition border border-gray-200 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl">📄</div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                    {(card.files?.length ?? 0)} files
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 truncate group-hover:text-orange-600 transition-colors">
                  {card.title}
                </h3>
                <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-gray-300" />
                  <span>{card.department?.name || 'No Department'}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Create Card Modal - FIXED: use 'user' instead of 'currentUser' */}
        {user && (
          <CreateCardModal
            open={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreateCard}
            loading={createLoading}
            error={createError}
            user_type={user.user_type as 'ADMIN' | 'HEAD'} // Cast to the expected type
            user_department={getUserDepartmentId()} // Get department ID for HEAD users
          />
        )}
      </div>
    </div>
  );
};

export default CardsPage;
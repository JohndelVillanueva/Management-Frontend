import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FolderIcon, PencilSquareIcon  } from '@heroicons/react/24/outline';

const CardsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

    useEffect(() => {
    const fetchUserCards = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!user?.id) {
          throw new Error('User information not available');
        }

        // Build query parameters
        const params = new URLSearchParams();
        params.append('userId', user.id);
        
        // Only add departmentId if it exists
        if (user.departmentId) {
          params.append('departmentId', user.departmentId.toString());
        }

        const response = await fetch(`http://localhost:3000/cards?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user cards');
        }
        
        const data = await response.json();
        setCards(data);
      } catch (err) {
        console.error('Error fetching user cards:', err);
        setError('Failed to load your cards. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserCards();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  // Group cards by relationship type
  const headCards = cards.filter(card => card.headId === user?.id);
  const departmentCards = cards.filter(card => 
    card.departmentId === user?.departmentId && card.headId !== user?.id
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Cards</h1>
        <p className="text-gray-600">
          {cards.length} {cards.length === 1 ? 'card' : 'cards'} related to you
        </p>
      </div>

      {/* Cards where user is head */}
      {headCards.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Cards You Manage ({headCards.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {headCards.map((card) => (
              <CardItem key={card.id} card={card} navigate={navigate} />
            ))}
          </div>
        </div>
      )}

      {/* Cards in user's department */}
      {departmentCards.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Department Cards ({departmentCards.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentCards.map((card) => (
              <CardItem key={card.id} card={card} navigate={navigate} />
            ))}
          </div>
        </div>
      )}

      {cards.length === 0 && (
        <div className="text-center py-10">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No cards found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any cards assigned to you or in your department.
          </p>
        </div>
      )}
    </div>
  );
};

// Reusable card component
const CardItem = ({ card, navigate }: { card: any; navigate: any }) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking edit
    navigate(`/edit-card/${card.id}`);
  };

  return (
    <div 
      onClick={() => navigate(`/CardDetails/${card.id}`)}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer relative"
    >
      {/* Edit button positioned at top-right */}
      <button
        onClick={handleEditClick}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-orange-500 transition-colors"
        aria-label="Edit card"
      >
        <PencilSquareIcon className="h-5 w-5" />
      </button>
      
      <div className="flex items-center mb-3">
        <FolderIcon className="h-5 w-5 text-orange-500 mr-2" />
        <h3 className="font-medium text-gray-900">{card.title}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        {card.description || 'No description available'}
      </p>
      <div className="flex justify-between items-center">
        <span className={`px-2 py-1 text-xs rounded-full ${
          card.status === 'active' ? 'bg-green-100 text-green-800' :
          card.status === 'archived' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {card.status}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(card.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default CardsPage;
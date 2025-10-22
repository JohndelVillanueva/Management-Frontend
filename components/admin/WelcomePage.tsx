import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateCardModal from '../../modals/CreateCardModal';

type DepartmentModuleType = 
  | 'Student Records' 
  | 'Class Scheduling'
  | 'Grade Management'
  | 'Attendance Tracking'
  | 'Faculty Management'
  | 'Curriculum Planning'
  | 'Financial Operations'
  | 'Library System'
  | 'Health Services'
  | 'IT Support'
  | 'Facilities'
  | 'Transportation'
  | 'Extracurriculars';

type DepartmentType = 
  | 'Academics' 
  | 'Administration'
  | 'Student Services'
  | 'Support Services';

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [cards, setCards] = React.useState<any[]>([]);
  const [cardsLoading, setCardsLoading] = React.useState(true);
  const [cardsError, setCardsError] = React.useState('');

  const handleModuleClick = (module: DepartmentModuleType) => {
    navigate(`/cards/${encodeURIComponent(module)}`);
  };

  const handleCreateCard = async (title: string, description: string, departmentId: number, headId: number | null) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3000/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, departmentId, headId }),
        credentials: 'include',
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || 'Failed to create card');
        setLoading(false);
        return false;
      }
      // Re-fetch cards after successful creation
      const cardsRes = await fetch('http://localhost:3000/cards');
      const cardsData = await cardsRes.json();
      setCards(cardsData);
      setLoading(false);
      setError('');
      return true;
    } catch (err) {
      setError('Error creating card.');
      setLoading(false);
      return false;
    }
  };

  React.useEffect(() => {
    setCardsLoading(true);
    fetch('http://localhost:3000/cards')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch cards');
        return res.json();
      })
      .then(data => {
        setCards(data);
        setCardsLoading(false);
      })
      .catch(err => {
        setCardsError('Error loading cards.');
        setCardsLoading(false);
      });
  }, []);

  const departments: {
    name: DepartmentType;
    color: string;
    modules: {
      label: DepartmentModuleType;
      icon: string;
    }[];
  }[] = [
    {
      name: 'Academics',
      color: 'blue',
      modules: [
        { label: 'Student Records', icon: '📚' },
        { label: 'Class Scheduling', icon: '⏰' },
        { label: 'Grade Management', icon: '📝' },
        { label: 'Attendance Tracking', icon: '✓' }
      ]
    },
    {
      name: 'Administration',
      color: 'green',
      modules: [
        { label: 'Faculty Management', icon: '👩‍🏫' },
        { label: 'Curriculum Planning', icon: '📋' },
        { label: 'Financial Operations', icon: '💰' }
      ]
    },
    {
      name: 'Student Services',
      color: 'purple',
      modules: [
        { label: 'Library System', icon: '📖' },
        { label: 'Health Services', icon: '🏥' },
        { label: 'Extracurriculars', icon: '⚽' }
      ]
    },
    {
      name: 'Support Services',
      color: 'orange',
      modules: [
        { label: 'IT Support', icon: '💻' },
        { label: 'Facilities', icon: '🏫' },
        { label: 'Transportation', icon: '🚌' }
      ]
    }
  ];

  // Group cards by department name
  const cardsByDepartment = cards.reduce((acc, card) => {
    const deptName = card.department?.name || 'No Department';
    if (!acc[deptName]) acc[deptName] = [];
    acc[deptName].push(card);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        {/* <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Access department-specific tools and resources</p>
          </div>
          <button
            className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow font-semibold transition-all"
            onClick={() => setModalOpen(true)}
          >
            + Create New Card
          </button>
        </div> */}

        {/* Grouped Cards by Department */}
        {Object.entries(cardsByDepartment).map(([deptName, deptCards]) => (
          <div className="mb-5" key={deptName}>
            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-semibold text-orange-700">
                {deptName}
              </h2>
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                {(deptCards as any[]).length} cards
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {(deptCards as any[]).map((card) => (
                <div
                  key={card.id}
                  className="flex flex-col h-32 bg-white rounded-lg shadow-md p-5 cursor-pointer hover:bg-orange-50 transition-all hover:shadow-lg border-l-4 border-orange-500"
                  onClick={() => navigate(`/CardDetails/${card.id}`)}
                >
                  <div className="text-2xl mb-2">📄</div>
                  <h3 className="font-medium text-gray-800">{card.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">{card.department?.name || 'No Department'}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* School-wide Overview */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">School-wide Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-bold">1,842</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-500">Faculty Members</p>
              <p className="text-2xl font-bold">127</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-500">Active Classes</p>
              <p className="text-2xl font-bold">86</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-500">Departments</p>
              <p className="text-2xl font-bold">4</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Quick Links</h2>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
              School Calendar
            </button>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
              Emergency Protocols
            </button>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
              Staff Directory
            </button>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
              Policy Handbook
            </button>
          </div>
        </div>
      </div>
      <CreateCardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateCard}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default SchoolDashboard;
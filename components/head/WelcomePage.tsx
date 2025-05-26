import { useNavigate } from 'react-router-dom';

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

interface DepartmentHeadDashboardProps {
  department: DepartmentType; // The department this head manages
  isAdmin?: boolean; // Optional admin override
}

const DepartmentHeadDashboard = ({ department, isAdmin = false }: DepartmentHeadDashboardProps) => {
  const navigate = useNavigate();

  const handleModuleClick = (module: DepartmentModuleType, moduleDepartment: DepartmentType) => {
    if (department === moduleDepartment || isAdmin) {
      navigate(`/${module.toLowerCase().replace(' ', '-')}`);
    } else {
      alert(`You don't have permission to access ${moduleDepartment} Department modules`);
    }
  };

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

  return (
    <div className="mx-auto px-8 py-6">
      <div className="mx-auto">
        <div className="mx-4">
          <div className="mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                {department} Department Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your {department} department resources
              </p>
            </div>

            {/* Only show the head's department unless they're admin */}
            {departments
              .filter(dept => isAdmin || dept.name === department)
              .map((dept) => (
                <div key={dept.name} className="mb-10">
                  <div className="flex items-center mb-4">
                    <h2 className={`text-2xl font-semibold text-${dept.color}-700`}>
                      {dept.name} Department
                    </h2>
                    {dept.name === department && (
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Your Department
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {dept.modules.map((module) => (
                      <div
                        key={module.label}
                        onClick={() => handleModuleClick(module.label, dept.name)}
                        className={`flex flex-col h-32 bg-white rounded-lg shadow-md p-5 cursor-pointer hover:bg-${dept.color}-50 transition-all hover:shadow-lg border-l-4 border-${dept.color}-500 ${
                          dept.name !== department && !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <div className="text-2xl mb-2">{module.icon}</div>
                        <h3 className="font-medium text-gray-800">{module.label}</h3>
                        <p className="mt-1 text-xs text-gray-500">{dept.name} Department</p>
                        {dept.name !== department && !isAdmin && (
                          <div className="mt-1 text-xs text-red-500">No access</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            {/* Department-specific Overview */}
            <div className="mt-12 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">{department} Department Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Active Staff</p>
                  <p className="text-2xl font-bold">
                    {department === 'Academics' ? '42' : 
                     department === 'Administration' ? '15' :
                     department === 'Student Services' ? '23' : '18'}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Pending Tasks</p>
                  <p className="text-2xl font-bold">7</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Recent Updates</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Open Requests</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
              <div className="flex flex-wrap gap-3">
                <button 
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                  onClick={() => navigate('/department-calendar')}
                >
                  Department Calendar
                </button>
                <button 
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                  onClick={() => navigate('/staff-directory')}
                >
                  Staff Directory
                </button>
                <button 
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                  onClick={() => navigate(`/department-reports`)}
                >
                  {department} Reports
                </button>
                <button 
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                  onClick={() => navigate('/messages')}
                >
                  Messages
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentHeadDashboard;
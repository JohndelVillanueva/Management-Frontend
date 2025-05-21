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

const SchoolDashboard = () => {
  const navigate = useNavigate();

  const handleModuleClick = (module: DepartmentModuleType) => {
    navigate(`/${module.toLowerCase().replace(' ', '-')}`);
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
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600">Access department-specific tools and resources</p>
            </div>

            {/* Department Sections */}
            {departments.map((department) => (
              <div key={department.name} className="mb-10">
                <div className="flex items-center mb-4">
                  <h2 className={`text-2xl font-semibold text-${department.color}-700`}>
                    {department.name} Department
                  </h2>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full bg-${department.color}-100 text-${department.color}-800`}>
                    {department.modules.length} modules
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {department.modules.map((module) => (
                    <div
                      key={module.label}
                      onClick={() => handleModuleClick(module.label)}
                      className={`flex flex-col h-32 bg-white rounded-lg shadow-md p-5 cursor-pointer hover:bg-${department.color}-50 transition-all hover:shadow-lg border-l-4 border-${department.color}-500`}
                    >
                      <div className="text-2xl mb-2">{module.icon}</div>
                      <h3 className="font-medium text-gray-800">{module.label}</h3>
                      <p className="mt-1 text-xs text-gray-500">{department.name} Department</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* School-wide Overview */}
            <div className="mt-12 bg-white rounded-lg shadow-md p-6">
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
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
              <div className="flex flex-wrap gap-3">
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
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
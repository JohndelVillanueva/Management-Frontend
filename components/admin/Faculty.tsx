import { Link } from 'react-router-dom';
import React from 'react';

interface FacultyMember {
  id: number;
  name: string;
  department: string;
  email: string;
  subjects: string[];
}

const Faculty = () => {
  const faculty: FacultyMember[] = [
    { id: 1, name: 'Dr. Smith', department: 'Science', email: 'smith@school.edu', subjects: ['Chemistry', 'Biology'] },
    { id: 2, name: 'Prof. Johnson', department: 'Mathematics', email: 'johnson@school.edu', subjects: ['Algebra', 'Calculus'] },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Faculty Management</h1>
        <Link 
          to="/admin/create-new?type=faculty" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Faculty Member
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faculty.map((member) => (
          <div key={member.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">{member.name}</h3>
            <p className="text-gray-600">{member.department} Department</p>
            <p className="text-gray-500 text-sm mt-2">Subjects: {member.subjects.join(', ')}</p>
            <div className="mt-4 flex space-x-2">
              <Link 
                to={`/admin/faculty/${member.id}`} 
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View Profile
              </Link>
              <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faculty;
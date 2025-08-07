import React, { useState, useEffect } from 'react';

interface Department {
  id: number;
  name: string;
}

interface HeadUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface CreateCardModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (
    title: string, 
    description: string, 
    departmentId: number,
    headId?: number | null  // Add this parameter
  ) => Promise<boolean>;
  loading: boolean;
  error: string;
}

const CreateCardModal: React.FC<CreateCardModalProps> = ({ open, onClose, onCreate, loading, error }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [deptError, setDeptError] = useState('');
  const [headUsers, setHeadUsers] = useState<HeadUser[]>([]);
  const [selectedHeadId, setSelectedHeadId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setDeptError('');
      fetch('http://localhost:3000/departments')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch departments');
          return res.json();
        })
        .then(data => {
          setDepartments(data);
          setDepartmentId(null); // Always set to null so the default option is shown
        })
        .catch(() => {
          setDeptError('Could not load departments.');
          setDepartments([]);
          setDepartmentId(null);
        });
      // Fetch head users
      fetch('http://localhost:3000/auth/heads')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch head users');
          return res.json();
        })
        .then(data => {
          setHeadUsers(data);
          setSelectedHeadId(null); // Always set to null so the default option is shown
        })
        .catch(() => {
          setHeadUsers([]);
          setSelectedHeadId(null);
        });
    }
    if (!open) {
      setTitle('');
      setDescription('');
      setDepartmentId(null);
      setDeptError('');
      setHeadUsers([]);
      setSelectedHeadId(null);
    }
  }, [open]);

  if (!open) return null;

const handleCreate = async () => {
  if (!title.trim() || !departmentId) return;
  const success = await onCreate(
    title, 
    description, 
    departmentId,
    selectedHeadId  // Pass the selected headId
  );
  if (success) {
    setTitle('');
    setDescription('');
    setDepartmentId(null);
    setSelectedHeadId(null);
    onClose();
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blur bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-xl font-semibold mb-4">Create New Card</h2>
        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
        {deptError && <div className="mb-4 text-red-600 text-sm">{deptError}</div>}
        <label className="block mb-2 text-sm font-medium text-gray-700">Card Title</label>
        <input
          className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter card title"
          disabled={loading}
        />
        <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
        <textarea
          className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter description"
          disabled={loading}
        />
        <label className="block mb-2 text-sm font-medium text-gray-700">Department</label>
        <select
          className="w-full mb-2 px-3 py-2 border rounded focus:outline-none focus:ring"
          value={departmentId ?? ''}
          onChange={e => setDepartmentId(Number(e.target.value))}
          disabled={loading || departments.length === 0}
        >
          <option value="">Select Department</option>
          {departments.length === 0 ? (
            <option>No departments found</option>
          ) : (
            departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))
          )}
        </select>
        {/* Head user dropdown */}
        {headUsers.length > 0 && (
          <>
            <label className="block mb-2 text-sm font-medium text-gray-700">Department Head</label>
            <select
              className="w-full mb-2 px-3 py-2 border rounded focus:outline-none focus:ring"
              value={selectedHeadId ?? ''}
              onChange={e => setSelectedHeadId(Number(e.target.value))}
              disabled={loading}
            >
              <option value="">Select Department Head</option>
              {headUsers.map((head) => (
                <option key={head.id} value={head.id}>
                  {head.first_name} {head.last_name}
                </option>
              ))}
            </select>
          </>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={onClose}
            type="button"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center min-w-[90px]"
            onClick={handleCreate}
            type="button"
            disabled={!title.trim() || !departmentId || !selectedHeadId || loading || departments.length === 0}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCardModal; 
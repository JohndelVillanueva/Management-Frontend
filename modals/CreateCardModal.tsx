import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';

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
  onCreate: (title: string, description: string, departmentId: number, headId: number | null) => Promise<boolean>;
  loading: boolean;
  error: string;
  user_type: 'ADMIN' | 'HEAD'; // Add this line
}

const CreateCardModal: React.FC<CreateCardModalProps> = ({ open, onClose, onCreate, loading, error, user_type }) => {
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
    const success = await onCreate(title, description, departmentId, selectedHeadId);
    if (success) {
      setTitle('');
      setDescription('');
      setDepartmentId(null);
      setSelectedHeadId(null);
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      title="Create New Card"
      description="Define the card title, department, optional head, and description."
      widthClassName="max-w-xl"
      footer={(
        <>
          <button
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={onClose}
            type="button"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center min-w-[90px] disabled:opacity-50"
            onClick={handleCreate}
            type="button"
            disabled={
              user_type === 'ADMIN'
                ? (!title.trim() || !departmentId || !selectedHeadId || loading || departments.length === 0)
                : (!title.trim() || loading)
            }
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </>
      )}
    >
      {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
      {deptError && <div className="mb-4 text-red-600 text-sm">{deptError}</div>}
      <label className="block mb-1 text-sm font-medium text-gray-700">Card Title</label>
      <p className="text-xs text-gray-500 mb-2">Use a clear, concise name for this card.</p>
      <input
        className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring"
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Enter card title"
        disabled={loading}
      />
      <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
      <p className="text-xs text-gray-500 mb-2">Describe the purpose or scope of this card (optional).</p>
      <textarea
        className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Enter description"
        disabled={loading}
      />
      {user_type === 'ADMIN' && (
        <>
          <label className="block mb-1 text-sm font-medium text-gray-700">Department</label>
          <p className="text-xs text-gray-500 mb-2">Assign this card to a department.</p>
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
              <label className="block mb-1 text-sm font-medium text-gray-700">Department Head</label>
              <p className="text-xs text-gray-500 mb-2">Optional: designate a head for this card.</p>
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
        </>
      )}
    </BaseModal>
  );
};

export default CreateCardModal;
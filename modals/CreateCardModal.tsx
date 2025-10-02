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
  departmentId?: number;
}

interface CreateCardModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string, departmentId: number, headId: number | null, expiresAt: Date | null) => Promise<boolean>;
  loading: boolean;
  error: string;
  user_type: 'ADMIN' | 'HEAD';
  user_department?: number; // Add current user's department for HEAD users
}

const CreateCardModal: React.FC<CreateCardModalProps> = ({ 
  open, 
  onClose, 
  onCreate, 
  loading, 
  error, 
  user_type,
  user_department 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [deptError, setDeptError] = useState('');
  const [headUsers, setHeadUsers] = useState<HeadUser[]>([]);
  const [selectedHeadId, setSelectedHeadId] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [includeExpiration, setIncludeExpiration] = useState(false);
  const [userDepartmentInfo, setUserDepartmentInfo] = useState<Department | null>(null);

  useEffect(() => {
    if (open) {
      setDeptError('');
      
      // For HEAD users, only fetch their own department
      if (user_type === 'HEAD' && user_department) {
        fetch(`http://localhost:3000/departments/${user_department}`)
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch department');
            return res.json();
          })
          .then(data => {
            setUserDepartmentInfo(data);
            setDepartmentId(user_department);
            setDepartments([data]);
          })
          .catch(() => {
            setDeptError('Could not load department information.');
            setUserDepartmentInfo(null);
            setDepartmentId(null);
          });
      } else if (user_type === 'ADMIN') {
        // For ADMIN users, fetch all departments
        fetch('http://localhost:3000/departments')
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch departments');
            return res.json();
          })
          .then(data => {
            setDepartments(data);
            setDepartmentId(null);
          })
          .catch(() => {
            setDeptError('Could not load departments.');
            setDepartments([]);
            setDepartmentId(null);
          });
      }
      
      // Fetch head users (only for ADMIN, as HEAD will be auto-assigned)
      if (user_type === 'ADMIN') {
        fetch('http://localhost:3000/auth/heads')
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch head users');
            return res.json();
          })
          .then(data => {
            setHeadUsers(data);
            setSelectedHeadId(null);
          })
          .catch(() => {
            setHeadUsers([]);
            setSelectedHeadId(null);
          });
      } else {
        // For HEAD users, clear head users list since they'll be auto-assigned
        setHeadUsers([]);
        setSelectedHeadId(null);
      }
    }
    if (!open) {
      setTitle('');
      setDescription('');
      setDepartmentId(null);
      setDeptError('');
      setHeadUsers([]);
      setSelectedHeadId(null);
      setExpiresAt('');
      setIncludeExpiration(false);
      setUserDepartmentInfo(null);
    }
  }, [open, user_type, user_department]);

  if (!open) return null;

  const handleCreate = async () => {
    if (!title.trim()) return;
    
    // For HEAD users, departmentId must be their department
    let finalDepartmentId = departmentId;
    if (user_type === 'HEAD') {
      finalDepartmentId = user_department || null;
    }
    
    if (!finalDepartmentId) {
      alert('Department is required');
      return;
    }
    
    // For HEAD users, headId should be null (they'll be auto-assigned in backend)
    const finalHeadId = user_type === 'HEAD' ? null : selectedHeadId;
    
    // Convert expiration date string to Date object if provided
    let expirationDate: Date | null = null;
    if (includeExpiration && expiresAt) {
      expirationDate = new Date(expiresAt);
      // Validate the date
      if (isNaN(expirationDate.getTime())) {
        alert('Please enter a valid expiration date');
        return;
      }
    }
    
    const success = await onCreate(
      title, 
      description, 
      finalDepartmentId, 
      finalHeadId, 
      expirationDate
    );
    if (success) {
      setTitle('');
      setDescription('');
      setDepartmentId(null);
      setSelectedHeadId(null);
      setExpiresAt('');
      setIncludeExpiration(false);
      onClose();
    }
  };

  // Calculate minimum date (today) for the date picker
  const today = new Date().toISOString().split('T')[0];

  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      title="Create New Card"
      description="Define the card title, department, optional head, description, and expiration date."
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
            disabled={!title.trim() || loading || !departmentId}
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
      
      {/* Department field - different for HEAD vs ADMIN */}
      <label className="block mb-1 text-sm font-medium text-gray-700">Department</label>
      <p className="text-xs text-gray-500 mb-2">
        {user_type === 'HEAD' 
          ? 'This card will be created for your department.' 
          : 'Assign this card to a department.'}
      </p>
      
      {user_type === 'HEAD' ? (
        // For HEAD users - show read-only department info
        <div className="w-full mb-4 px-3 py-2 border rounded bg-gray-50">
          {userDepartmentInfo ? (
            <span className="text-gray-700">{userDepartmentInfo.name}</span>
          ) : (
            <span className="text-gray-500">Loading department...</span>
          )}
          <p className="text-xs text-gray-500 mt-1">
            As a department head, you can only create cards for your own department.
          </p>
        </div>
      ) : (
        // For ADMIN users - show department dropdown
        <select
          className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring"
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
      )}

      {/* Head user dropdown - only for ADMIN users */}
      {user_type === 'ADMIN' && headUsers.length > 0 && (
        <>
          <label className="block mb-1 text-sm font-medium text-gray-700">Department Head</label>
          <p className="text-xs text-gray-500 mb-2">Optional: designate a head for this card.</p>
          <select
            className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring"
            value={selectedHeadId ?? ''}
            onChange={e => setSelectedHeadId(Number(e.target.value))}
            disabled={loading}
          >
            <option value="">Select Department Head (Optional)</option>
            {headUsers.map((head) => (
              <option key={head.id} value={head.id}>
                {head.first_name} {head.last_name}
              </option>
            ))}
          </select>
        </>
      )}

      {/* For HEAD users, show message about auto-assignment */}
      {user_type === 'HEAD' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> As the department head, you will be automatically assigned as the head of this card.
          </p>
        </div>
      )}

      {/* Expiration Date Section */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="includeExpiration"
            checked={includeExpiration}
            onChange={(e) => setIncludeExpiration(e.target.checked)}
            className="mr-2"
            disabled={loading}
          />
          <label htmlFor="includeExpiration" className="text-sm font-medium text-gray-700">
            Set expiration date
          </label>
        </div>
        <p className="text-xs text-gray-500 mb-2">Optionally set when this card should expire.</p>
        
        {includeExpiration && (
          <div className="mt-2">
            <label className="block mb-1 text-sm font-medium text-gray-700">Expiration Date</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={today}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              The card will automatically expire after this date.
            </p>
          </div>
        )}
      </div>
    </BaseModal>
  );
};

export default CreateCardModal;
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
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
  onCreate: (
    title: string, 
    description: string, 
    departmentIds: number[] | 'ALL', // Updated to departmentIds
    headId: number | null, 
    expiresAt: Date | null,
    allowedFileTypes: string[]
  ) => Promise<boolean>;
  loading: boolean;
  error: string;
  user_type: 'ADMIN' | 'HEAD';
  user_department?: number;
}

const FILE_TYPE_OPTIONS = [
  { value: '.pdf', label: 'PDF Documents (.pdf)' },
  { value: '.doc,.docx', label: 'Word Documents (.doc, .docx)' },
  { value: '.xls,.xlsx', label: 'Excel Spreadsheets (.xls, .xlsx)' },
  { value: '.ppt,.pptx', label: 'PowerPoint Presentations (.ppt, .pptx)' },
  { value: 'image/*', label: 'Images (all formats)' },
  { value: '.jpg,.jpeg,.png', label: 'Images (.jpg, .png)' },
  { value: '.zip,.rar', label: 'Compressed Files (.zip, .rar)' },
  { value: '.txt', label: 'Text Files (.txt)' },
  { value: '*', label: 'All File Types' }
];

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
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<number[]>([]); // Changed to array
  const [isAllDepartments, setIsAllDepartments] = useState(false); // New state for ALL
  const [deptError, setDeptError] = useState('');
  const [headUsers, setHeadUsers] = useState<HeadUser[]>([]);
  const [selectedHeadId, setSelectedHeadId] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [includeExpiration, setIncludeExpiration] = useState(false);
  const [userDepartmentInfo, setUserDepartmentInfo] = useState<Department | null>(null);
  const [allowedFileTypes, setAllowedFileTypes] = useState<string[]>(['*']);

  useEffect(() => {
    if (open) {
      // Reset form state when opening
      setTitle('');
      setDescription('');
      setSelectedDepartmentIds([]);
      setIsAllDepartments(false);
      setDeptError('');
      setHeadUsers([]);
      setSelectedHeadId(null);
      setExpiresAt('');
      setIncludeExpiration(false);
      setUserDepartmentInfo(null);
      setAllowedFileTypes(['*']);

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // For HEAD users, only fetch their own department
      if (user_type === 'HEAD' && user_department) {
        fetch(`http://localhost:3000/departments/${user_department}`, { headers })
          .then(res => {
            if (!res.ok) {
              if (res.status === 401) {
                throw new Error('Authentication failed. Please log in again.');
              }
              if (res.status === 500) {
                throw new Error('Server error while fetching department');
              }
              throw new Error(`Failed to fetch department: ${res.status}`);
            }
            return res.json();
          })
          .then(data => {
            setUserDepartmentInfo(data);
            setSelectedDepartmentIds([user_department]); // Set as single department in array
            setDepartments([data]);
          })
          .catch((err) => {
            console.error('Department fetch error:', err);
            const errorMsg = err.message || 'Could not load department information.';
            setDeptError(errorMsg);
            toast.error(errorMsg);
            setUserDepartmentInfo(null);
            setSelectedDepartmentIds([]);
          });
      } else if (user_type === 'ADMIN') {
        // For ADMIN users, fetch all departments
        fetch('http://localhost:3000/departments', { headers })
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
          })
          .then(data => {
            console.log('Departments data:', data);
            setDepartments(data);
            setSelectedDepartmentIds([]);
          })
          .catch((err) => {
            console.error('Departments fetch error:', err);
            const errorMsg = err.message || 'Could not load departments.';
            setDeptError(errorMsg);
            toast.error(errorMsg);
            setDepartments([]);
            setSelectedDepartmentIds([]);
          });
      }
      
      // Fetch head users (only for ADMIN)
      if (user_type === 'ADMIN') {
        fetch('http://localhost:3000/auth/heads', { headers })
          .then(res => {
            if (!res.ok) {
              if (res.status === 401) {
                throw new Error('Authentication failed. Please log in again.');
              }
              throw new Error('Failed to fetch head users');
            }
            return res.json();
          })
          .then(data => {
            setHeadUsers(data);
            setSelectedHeadId(null);
          })
          .catch((err) => {
            const errorMsg = err.message || 'Could not load department heads.';
            toast.error(errorMsg);
            setHeadUsers([]);
            setSelectedHeadId(null);
          });
      } else {
        // For HEAD users, clear head users list
        setHeadUsers([]);
        setSelectedHeadId(null);
      }
    }
  }, [open, user_type, user_department]);

  // Show toast when error prop changes
  useEffect(() => {
    if (error && open) {
      toast.error(error);
    }
  }, [error, open]);

  if (!open) return null;

  const handleDepartmentToggle = (departmentId: number) => {
    if (selectedDepartmentIds.includes(departmentId)) {
      // Remove department
      setSelectedDepartmentIds(selectedDepartmentIds.filter(id => id !== departmentId));
    } else {
      // Add department
      setSelectedDepartmentIds([...selectedDepartmentIds, departmentId]);
    }
  };

  const handleSelectAllDepartments = () => {
    if (isAllDepartments) {
      // Deselect ALL
      setIsAllDepartments(false);
      setSelectedDepartmentIds([]);
    } else {
      // Select ALL
      setIsAllDepartments(true);
      setSelectedDepartmentIds([]);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('Card title is required');
      return;
    }
    
    // Determine final department selection
    let finalDepartmentSelection: number[] | 'ALL';
    
    if (user_type === 'HEAD') {
      // HEAD users can only assign to their own department
      finalDepartmentSelection = user_department ? [user_department] : [];
    } else {
      // ADMIN users can select multiple departments or ALL
      if (isAllDepartments) {
        finalDepartmentSelection = 'ALL';
      } else {
        finalDepartmentSelection = selectedDepartmentIds;
      }
    }
    
    if (finalDepartmentSelection === 'ALL' && finalDepartmentSelection.length === 0) {
      toast.error('At least one department is required');
      return;
    }
    
    if (Array.isArray(finalDepartmentSelection) && finalDepartmentSelection.length === 0) {
      toast.error('At least one department is required');
      return;
    }
    
    // For HEAD users, headId should be null (they'll be auto-assigned in backend)
    const finalHeadId = user_type === 'HEAD' ? null : selectedHeadId;
    
    // Convert expiration date string to Date object if provided
    let expirationDate: Date | null = null;
    if (includeExpiration && expiresAt) {
      expirationDate = new Date(expiresAt);
      if (isNaN(expirationDate.getTime())) {
        toast.error('Please enter a valid expiration date');
        return;
      }
    }
    
    const success = await onCreate(
      title, 
      description, 
      finalDepartmentSelection, // Now passing array or 'ALL'
      finalHeadId, 
      expirationDate,
      allowedFileTypes
    );
    
    if (success) {
      toast.success('Card created successfully!');
      setTitle('');
      setDescription('');
      setSelectedDepartmentIds([]);
      setIsAllDepartments(false);
      setSelectedHeadId(null);
      setExpiresAt('');
      setIncludeExpiration(false);
      setAllowedFileTypes(['*']);
      onClose();
    }
  };

  const handleFileTypeToggle = (value: string) => {
    if (value === '*') {
      setAllowedFileTypes(['*']);
    } else {
      let newTypes = allowedFileTypes.filter(t => t !== '*');
      
      if (newTypes.includes(value)) {
        newTypes = newTypes.filter(t => t !== value);
        if (newTypes.length === 0) {
          newTypes = ['*'];
        }
      } else {
        newTypes.push(value);
      }
      
      setAllowedFileTypes(newTypes);
    }
  };

  // Calculate minimum date (today) for the date picker
  const today = new Date().toISOString().split('T')[0];

  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      title="Create New Card"
      description="Define the card title, department, optional head, description, expiration date, and allowed file types."
      widthClassName="max-w-2xl"
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
            disabled={!title.trim() || loading || 
              (user_type === 'ADMIN' && !isAllDepartments && selectedDepartmentIds.length === 0) ||
              (user_type === 'HEAD' && !user_department)}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </>
      )}
    >
      <div className="max-h-[70vh] overflow-y-auto pr-2">
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
          rows={3}
        />
        
        {/* Department field - different for HEAD vs ADMIN */}
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Department{user_type === 'ADMIN' && 's'}
        </label>
        <p className="text-xs text-gray-500 mb-2">
          {user_type === 'HEAD' 
            ? 'This card will be created for your department.' 
            : 'Select one or more departments for this card, or choose ALL departments.'}
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
          // For ADMIN users - show multi-select department options
          <div className="mb-4">
            {/* ALL Departments option */}
            <label className="flex items-center space-x-2 mb-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={isAllDepartments}
                onChange={handleSelectAllDepartments}
                disabled={loading}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-700">📢 ALL DEPARTMENTS</span>
            </label>

            {/* Individual department selection */}
            {!isAllDepartments && (
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-3 bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">Select specific departments:</p>
                {departments.length === 0 ? (
                  <p className="text-sm text-gray-500">No departments found</p>
                ) : (
                  departments.map((dept) => (
                    <label key={dept.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedDepartmentIds.includes(dept.id)}
                        onChange={() => handleDepartmentToggle(dept.id)}
                        disabled={loading}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{dept.name}</span>
                    </label>
                  ))
                )}
              </div>
            )}

            {/* Selection summary */}
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-xs text-blue-700">
                <strong>Selected:</strong> {
                  isAllDepartments 
                    ? 'All departments' 
                    : selectedDepartmentIds.length === 0 
                    ? 'No departments selected' 
                    : `${selectedDepartmentIds.length} department(s) selected`
                }
              </p>
            </div>
          </div>
        )}

        {/* Show info when ALL is selected */}
        {isAllDepartments && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Note:</strong> This card will be visible to all departments. All staff members across all departments will be able to see and submit to this card.
            </p>
          </div>
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

        {/* Allowed File Types Section */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">Allowed File Types for Submissions</label>
          <p className="text-xs text-gray-500 mb-3">Select which file types staff can submit for this card.</p>
          
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-3 bg-gray-50">
            {FILE_TYPE_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                <input
                  type="checkbox"
                  checked={allowedFileTypes.includes(option.value)}
                  onChange={() => handleFileTypeToggle(option.value)}
                  disabled={loading}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-blue-700">
              <strong>Selected:</strong> {
                allowedFileTypes.includes('*') 
                  ? 'All file types allowed' 
                  : allowedFileTypes.join(', ')
              }
            </p>
          </div>
        </div>

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
      </div>
    </BaseModal>
  );
};

export default CreateCardModal;
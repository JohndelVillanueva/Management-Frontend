import React, { useState, useEffect } from 'react';

interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  created_at: string;
  updated_at: string;
  _count?: {
    users: number;
    cards: number;
  };
}

interface DepartmentModalProps {
  open: boolean;
  onClose: () => void;
  editingDepartment: Department | null;
  onSubmit: (formData: { name: string; code: string; description: string }) => Promise<void>;
  loading: boolean;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
  open,
  onClose,
  editingDepartment,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  // Update form data when editing department changes
  useEffect(() => {
    if (editingDepartment) {
      setFormData({
        name: editingDepartment.name,
        code: editingDepartment.code,
        description: editingDepartment.description || ''
      });
    } else {
      setFormData({ name: '', code: '', description: '' });
    }
  }, [editingDepartment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Department name is required');
      return;
    }

    if (!formData.code.trim()) {
      alert('Department code is required');
      return;
    }

    await onSubmit(formData);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-blur bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingDepartment ? 'Edit Department' : 'Create Department'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter department name"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter department code (e.g., CS, IT, ENG)"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter department description (optional)"
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingDepartment ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DepartmentModal; 
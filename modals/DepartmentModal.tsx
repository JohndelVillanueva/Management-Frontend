import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';

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
    <BaseModal
      isOpen={open}
      onClose={handleClose}
      title={editingDepartment ? 'Edit Department' : 'Create Department'}
      description={editingDepartment ? 'Update department info and code.' : 'Add a new department to the system.'}
      widthClassName=""
      containerClassName="w-[24rem] md:w-[36rem] aspect-square"
      contentClassName="px-6 pt-3 pb-3 flex-1"
      footer={(
        <>
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
            form="department-form"
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : (editingDepartment ? 'Update' : 'Create')}
          </button>
        </>
      )}
    >
      <form id="department-form" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
          <p className="text-xs text-gray-500 mb-2">Provide a unique, descriptive name.</p>
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
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Department Code *</label>
          <p className="text-xs text-gray-500 mb-2">Used for quick references (e.g., CS, IT, ENG).</p>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter department code"
            required
            disabled={loading}
          />
        </div>
        <div className="mb-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <p className="text-xs text-gray-500 mb-2">Optional: add details that help identify this department.</p>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter description (optional)"
            rows={3}
            disabled={loading}
          />
        </div>
      </form>
    </BaseModal>
  );
};

export default DepartmentModal; 
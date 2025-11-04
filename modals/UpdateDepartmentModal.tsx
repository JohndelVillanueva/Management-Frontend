import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import toast from 'react-hot-toast';

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

interface UpdateDepartmentModalProps {
  open: boolean; // This should be isOpen to match BaseModal
  onClose: () => void;
  department: Department | null;
  onSubmit: (formData: { name: string; code: string; description: string }) => Promise<void>;
  loading: boolean;
}

const UpdateDepartmentModal: React.FC<UpdateDepartmentModalProps> = ({
  open, // Rename this to isOpen
  onClose,
  department,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form with department data when modal opens
  useEffect(() => {
    if (open && department) {
      setFormData({
        name: department.name,
        code: department.code,
        description: department.description || ''
      });
      setErrors({});
    }
  }, [open, department]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Department code is required';
    } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
      newErrors.code = 'Code should contain only uppercase letters and numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      // Error is already handled by parent component via toast
      console.error('Form submission error:', error);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!department) return null;

  return (
    <BaseModal
      isOpen={open} // FIXED: Changed from 'open' to 'isOpen'
      onClose={handleClose}
      title="Edit Department"
      description="Update department information"
      widthClassName="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Department Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Department Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter department name"
            disabled={loading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Department Code */}
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
            Department Code *
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
              errors.code ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., CS, IT, MATH"
            disabled={loading}
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Use uppercase letters and numbers only (e.g., CS001, MATH101)
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Enter department description (optional)"
            disabled={loading}
          />
        </div>

        {/* Department Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Department Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {new Date(department.created_at).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{' '}
              {new Date(department.updated_at).toLocaleDateString()}
            </div>
            {department._count && (
              <>
                <div>
                  <span className="font-medium">Users:</span> {department._count.users}
                </div>
                <div>
                  <span className="font-medium">Cards:</span> {department._count.cards}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : (
              'Update Department'
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default UpdateDepartmentModal;
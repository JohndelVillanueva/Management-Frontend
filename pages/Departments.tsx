import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import DepartmentModal from '../modals/DepartmentModal';

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

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch departments
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/departments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }

      const data = await response.json();
      setDepartments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = () => {
    setEditingDepartment(null);
    setModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setModalOpen(true);
  };

  const handleDeleteDepartment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/departments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete department');
      }

      // Remove from local state
      setDepartments(departments.filter(dept => dept.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete department');
    }
  };

  const handleSubmit = async (formData: { name: string; code: string; description: string }) => {
    setSubmitting(true);
    try {
      const url = editingDepartment 
        ? `http://localhost:3000/departments/${editingDepartment.id}`
        : 'http://localhost:3000/departments';
      
      const method = editingDepartment ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save department');
      }

      const savedDepartment = await response.json();
      
      if (editingDepartment) {
        // Update existing department
        setDepartments(departments.map(dept => 
          dept.id === editingDepartment.id ? savedDepartment : dept
        ));
      } else {
        // Add new department
        setDepartments([...departments, savedDepartment]);
      }

      setModalOpen(false);
      setEditingDepartment(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save department');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDepartment(null);
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Departments</h1>
            <p className="text-gray-600">Manage university departments and their settings</p>
          </div>
          <button
            onClick={handleCreateDepartment}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Department
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((department) => (
            <div key={department.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <BuildingOfficeIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
                      <p className="text-sm text-orange-600 font-medium">{department.code}</p>
                      {department.description && (
                        <p className="text-sm text-gray-600 mt-1">{department.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditDepartment(department)}
                      className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Edit department"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(department.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete department"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {department._count?.users || 0} users
                    </span>
                  </div>
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {department._count?.cards || 0} cards
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Updated: {new Date(department.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {departments.length === 0 && !loading && (
          <div className="text-center py-6">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No departments yet</h3>
            <p className="text-gray-600 mb-6">Create your first department to get started</p>
            <button
              onClick={handleCreateDepartment}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Create First Department
            </button>
          </div>
        )}
      </div>

      {/* Department Modal */}
      <DepartmentModal
        open={modalOpen}
        onClose={closeModal}
        editingDepartment={editingDepartment}
        onSubmit={handleSubmit}
        loading={submitting}
      />
    </div>
  );
};

export default Departments; 
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

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/departments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }

      const data = await response.json();
      setDepartments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load departments';
      setError(errorMessage);
      toast.error(errorMessage);
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

    const deletePromise = fetch(`http://localhost:3000/departments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
      }
    });

    toast.promise(
      deletePromise,
      {
        loading: 'Deleting department...',
        success: (response) => {
          if (!response.ok) {
            throw new Error('Failed to delete department');
          }
          setDepartments(departments.filter(dept => dept.id !== id));
          return 'Department deleted successfully';
        },
        error: (err) => {
          return err instanceof Error ? err.message : 'Failed to delete department';
        },
      }
    );
  };

  const handleSubmit = async (formData: { name: string; code: string; description: string }) => {
    setSubmitting(true);
    
    const url = editingDepartment 
      ? `http://localhost:3000/departments/${editingDepartment.id}`
      : 'http://localhost:3000/departments';
    
    const method = editingDepartment ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${editingDepartment ? 'update' : 'create'} department`);
      }

      const savedDepartment = await response.json();
      
      if (editingDepartment) {
        setDepartments(departments.map(dept => 
          dept.id === editingDepartment.id ? savedDepartment : dept
        ));
        toast.success('Department updated successfully!');
      } else {
        setDepartments([...departments, savedDepartment]);
        toast.success('Department created successfully!');
      }

      setModalOpen(false);
      setEditingDepartment(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${editingDepartment ? 'update' : 'create'} department`;
      toast.error(errorMessage);
      console.error('Department operation error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDepartment(null);
  };

  // ... rest of your component remains the same until the return statement

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto overflow-x-hidden">
      <div className="w-full p-8 min-h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Departments</h1>
            <p className="text-lg text-gray-600">Manage university departments and their settings</p>
          </div>
          <button
            onClick={handleCreateDepartment}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center text-base"
          >
            <PlusIcon className="h-6 w-6 mr-2" />
            Add Department
          </button>
        </div>

        {/* Error Message - Keep this for initial load errors */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8 text-base">
            {error}
          </div>
        )}

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {departments.map((department) => (
            <div key={department.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center flex-1">
                    <div className="h-14 w-14 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BuildingOfficeIcon className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{department.name}</h3>
                      <p className="text-base text-orange-600 font-medium">{department.code}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditDepartment(department)}
                      className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Edit department"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(department.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete department"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {department.description && (
                  <p className="text-base text-gray-600 mb-6">{department.description}</p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-base text-gray-600">
                      {department._count?.users || 0} users
                    </span>
                  </div>
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-base text-gray-600">
                      {department._count?.cards || 0} cards
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-sm text-gray-500">
                  Updated: {new Date(department.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {departments.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🏢</div>
            <h3 className="text-2xl font-medium text-gray-900 mb-3">No departments yet</h3>
            <p className="text-lg text-gray-600 mb-8">Create your first department to get started</p>
            <button
              onClick={handleCreateDepartment}
              className="bg-orange-600 text-white px-8 py-4 rounded-lg hover:bg-orange-700 transition-colors font-medium text-base"
            >
              Create First Department
            </button>
          </div>
        )}

        {/* Bottom spacing */}
        <div className="h-32"></div>
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
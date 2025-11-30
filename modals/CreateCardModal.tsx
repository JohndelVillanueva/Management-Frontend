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
    departmentIds: number[] | 'ALL',
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
  { value: '.pdf', label: 'PDF Documents (.pdf)', icon: '📄' },
  { value: '.doc,.docx', label: 'Word Documents (.doc, .docx)', icon: '📝' },
  { value: '.xls,.xlsx', label: 'Excel Spreadsheets (.xls, .xlsx)', icon: '📊' },
  { value: '.ppt,.pptx', label: 'PowerPoint Presentations (.ppt, .pptx)', icon: '📈' },
  { value: 'image/*', label: 'Images (all formats)', icon: '🖼️' },
  { value: '.jpg,.jpeg,.png', label: 'Images (.jpg, .png)', icon: '📷' },
  { value: '.zip,.rar', label: 'Compressed Files (.zip, .rar)', icon: '📦' },
  { value: '.txt', label: 'Text Files (.txt)', icon: '📄' },
  { value: '*', label: 'All File Types', icon: '📎' }
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
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<number[]>([]);
  const [isAllDepartments, setIsAllDepartments] = useState(false);
  const [deptError, setDeptError] = useState('');
  const [, setHeadUsers] = useState<HeadUser[]>([]);
  const [, setSelectedHeadId] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [includeExpiration, setIncludeExpiration] = useState(false);
  const [userDepartmentInfo, setUserDepartmentInfo] = useState<Department | null>(null);
  const [allowedFileTypes, setAllowedFileTypes] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<'basic' | 'departments' | 'files' | 'settings'>('basic');
  const [completedSections, setCompletedSections] = useState({
    basic: false,
    departments: false,
    files: false,
    settings: true
  });
  const baseUrl: string = (import.meta as any).env?.VITE_API_URL ?? "";

  // Check if all required sections are completed
  const isFormComplete = completedSections.basic && completedSections.departments && completedSections.files;

  // Validate sections whenever relevant fields change
  useEffect(() => {
    // Basic Info validation
    const isBasicComplete = title.trim().length > 0;
    
    // Departments validation
    let isDepartmentsComplete = false;
    if (user_type === 'HEAD') {
      isDepartmentsComplete = user_department !== undefined;
    } else {
      isDepartmentsComplete = isAllDepartments || selectedDepartmentIds.length > 0;
    }
    
    // Files validation
    const isFilesComplete = allowedFileTypes.length > 0;

    setCompletedSections(prev => ({
      ...prev,
      basic: isBasicComplete,
      departments: isDepartmentsComplete,
      files: isFilesComplete
    }));
  }, [title, user_type, user_department, isAllDepartments, selectedDepartmentIds, allowedFileTypes]);

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
      setAllowedFileTypes([]);
      setActiveSection('basic');
      setCompletedSections({
        basic: false,
        departments: false,
        files: false,
        settings: true
      });

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
        fetch(`${baseUrl}/departments/${user_department}`, { headers })
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
            setSelectedDepartmentIds([user_department]);
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
        fetch(`${baseUrl}/departments`, { headers })
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
        
        // CHANGED: Removed head users fetch for ADMIN
        // No longer fetching head users for ADMIN users
      }
      
      // For HEAD users, clear head users list
      setHeadUsers([]);
      setSelectedHeadId(null);
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
      setSelectedDepartmentIds(selectedDepartmentIds.filter(id => id !== departmentId));
    } else {
      setSelectedDepartmentIds([...selectedDepartmentIds, departmentId]);
    }
  };

  const handleSelectAllDepartments = () => {
    if (isAllDepartments) {
      setIsAllDepartments(false);
      setSelectedDepartmentIds([]);
    } else {
      setIsAllDepartments(true);
      setSelectedDepartmentIds([]);
    }
  };

  const handleCreate = async () => {
    if (!isFormComplete) {
      toast.error('Please complete all required sections before creating the card');
      return;
    }

    if (!title.trim()) {
      toast.error('Card title is required');
      return;
    }
    
    let finalDepartmentSelection: number[] | 'ALL';
    
    if (user_type === 'HEAD') {
      finalDepartmentSelection = user_department ? [user_department] : [];
    } else {
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
    
    // Validate file types selection
    if (allowedFileTypes.length === 0) {
      toast.error('Please select at least one allowed file type');
      return;
    }
    
    // CHANGED: For ADMIN users, always set headId to null
    const finalHeadId = null;
    
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
      finalDepartmentSelection,
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
      setAllowedFileTypes([]);
      onClose();
    }
  };

  const handleFileTypeToggle = (value: string) => {
    if (value === '*') {
      // If "All File Types" is selected, clear other selections and select only this
      setAllowedFileTypes(['*']);
    } else {
      let newTypes = allowedFileTypes.filter(t => t !== '*');
      
      if (newTypes.includes(value)) {
        newTypes = newTypes.filter(t => t !== value);
        // Don't auto-select '*' when empty - let user choose explicitly
      } else {
        newTypes.push(value);
      }
      
      setAllowedFileTypes(newTypes);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const SectionButton = ({ section, icon, label }: { section: string, icon: string, label: string }) => (
    <button
      type="button"
      onClick={() => setActiveSection(section as any)}
      className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 relative ${
        activeSection === section
          ? 'bg-blue-600 text-white shadow-lg transform scale-105'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
      {completedSections[section as keyof typeof completedSections] && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </span>
      )}
    </button>
  );

  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      title="Create New Card"
      description="Complete all required sections to create your card"
      widthClassName="max-w-4xl"
      footer={(
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isFormComplete ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-600">
              {isFormComplete ? 'All sections completed' : 'Complete all sections to continue'}
            </span>
          </div>
          <div className="flex space-x-3">
            <button
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
              onClick={onClose}
              type="button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium flex items-center justify-center min-w-[120px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              onClick={handleCreate}
              type="button"
              disabled={!isFormComplete || loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Card'
              )}
            </button>
          </div>
        </div>
      )}
    >
      <div className="max-h-[70vh] overflow-y-auto">
        {/* Progress Indicator */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Progress</h3>
            <span className="text-xs text-gray-500">
              {Object.values(completedSections).filter(Boolean).length} of 4 sections completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${(Object.values(completedSections).filter(Boolean).length / 4) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <SectionButton section="basic" icon="📝" label="Basic Info" />
          <SectionButton section="departments" icon="🏢" label="Departments" />
          <SectionButton section="files" icon="📎" label="File Types" />
          <SectionButton section="settings" icon="⚙️" label="Settings" />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 text-lg mr-2">⚠️</span>
              <span className="text-red-700 text-sm font-medium">{error}</span>
            </div>
          </div>
        )}
        
        {deptError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 text-lg mr-2">⚠️</span>
              <span className="text-red-700 text-sm font-medium">{deptError}</span>
            </div>
          </div>
        )}

        {/* Basic Information Section */}
        {activeSection === 'basic' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <span className="text-blue-600 mr-2">📝</span>
                Card Information {completedSections.basic && <span className="ml-2 text-green-600 text-sm">✓ Completed</span>}
              </h3>
              <p className="text-sm text-gray-600">Provide the basic details for your new card.</p>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 flex items-center">
                <span className="text-blue-500 mr-2">🏷️</span>
                Card Title *
              </label>
              <p className="text-xs text-gray-500 mb-3">Use a clear, concise name for this card</p>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter card title..."
                disabled={loading}
              />
              {!completedSections.basic && (
                <p className="text-xs text-red-500 mt-2">Card title is required to complete this section</p>
              )}
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 flex items-center">
                <span className="text-blue-500 mr-2">📄</span>
                Description
              </label>
              <p className="text-xs text-gray-500 mb-3">Describe the purpose or scope of this card (optional)</p>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter description..."
                disabled={loading}
                rows={4}
              />
            </div>
          </div>
        )}

        {/* Departments Section */}
        {activeSection === 'departments' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <span className="text-green-600 mr-2">🏢</span>
                Department Assignment {completedSections.departments && <span className="ml-2 text-green-600 text-sm">✓ Completed</span>}
              </h3>
              <p className="text-sm text-gray-600">
                {user_type === 'HEAD' 
                  ? 'This card will be created for your department.' 
                  : 'Select departments that should have access to this card.'}
              </p>
            </div>

            {user_type === 'HEAD' ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">Your Department</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {userDepartmentInfo ? userDepartmentInfo.name : 'Loading department...'}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    Auto-assigned
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  As a department head, you can only create cards for your own department.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* ALL Departments option */}
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    isAllDepartments 
                      ? 'border-green-500 bg-green-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={handleSelectAllDepartments}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isAllDepartments ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}>
                      {isAllDepartments && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">📢 All Departments</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Make this card available to all departments in the system
                      </p>
                    </div>
                  </div>
                </div>

                {/* Individual department selection */}
                {!isAllDepartments && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-800 mb-3">Select Specific Departments *</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {departments.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No departments found</p>
                      ) : (
                        departments.map((dept) => (
                          <label key={dept.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200">
                            <input
                              type="checkbox"
                              checked={selectedDepartmentIds.includes(dept.id)}
                              onChange={() => handleDepartmentToggle(dept.id)}
                              disabled={loading}
                              className="rounded text-blue-600 focus:ring-blue-500 transform scale-110"
                            />
                            <span className="text-sm text-gray-700 font-medium">{dept.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                    {!completedSections.departments && (
                      <p className="text-xs text-red-500 mt-2">Select at least one department to complete this section</p>
                    )}
                  </div>
                )}

                {/* Selection summary */}
                <div className={`p-4 rounded-lg border ${
                  completedSections.departments 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center">
                    <span className={`text-lg mr-2 ${completedSections.departments ? 'text-green-600' : 'text-blue-600'}`}>
                      {completedSections.departments ? '✅' : 'ℹ️'}
                    </span>
                    <div>
                      <p className={`text-sm font-medium ${completedSections.departments ? 'text-green-800' : 'text-blue-800'}`}>
                        <strong>Selected:</strong> {
                          isAllDepartments 
                            ? 'All departments' 
                            : selectedDepartmentIds.length === 0 
                            ? 'No departments selected' 
                            : `${selectedDepartmentIds.length} department(s) selected`
                        }
                      </p>
                      {isAllDepartments && (
                        <p className="text-xs text-green-600 mt-1">
                          This card will be visible to all departments and staff members.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CHANGED: Removed Head user dropdown for ADMIN users */}
            {/* Only show head user dropdown for HEAD users */}
            {user_type === 'HEAD' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-blue-600 text-lg mr-2">💡</span>
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> As the department head, you will be automatically assigned as the head of this card.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* File Types Section */}
        {activeSection === 'files' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <span className="text-purple-600 mr-2">📎</span>
                Allowed File Types {completedSections.files && <span className="ml-2 text-green-600 text-sm">✓ Completed</span>}
              </h3>
              <p className="text-sm text-gray-600">Select which file types staff can submit for this card</p>
            </div>

            {/* Warning message when no file types are selected */}
            {allowedFileTypes.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-yellow-600 text-lg mr-2">⚠️</span>
                  <p className="text-sm text-yellow-800">
                    <strong>No file types selected.</strong> Please choose at least one file type to complete this section.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2">
              {FILE_TYPE_OPTIONS.map((option) => (
                <label 
                  key={option.value} 
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    allowedFileTypes.includes(option.value)
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={allowedFileTypes.includes(option.value)}
                    onChange={() => handleFileTypeToggle(option.value)}
                    disabled={loading}
                    className="rounded text-purple-600 focus:ring-purple-500 transform scale-110"
                  />
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700">{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
            
            <div className={`p-4 rounded-lg border ${
              completedSections.files 
                ? 'bg-green-50 border-green-200' 
                : 'bg-purple-50 border-purple-200'
            }`}>
              <div className="flex items-center">
                <span className={`text-lg mr-2 ${completedSections.files ? 'text-green-600' : 'text-purple-600'}`}>
                  {completedSections.files ? '✅' : '📋'}
                </span>
                <div>
                  <p className={`text-sm font-medium ${completedSections.files ? 'text-green-800' : 'text-purple-800'}`}>
                    <strong>Selected File Types:</strong> {
                      allowedFileTypes.length === 0 
                        ? 'No file types selected' 
                        : allowedFileTypes.includes('*') 
                          ? 'All file types allowed' 
                          : allowedFileTypes.map(type => type.replace(/,/g, ', ')).join(', ')
                    }
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {allowedFileTypes.length === 0 
                      ? 'You must select at least one file type to complete this section'
                      : 'Staff will only be able to submit files with the selected types'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Section */}
        {activeSection === 'settings' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <span className="text-orange-600 mr-2">⚙️</span>
                Card Settings
              </h3>
              <p className="text-sm text-gray-600">Configure additional settings for your card</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    id="includeExpiration"
                    checked={includeExpiration}
                    onChange={(e) => setIncludeExpiration(e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="includeExpiration" className="text-sm font-semibold text-gray-700 flex items-center">
                    <span className="text-orange-500 mr-2">⏰</span>
                    Set Expiration Date
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically expire this card after a specific date
                  </p>
                  
                  {includeExpiration && (
                    <div className="mt-4 space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
                      <input
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        min={today}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500">
                        The card will automatically expire and become unavailable after this date.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-blue-600 text-lg mr-3">💡</span>
                <div>
                  <h4 className="font-medium text-blue-800">Quick Tips</h4>
                  <ul className="text-xs text-blue-700 mt-2 space-y-1">
                    <li>• Use clear, descriptive titles for better organization</li>
                    <li>• Select specific file types to ensure submission quality</li>
                    <li>• Set expiration dates for time-sensitive cards</li>
                    <li>• Review all settings before creating the card</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
};

export default CreateCardModal;
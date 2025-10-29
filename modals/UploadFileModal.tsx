import React, { useState } from 'react';
import BaseModal from './BaseModal';

type UploadPayload = {
  file: File;
  title: string;
  description?: string;
};

type UploadFileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UploadPayload) => Promise<boolean>; // Change to return boolean
  uploading?: boolean;
  allowedFileTypes?: string[];
};

const UploadFileModal: React.FC<UploadFileModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  uploading = false,
  allowedFileTypes = ['*']
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileError, setFileError] = useState<string>('');

  const reset = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setFileError('');
  };

  const handleClose = () => {
    if (uploading) return;
    reset();
    onClose();
  };

  // Client-side file type validation
  const isFileTypeAllowed = (fileName: string, fileTypes: string[]): boolean => {
    if (fileTypes.includes('*')) return true;
    
    const fileExtension = '.' + fileName.split('.').pop()?.toLowerCase();
    
    return fileTypes.some(allowedType => {
      if (allowedType.includes(',')) {
        return allowedType.split(',').some(ext => ext.trim() === fileExtension);
      } else if (allowedType === 'image/*') {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
        return imageExtensions.includes(fileExtension || '');
      } else {
        return allowedType === fileExtension;
      }
    });
  };

  const validateFile = (selectedFile: File): boolean => {
    if (allowedFileTypes.includes('*')) {
      setFileError('');
      return true;
    }

    if (!isFileTypeAllowed(selectedFile.name, allowedFileTypes)) {
      const errorMessage = `File type not allowed. Please upload: ${formatAllowedFileTypes()}`;
      setFileError(errorMessage);
      return false;
    }

    setFileError('');
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      validateFile(selectedFile);
    } else {
      setFile(null);
      setFileError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation before submission
    if (!file) {
      setFileError('Please select a file to upload');
      return;
    }

    if (!title.trim()) {
      return;
    }

    // Validate file type before submitting
    if (!validateFile(file)) {
      return; // Don't submit if file type is invalid
    }

    try {
      const success = await onSubmit({ file, title, description });
      // Only reset and close if the upload was successful
      if (success) {
        reset();
        onClose();
      }
      // If success is false, the modal stays open and error is shown by parent component
    } catch (error) {
      console.error('Upload failed:', error);
      // Modal stays open on error
    }
  };

  // Format the allowed file types for display
  const formatAllowedFileTypes = () => {
    if (allowedFileTypes.includes('*')) {
      return 'All file types';
    }
    
    const formattedTypes = allowedFileTypes.map(type => {
      if (type === 'image/*') return 'Images (all formats)';
      if (type.includes(',')) {
        return type.split(',').map(ext => ext.trim().toUpperCase()).join(', ');
      }
      return type.toUpperCase();
    });
    
    return formattedTypes.join(', ');
  };

  // Get file icon and type info for preview
  const getFileInfo = () => {
    if (!file) return null;

    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const fileSize = (file.size / (1024 * 1024)).toFixed(2);

    let fileType = 'Document';
    let icon = '📄';
    
    if (file.type.startsWith('image/')) {
      fileType = 'Image';
      icon = '🖼️';
    } else if (file.type === 'application/pdf') {
      fileType = 'PDF';
      icon = '📄';
    } else if (file.type.includes('spreadsheet') || file.type.includes('excel') || 
               ['.xlsx', '.xls', '.csv'].includes('.' + fileExtension)) {
      fileType = 'Spreadsheet';
      icon = '📊';
    } else if (file.type.includes('word') || ['.doc', '.docx'].includes('.' + fileExtension)) {
      fileType = 'Document';
      icon = '📝';
    } else if (file.type.includes('presentation') || ['.ppt', '.pptx'].includes('.' + fileExtension)) {
      fileType = 'Presentation';
      icon = '📈';
    }

    return { icon, fileType, fileSize, fileExtension };
  };

  const fileInfo = getFileInfo();
  const isSubmitDisabled = uploading || !file || !title.trim() || !!fileError;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload File"
      description="Add a file to this card with a title and optional description."
      widthClassName="max-w-md"
      footer={(
        <>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="upload-file-form"
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitDisabled}
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </div>
            ) : (
              'Upload File'
            )}
          </button>
        </>
      )}
    >
      <form id="upload-file-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* File Upload Area */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              File *
            </label>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              FORMAT ACCEPT: {formatAllowedFileTypes()}
            </span>
          </div>
          
          {/* File Upload Zone */}
          <div className={`flex items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            fileError 
              ? 'border-red-300 bg-red-50 hover:bg-red-100' 
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}>
            <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className={`w-8 h-8 mb-3 ${
                  fileError ? 'text-red-400' : 'text-gray-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className={`mb-2 text-sm ${
                  fileError ? 'text-red-600' : 'text-gray-500'
                }`}>
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className={`text-xs ${
                  fileError ? 'text-red-500' : 'text-gray-500'
                }`}>
                  Supports: {formatAllowedFileTypes()}
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                required
              />
            </label>
          </div>
          
          {/* File Error Message */}
          {fileError && (
            <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {fileError}
            </div>
          )}
          
          {/* File Preview */}
          {file && fileInfo && (
            <div className={`mt-3 p-3 border rounded-lg ${
              fileError 
                ? 'bg-red-50 border-red-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{fileInfo.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    fileError ? 'text-red-800' : 'text-gray-900'
                  }`}>
                    {file.name}
                  </p>
                  <p className={`text-xs ${
                    fileError ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {fileInfo.fileType} • {fileInfo.fileSize} MB
                    {fileError && ' • Invalid format'}
                  </p>
                </div>
                {fileError && (
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setFileError('');
                    }}
                    className="text-red-500 hover:text-red-700 p-1 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            id="title"
            type="text"
            placeholder="Enter a descriptive title for this file"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-gray-400 text-sm font-normal">(optional)</span>
          </label>
          <textarea
            id="description"
            placeholder="Add context or notes about this file..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Help Text */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Note:</strong> The file type will be automatically detected from your upload. 
            {!allowedFileTypes.includes('*') && (
              <> Only <strong>{formatAllowedFileTypes().toLowerCase()}</strong> files are accepted for this card.</>
            )}
          </p>
        </div>
      </form>
    </BaseModal>
  );
};

export default UploadFileModal;
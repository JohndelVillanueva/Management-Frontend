import React, { useState } from 'react';
import BaseModal from './BaseModal';

type UploadPayload = {
  file: File;
  title: string;
  description?: string;
  type: string;
};

type UploadFileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UploadPayload) => Promise<void> | void;
  uploading?: boolean;
};

const UploadFileModal: React.FC<UploadFileModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  uploading = false,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Document');

  const reset = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setType('Document');
  };

  const handleClose = () => {
    if (uploading) return;
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !type) return;
    await onSubmit({ file, title, description, type });
    reset();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload New File"
      description="Select a file and add details before uploading to this card."
      widthClassName="max-w-lg"
      footer={(
        <>
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition-colors"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="upload-file-form"
            className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700 transition-colors"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </>
      )}
    >
      <form id="upload-file-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
          <input
            type="file"
            accept="*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
            }}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            placeholder="Enter file title"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
          <textarea
            placeholder="Enter description"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="Document">Document</option>
            <option value="Image">Image</option>
            <option value="PDF">PDF</option>
            <option value="Spreadsheet">Spreadsheet</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </form>
    </BaseModal>
  );
};

export default UploadFileModal;



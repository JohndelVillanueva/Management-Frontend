import React, { useEffect, useState } from "react";
import Modal from 'react-modal';
import { useParams, useNavigate} from "react-router-dom";


const SubmissionDetails = () => {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalFile, setModalFile] = useState<File | null>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalType, setModalType] = useState("Document");
  const navigate = useNavigate();
  const baseUrl: string = (import.meta as any).env?.VITE_API_URL ?? "";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch submission details
        const submissionRes = await fetch(`${baseUrl}/submission/details/${submissionId}`);
        if (!submissionRes.ok) throw new Error("Failed to fetch submission");
        const submissionData = await submissionRes.json();
        setSubmission(submissionData);

        // Fetch files for this card (by cardId)
        const filesRes = await fetch(`${baseUrl}/submission/${submissionData.card.id}/files`);
        if (filesRes.ok) {
          const filesData = await filesRes.json();
          setFiles(filesData);
        }
      } catch (err: any) {
        setError(err.message || "Error loading data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [submissionId]);

  // Handle modal file input
  const handleModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setModalFile(e.target.files[0]);
    }
  };

  const resetModal = () => {
    setModalFile(null);
    setModalTitle("");
    setModalDescription("");
    setModalType("Document");
  };

  // Handle modal submit
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalFile || !modalTitle || !modalType) {
      alert("Please fill in all required fields.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", modalFile);
      formData.append("title", modalTitle);
      formData.append("description", modalDescription || "");
      formData.append("type", modalType);
      if (submission?.card?.department?.id) {
        formData.append("departmentId", submission.card.department.id);
      }
      // Do not tie to specific submission; show files by cardId

      const response = await fetch(
        `${baseUrl}/submission/${submission.card.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Upload failed");
      }

      // Refresh files data for this card
      const filesRes = await fetch(`${baseUrl}/submission/${submission.card.id}/files`);
      if (filesRes.ok) {
        const filesData = await filesRes.json();
        setFiles(filesData);
      }
      
      setModalOpen(false);
      resetModal();
    } catch (err: any) {
      console.error("Submission error:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleModalClose = () => {
    if (!uploading) {
      setModalOpen(false);
      resetModal();
    }
  };

  const getFileIcon = (fileName: string, type: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (type === 'Image' || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension || '')) {
      return '🖼️';
    } else if (type === 'PDF' || extension === 'pdf') {
      return '📄';
    } else if (type === 'Spreadsheet' || ['xlsx', 'xls', 'csv'].includes(extension || '')) {
      return '📊';
    } else if (['doc', 'docx'].includes(extension || '')) {
      return '📝';
    } else if (['ppt', 'pptx'].includes(extension || '')) {
      return '📈';
    } else {
      return '📄';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-600 p-8">{error}</div>;
  if (!submission) return <div className="p-8">No submission found.</div>;

  return (
    <div className="flex bg-gray-100 h-screen w-full p-0 m-0 flex flex-col">
      {/* Fixed header with title */}
      <div className="flex items-center justify-between mb-4 p-6 bg-white shadow-sm border-b border-gray-200">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {submission.title || 'File Details'}
          </h1>
          <p className="text-sm text-gray-600">
            {submission.card?.department?.name || 'No Department'} • {submission.type} • {files.length} files
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            disabled={uploading}
          >
            + Upload File
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Card
          </button>
        </div>
      </div>

      {/* Modal for file submission */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={handleModalClose}
        style={customModalStyles}
        contentLabel="Upload File Modal"
      >
        <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
          <h3 className="text-lg font-bold mb-2">Upload New File</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
            <input
              type="file"
              accept="*"
              onChange={handleModalFileChange}
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
              value={modalTitle}
              onChange={(e) => setModalTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              placeholder="Enter description"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={modalDescription}
              onChange={(e) => setModalDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={modalType}
              onChange={(e) => setModalType(e.target.value)}
              required
            >
              <option value="Document">Document</option>
              <option value="Image">Image</option>
              <option value="PDF">PDF</option>
              <option value="Spreadsheet">Spreadsheet</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition-colors"
              onClick={handleModalClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700 transition-colors"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Google Drive-style file list */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm font-medium text-gray-500">
                  <th className="px-6 py-3">
                    <div className="flex items-center">
                      <span>Name</span>
                      <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3">Owner</th>
                  <th className="px-6 py-3">
                    <div className="flex items-center">
                      <span>Last modified</span>
                      <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3">File size</th>
                  <th className="px-6 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {files.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="text-4xl mb-4">📁</div>
                        <p className="text-lg font-medium">No files uploaded yet</p>
                        <p className="text-sm">Upload your first file to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  files.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-xl mr-3">
                            {getFileIcon(file.name, file.type)}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {file.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {file.type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center text-xs text-white mr-2">
                            {file.user?.first_name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-sm text-gray-900">
                            {file.user ? `${file.user.first_name} ${file.user.last_name}` : 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(file.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {file.size ? formatFileSize(file.size) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {file.path && (
                            <a
                              href={`http://localhost:3000${file.path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-600 hover:text-orange-800 p-1 rounded hover:bg-orange-50"
                              title="Download"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </a>
                          )}
                          <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal styles for ReactModal
const customModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    minWidth: "400px",
    maxWidth: "90vw",
    padding: "2rem",
    borderRadius: "0.5rem",
    border: "none",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
  },
};

Modal.setAppElement("#root");

export default SubmissionDetails;
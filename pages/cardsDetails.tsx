import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactModal from "react-modal";
import { DocumentTextIcon, UserIcon, CalendarIcon, DocumentIcon } from "@heroicons/react/24/outline";

// File upload button and logic will be added to the component below

const CardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Debug: Log the id parameter and current URL
  console.log('Card ID from params:', id);
  console.log('Current URL:', window.location.href);
  console.log('Pathname:', window.location.pathname);
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]); // Add this line

  // Add these at the top of your component
  console.log("Component rendering..."); // Debugging line

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch card details
        const cardRes = await fetch(`http://localhost:3000/cards/${id}`);
        if (cardRes.ok) {
          const cardData = await cardRes.json();
          setCard(cardData);
        }

        // Fetch submissions for this card
        const submissionsRes = await fetch(`http://localhost:3000/submission/${id}`);
        
        if (!submissionsRes.ok) throw new Error('Failed to fetch submissions');
  
        const submissionsData = await submissionsRes.json();
        setSubmissions(submissionsData);
      } catch (err) {
        setError(err.message || 'Error loading data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);

  // File upload state and ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFile, setModalFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Document");

  // Helper to trigger file input
  const handleUploadClick = () => {
    setModalOpen(true);
  };

  // Handle modal file input
  const handleModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setModalFile(e.target.files[0]);
    }
  };
  const resetModal = () => {
    setModalFile(null);
    setTitle("");
    setDescription("");
    setType("Document");
  };

  // Handle modal submit
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalFile || !title || !type) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!id) {
      alert("Card ID is missing. Please refresh the page and try again.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", modalFile);
      formData.append("title", title);
      formData.append("description", description || "");
      formData.append("type", type);
      if (card?.department?.id) {
        formData.append("departmentId", card.department.id);
      }

      console.log('Submitting to card ID:', id);
      const response = await fetch(
        `http://localhost:3000/submission/${id}`,
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

      // Refresh data
      const res = await fetch(`http://localhost:3000/submission/${id}`);
      const data = await res.json();
      setSubmissions(data);
      setModalOpen(false);
      resetModal();
    } catch (err) {
      console.error("Submission error:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleModalClose = () => {
    if (!uploading) {
      setModalOpen(false);
      setModalFile(null);
      setTitle("");
      setDescription("");
      setType("Document");
    }
  };

  const departmentName = card?.department?.name || "Department";
  const files = card?.files || [];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {card?.title || 'Card Details'}
            </h1>
            <p className="text-gray-600">
              {card?.department?.name || 'No Department'} • {submissions.length} submissions
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            + Submit File
          </button>
        </div>

        {/* Card Description */}
        {card?.description && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed">{card.description}</p>
          </div>
        )}

        {/* Submissions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
              onClick={() => navigate(`/submission/${submission.id}`)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <DocumentTextIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        {submission.title || 'Untitled Submission'}
                      </h3>
                      <p className="text-xs text-gray-500">{submission.type}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <UserIcon className="h-4 w-4 mr-2" />
                    <span>
                      {submission.user ? `${submission.user.first_name} ${submission.user.last_name}` : 'Unknown User'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DocumentIcon className="h-4 w-4 mr-2" />
                    <span>{submission.files?.length || 0} files</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {submissions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
            <p className="text-gray-600 mb-6">Be the first to submit a file for this card</p>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Submit First File
            </button>
          </div>
        )}
      </div>

      {/* File Upload Modal */}
      <ReactModal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        style={customModalStyles}
        contentLabel="Upload File Modal"
      >
        <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
          <h3 className="text-lg font-bold mb-2">Submit New File</h3>
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
              placeholder="Enter submission title"
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
          <div className="flex gap-2 justify-end mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition-colors"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700 transition-colors"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Submit"}
            </button>
          </div>
        </form>
      </ReactModal>
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
    minWidth: "350px",
    maxWidth: "90vw",
    padding: "2rem",
    borderRadius: "0.5rem",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
  },
};
ReactModal.setAppElement("#root");

export default CardDetails;

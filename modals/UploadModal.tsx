import React, { useState } from "react";
import ReactModal from "react-modal";

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

interface UploadModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmissionSuccess: () => void;
  cardId?: string;
  departmentId?: string;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onRequestClose,
  onSubmissionSuccess,
  cardId,
  departmentId,
}) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Document");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDescription("");
    setType("Document");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !type || !cardId) {
      alert("Please fill in all required fields.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description || "");
      formData.append("type", type);
      if (departmentId) {
        formData.append("departmentId", departmentId);
      }

      const response = await fetch(
        `http://localhost:3000/submission/${cardId}`,
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

      onSubmissionSuccess();
      resetForm();
    } catch (err) {
      console.error("Submission error:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customModalStyles}
      contentLabel="Upload File Modal"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h3 className="text-lg font-bold mb-2">Submit New File</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
          <input
            type="file"
            accept="*"
            onChange={handleFileChange}
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
            onClick={onRequestClose}
            disabled={uploading}
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
  );
};

export default UploadModal;
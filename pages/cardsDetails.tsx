import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowUpTrayIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import UploadFileModal from "../modals/UploadFileModal";

const CardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  console.log('Card ID from params:', id);
  console.log('Current URL:', window.location.href);
  console.log('Pathname:', window.location.pathname);
  
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Removed submissions; only showing files list
  const [modalOpen, setModalOpen] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  // Filters and sorting
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "size">("recent");

  console.log("Component rendering...");

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

        // Fetch files for this card
        const filesRes = await fetch(`http://localhost:3000/submission/${id}/files`);
        if (filesRes.ok) {
          const filesData = await filesRes.json();
          setFiles(filesData);
        }
      } catch (err) {
        setError(err.message || 'Error loading data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);

  const handleUpload = async ({ file, title, description, type }: { file: File; title: string; description?: string; type: string; }) => {
    if (!id) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description || "");
      formData.append("type", type);
      if (card?.department?.id) {
        formData.append("departmentId", card.department.id);
      }

      const response = await fetch(`http://localhost:3000/submission/${id}`,
        { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, body: formData }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Upload failed");
      const filesRes = await fetch(`http://localhost:3000/submission/${id}/files`);
      if (filesRes.ok) setFiles(await filesRes.json());
      setModalOpen(false);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileName: string, type: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (type === 'Image' || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension || '')) return '🖼️';
    if (type === 'PDF' || extension === 'pdf') return '📄';
    if (type === 'Spreadsheet' || ['xlsx', 'xls', 'csv'].includes(extension || '')) return '📊';
    if (['doc', 'docx'].includes(extension || '')) return '📝';
    if (['ppt', 'pptx'].includes(extension || '')) return '📈';
    return '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const departmentName = card?.department?.name || "Department";

  // Available file types for filter dropdown
  const typeOptions = useMemo(() => {
    const set = new Set<string>();
    files.forEach((f) => {
      if (f?.type) set.add(String(f.type));
    });
    return Array.from(set).sort();
  }, [files]);

  // Filtered and sorted files
  const filteredFiles = useMemo(() => {
    let list = files.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((f) => {
        const name = String(f?.name || "").toLowerCase();
        const type = String(f?.type || "").toLowerCase();
        const owner = `${f?.user?.first_name || ""} ${f?.user?.last_name || ""}`.toLowerCase();
        return name.includes(q) || type.includes(q) || owner.includes(q);
      });
    }
    if (typeFilter !== "all") {
      list = list.filter((f) => String(f?.type || "") === typeFilter);
    }
    if (sortBy === "name") {
      list.sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
    } else if (sortBy === "size") {
      list.sort((a, b) => (b?.size || 0) - (a?.size || 0));
    } else {
      // recent by updatedAt desc
      list.sort((a, b) => new Date(b?.updatedAt || 0).getTime() - new Date(a?.updatedAt || 0).getTime());
    }
    return list;
  }, [files, query, typeFilter, sortBy]);

  return (
    <div className="flex bg-gray-100 h-screen w-full p-0 m-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 p-6 bg-white shadow-sm border-b border-gray-200">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {card?.title || 'Card Files'}
          </h1>
          <p className="text-sm text-gray-600">
            {card?.department?.name || 'No Department'} • {files.length} files
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700 transition-colors"
            aria-label="Upload file"
            disabled={uploading}
          >
            <ArrowUpTrayIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 mb-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-72 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
          />
          <div className="flex gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="all">All Types</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="recent">Most Recent</option>
              <option value="name">Name (A-Z)</option>
              <option value="size">Size (Largest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* File list */}
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
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3">File size</th>
                  <th className="px-6 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFiles.length === 0 ? (
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
                  filteredFiles.map((file) => (
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
                              download
                              className="text-orange-600 hover:text-orange-800 p-1 rounded hover:bg-orange-50"
                              title="Download"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </a>
                          )}
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

      {/* Upload modal */}
      <UploadFileModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleUpload} uploading={uploading} />
    </div>
  );
};
// Modal handled inside UploadFileModal

export default CardDetails;
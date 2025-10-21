import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowUpTrayIcon, 
  ArrowLeftIcon, 
  EyeIcon, 
  DocumentArrowDownIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import UploadFileModal from "../modals/UploadFileModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  console.log('Card ID from params:', id);
  console.log('Current URL:', window.location.href);
  console.log('Pathname:', window.location.pathname);
  
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "size" | "owner">("recent");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  console.log("Component rendering...");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch card details - files are included in the card response
        const cardRes = await fetch(`http://localhost:3000/cards/${id}`);
        if (cardRes.ok) {
          const cardData = await cardRes.json();
          console.log('Card data received:', cardData);
          setCard(cardData);
          
          // Files are included in the card response under 'files' property
          if (cardData.files && Array.isArray(cardData.files)) {
            setFiles(cardData.files);
          } else {
            setFiles([]);
          }
        } else {
          const errorText = await cardRes.text();
          console.error('Error fetching card:', errorText);
          setError('Failed to load card details');
          toast.error('Failed to load card details');
        }
      } catch (err: any) {
        console.error('Error in fetchData:', err);
        setError(err.message || 'Error loading data');
        toast.error(err.message || 'Error loading data');
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

      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // PROPER ENDPOINT: Based on your backend route configuration
      // Your route is POST /submissions/:id
      const response = await fetch(`http://localhost:3000/submissions/${id}`, {
        method: "POST", 
        headers,
        body: formData 
      });
      
      if (!response.ok) {
        let errorText;
        try {
          const errorData = await response.json();
          errorText = errorData.error || errorData.details || response.statusText;
        } catch {
          errorText = await response.text();
        }
        throw new Error(errorText || `Upload failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Upload successful:', result);
      
      // Show success toast
      toast.success('File uploaded successfully!');
      
      // Refresh the card data to get updated files
      const cardRes = await fetch(`http://localhost:3000/cards/${id}`);
      if (cardRes.ok) {
        const cardData = await cardRes.json();
        setCard(cardData);
        if (cardData.files && Array.isArray(cardData.files)) {
          setFiles(cardData.files);
        }
      }
      
      setModalOpen(false);
    } catch (err: any) {
      console.error('Upload error:', err);
      // Show error toast instead of alert
      toast.error(`Upload failed: ${err.message}`);
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

  // Available file types for filter dropdown
  const typeOptions = useMemo(() => {
    const set = new Set<string>();
    files.forEach((f) => {
      if (f?.type) set.add(String(f.type));
    });
    return Array.from(set).sort();
  }, [files]);

  // Handle sorting
  const handleSort = (column: "recent" | "name" | "size" | "owner") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  // Filtered and sorted files
  const filteredFiles = useMemo(() => {
    let list = files.slice();
    
    // Apply search filter
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((f) => {
        const name = String(f?.name || "").toLowerCase();
        const type = String(f?.type || "").toLowerCase();
        const owner = `${f?.user?.first_name || ""} ${f?.user?.last_name || ""}`.toLowerCase();
        return name.includes(q) || type.includes(q) || owner.includes(q);
      });
    }
    
    // Apply type filter
    if (typeFilter !== "all") {
      list = list.filter((f) => String(f?.type || "") === typeFilter);
    }
    
    // Apply sorting
    list.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = String(a?.name || "").localeCompare(String(b?.name || ""));
          break;
        case "size":
          comparison = (a?.size || 0) - (b?.size || 0);
          break;
        case "owner":
          const ownerA = `${a?.user?.first_name || ""} ${a?.user?.last_name || ""}`;
          const ownerB = `${b?.user?.first_name || ""} ${b?.user?.last_name || ""}`;
          comparison = ownerA.localeCompare(ownerB);
          break;
        case "recent":
        default:
          comparison = new Date(a?.updatedAt || 0).getTime() - new Date(b?.updatedAt || 0).getTime();
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
    
    return list;
  }, [files, query, typeFilter, sortBy, sortDirection]);

  // Handle file download/view
  const handleFileAction = async (fileId: number, action: 'view' | 'download') => {
    try {
      // Since files are included in the card response, we can use the file path directly
      const file = files.find(f => f.id === fileId);
      if (!file || !file.path) {
        toast.error('File path not found');
        return;
      }

      const fileUrl = `http://localhost:3000${file.path}`;
      
      if (action === 'view') {
        window.open(fileUrl, '_blank');
      } else if (action === 'download') {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started');
      }
    } catch (err) {
      console.error('File action error:', err);
      toast.error('Error accessing file');
    }
  };

  if (loading) {
    return (
      <div className="flex bg-gray-100 h-screen w-full p-0 m-0 flex flex-col">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading card details...</p>
          </div>
        </div>
        <ToastContainer position="bottom-right" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-gray-100 h-screen w-full p-0 m-0 flex flex-col">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">Error</div>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={() => navigate('/cards')}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Back to Cards
            </button>
          </div>
        </div>
        <ToastContainer position="bottom-right" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex bg-gray-100 h-screen w-full p-0 m-0 flex flex-col">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-700 mb-4">Card not found</p>
            <button
              onClick={() => navigate('/cards')}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Back to Cards
            </button>
          </div>
        </div>
        <ToastContainer position="bottom-right" />
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 h-screen w-full p-0 m-0 flex flex-col">
      {/* Toast Container */}
      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 p-6 bg-white shadow-sm border-b border-gray-200">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {card.title}
          </h1>
          <p className="text-sm text-gray-600">
            {card.department?.name || 'No Department'} • {files.length} files
            {card.description && (
              <span className="ml-4 text-gray-500">• {card.description}</span>
            )}
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
            onClick={() => navigate('/cards')}
            className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Rest of your component remains the same... */}
      {/* Controls */}
      <div className="px-6 mb-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files, types, or owners..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-orange-50 border-orange-200 text-orange-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FunnelIcon className="h-4 w-4" />
                Filters
              </button>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {filteredFiles.length} of {files.length} files
                </span>
              </div>
            </div>
          </div>
          
          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Type:</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Types</option>
                    {typeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="size">Size (Largest)</option>
                    <option value="owner">Owner (A-Z)</option>
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setQuery("");
                    setTypeFilter("all");
                    setSortBy("recent");
                    setSortDirection("desc");
                  }}
                  className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File list */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-5">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                >
                  <span>Name</span>
                  {sortBy === "name" ? (
                    sortDirection === "asc" ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="col-span-2">
                <button
                  onClick={() => handleSort("owner")}
                  className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                >
                  <span>Owner</span>
                  {sortBy === "owner" ? (
                    sortDirection === "asc" ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="col-span-2">
                <button
                  onClick={() => handleSort("recent")}
                  className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                >
                  <span>Modified</span>
                  {sortBy === "recent" ? (
                    sortDirection === "asc" ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="col-span-2">
                <button
                  onClick={() => handleSort("size")}
                  className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                >
                  <span>Size</span>
                  {sortBy === "size" ? (
                    sortDirection === "asc" ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {filteredFiles.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <div className="text-6xl mb-4">📁</div>
                  <p className="text-lg font-medium mb-2">
                    {query || typeFilter !== "all" ? "No files match your filters" : "No files uploaded yet"}
                  </p>
                  <p className="text-sm">
                    {query || typeFilter !== "all" 
                      ? "Try adjusting your search or filters" 
                      : "Upload your first file to get started"
                    }
                  </p>
                </div>
              </div>
            ) : (
              filteredFiles.map((file) => (
                <div key={file.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  {/* File Name & Type */}
                  <div className="col-span-5 flex items-center">
                    <div className="flex items-center min-w-0 flex-1">
                      <span className="text-2xl mr-3 flex-shrink-0">
                        {getFileIcon(file.name, file.type)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {file.type}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="col-span-2 flex items-center">
                    <div className="flex items-center min-w-0">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xs font-medium text-white mr-3 flex-shrink-0">
                        {file.user?.first_name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm text-gray-900 truncate">
                          {file.user ? `${file.user.first_name} ${file.user.last_name}` : 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modified Date */}
                  <div className="col-span-2 flex items-center">
                    <div className="text-sm text-gray-900">
                      {new Date(file.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* File Size */}
                  <div className="col-span-2 flex items-center">
                    <div className="text-sm text-gray-900">
                      {file.size ? formatFileSize(file.size) : '—'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="flex items-center space-x-1">
                      {file.path && (
                        <>
                          <button
                            onClick={() => handleFileAction(file.id, 'view')}
                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="View file"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleFileAction(file.id, 'download')}
                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Download file"
                          >
                            <DocumentArrowDownIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Upload modal */}
      <UploadFileModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleUpload} uploading={uploading} />
    </div>
  );
};

export default CardDetails;
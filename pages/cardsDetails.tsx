import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowUpTrayIcon, 
  ArrowLeftIcon, 
  EyeIcon, 
  DocumentArrowDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import UploadFileModal from "../modals/UploadFileModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
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

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const cardRes = await fetch(`http://localhost:3000/cards/${id}`);
        if (cardRes.ok) {
          const cardData = await cardRes.json();
          console.log('Card data received:', cardData);
          setCard(cardData);
          
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

  const handleUpload = async (uploadData: { file: File; title: string; description?: string }): Promise<boolean> => {
    if (!id) return false;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadData.file);
      formData.append("title", uploadData.title);
      formData.append("description", uploadData.description || "");
      formData.append("type", "Document");
      if (card?.department?.id) {
        formData.append("departmentId", card.department.id);
      }

      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

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
      
      return true;
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(`Upload failed: ${err.message}`);
      return false;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading card details...</p>
        </div>
        <ToastContainer position="bottom-right" />
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-700 mb-4">{error || 'Card not found'}</p>
          <button
            onClick={() => navigate('/cards')}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm"
          >
            Back to Cards
          </button>
        </div>
        <ToastContainer position="bottom-right" />
      </div>
    );
  }

  return (
    <div>
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
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => navigate('/cards')}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                >
                  <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm font-medium">Back to Cards</span>
                </button>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <DocumentTextIcon className="h-8 w-8 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {card.title}
                  </h1>
                  <p className="text-lg text-gray-600 mb-4 max-w-3xl">
                    {card.description || 'No description provided'}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span className="font-medium text-gray-700">{card.department?.name || 'No Department'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Created {formatDate(card.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{files.length} files</span>
                    </div>
                    {card.head && (
                      <div className="flex items-center gap-2">
                        <span>Head: {card.head.first_name} {card.head.last_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploading}
              >
                <ArrowUpTrayIcon className="h-5 w-5" />
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search files, types, or owners..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              />
            </div>
            
            {/* Filter Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  showFilters 
                    ? 'bg-orange-50 border-orange-200 text-orange-700 shadow-sm' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                <FunnelIcon className="h-5 w-5" />
                <span className="font-medium">Filters</span>
              </button>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="font-medium text-gray-900">{filteredFiles.length}</span> of <span className="font-medium text-gray-900">{files.length}</span> files
                </div>
              </div>
            </div>
          </div>
          
          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">File Type:</label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    >
                      <option value="all">All Types</option>
                      {typeOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="size">Size (Largest)</option>
                      <option value="owner">Owner (A-Z)</option>
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setQuery("");
                    setTypeFilter("all");
                    setSortBy("recent");
                    setSortDirection("desc");
                  }}
                  className="text-sm text-orange-600 hover:text-orange-800 font-medium px-4 py-2 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* File list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-6 px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
              <div className="col-span-5">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-2 hover:text-gray-900 transition-colors group"
                >
                  <span>Name</span>
                  {sortBy === "name" ? (
                    sortDirection === "asc" ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )
                  ) : (
                    <ChevronUpIcon className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                  )}
                </button>
              </div>
              <div className="col-span-2">
                <button
                  onClick={() => handleSort("owner")}
                  className="flex items-center gap-2 hover:text-gray-900 transition-colors group"
                >
                  <span>Owner</span>
                  {sortBy === "owner" ? (
                    sortDirection === "asc" ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )
                  ) : (
                    <ChevronUpIcon className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                  )}
                </button>
              </div>
              <div className="col-span-2">
                <button
                  onClick={() => handleSort("recent")}
                  className="flex items-center gap-2 hover:text-gray-900 transition-colors group"
                >
                  <span>Modified</span>
                  {sortBy === "recent" ? (
                    sortDirection === "asc" ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )
                  ) : (
                    <ChevronUpIcon className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                  )}
                </button>
              </div>
              <div className="col-span-2">
                <button
                  onClick={() => handleSort("size")}
                  className="flex items-center gap-2 hover:text-gray-900 transition-colors group"
                >
                  <span>Size</span>
                  {sortBy === "size" ? (
                    sortDirection === "asc" ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )
                  ) : (
                    <ChevronUpIcon className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                  )}
                </button>
              </div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {filteredFiles.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="flex flex-col items-center">
                  <div className="text-6xl mb-6">📁</div>
                  <p className="text-xl font-medium text-gray-900 mb-3">
                    {query || typeFilter !== "all" ? "No files match your filters" : "No files uploaded yet"}
                  </p>
                  <p className="text-gray-600 mb-6 max-w-md">
                    {query || typeFilter !== "all" 
                      ? "Try adjusting your search or filters to find what you're looking for." 
                      : "Get started by uploading your first file to this card."
                    }
                  </p>
                  {(query || typeFilter !== "all") ? (
                    <button
                      onClick={() => {
                        setQuery("");
                        setTypeFilter("all");
                      }}
                      className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                    >
                      Clear filters
                    </button>
                  ) : (
                    <button
                      onClick={() => setModalOpen(true)}
                      className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                    >
                      Upload First File
                    </button>
                  )}
                </div>
              </div>
            ) : (
              filteredFiles.map((file) => (
                <div key={file.id} className="grid grid-cols-12 gap-6 px-6 py-4 hover:bg-gray-50 transition-colors group">
                  {/* File Name & Type */}
                  <div className="col-span-5 flex items-center">
                    <div className="flex items-center min-w-0 flex-1">
                      <span className="text-3xl mr-4 flex-shrink-0 group-hover:scale-110 transition-transform">
                        {getFileIcon(file.name, file.type)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-base font-semibold text-gray-900 truncate">
                          {file.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {file.type}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="col-span-2 flex items-center">
                    <div className="flex items-center min-w-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-sm font-semibold text-white mr-3 flex-shrink-0 shadow-sm">
                        {file.user?.first_name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {file.user ? `${file.user.first_name} ${file.user.last_name}` : 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modified Date */}
                  <div className="col-span-2 flex items-center">
                    <div className="text-sm text-gray-900 font-medium">
                      {formatDate(file.updatedAt)}
                    </div>
                  </div>

                  {/* File Size */}
                  <div className="col-span-2 flex items-center">
                    <div className="text-sm text-gray-900 font-medium">
                      {file.size ? formatFileSize(file.size) : '—'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      {file.path && (
                        <>
                          <button
                            onClick={() => handleFileAction(file.id, 'view')}
                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                            title="View file"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleFileAction(file.id, 'download')}
                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                            title="Download file"
                          >
                            <DocumentArrowDownIcon className="h-5 w-5" />
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
      <UploadFileModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSubmit={handleUpload} 
        uploading={uploading}
        allowedFileTypes={card?.allowedFileTypes ? card.allowedFileTypes.split(',') : ['*']}
      />
    </div>
  );
};

export default CardDetails;
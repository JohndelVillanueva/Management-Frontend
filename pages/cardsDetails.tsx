import { useEffect, useMemo, useState } from "react";
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
  UserIcon,
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
  const [sortBy, setSortBy] = useState<"recent" | "name" | "size" | "owner">(
    "recent"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showOnlyMyFiles, setShowOnlyMyFiles] = useState(false);
  const baseUrl: string = (import.meta as any).env?.VITE_API_URL ?? "";

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${baseUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log("Raw /auth/me response:", responseData);

          // Try to extract user data from different possible structures
          let userData = responseData;

          // If response has a 'user' property, use that
          if (responseData.user && typeof responseData.user === "object") {
            userData = responseData.user;
            console.log("Extracted user from response.user:", userData);
          }
          // If response has a 'data' property (common pattern)
          else if (responseData.data && typeof responseData.data === "object") {
            userData = responseData.data;
            console.log("Extracted user from response.data:", userData);
          }

          // Log the final user data structure
          console.log("Setting current user data:", {
            id: userData.id,
            email: userData.email,
            // Check for different naming conventions
            first_name: userData.first_name,
            firstName: userData.firstName,
            last_name: userData.last_name,
            lastName: userData.lastName,
            fullData: userData,
          });

          // Set the current user with proper field mapping
          setCurrentUser({
            id: userData.id,
            email: userData.email,
            // Try different field name patterns
            first_name: userData.first_name || userData.firstName,
            last_name: userData.last_name || userData.lastName,
            // Also check for camelCase versions
            firstName: userData.firstName || userData.first_name,
            lastName: userData.lastName || userData.last_name,
            ...userData, // Include any other properties
          });

          // Also check token payload as backup
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            console.log("Token payload:", payload);

            // If /auth/me doesn't provide name data, use token payload
            if (
              !userData.first_name &&
              !userData.firstName &&
              (payload.first_name || payload.firstName)
            ) {
              console.log("Using name from token payload");
              setCurrentUser((prev: any) => ({
                ...prev,
                first_name: payload.first_name || payload.firstName,
                last_name: payload.last_name || payload.lastName,
                firstName: payload.firstName || payload.first_name,
                lastName: payload.lastName || payload.last_name,
              }));
            }
          } catch (e) {
            console.log("Could not decode token");
          }
        } else {
          console.error("Failed to fetch /auth/me:", response.status);
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    fetchCurrentUser();
  }, [baseUrl]);

  const isCurrentUsersFile = (file: any): boolean => {
    if (!currentUser || !file.user) return false;

    // Try multiple ways to match the user
    // 1. Direct ID match
    if (file.user.id && currentUser.id && file.user.id === currentUser.id) {
      return true;
    }

    // 2. Email match (fallback)
    if (
      file.user.email &&
      currentUser.email &&
      file.user.email.toLowerCase() === currentUser.email.toLowerCase()
    ) {
      return true;
    }

    // 3. Name match (fallback)
    const fileUserName = `${file.user.first_name || ""} ${
      file.user.last_name || ""
    }`
      .toLowerCase()
      .trim();
    const currentUserName = `${currentUser.first_name || ""} ${
      currentUser.last_name || ""
    }`
      .toLowerCase()
      .trim();
    if (fileUserName && currentUserName && fileUserName === currentUserName) {
      return true;
    }

    return false;
  };

  // Helper to get display name for file owner
  const getOwnerDisplayName = (file: any): string => {
    if (!file.user) return "Unknown User";

    const isCurrentUser = isCurrentUsersFile(file);

    if (isCurrentUser) {
      return "You";
    }

    // Just return the name without any "(You)" suffix
    return `${file.user.first_name || ""} ${file.user.last_name || ""}`.trim();
  };

  // Helper to get initials for avatar
  const getOwnerInitials = (file: any): string => {
    if (isCurrentUsersFile(file)) {
      return "You";
    }

    if (!file.user) return "U";

    const first = file.user.first_name?.charAt(0) || "";
    const last = file.user.last_name?.charAt(0) || "";

    return (first + last).toUpperCase() || "U";
  };

  // Helper to get avatar color based on user
  const getOwnerAvatarColor = (file: any): string => {
    if (isCurrentUsersFile(file)) {
      return "bg-gradient-to-br from-orange-500 to-orange-700"; // Highlight current user
    }

    // Default color for other users
    return "bg-gradient-to-br from-gray-400 to-gray-600";
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Option 1: Fetch card with files including user data
        const cardRes = await fetch(
          `${baseUrl}/cards/${id}?include=files.user`
        );

        if (cardRes.ok) {
          const cardData = await cardRes.json();
          console.log("First file user data for debugging:", {
            fileUserId: cardData.files?.[0]?.user?.id,
            fileUserEmail: cardData.files?.[0]?.user?.email,
            fileUserName: `${cardData.files?.[0]?.user?.first_name || ""} ${
              cardData.files?.[0]?.user?.last_name || ""
            }`,
            fileUserData: cardData.files?.[0]?.user,
          });

          // Process the card data
          const processedCard = {
            ...cardData,
            displayDepartment:
              cardData.departments && cardData.departments.length > 0
                ? cardData.departments[0].department
                : null,
            departmentNames:
              cardData.departments && cardData.departments.length > 0
                ? cardData.departments
                    .map((cd: any) => cd.department.name)
                    .join(", ")
                : "No Department",
          };

          setCard(processedCard);

          if (cardData.files && Array.isArray(cardData.files)) {
            setFiles(cardData.files);
          } else {
            setFiles([]);
          }
        } else {
          const errorText = await cardRes.text();
          console.error("Error fetching card:", errorText);
          setError("Failed to load card details");
          toast.error("Failed to load card details");
        }
      } catch (err: any) {
        console.error("Error in fetchData:", err);
        setError(err.message || "Error loading data");
        toast.error(err.message || "Error loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUpload = async (uploadData: {
    file: File;
    title: string;
    description?: string;
  }): Promise<boolean> => {
    if (!id) return false;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadData.file);
      formData.append("title", uploadData.title);
      formData.append("description", uploadData.description || "");
      formData.append("type", "Document");

      // Use the first department for submission if available
      if (card?.displayDepartment?.id) {
        formData.append("departmentId", card.displayDepartment.id);
      }

      const token = localStorage.getItem("token");
      const headers: HeadersInit = {};

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${baseUrl}/submissions/${id}`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        let errorText;
        try {
          const errorData = await response.json();
          errorText =
            errorData.error || errorData.details || response.statusText;
        } catch {
          errorText = await response.text();
        }
        throw new Error(
          errorText || `Upload failed with status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Upload successful:", result);

      toast.success("File uploaded successfully!");

      // Refresh the card data to get updated files
      const cardRes = await fetch(`${baseUrl}/cards/${id}`);
      if (cardRes.ok) {
        const cardData = await cardRes.json();

        // Process the card data again
        const processedCard = {
          ...cardData,
          displayDepartment:
            cardData.departments && cardData.departments.length > 0
              ? cardData.departments[0].department
              : null,
          departmentNames:
            cardData.departments && cardData.departments.length > 0
              ? cardData.departments
                  .map((cd: any) => cd.department.name)
                  .join(", ")
              : "No Department",
        };

        setCard(processedCard);
        if (cardData.files && Array.isArray(cardData.files)) {
          setFiles(cardData.files);
        }
      }

      return true;
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(`Upload failed: ${err.message}`);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileName: string, type: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (
      type === "Image" ||
      ["jpg", "jpeg", "png", "gif", "bmp", "svg"].includes(extension || "")
    )
      return "🖼️";
    if (type === "PDF" || extension === "pdf") return "📄";
    if (
      type === "Spreadsheet" ||
      ["xlsx", "xls", "csv"].includes(extension || "")
    )
      return "📊";
    if (["doc", "docx"].includes(extension || "")) return "📝";
    if (["ppt", "pptx"].includes(extension || "")) return "📈";
    return "📄";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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

    // Filter by current user's files if enabled
    if (showOnlyMyFiles && currentUser) {
      list = list.filter(
        (file) =>
          file.user &&
          // Check all possible matching methods
          ((file.user.id &&
            currentUser.id &&
            file.user.id === currentUser.id) ||
            (file.user.email &&
              currentUser.email &&
              file.user.email.toLowerCase() ===
                currentUser.email.toLowerCase()) ||
            (file.user.first_name &&
              file.user.last_name &&
              currentUser.first_name &&
              currentUser.last_name &&
              `${file.user.first_name} ${file.user.last_name}`.toLowerCase() ===
                `${currentUser.first_name} ${currentUser.last_name}`.toLowerCase()))
      );
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((f) => {
        const name = String(f?.name || "").toLowerCase();
        const type = String(f?.type || "").toLowerCase();
        const owner = `${f?.user?.first_name || ""} ${
          f?.user?.last_name || ""
        }`.toLowerCase();
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
          comparison = String(a?.name || "").localeCompare(
            String(b?.name || "")
          );
          break;
        case "size":
          comparison = (a?.size || 0) - (b?.size || 0);
          break;
        case "owner":
          const ownerA = `${a?.user?.first_name || ""} ${
            a?.user?.last_name || ""
          }`;
          const ownerB = `${b?.user?.first_name || ""} ${
            b?.user?.last_name || ""
          }`;
          comparison = ownerA.localeCompare(ownerB);
          break;
        case "recent":
        default:
          comparison =
            new Date(a?.updatedAt || 0).getTime() -
            new Date(b?.updatedAt || 0).getTime();
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return list;
  }, [
    files,
    query,
    typeFilter,
    sortBy,
    sortDirection,
    showOnlyMyFiles,
    currentUser,
  ]);

  // Handle file download/view
  const handleFileAction = async (
    fileId: number,
    action: "view" | "download"
  ) => {
    try {
      const file = files.find((f) => f.id === fileId);
      if (!file || !file.path) {
        toast.error("File path not found");
        return;
      }

      const fileUrl = `${baseUrl}${file.path}`;

      if (action === "view") {
        window.open(fileUrl, "_blank");
      } else if (action === "download") {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started");
      }
    } catch (err) {
      console.error("File action error:", err);
      toast.error("Error accessing file");
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
          <p className="text-gray-700 mb-4">{error || "Card not found"}</p>
          <button
            onClick={() => navigate("/cards")}
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
                  onClick={() => navigate("/cards")}
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
                    {card.description || "No description provided"}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span className="font-medium text-gray-700">
                        {card.departmentNames}
                      </span>
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
                        <span>
                          Head: {card.head.first_name} {card.head.last_name}
                        </span>
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
                {uploading ? "Uploading..." : "Upload File"}
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
                    ? "bg-orange-50 border-orange-200 text-orange-700 shadow-sm"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-sm"
                }`}
              >
                <FunnelIcon className="h-5 w-5" />
                <span className="font-medium">Filters</span>
              </button>

              {/* Quick Stats */}
              <div className="flex items-center gap-4">
                {currentUser && (
                  <div className="text-sm text-gray-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
                    <span className="font-medium text-orange-700">
                      {
                        files.filter((f) => {
                          if (!f.user) return false;
                          return (
                            (f.user.id &&
                              currentUser.id &&
                              f.user.id === currentUser.id) ||
                            (f.user.email &&
                              currentUser.email &&
                              f.user.email.toLowerCase() ===
                                currentUser.email.toLowerCase()) ||
                            (f.user.first_name &&
                              f.user.last_name &&
                              currentUser.first_name &&
                              currentUser.last_name &&
                              `${f.user.first_name} ${f.user.last_name}`.toLowerCase() ===
                                `${currentUser.first_name} ${currentUser.last_name}`.toLowerCase())
                          );
                        }).length
                      }
                    </span>{" "}
                    of your files
                  </div>
                )}
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="font-medium text-gray-900">
                    {filteredFiles.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-900">
                    {files.length}
                  </span>{" "}
                  files
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
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      File Type:
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    >
                      <option value="all">All Types</option>
                      {typeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Sort by:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="size">Size (Largest)</option>
                      <option value="owner">Submitted By (A-Z)</option>
                    </select>
                  </div>

                  {/* Add "My Files" toggle */}
                  {currentUser && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="myFiles"
                        checked={showOnlyMyFiles}
                        onChange={(e) => setShowOnlyMyFiles(e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="myFiles"
                        className="text-sm font-medium text-gray-700"
                      >
                        My Files Only
                      </label>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setQuery("");
                    setTypeFilter("all");
                    setSortBy("recent");
                    setSortDirection("desc");
                    setShowOnlyMyFiles(false);
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
                  <span>Submitted By</span>
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
                    {query || typeFilter !== "all" || showOnlyMyFiles
                      ? "No files match your filters"
                      : "No files uploaded yet"}
                  </p>
                  <p className="text-gray-600 mb-6 max-w-md">
                    {query || typeFilter !== "all" || showOnlyMyFiles
                      ? "Try adjusting your search or filters to find what you're looking for."
                      : "Get started by uploading your first file to this card."}
                  </p>
                  {query || typeFilter !== "all" || showOnlyMyFiles ? (
                    <button
                      onClick={() => {
                        setQuery("");
                        setTypeFilter("all");
                        setShowOnlyMyFiles(false);
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
                <div
                  key={file.id}
                  className="grid grid-cols-12 gap-6 px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  {/* File Name & Type */}
                  <div className="col-span-5 flex items-center">
                    <div className="flex items-center min-w-0 flex-1">
                      <span className="text-3xl mr-4 flex-shrink-0 group-hover:scale-110 transition-transform">
                        {getFileIcon(file.name, file.type)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-base font-semibold text-gray-900 truncate">
                            {file.name}
                          </div>
                          {isCurrentUsersFile(file) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Your file
                            </span>
                          )}
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
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white mr-3 flex-shrink-0 shadow-sm ${getOwnerAvatarColor(
                          file
                        )}`}
                      >
                        {getOwnerInitials(file)}
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`text-sm font-medium truncate ${
                            isCurrentUsersFile(file)
                              ? "text-orange-600 font-semibold"
                              : "text-gray-900"
                          }`}
                        >
                          {getOwnerDisplayName(file)}
                        </div>
                        {file.user?.email && (
                          <div className="text-xs text-gray-500 truncate">
                            {isCurrentUsersFile(file)
                              ? "Your submission"
                              : file.user.email}
                          </div>
                        )}
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
                      {file.size ? formatFileSize(file.size) : "—"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      {file.path && (
                        <>
                          <button
                            onClick={() => handleFileAction(file.id, "view")}
                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                            title="View file"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleFileAction(file.id, "download")
                            }
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
        allowedFileTypes={
          card?.allowedFileTypes ? card.allowedFileTypes.split(",") : ["*"]
        }
      />
    </div>
  );
};

export default CardDetails;

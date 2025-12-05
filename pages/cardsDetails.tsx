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
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showOnlyMyFiles, setShowOnlyMyFiles] = useState(false);
  
  // New state for user sidebar
  const [showUserSidebar, setShowUserSidebar] = useState(false);
  const [userStatus, setUserStatus] = useState<any>(null);
  const [loadingUserStatus, setLoadingUserStatus] = useState(false);
  const [userStatusError, setUserStatusError] = useState("");
  
  const baseUrl: string = (import.meta as any).env?.VITE_API_URL ?? "";

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${baseUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log('Raw /auth/me response:', responseData);
          
          let userData = responseData;
          
          if (responseData.user && typeof responseData.user === 'object') {
            userData = responseData.user;
            console.log('Extracted user from response.user:', userData);
          }
          else if (responseData.data && typeof responseData.data === 'object') {
            userData = responseData.data;
            console.log('Extracted user from response.data:', userData);
          }
          
          setCurrentUser({
            id: userData.id,
            email: userData.email,
            first_name: userData.first_name || userData.firstName,
            last_name: userData.last_name || userData.lastName,
            firstName: userData.firstName || userData.first_name,
            lastName: userData.lastName || userData.last_name,
            profile_picture: userData.profile_picture || userData.profilePicture || userData.avatar,
            ...userData
          });
          
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('Token payload:', payload);
            
            if ((!userData.first_name && !userData.firstName) && (payload.first_name || payload.firstName)) {
              console.log('Using name from token payload');
              setCurrentUser((prev: any) => ({
                ...prev,
                first_name: payload.first_name || payload.firstName,
                last_name: payload.last_name || payload.lastName,
                firstName: payload.firstName || payload.first_name,
                lastName: payload.lastName || payload.last_name,
              }));
            }
          } catch (e) {
            console.log('Could not decode token');
          }
        } else {
          console.error('Failed to fetch /auth/me:', response.status);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };

    fetchCurrentUser();
  }, [baseUrl]);

  // Function to get user avatar/initials
const getUserAvatar = (user: any, isCurrentUser: boolean = false) => {
  if (!user) {
    return {
      type: 'initials',
      content: 'U',
      color: 'bg-gradient-to-br from-gray-400 to-gray-600'
    };
  }

  // Check if user has an avatar (not profile_picture)
  const avatar = user.avatar;
  
  if (avatar) {
    // If it's a relative path, prepend baseUrl
    let avatarUrl = avatar;
    if (!avatar.startsWith('http') && !avatar.startsWith('data:')) {
      avatarUrl = `${baseUrl}${avatar.startsWith('/') ? '' : '/'}${avatar}`;
    }
    
    return {
      type: 'image',
      content: avatarUrl,
      color: isCurrentUser ? 'bg-gradient-to-br from-orange-500 to-orange-700' : 'bg-gradient-to-br from-gray-400 to-gray-600'
    };
  }

  // Get initials from name
  const firstName = user.first_name || user.firstName || '';
  const lastName = user.last_name || user.lastName || '';
  let initials = '';
  
  if (firstName && lastName) {
    initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  } else if (firstName) {
    initials = firstName.charAt(0).toUpperCase();
  } else if (lastName) {
    initials = lastName.charAt(0).toUpperCase();
  } else if (user.email) {
    initials = user.email.charAt(0).toUpperCase();
  } else {
    initials = 'U';
  }
  
  // Determine background color based on user ID or name
  const getColorForUser = (userId: number | string, userName: string) => {
    if (isCurrentUser) {
      return 'bg-gradient-to-br from-orange-500 to-orange-700';
    }
    
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-700',
      'bg-gradient-to-br from-green-500 to-green-700',
      'bg-gradient-to-br from-purple-500 to-purple-700',
      'bg-gradient-to-br from-red-500 to-red-700',
      'bg-gradient-to-br from-teal-500 to-teal-700',
      'bg-gradient-to-br from-indigo-500 to-indigo-700',
      'bg-gradient-to-br from-pink-500 to-pink-700',
      'bg-gradient-to-br from-yellow-500 to-yellow-700'
    ];
    
    let hash = 0;
    const str = userId?.toString() || userName || 'user';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  
  const color = getColorForUser(user.id || user.userId, `${firstName} ${lastName}`.trim());
  
  return {
    type: 'initials',
    content: initials,
    color: color
  };
};

  const isCurrentUsersFile = (file: any): boolean => {
    if (!currentUser || !file.user) return false;
    
    if (file.user.id && currentUser.id && file.user.id === currentUser.id) {
      return true;
    }
    
    if (file.user.email && currentUser.email && 
        file.user.email.toLowerCase() === currentUser.email.toLowerCase()) {
      return true;
    }
    
    const fileUserName = `${file.user.first_name || ''} ${file.user.last_name || ''}`.toLowerCase().trim();
    const currentUserName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.toLowerCase().trim();
    if (fileUserName && currentUserName && fileUserName === currentUserName) {
      return true;
    }
    
    return false;
  };

  // Helper to get display name for file owner
  const getOwnerDisplayName = (file: any): string => {
    if (!file.user) return 'Unknown User';
    
    const isCurrentUser = isCurrentUsersFile(file);
    
    if (isCurrentUser) {
      return 'You';
    }
    
    return `${file.user.first_name || ''} ${file.user.last_name || ''}`.trim();
  };

  // Helper to get initials for avatar
  const getOwnerInitials = (file: any): string => {
    if (isCurrentUsersFile(file)) {
      return 'You';
    }
    
    if (!file.user) return 'U';
    
    const first = file.user.first_name?.charAt(0) || '';
    const last = file.user.last_name?.charAt(0) || '';
    
    return (first + last).toUpperCase() || 'U';
  };

  // Helper to get avatar color based on user
  const getOwnerAvatarColor = (file: any): string => {
    if (isCurrentUsersFile(file)) {
      return 'bg-gradient-to-br from-orange-500 to-orange-700';
    }
    
    return 'bg-gradient-to-br from-gray-400 to-gray-600';
  };

  // Function to fetch user submission status for the card
  const fetchUserStatus = async () => {
    if (!id) return;
    
    setLoadingUserStatus(true);
    setUserStatusError("");
    
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${baseUrl}/cards/${id}/users`, {
        headers
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch user status: ${res.status}`);
      }
      
      const data = await res.json();
      setUserStatus(data);
    } catch (err: any) {
      console.error('Error fetching user status:', err);
      setUserStatusError(err.message || 'Error loading user status');
    } finally {
      setLoadingUserStatus(false);
    }
  };

  // Toggle user sidebar
  const toggleUserSidebar = async () => {
    const newState = !showUserSidebar;
    setShowUserSidebar(newState);
    
    if (newState && !userStatus) {
      await fetchUserStatus();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const cardRes = await fetch(`${baseUrl}/cards/${id}?include=files.user`);
        
        if (cardRes.ok) {
          const cardData = await cardRes.json();
          console.log('First file user data for debugging:', {
            fileUserId: cardData.files?.[0]?.user?.id,
            fileUserEmail: cardData.files?.[0]?.user?.email,
            fileUserName: `${cardData.files?.[0]?.user?.first_name || ''} ${cardData.files?.[0]?.user?.last_name || ''}`,
            fileUserData: cardData.files?.[0]?.user
          });
          
          // Process the card data
          const processedCard = {
            ...cardData,
            displayDepartment: cardData.departments && cardData.departments.length > 0
              ? cardData.departments[0].department
              : null,
            departmentNames: cardData.departments && cardData.departments.length > 0
              ? cardData.departments.map((cd: any) => cd.department.name).join(', ')
              : 'No Department'
          };

          setCard(processedCard);

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

      // Use the first department for submission if available
      if (card?.displayDepartment?.id) {
        formData.append("departmentId", card.displayDepartment.id);
      }

      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${baseUrl}/submissions/${id}`, {
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
      const cardRes = await fetch(`${baseUrl}/cards/${id}`);
      if (cardRes.ok) {
        const cardData = await cardRes.json();

        // Process the card data again
        const processedCard = {
          ...cardData,
          displayDepartment: cardData.departments && cardData.departments.length > 0
            ? cardData.departments[0].department
            : null,
          departmentNames: cardData.departments && cardData.departments.length > 0
            ? cardData.departments.map((cd: any) => cd.department.name).join(', ')
            : 'No Department'
        };

        setCard(processedCard);
        if (cardData.files && Array.isArray(cardData.files)) {
          setFiles(cardData.files);
        }
      }

      // Refresh user status if sidebar is open
      if (showUserSidebar) {
        await fetchUserStatus();
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

    // Filter by current user's files if enabled
    if (showOnlyMyFiles && currentUser) {
      list = list.filter((file) => 
        file.user && file.user.id === currentUser.id
      );
    }

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
  }, [files, query, typeFilter, sortBy, sortDirection, showOnlyMyFiles, currentUser]);

  // Handle file download/view
  const handleFileAction = async (fileId: number, action: 'view' | 'download') => {
    try {
      const file = files.find(f => f.id === fileId);
      if (!file || !file.path) {
        toast.error('File path not found');
        return;
      }

      const fileUrl = `${baseUrl}${file.path}`;

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

  // User sidebar component
  // User sidebar component
const renderUserSidebar = () => {
  const exportUserStatusToExcel = () => {
    try {
      if (!userStatus) {
        toast.error('No user status data available to export');
        return;
      }

      // Prepare data for export
      const exportData = userStatus.users.map((user: any) => {
        const userFile = files.find(f => f.user?.id === user.id);
        
        return {
          'User Name': user.name,
          'User Email': user.email,
          'Status': user.hasSubmitted ? 'Submitted' : 'Pending',
          'Submission Date': user.submittedAt ? formatDate(user.submittedAt) : 'Not Submitted',
          'File Name': userFile?.name || 'No file uploaded',
          'File Type': userFile?.type || 'N/A',
          'File Size': userFile?.size ? formatFileSize(userFile.size) : 'N/A',
          'Modified Date': userFile?.updatedAt ? formatDate(userFile.updatedAt) : 'N/A'
        };
      });

      // Add summary rows
      const summaryRows = [
        {},
        { 'User Name': 'SUMMARY', 'User Email': '', 'Status': '', 'Submission Date': '', 'File Name': '', 'File Type': '', 'File Size': '', 'Modified Date': '' },
        { 'User Name': 'Total Users:', 'User Email': userStatus.totalUsers },
        { 'User Name': 'Submitted:', 'User Email': userStatus.submittedCount },
        { 'User Name': 'Pending:', 'User Email': userStatus.pendingCount },
        { 'User Name': 'Completion Rate:', 'User Email': `${((userStatus.submittedCount / userStatus.totalUsers) * 100).toFixed(1)}%` }
      ];

      // Combine data with summary
      const allData = [...exportData, ...summaryRows];

      // Create CSV content
      const headers = ['User Name', 'User Email', 'Status', 'Submission Date', 'File Name', 'File Type', 'File Size', 'Modified Date'];
      const csvContent = [
        headers.join(','),
        ...allData.map(row => headers.map(header => {
          const cell = row[header] || '';
          return `"${cell.toString().replace(/"/g, '""')}"`;
        }).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `user-status-${card?.title?.replace(/[^a-z0-9]/gi, '-') || 'card'}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('User status exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting user status:', error);
      toast.error('Failed to export user status');
    }
  };

  const printUserStatus = () => {
    // Create a printable version of the user status
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }

    const avatar = getUserAvatar(currentUser, true);
    const avatarContent = avatar.type === 'image' 
      ? `<img src="${avatar.content}" alt="Current User" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">`
      : `<div style="width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f97316, #ea580c); color: white; font-weight: bold; font-size: 20px;">${avatar.content}</div>`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>User Status Report - ${card?.title || 'Card'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f97316;
          }
          .header h1 {
            color: #1f2937;
            margin-bottom: 10px;
          }
          .card-info {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .stat-box {
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            color: white;
          }
          .stat-box.submitted { background: linear-gradient(135deg, #10b981, #059669); }
          .stat-box.pending { background: linear-gradient(135deg, #f97316, #ea580c); }
          .stat-box.total { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
          .stat-value {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .user-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .user-table th {
            background: #4b5563;
            color: white;
            padding: 12px;
            text-align: left;
            border: 1px solid #374151;
          }
          .user-table td {
            padding: 12px;
            border: 1px solid #e5e7eb;
          }
          .user-table tr:nth-child(even) {
            background: #f9fafb;
          }
          .status-submitted {
            color: #10b981;
            font-weight: bold;
          }
          .status-pending {
            color: #f97316;
            font-weight: bold;
          }
          .current-user {
            background: #ffedd5 !important;
            font-weight: bold;
          }
          .current-user-badge {
            background: #f97316;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            margin-left: 5px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .print-meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 12px;
            color: #6b7280;
          }
          .current-user-info {
            display: flex;
            align-items: center;
            gap: 15px;
            background: #ffedd5;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>User Submission Status Report</h1>
          <h2>${card?.title || 'Card'}</h2>
          <div class="print-meta">
            <div>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
            <div>Total Records: ${userStatus?.users?.length || 0} users</div>
          </div>
        </div>

        <div class="current-user-info">
          ${avatarContent}
          <div>
            <strong>Report Generated By:</strong><br>
            ${currentUser ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.email : 'Unknown User'}<br>
            ${currentUser?.email || ''}
          </div>
        </div>

        ${userStatus ? `
          <div class="card-info">
            <h3>Card Information</h3>
            <p><strong>Description:</strong> ${card?.description || 'No description'}</p>
            <p><strong>Department:</strong> ${card?.departmentNames || 'No department'}</p>
            <p><strong>Total Files:</strong> ${files.length}</p>
          </div>

          <div class="stats-grid">
            <div class="stat-box submitted">
              <div class="stat-value">${userStatus.submittedCount}</div>
              <div>Submitted</div>
            </div>
            <div class="stat-box pending">
              <div class="stat-value">${userStatus.pendingCount}</div>
              <div>Pending</div>
            </div>
            <div class="stat-box total">
              <div class="stat-value">${userStatus.totalUsers}</div>
              <div>Total Users</div>
            </div>
          </div>

          <h3>User Submission Details (${userStatus.users.length} users)</h3>
          <table class="user-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Submission Date</th>
                <th>File Name</th>
                <th>File Type</th>
                <th>File Size</th>
              </tr>
            </thead>
            <tbody>
              ${userStatus.users.map((user: any) => {
                const userFile = files.find(f => f.user?.id === user.id);
                const isCurrent = user.id === currentUser?.id;
                
                return `
                  <tr ${isCurrent ? 'class="current-user"' : ''}>
                    <td>
                      ${user.name}
                      ${isCurrent ? '<span class="current-user-badge">You</span>' : ''}
                    </td>
                    <td>${user.email}</td>
                    <td class="${user.hasSubmitted ? 'status-submitted' : 'status-pending'}">
                      ${user.hasSubmitted ? 'Submitted' : 'Pending'}
                    </td>
                    <td>${user.submittedAt ? new Date(user.submittedAt).toLocaleDateString() : 'Not Submitted'}</td>
                    <td>${userFile?.name || 'No file uploaded'}</td>
                    <td>${userFile?.type || 'N/A'}</td>
                    <td>${userFile?.size ? formatFileSize(userFile.size) : 'N/A'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Completion Rate: ${((userStatus.submittedCount / userStatus.totalUsers) * 100).toFixed(1)}%</p>
            <p>Report generated from Card Management System</p>
          </div>
        ` : '<p>No user status data available</p>'}
      </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <>
      {/* Overlay */}
      {showUserSidebar && (
        <div 
          className="fixed inset-0 bg-blur bg-opacity-50 z-40 transition-opacity"
          onClick={toggleUserSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        showUserSidebar ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ width: '400px' }}>
        {/* Sidebar Header with Action Buttons */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Submission Status</h2>
              <p className="text-sm text-gray-500 mt-1">
                {card?.title || 'Card'}
              </p>
            </div>
            <button
              onClick={toggleUserSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-3">
            <button
              onClick={printUserStatus}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors flex-1 justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              <span>Print</span>
            </button>
            <button
              onClick={exportUserStatusToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-colors flex-1 justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="h-full flex flex-col">
          {loadingUserStatus ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading user status...</p>
              </div>
            </div>
          ) : userStatusError ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-red-500 mb-2">⚠️</div>
                <p className="text-gray-700 mb-4">{userStatusError}</p>
                <button
                  onClick={fetchUserStatus}
                  className="text-orange-600 hover:text-orange-800 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : userStatus ? (
            <>
              {/* Stats Summary */}
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-700">{userStatus.submittedCount}</div>
                    <div className="text-sm text-green-600 mt-1">Submitted</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <div className="text-2xl font-bold text-orange-700">{userStatus.pendingCount}</div>
                    <div className="text-sm text-orange-600 mt-1">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-700">{userStatus.totalUsers}</div>
                    <div className="text-sm text-blue-600 mt-1">Total Users</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${((userStatus.submittedCount / userStatus.totalUsers) * 100) || 0}%` }}
                      ></div>
                    </div>
                    <span className="font-medium">{((userStatus.submittedCount / userStatus.totalUsers) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Current User Info */}
              {currentUser && (
                <div className="p-4 bg-orange-50 border-b border-orange-100 mx-6 mt-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getUserAvatar(currentUser, true).type === 'image' ? (
                      <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
                        <img 
                          src={getUserAvatar(currentUser, true).content} 
                          alt="You"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const avatar = getUserAvatar(currentUser, true);
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = `
                              <div class="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0 shadow-sm ${avatar.color}">
                                ${avatar.content}
                              </div>
                            `;
                          }}
                        />
                      </div>
                    ) : (
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0 shadow-sm ${getUserAvatar(currentUser, true).color}`}>
                        {getUserAvatar(currentUser, true).content}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        You
                        <span className="ml-2 inline-block px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                          Current User
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {currentUser.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* User List */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Users ({userStatus.users.length})</h3>
                  <div className="space-y-3">
                    {userStatus.users.map((user: any) => {
                      const avatar = getUserAvatar(user, user.id === currentUser?.id);
                      const userHasFile = files.some(f => f.user?.id === user.id);
                      
                      return (
                        <div 
                          key={user.id} 
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {avatar.type === 'image' ? (
                              <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
                                <img 
                                  src={avatar.content} 
                                  alt={user.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = `
                                      <div class="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0 shadow-sm ${avatar.color}">
                                        ${avatar.content}
                                      </div>
                                    `;
                                  }}
                                />
                              </div>
                            ) : (
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0 shadow-sm ${avatar.color}`}>
                                {avatar.content}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {user.name}
                                {user.id === currentUser?.id && (
                                  <span className="ml-2 inline-block px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-[180px]">
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {user.hasSubmitted ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircleIcon className="h-5 w-5" />
                                <span className="text-sm font-medium">Submitted</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-orange-600">
                                <XCircleIcon className="h-5 w-5" />
                                <span className="text-sm font-medium">Pending</span>
                              </div>
                            )}
                            {user.submittedAt && (
                              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {new Date(user.submittedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="p-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  <div className="flex items-center justify-between mb-3">
                    <span>Last updated</span>
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <button
                    onClick={fetchUserStatus}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Refresh Status
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};

  // Toggle button for sidebar
const renderSidebarToggleButton = () => {
  return (
    <button
      onClick={toggleUserSidebar}
      className={`fixed right-0 z-40 flex items-center gap-2 transition-transform duration-300 ease-in-out ${
        showUserSidebar ? 'translate-x-96' : 'translate-x-0'
      }`}
      style={{ 
        top: '50%',
        transform: showUserSidebar 
          ? 'translateX(24rem) translateY(-50%)' 
          : 'translateY(-50%)',
        position: 'fixed'
      }}
    >
      <div className="bg-gradient-to-r from-orange-500 to-white-600 text-white rounded-l-lg shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 p-3 pl-4 flex items-center gap-2">
        {showUserSidebar ? (
          <>
            {/* <ChevronRightIcon className="h-6 w-6" /> */}
            {/* <span className="text-sm font-medium whitespace-nowrap">Hide Status</span> */}
          </>
        ) : (
          <>
            {/* <div className="flex items-center"> */}
              {/* <UserIcon className="h-5 w-5" /> */}
              {/* <div className="flex flex-col items-start">
                <span className="text-sm font-medium">View Status</span>
                <span className="text-xs opacity-80">Users & Submissions</span>
              </div> */}
            {/* </div> */}
            <ChevronLeftIcon className="h-5 w-5 ml-1" />
          </>
        )}
      </div>
    </button>
  );
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
    <div className="relative">
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

      {/* Sidebar Toggle Button */}
      {renderSidebarToggleButton()}

      {/* User Sidebar */}
      {renderUserSidebar()}

      {/* Main Content - Add right padding when sidebar is open */}
      <div className={`transition-all duration-300 ${
        showUserSidebar ? 'mr-96' : 'mr-0'
      }`}>
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
                        <span className="font-medium text-gray-700">{card.departmentNames}</span>
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${showFilters
                      ? 'bg-orange-50 border-orange-200 text-orange-700 shadow-sm'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-sm'
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
                        {files.filter(f => f.user?.id === currentUser.id).length}
                      </span> of your files
                    </div>
                  )}
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
                        <label htmlFor="myFiles" className="text-sm font-medium text-gray-700">
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
                      {query || typeFilter !== "all" || showOnlyMyFiles ? "No files match your filters" : "No files uploaded yet"}
                    </p>
                    <p className="text-gray-600 mb-6 max-w-md">
                      {query || typeFilter !== "all" || showOnlyMyFiles
                        ? "Try adjusting your search or filters to find what you're looking for."
                        : "Get started by uploading your first file to this card."
                      }
                    </p>
                    {(query || typeFilter !== "all" || showOnlyMyFiles) ? (
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
                filteredFiles.map((file) => {
                  const isCurrentUser = isCurrentUsersFile(file);
                  const avatar = getUserAvatar(file.user, isCurrentUser);
                  
                  return (
                    <div key={file.id} className="grid grid-cols-12 gap-6 px-6 py-4 hover:bg-gray-50 transition-colors group">
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
                              {isCurrentUser && (
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

                      {/* Owner with Avatar */}
                      <div className="col-span-2 flex items-center">
                        <div className="flex items-center min-w-0">
                          {avatar.type === 'image' ? (
                            <div className="h-10 w-10 rounded-full overflow-hidden mr-3 flex-shrink-0 shadow-sm">
                              <img 
                                src={avatar.content} 
                                alt={`${file.user?.first_name || ''} ${file.user?.last_name || ''}`}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  // If image fails to load, fall back to initials
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement!.innerHTML = `
                                    <div class="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white mr-3 flex-shrink-0 shadow-sm ${avatar.color}">
                                      ${getOwnerInitials(file)}
                                    </div>
                                  `;
                                }}
                              />
                            </div>
                          ) : (
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white mr-3 flex-shrink-0 shadow-sm ${avatar.color}`}>
                              {avatar.content}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className={`text-sm font-medium truncate ${isCurrentUser ? 'text-orange-600 font-semibold' : 'text-gray-900'}`}>
                              {getOwnerDisplayName(file)}
                            </div>
                            {file.user?.email && (
                              <div className="text-xs text-gray-500 truncate">
                                {isCurrentUser ? 'Your submission' : file.user.email}
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
                  );
                })
              )}
            </div>
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
import {
  EyeIcon,
  DocumentArrowDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { FileItem, User } from "../types/types";
import { getFileIcon, formatFileSize, formatDate } from "../utils/fileUtils";
import { getUserAvatar } from "../utils/userUtils";

interface FileTableProps {
  files: FileItem[];
  currentUser: User | null;
  sortBy: "recent" | "name" | "size" | "owner";
  sortDirection: "asc" | "desc";
  onSort: (column: "recent" | "name" | "size" | "owner") => void;
  onFileAction: (fileId: number, action: "view" | "download") => void;
  onUploadClick: () => void;
  isEmpty: boolean;
}

const FileTable: React.FC<FileTableProps> = ({
  files,
  currentUser,
  sortBy,
  sortDirection,
  onSort,
  onFileAction,
  onUploadClick,
  isEmpty,
}) => {
  const isCurrentUsersFile = (file: FileItem): boolean => {
    if (!currentUser || !file.user) return false;

    if (file.user.id && currentUser.id && file.user.id === currentUser.id) {
      return true;
    }

    if (
      file.user.email &&
      currentUser.email &&
      file.user.email.toLowerCase() === currentUser.email.toLowerCase()
    ) {
      return true;
    }

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

  const getOwnerDisplayName = (file: FileItem): string => {
    if (!file.user) return "Unknown User";
    const isCurrentUser = isCurrentUsersFile(file);
    if (isCurrentUser) return "You";
    return `${file.user.first_name || ""} ${file.user.last_name || ""}`.trim();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-6 px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
          <div className="col-span-5">
            <button
              onClick={() => onSort("name")}
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
              onClick={() => onSort("owner")}
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
              onClick={() => onSort("recent")}
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
              onClick={() => onSort("size")}
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
        {isEmpty ? (
          <div className="px-6 py-16 text-center">
            <div className="flex flex-col items-center">
              <div className="text-6xl mb-6">📁</div>
              <p className="text-xl font-medium text-gray-900 mb-3">
                No files uploaded yet
              </p>
              <p className="text-gray-600 mb-6 max-w-md">
                Get started by uploading your first file to this card.
              </p>
              <button
                onClick={onUploadClick}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Upload First File
              </button>
            </div>
          </div>
        ) : (
          files.map((file) => {
            const isCurrentUser = isCurrentUsersFile(file);
            const avatar = getUserAvatar(file.user, isCurrentUser);

            return (
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
                    {avatar.type === "image" ? (
                      <div className="h-10 w-10 rounded-full overflow-hidden mr-3 flex-shrink-0 shadow-sm">
                        <img
                          src={avatar.content}
                          alt={`${file.user?.first_name || ""} ${
                            file.user?.last_name || ""
                          }`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement!.innerHTML = `
                              <div class="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white mr-3 flex-shrink-0 shadow-sm ${
                                avatar.color
                              }">
                                ${getOwnerInitials(file)}
                              </div>
                            `;
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white mr-3 flex-shrink-0 shadow-sm ${avatar.color}`}
                      >
                        {avatar.content}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-medium truncate ${
                          isCurrentUser
                            ? "text-orange-600 font-semibold"
                            : "text-gray-900"
                        }`}
                      >
                        {getOwnerDisplayName(file)}
                      </div>
                      {file.user?.email && (
                        <div className="text-xs text-gray-500 truncate">
                          {isCurrentUser ? "Your submission" : file.user.email}
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
                          onClick={() => onFileAction(file.id, "view")}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                          title="View file"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onFileAction(file.id, "download")}
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
  );
};

// Helper functions (could be moved to utils)
const getOwnerInitials = (file: FileItem): string => {
  if (!file.user) return "U";
  const first = file.user.first_name?.charAt(0) || "";
  const last = file.user.last_name?.charAt(0) || "";
  return (first + last).toUpperCase() || "U";
};

export default FileTable;
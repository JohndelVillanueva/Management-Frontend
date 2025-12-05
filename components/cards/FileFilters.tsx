import { useState, useMemo } from "react";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { FileItem, User } from "../types/types";

interface FileFiltersProps {
  query: string;
  setQuery: (query: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  typeFilter: string;
  setTypeFilter: (filter: string) => void;
  sortBy: "recent" | "name" | "size" | "owner";
  setSortBy: (sort: "recent" | "name" | "size" | "owner") => void;
  sortDirection: "asc" | "desc";
  setSortDirection: (direction: "asc" | "desc") => void;
  showOnlyMyFiles: boolean;
  setShowOnlyMyFiles: (show: boolean) => void;
  currentUser: User | null;
  files: FileItem[];
  filteredFiles: FileItem[];
}

const FileFilters: React.FC<FileFiltersProps> = ({
  query,
  setQuery,
  showFilters,
  setShowFilters,
  typeFilter,
  setTypeFilter,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  showOnlyMyFiles,
  setShowOnlyMyFiles,
  currentUser,
  files,
  filteredFiles,
}) => {
  // Available file types for filter dropdown
  const typeOptions = useMemo(() => {
    const set = new Set<string>();
    files.forEach((f) => {
      if (f?.type) set.add(String(f.type));
    });
    return Array.from(set).sort();
  }, [files]);

  const handleSort = (column: "recent" | "name" | "size" | "owner") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const clearFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setSortBy("recent");
    setSortDirection("desc");
    setShowOnlyMyFiles(false);
  };

  return (
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
                  {files.filter((f) => f.user?.id === currentUser.id).length}
                </span>{" "}
                of your files
              </div>
            )}
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <span className="font-medium text-gray-900">
                {filteredFiles.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900">{files.length}</span>{" "}
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
              onClick={clearFilters}
              className="text-sm text-orange-600 hover:text-orange-800 font-medium px-4 py-2 hover:bg-orange-50 rounded-lg transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileFilters;
export interface User {
  id: number | string;
  email: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  profile_picture?: string;
  avatar?: string;
}

export interface FileItem {
  id: number;
  name: string;
  type: string;
  size?: number;
  path?: string;
  updatedAt: string;
  user?: User;
}

export interface Card {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  departments?: Array<{
    department: {
      id: number;
      name: string;
    }
  }>;
  allowedFileTypes?: string;
  displayDepartment?: {
    id: number;
    name: string;
  };
  departmentNames: string;
}

export interface UserStatus {
  users: Array<{
    id: number;
    name: string;
    email: string;
    hasSubmitted: boolean;
    submittedAt?: string;
  }>;
  submittedCount: number;
  pendingCount: number;
  totalUsers: number;
}
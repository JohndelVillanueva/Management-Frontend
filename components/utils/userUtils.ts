import { User } from "../types/types";

export const getUserAvatar = (user: User | undefined, isCurrentUser: boolean = false) => {
  if (!user) {
    return {
      type: 'initials' as const,
      content: 'U',
      color: 'bg-gradient-to-br from-gray-400 to-gray-600'
    };
  }

  // Check if user has an avatar
  const avatar = user.avatar;
  
  if (avatar) {
    // If it's a relative path, prepend baseUrl
    let avatarUrl = avatar;
    const baseUrl: string = (import.meta as any).env?.VITE_API_URL ?? "";
    
    if (!avatar.startsWith('http') && !avatar.startsWith('data:')) {
      avatarUrl = `${baseUrl}${avatar.startsWith('/') ? '' : '/'}${avatar}`;
    }
    
    return {
      type: 'image' as const,
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
    type: 'initials' as const,
    content: initials,
    color: color
  };
};
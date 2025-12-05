import { useState, useEffect } from 'react';
import { User } from '../types/types';

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const baseUrl: string = (import.meta as any).env?.VITE_API_URL ?? '';

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${baseUrl}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const responseData = await response.json();
          let userData = responseData;
          
          if (responseData.user && typeof responseData.user === 'object') {
            userData = responseData.user;
          } else if (responseData.data && typeof responseData.data === 'object') {
            userData = responseData.data;
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
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [baseUrl]);

  return { currentUser, loading };
};
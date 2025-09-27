import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '../utils/storage';

interface User {
  id: number;
  caregiverId?: number;
  careseekerId?: number;
  name: string;
  email: string;
  userType: 'caregiver' | 'careseeker';
  district?: string;
  profileImage?: string;
}

interface UseCurrentUserReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  getUserId: () => number | null;
  isCaregiver: () => boolean;
  isCareseeker: () => boolean;
}

export const useCurrentUser = (): UseCurrentUserReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get user from AsyncStorage first
      const userDataString = await AsyncStorage.getItem('currentUser');
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        console.log('Loaded user from AsyncStorage:', userData);
        setUser(userData);
        setLoading(false);
        return;
      }

      // If no user in AsyncStorage, try to get from token
      const token = await storage.getItem('accessToken');
      if (token) {
        // Decode JWT token to get user info
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const tokenData = JSON.parse(jsonPayload);
          
          if (tokenData.userId || tokenData.caregiverId || tokenData.careseekerId) {
            const userFromToken: User = {
              id: tokenData.userId || tokenData.caregiverId || tokenData.careseekerId,
              caregiverId: tokenData.caregiverId,
              careseekerId: tokenData.careseekerId,
              name: tokenData.name || tokenData.caregiverName || tokenData.careseekerName,
              email: tokenData.email,
              userType: tokenData.userType || (tokenData.caregiverId ? 'caregiver' : 'careseeker'),
              district: tokenData.district,
            };
            
            console.log('Loaded user from token:', userFromToken);
            setUser(userFromToken);
            
            // Save to AsyncStorage for future use
            await AsyncStorage.setItem('currentUser', JSON.stringify(userFromToken));
          }
        } catch (tokenError) {
          console.error('Error decoding token:', tokenError);
          setError('Invalid authentication token');
        }
      } else {
        setError('No authentication found');
      }
    } catch (err) {
      console.error('Error loading current user:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const getUserId = (): number | null => {
    if (!user) return null;
    const userId = user.id || user.caregiverId || user.careseekerId || null;
    console.log('=== getUserId DEBUG ===');
    console.log('User object:', user);
    console.log('Extracted user ID:', userId);
    console.log('========================');
    return userId;
  };

  const isCaregiver = (): boolean => {
    return user?.userType === 'caregiver' || !!user?.caregiverId;
  };

  const isCareseeker = (): boolean => {
    return user?.userType === 'careseeker' || !!user?.careseekerId;
  };

  useEffect(() => {
    loadUser();
  }, []);

  return {
    user,
    loading,
    error,
    refreshUser,
    getUserId,
    isCaregiver,
    isCareseeker,
  };
};

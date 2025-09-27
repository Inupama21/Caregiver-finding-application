import axios from 'axios';

// API URLs for different services
const USER_API_BASE_URL = 'http://192.168.176.11:5001';

export interface Careseeker {
  id: number;
  name: string;
  userType: 'careseeker';
  email: string;
  phone?: string;
  address?: string;
  careseekerId?: number;
  careseekerName?: string;
}

export interface Caregiver {
  id: number;
  name: string;
  userType: 'caregiver';
  email: string;
  phone?: string;
  district?: string;
  profileImage?: string;
  caregiverId?: number;
  caregiverName?: string;
}

export type User = Careseeker | Caregiver;

export const getUserById = async (userId: number, userType: 'careseeker' | 'caregiver'): Promise<Careseeker | Caregiver | null> => {
  try {
    // Use the unified admin endpoint that can handle both user types
    const url = `${USER_API_BASE_URL}/admin/user/${userId}`;
    
    console.log(`Making API call to: ${url}`);
    
    const response = await axios.get(url);

    console.log(`API response for user ${userId}:`, response.data);
    
    // The admin endpoint returns the user data directly with userType field
    const userData = response.data;
    
    // Return the data as the appropriate type based on userType
    if (userData.userType === 'careseeker') {
      return userData as Careseeker;
    } else if (userData.userType === 'caregiver') {
      return userData as Caregiver;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching user by ID:`, error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error(`Response status: ${axiosError.response.status}`);
      console.error(`Response data:`, axiosError.response.data);
    }
    return null;
  }
};

export const getCareseekerById = async (careseekerId: number): Promise<Careseeker | null> => {
  try {
    const result = await getUserById(careseekerId, 'careseeker');
    return result as Careseeker | null;
  } catch (error) {
    console.error(`Error fetching careseeker ${careseekerId}:`, error);
    return null;
  }
};

export const getCaregiverById = async (caregiverId: number): Promise<Caregiver | null> => {
  try {
    const result = await getUserById(caregiverId, 'caregiver');
    return result as Caregiver | null;
  } catch (error) {
    console.error(`Error fetching caregiver ${caregiverId}:`, error);
    return null;
  }
};

// Alias methods for compatibility with existing code
export const getCaregiverProfile = getCaregiverById;
export const getCareseekerProfile = getCareseekerById;

// Create a userService object for easier imports
export const userService = {
  getCaregiverProfile,
  getCareseekerProfile,
  getCaregiverById,
  getCareseekerById,
  getUserById,
};

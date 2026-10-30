import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/apiClient';

export interface MemberData {
  id?: number;
  member_id?: string;
  full_name: string;
  father_name?: string;
  date_of_birth?: string;
  gender?: string;
  email: string;
  mobile?: string;
  phone_number?: string;
  status: string;
  application_number?: string;
  profile_photo?: string;
  profile_image?: string;
  district_id?: number;
  block_id?: number;
  village_id?: number;
  village?: string;
  village_name?: string;
  role_name?: string;
}

export interface UserData {
  id: number;
  email: string;
  mobile?: string;
  phone_number?: string;
  roles: string[];
  member: MemberData | null;
}

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  login: (loginStr: string, passwordStr: string) => Promise<{ success: boolean; message?: string }>;
  registerMember: (formData: any) => Promise<{ success: boolean; data?: any; message?: string }>;
  logout: () => Promise<void>;
  prefilledEmail: string;
  setPrefilledEmail: (email: string) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prefilledEmail, setPrefilledEmail] = useState('');

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('user_token');
      const storedUser = await AsyncStorage.getItem('user_data');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Error loading session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (loginStr: string, passwordStr: string) => {
    const cleanLogin = loginStr.trim();
    const cleanPassword = passwordStr.trim();

    try {
      const response = await apiClient.post('/auth/login', {
        login: cleanLogin,
        password: cleanPassword,
      });

      const { token: receivedToken, user: receivedUser } = response.data.data;
      await AsyncStorage.setItem('user_token', receivedToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true };
    } catch (apiError: any) {
      const message =
        apiError.response?.data?.message ||
        (apiError.message?.includes('Network')
          ? 'Unable to reach NMPI server. Check your connection and API URL.'
          : 'Invalid credentials. Please verify your email/mobile and password.');

      return { success: false, message };
    }
  };

  const registerMember = async (formPayload: any) => {
    try {
      const formData = new FormData();
      Object.keys(formPayload).forEach((key) => {
        const val = formPayload[key];
        if (val === undefined || val === null || val === '') return;
        if (['confirm_password', 'consent_terms'].includes(key)) return;
        if (key === 'profile_image' && typeof val === 'object') {
          formData.append('profile_image', val as any);
          return;
        }
        formData.append(key, String(val).trim());
      });

      const response = await apiClient.post('/members/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      setPrefilledEmail(formPayload.email);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Membership application submitted successfully.',
      };
    } catch (apiError: any) {
      const message =
        apiError.response?.data?.message ||
        apiError.response?.data?.error?.details?.[0]?.message ||
        (apiError.message?.includes('Network')
          ? 'Unable to reach NMPI server. Check your connection and API URL.'
          : 'Registration failed. Please try again.');

      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user_token');
      await AsyncStorage.removeItem('user_data');
    } catch (e) {
      console.error('Error during logout:', e);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        registerMember,
        logout,
        prefilledEmail,
        setPrefilledEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Same backend as nmpi_website / nmpi_webapplication.
 * - Android emulator → 10.0.2.2 maps to host localhost
 * - iOS simulator / web → localhost
 * - Physical device → set EXPO_PUBLIC_API_URL or replace with your PC LAN IP
 * - Production → https://api.nmpi.in/api
 */
const getBaseUrl = () => {
  const customUrl = (process.env as any)?.EXPO_PUBLIC_API_URL;
  if (customUrl) {
    return String(customUrl).replace(/\/$/, '');
  }
  // Live API URL used across website & webapplication
  return 'https://api.nmpi.in/api';
};

export const API_BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('user_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

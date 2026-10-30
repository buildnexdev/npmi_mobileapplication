import { apiClient } from './apiClient';

export interface DistrictItem {
  id: number;
  name_en: string;
  name_ta?: string;
  code?: string;
}

export interface BlockItem {
  id: number;
  district_id: number;
  name_en: string;
  name_ta?: string;
}

export interface ParliamentItem {
  id: number;
  state_id: number;
  name_en: string;
  name_ta?: string;
  code?: string;
}

export interface AssemblyItem {
  id: number;
  parliament_constituency_id?: number | null;
  name_en: string;
  name_ta?: string;
}

export interface VillageItem {
  id: number;
  district_id: number;
  block_id: number;
  name_en: string;
  name_ta?: string;
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];

export const COUNTRY_CODES = [
  { code: '+91', label: 'IN (+91)' },
  { code: '+971', label: 'AE (+971)' },
  { code: '+65', label: 'SG (+65)' },
  { code: '+60', label: 'MY (+60)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+1', label: 'US (+1)' },
  { code: '+61', label: 'AU (+61)' },
];

export const JOIN_ROLE_OPTIONS = [
  { id: 1, name: 'Primary Member', desc: 'Active community membership with voting rights' },
  { id: 2, name: 'Youth Volunteer', desc: 'Volunteer for community initiatives and welfare' },
];

export const masterData = {
  getDistricts: async (): Promise<DistrictItem[]> => {
    try {
      const res = await apiClient.get('/master-data/districts');
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch (e) {
      console.warn('Failed to fetch districts:', e);
      return [];
    }
  },

  getBlocks: async (districtId: number): Promise<BlockItem[]> => {
    try {
      const res = await apiClient.get(`/master-data/blocks?districtId=${districtId}`);
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch (e) {
      console.warn('Failed to fetch blocks:', e);
      return [];
    }
  },

  getParliaments: async (): Promise<ParliamentItem[]> => {
    try {
      const res = await apiClient.get('/master-data/parliaments');
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch (e) {
      console.warn('Failed to fetch parliaments:', e);
      return [];
    }
  },

  getAssemblies: async (parliamentId?: number): Promise<AssemblyItem[]> => {
    try {
      const qs = parliamentId ? `?parliamentId=${parliamentId}` : '';
      const res = await apiClient.get(`/master-data/assemblies${qs}`);
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch (e) {
      console.warn('Failed to fetch assemblies:', e);
      return [];
    }
  },

  getVillages: async (blockId: number): Promise<VillageItem[]> => {
    try {
      const res = await apiClient.get(`/master-data/villages?blockId=${blockId}`);
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch (e) {
      console.warn('Failed to fetch villages:', e);
      return [];
    }
  },

  checkPhone: async (phone: string, countryCode = '+91') => {
    try {
      const res = await apiClient.get(`/members/check-phone?phone=${encodeURIComponent(phone)}&countryCode=${encodeURIComponent(countryCode)}`);
      return res.data?.data?.exists || false;
    } catch {
      return false;
    }
  },

  checkEmail: async (email: string) => {
    try {
      const res = await apiClient.get(`/members/check-email?email=${encodeURIComponent(email)}`);
      return res.data?.data?.exists || false;
    } catch {
      return false;
    }
  },

  checkAadhaar: async (aadhaar: string) => {
    try {
      const res = await apiClient.get(`/members/check-aadhaar?aadhaar=${encodeURIComponent(aadhaar)}`);
      return res.data?.data?.exists || false;
    } catch {
      return false;
    }
  },

  checkVoterId: async (voterId: string) => {
    try {
      const res = await apiClient.get(`/members/check-voter-id?voterId=${encodeURIComponent(voterId)}`);
      return res.data?.data?.exists || false;
    } catch {
      return false;
    }
  },
};

import { http } from './http';
import type { Me } from '../types/api';

export const userService = {
  async updateProfile(payload: { name?: string; bio?: string; avatar?: string }) {
    const { data } = await http.patch<Me>('/me', payload);
    return data;
  },
  async updatePreferences(payload: { currentLat: number; currentLng: number; radiusMiles: number }) {
    const { data } = await http.put<Me>('/me/preferences', payload);
    return data;
  },
  async updateInterests(payload: { interestIds: string[] }) {
    const { data } = await http.put<Me>('/me/interests', payload);
    return data;
  },
};

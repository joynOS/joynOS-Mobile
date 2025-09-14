import { http } from './http';
import type {
  ProfileSummary,
  AttendedEventsResponse,
  VisitedPlacesResponse,
  CircleResponse,
  ProfilePreferences
} from '../types/api';

export const profileService = {
  getSummary: async (): Promise<ProfileSummary> => {
    const { data } = await http.get('/profile/summary');
    return data;
  },

  getAttendedEvents: async (cursor?: string, limit: number = 20): Promise<AttendedEventsResponse> => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    
    const { data } = await http.get(`/profile/attended?${params.toString()}`);
    return data;
  },

  getVisitedPlaces: async (cursor?: string, limit: number = 20): Promise<VisitedPlacesResponse> => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    
    const { data } = await http.get(`/profile/places?${params.toString()}`);
    return data;
  },

  getCircle: async (cursor?: string, limit: number = 20): Promise<CircleResponse> => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    
    const { data } = await http.get(`/profile/circle?${params.toString()}`);
    return data;
  },

  getPreferences: async (): Promise<ProfilePreferences> => {
    const { data } = await http.get('/profile/preferences');
    return data;
  }
};
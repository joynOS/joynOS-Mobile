import { http } from './http';
import type { Interest } from '../types/api';

export const interestsService = {
  async list() {
    const { data } = await http.get<Interest[]>('/interests');
    return data;
  },
};

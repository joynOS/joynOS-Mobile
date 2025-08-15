import { http } from './http';
import type {
  EventReview,
  CreateReviewRequest,
  ReviewResponse
} from '../types/api';

export const reviewService = {
  getEventReview: async (eventId: string): Promise<EventReview> => {
    const { data } = await http.get(`/events/${eventId}/review`);
    return data;
  },

  submitReview: async (eventId: string, review: CreateReviewRequest): Promise<ReviewResponse> => {
    const { data } = await http.post(`/events/${eventId}/review`, review);
    return data;
  }
};
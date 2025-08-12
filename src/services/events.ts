import { http } from "./http";
import type {
  RecommendationsResponse,
  EventDetail,
  BookingInfo,
  ChatList,
} from "../types/api";

export const eventsService = {
  async recommendations(params?: {
    from?: string;
    to?: string;
    tags?: string[];
    radiusMiles?: number;
    cursor?: string;
  }) {
    const { data } = await http.get<RecommendationsResponse>(
      "/events/recommendations",
      { params }
    );
    return data;
  },
  async getById(id: string) {
    const { data } = await http.get<EventDetail>(`/events/${id}`);
    return data;
  },
  async browse(params?: {
    from?: string;
    to?: string;
    tags?: string[];
    take?: number;
  }) {
    const query: any = {};
    if (params?.from) query.from = params.from;
    if (params?.to) query.to = params.to;
    if (params?.tags && params.tags.length > 0)
      query.tags = params.tags.join(",");
    if (params?.take) query.take = params.take;
    const { data } = await http.get<any[] | { items: any[] }>(`/events/browse`, { params: query });

    return data;
  },
  async myEvents() {
    try {
      const { data } = await http.get<EventDetail[]>(`/events/my`);
      return data;
    } catch (e) {
      const { data } = await http.get<EventDetail[]>(`/me/events`);
      return data;
    }
  },
  async getPlans(id: string) {
    const { data } = await http.get<EventDetail["plans"]>(
      `/events/${id}/plans`
    );
    return data;
  },
  async votePlan(id: string, planId: string) {
    const { data } = await http.post<{ ok: true }>(
      `/events/${id}/plans/${planId}/vote`,
      {}
    );
    return data;
  },
  async join(id: string) {
    const { data } = await http.post(`/events/${id}/join`, {});
    return data as {
      member: { status: string; bookingStatus: string };
      voting: { state: string; endsAt: string };
    };
  },
  async leave(id: string) {
    const { data } = await http.post(`/events/${id}/leave`, {});
    return data;
  },
  async commit(id: string, decision: "IN" | "OUT") {
    const { data } = await http.post(`/events/${id}/commit`, { decision });
    return data;
  },
  async bookingInfo(id: string) {
    const { data } = await http.get<BookingInfo>(`/events/${id}/booking`);
    return data;
  },
  async bookingConfirm(id: string, bookingRef?: string) {
    const { data } = await http.post(
      `/events/${id}/booking/confirm`,
      bookingRef ? { bookingRef } : {}
    );
    return data;
  },
  async chatList(id: string, params?: { cursor?: string; limit?: number }) {
    const { data } = await http.get<ChatList>(`/events/${id}/chat`, { params });
    return data;
  },
  async chatSend(id: string, text: string) {
    const { data } = await http.post(`/events/${id}/chat`, { text });
    return data as {
      id: string;
      eventId: string;
      userId: string;
      kind: "CHAT";
      text: string;
      createdAt: string;
    };
  },
};

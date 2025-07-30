import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Event, EventPlan, EventMember, InsertEvent } from '../shared/shared';
import type { FilterOptions } from '../shared/types';

export interface EventWithPlans extends Event {
  plans: EventPlan[];
  members: Array<EventMember & { user: { name: string; avatar?: string } }>;
  userMembership?: EventMember;
}

export interface JoinEventRequest {
  eventId: number;
  status: 'interested' | 'committed';
}

export interface VotePlanRequest {
  eventId: number;
  planId: number;
}

export const eventsApi = createApi({
  reducerPath: 'eventsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/events',
    credentials: 'include',
  }),
  tagTypes: ['Event', 'EventMember', 'PlanVote'],
  endpoints: (builder) => ({
    getDiscoverFeed: builder.query<Event[], FilterOptions>({
      query: (filters) => ({
        url: '/discover',
        params: filters,
      }),
      providesTags: ['Event'],
    }),
    getEventById: builder.query<EventWithPlans, number>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Event', id }],
    }),
    getEventMembers: builder.query<EventMember[], number>({
      query: (eventId) => `/${eventId}/members`,
      providesTags: ['EventMember'],
    }),
    joinEvent: builder.mutation<EventMember, JoinEventRequest>({
      query: ({ eventId, status }) => ({
        url: `/${eventId}/join`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: ['Event', 'EventMember'],
    }),
    leaveEvent: builder.mutation<void, number>({
      query: (eventId) => ({
        url: `/${eventId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: ['Event', 'EventMember'],
    }),
    votePlan: builder.mutation<void, VotePlanRequest>({
      query: ({ eventId, planId }) => ({
        url: `/${eventId}/vote`,
        method: 'POST',
        body: { planId },
      }),
      invalidatesTags: ['PlanVote', 'Event'],
    }),
    updateMemberStatus: builder.mutation<EventMember, { eventId: number; status: string }>({
      query: ({ eventId, status }) => ({
        url: `/${eventId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['EventMember'],
    }),
    getMapEvents: builder.query<Event[], { lat: number; lng: number; radius: number }>({
      query: ({ lat, lng, radius }) => ({
        url: '/map',
        params: { lat, lng, radius },
      }),
      providesTags: ['Event'],
    }),
    searchEvents: builder.query<Event[], { query: string; filters?: FilterOptions }>({
      query: ({ query, filters }) => ({
        url: '/search',
        params: { q: query, ...filters },
      }),
      providesTags: ['Event'],
    }),
    createEvent: builder.mutation<Event, InsertEvent>({
      query: (eventData) => ({
        url: '/',
        method: 'POST',
        body: eventData,
      }),
      invalidatesTags: ['Event'],
    }),
  }),
});

export const {
  useGetDiscoverFeedQuery,
  useGetEventByIdQuery,
  useGetEventMembersQuery,
  useJoinEventMutation,
  useLeaveEventMutation,
  useVotePlanMutation,
  useUpdateMemberStatusMutation,
  useGetMapEventsQuery,
  useSearchEventsQuery,
  useCreateEventMutation,
} = eventsApi;

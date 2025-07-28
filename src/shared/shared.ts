export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  name: string;
  bio?: string | null;
  avatar?: string | null;
  archetype?: string | null;
  credibilityScore?: number;
  interests?: string[] | null;
  location?: { lat: number; lng: number; city: string } | null;
  isOnboarded?: boolean;
  createdAt: Date;
};

export type InsertUser = {
  username: string;
  email: string;
  password: string;
  name: string;
  bio?: string;
  avatar?: string;
};

export type Event = {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  location?: { lat: number; lng: number; venue: string; address: string } | null;
  startTime: Date;
  endTime: Date;
  maxAttendees?: number;
  currentAttendees?: number;
  category: string;
  tags?: string[] | null;
  aiVibeAnalysis?: string | null;
  createdBy?: number | null;
  createdAt: Date;
};

export type InsertEvent = {
  title: string;
  description: string;
  imageUrl?: string;
  location: { lat: number; lng: number; venue: string; address: string };
  startTime: Date;
  endTime: Date;
  maxAttendees?: number;
  category: string;
  tags?: string[];
};

export type EventPlan = {
  id: number;
  eventId?: number | null;
  title: string;
  description: string;
  emoji?: string | null;
  estimatedCost?: number | null;
  votes?: number;
  isSelected?: boolean;
  createdAt: Date;
};

export type EventMember = {
  id: number;
  eventId?: number | null;
  userId?: number | null;
  status: "interested" | "committed" | "arrived" | "no_show";
  compatibilityScore?: number | null;
  joinedAt: Date;
};

export type ChatMessage = {
  id: number;
  eventId?: number | null;
  userId?: number | null;
  content: string;
  type?: "message" | "system" | "poll";
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
};

export type InsertChatMessage = {
  eventId: number;
  content: string;
  type?: "message" | "system" | "poll";
  metadata?: Record<string, unknown>;
};

export type PlanVote = {
  id: number;
  eventId?: number | null;
  userId?: number | null;
  planId?: number | null;
  createdAt: Date;
};

export type UserReview = {
  id: number;
  reviewerId?: number | null;
  reviewedUserId?: number | null;
  eventId?: number | null;
  rating: number; // 1 to 5
  feedback?: string | null;
  createdAt: Date;
};

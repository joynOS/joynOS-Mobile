export interface OnboardingQuizAnswer {
  questionId: number;
  answer: string;
  score: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
  city: string;
}

export interface EventLocation {
  lat: number;
  lng: number;
  venue: string;
  address: string;
}

export interface QuorumStatus {
  current: number;
  needed: number;
  isActive: boolean;
  timeRemaining?: number;
}

export interface NotificationData {
  type: 'quorum' | 'vote' | 'commit' | 'event_start';
  title: string;
  message: string;
  eventId?: number;
}

export interface FilterOptions {
  category?: string;
  distance?: number;
  timeframe?: 'today' | 'this_week' | 'this_month';
  interests?: string[];
}

export interface EventCardSwipeData {
  direction: 'up' | 'down' | 'left' | 'right';
  eventId: number;
}

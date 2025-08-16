export type AccessTokens = {
  accessToken: string;
  refreshToken: string;
};

export type Me = {
  id: string;
  email: string;
  name: string;
  bio: string | null;
  avatar: string | null;
  currentLat: number | null;
  currentLng: number | null;
  radiusMiles: number | null;
  // Backend flag to decide onboarding routing
  hasInterests?: boolean;
  // Optional flags provided by backend to determine onboarding completion
  hasCompletedInterests?: boolean | null;
  hasCompletedQuiz?: boolean | null;
  needsOnboarding?: boolean | null;
  aiProfile: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type Interest = {
  id: string;
  slug: string;
  emoji: string;
  label: string;
  createdAt: string;
};

export type QuizAnswerOption = {
  id: string;
  questionId: string;
  key: string;
  text: string;
  archetype: string | null;
};

export type QuizQuestion = {
  id: string;
  quizId: string;
  order: number;
  imageUrl: string | null;
  question: string;
  answers: QuizAnswerOption[];
};

export type ActiveQuiz = {
  id: string;
  key: string;
  title: string;
  isActive: boolean;
  createdAt: string;
  questions: QuizQuestion[];
};

export type RecommendationItem = {
  eventId: string;
  title: string;
  imageUrl: string | null;
  startTime: string;
  venue: string;
  address: string;
  distanceMiles: number | null;
  etaSeconds: number | null;
  vibeMatchScoreEvent: number;
  vibeMatchScoreWithOtherUsers: number;
  interestedCount: number;
};

export type RecommendationsResponse = {
  items: RecommendationItem[];
  nextCursor: string | null;
};

export type EventPlan = {
  id: string;
  eventId: string;
  title: string;
  description: string;
  emoji: string | null;
  votes: number;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EventDetail = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  source: string | null;
  sourceId: string | null;
  externalBookingUrl: string | null;
  venue: string | null;
  address: string | null;
  lat: number;
  lng: number;
  startTime: string;
  endTime: string | null;
  rating: number | null;
  priceLevel: number | null;
  votingState: 'NOT_STARTED' | 'OPEN' | 'CLOSED';
  votingEndsAt: string | null;
  selectedPlanId: string | null;
  // Backend flag: whether current user is a member of the event
  isMember?: boolean;
  // Backend flag: whether current user has committed to attend
  isCommitted?: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  plans: EventPlan[];
  // AI-generated content
  aiVibeAnalysis?: string;
  // Dynamic scoring and analytics
  vibeMatchScoreEvent: number;
  vibeMatchScoreWithOtherUsers: number;
  distanceMiles: number;
  interestedCount: number;
  participants: EventParticipant[];
  overlap: number;
  cosine: number;
  penalty: number;
  rate: number;
};

export type JoinLeaveResponse = {
  member: { status: 'JOINED' | 'CANT_MAKE_IT' | 'COMMITTED'; bookingStatus: 'NONE' | 'BOOKED' };
  voting?: { state: 'NOT_STARTED' | 'OPEN' | 'CLOSED'; endsAt: string | null };
};

export type BookingInfo = {
  externalBookingUrl: string | null;
  selectedPlan: EventPlan | null;
  isBooked: boolean;
  isCommitted: boolean;
};

export type ChatItem = {
  id: string;
  eventId: string;
  userId: string | null;
  kind: 'CHAT' | 'SYSTEM' | 'VOTE' | 'BOOKING';
  text: string;
  createdAt: string;
};

export type ChatList = {
  items: ChatItem[];
  nextCursor: string | null;
};

export type EventParticipant = {
  id: string;
  name: string;
  avatar: string | null;
  status: 'JOINED' | 'CANT_MAKE_IT' | 'COMMITTED';
};

export type ProfileSummary = {
  eventsCount: number;
  circleCount: number;
  commitRate: number;
  commitScore: number;
  commitBreakdown: {
    attended: number;
    acknowledgedEvents: number;
    unratedEvents: number;
    posBonus: number;
    negPenalty: number;
  };
};

export type AttendedEvent = {
  eventId: string;
  title: string;
  venue: string;
  imageUrl: string;
  startTime: string;
  endTime: string;
  myPlaceRating: number | null;
  myPlanRating: number | null;
  selectedPlanId: string | null;
};

export type AttendedEventsResponse = {
  items: AttendedEvent[];
  nextCursor: string | null;
};

export type VisitedPlace = {
  venue: string;
  address: string;
  lat: number;
  lng: number;
  lastVisitedAt: string;
  visits: number;
  avgPlaceRating: number;
};

export type VisitedPlacesResponse = {
  items: VisitedPlace[];
  nextCursor: string | null;
};

export type CircleConnection = {
  userId: string;
  name: string;
  avatar: string | null;
  tagline: string | null;
  matchPercent: number;
};

export type CircleResponse = {
  items: CircleConnection[];
  nextCursor: string | null;
};

export type PlanPreference = {
  key: string;
  title: string;
  subtitle: string;
  matchLabel: string;
};

export type ProfilePreferences = {
  interests: Interest[];
  planPreferences: PlanPreference[];
};

export type EventReview = {
  eventId: string;
  userId: string;
  placeRating: number;
  planRating: number;
  planId: string;
  comment: string | null;
  connectedUserIds: string[];
  createdAt: string;
};

export type CreateReviewRequest = {
  placeRating: number;
  planRating: number;
  comment?: string;
  connectedUserIds: string[];
};

export type ReviewResponse = {
  ok: boolean;
  review: EventReview;
  circleAdded: number;
};

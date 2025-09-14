export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  PersonalityQuiz: { phone?: string };
  InterestSelector: { phone?: string };
  Feed: undefined;
  You: undefined;
  Discovery: undefined;
  Search: undefined;
  Map: undefined;
  Profile: undefined;
  Terms: undefined;
  Privacy: undefined;
  EventDetail: { id: string };
  EventChat: { id: string };
  EventLobby: { id: string };
  EventReview: { eventId: string; eventTitle: string };
};
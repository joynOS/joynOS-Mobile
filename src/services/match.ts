import { http } from './http';

export interface EventMatch {
  score: number;
  reasons: string[];
}

export interface ParticipantMatch {
  name: string;
  score: number;
  reasons: string[];
}

export interface WhyThisMatchResponse {
  eventMatch: EventMatch;
  participantMatches: ParticipantMatch[];
  overallExplanation: string;
}

export interface ChatSuggestion {
  suggestions: string[];
  context: string;
}

export const matchService = {
  async getChatSuggestions(eventId: string): Promise<ChatSuggestion> {
    const { data } = await http.get(`/events/${eventId}/chat/suggestions`);
    return data;
  }
};
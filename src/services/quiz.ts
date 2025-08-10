import { http } from './http';
import type { ActiveQuiz } from '../types/api';

export const quizService = {
  async getActive() {
    const { data } = await http.get<ActiveQuiz>('/quiz/active');
    return data;
  },
  async submitAnswers(quizId: string, answers: Array<{ questionId: string; answerKey: string }>) {
    const { data } = await http.post<{ ok: true }>(`/quiz/${quizId}/answers`, { answers });
    return data;
  },
};

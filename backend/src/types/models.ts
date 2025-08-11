export type QuestionType = 'single' | 'multi' | 'boolean' | 'text' | 'estimate';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: { id: string; text: string }[];
  correct?: string[] | string | number;
}

export interface Answer {
  playerId: string;
  questionId: string;
  payload: string[] | string | number;
  submittedAt: number;
}

export interface Player {
  id: string;
  name: string;
  connected: boolean;
  answers: Record<string, Answer>;
}

export interface RoundSettings {
  numQuestions: number;
  category?: string;
  difficulty?: string;
  language?: string;
  timeLimitSec: number;
  shuffle?: boolean;
  maxPlayers: number;
}

export interface Round {
  id: string;
  joinCode: string;
  hostId: string;
  settings: RoundSettings;
  status: 'lobby' | 'countdown' | 'running' | 'ended';
  players: Map<string, Player>;
  questions: Question[];
  startAt?: number;
  endAt?: number;
}

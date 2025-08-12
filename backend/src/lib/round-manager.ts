import type { Round, RoundSettings, Player, Question, Answer } from '../types/models.js';
import { v4 as uuid } from 'uuid';

export class RoundManager {
  rounds: Map<string, Round> = new Map();

  createRound(hostName: string, settings: Partial<RoundSettings>): { round: Round; hostId: string } {
    const hostId = uuid();
    const roundId = uuid();
    const joinCode = roundId.slice(0, 6);
    const round: Round = {
      id: roundId,
      joinCode,
      hostId,
      settings: {
        numQuestions: settings.numQuestions ?? 10,
        category: settings.category ?? '9',
        difficulty: settings.difficulty ?? 'medium',
        language: settings.language ?? 'de',
        timeLimitSec: settings.timeLimitSec ?? 600,
        shuffle: settings.shuffle ?? false,
        maxPlayers: Math.min(settings.maxPlayers ?? 10, 20),
      },
      status: 'lobby',
      players: new Map(),
      questions: [],
    };
    round.players.set(hostId, { id: hostId, name: hostName, connected: true, answers: {} });
    this.rounds.set(roundId, round);
    return { round, hostId };
  }

  getRound(id: string) {
    return this.rounds.get(id);
  }

  joinRound(round: Round, playerName: string): Player {
    if (round.players.size >= round.settings.maxPlayers) {
      throw new Error('ROUND_FULL');
    }
    const playerId = uuid();
    const player: Player = { id: playerId, name: playerName, connected: true, answers: {} };
    round.players.set(playerId, player);
    return player;
  }

  startRound(round: Round, questions: Question[]) {
    round.status = 'running';
    round.questions = questions;
    round.startAt = Date.now();
    round.endAt = round.startAt + round.settings.timeLimitSec * 1000;
  }

  submitAnswer(round: Round, answer: Answer) {
    const player = round.players.get(answer.playerId);
    if (!player) return;
    player.answers[answer.questionId] = answer;
  }

  endRound(round: Round) {
    round.status = 'ended';
  }

  getResults(round: Round): { playerId: string; name: string; points: number }[] {
    const scores: { playerId: string; name: string; points: number }[] =
      Array.from(round.players.values()).map((p: Player) => {
        let points = 0;
        for (const q of round.questions) {
          const ans = p.answers[q.id];
          if (!ans) continue;
          if ((q.type === 'single' || q.type === 'boolean') && q.correct !== undefined) {
            if (ans.payload === q.correct) points += 1;
          }
        }
        return { playerId: p.id, name: p.name, points };
      });
    scores.sort((a, b) => b.points - a.points);
    return scores;
  }
}

export const rounds = new RoundManager();

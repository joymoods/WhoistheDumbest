import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { Server } from 'socket.io';
import { rounds } from './lib/round-manager.js';
import { fetchQuestions } from './lib/trivia.js';
import type { Answer } from './types/models.js';

export function buildServer() {
  const app = Fastify({ logger: true });
  app.register(fastifyCors, { origin: true, credentials: true });

  const io = new Server(app.server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    socket.on('join', ({ roundId, playerId }) => {
      socket.join(roundId);
      const round = rounds.getRound(roundId);
      if (round) {
        const player = round.players.get(playerId);
        if (player) player.connected = true;
      }
    });
    socket.on('answer', (data: Answer & { roundId: string }) => {
      const round = rounds.getRound(data.roundId);
      if (!round) return;
      rounds.submitAnswer(round, data);
      socket.emit('answer:accepted', { questionId: data.questionId });
    });
  });

  app.get('/api/health', async (_req, reply) => {
    reply.type('application/json').send({ ok: true });
  });

  app.post('/api/rounds', async (req, reply) => {
    const body: any = req.body;
    const hostName = body.hostName || 'Host';
    const { round, hostId } = rounds.createRound(hostName, body.settings || {});
    reply.type('application/json').send({ roundId: round.id, joinCode: round.joinCode, settings: round.settings, hostId });
  });

  app.post('/api/rounds/:id/join', async (req, reply) => {
    const round = rounds.getRound((req.params as any).id);
    if (!round) return reply.code(404).type('application/json').send({ error: 'NOT_FOUND' });
    if (round.status !== 'lobby') return reply.code(409).type('application/json').send({ error: 'ROUND_ALREADY_STARTED' });
    const body: any = req.body;
    const player = rounds.joinRound(round, body.playerName);
    reply.type('application/json').send({ playerId: player.id, roundId: round.id, roundSummary: { settings: round.settings } });
  });

  app.get('/api/rounds/:id/questions', async (req, reply) => {
    const round = rounds.getRound((req.params as any).id);
    if (!round) return reply.code(404).type('application/json').send({ error: 'NOT_FOUND' });
    if (round.questions.length === 0) {
      const qs = await fetchQuestions(round.settings.numQuestions, round.settings.category || '9', round.settings.difficulty || 'medium', round.settings.language || 'de');
      rounds.startRound(round, qs);
    }
    reply
      .type('application/json')
      .send(round.questions.map((q: any) => ({ id: q.id, type: q.type, text: q.text, options: q.options })));
  });

  app.post('/api/rounds/:id/finish', async (req, reply) => {
    const round = rounds.getRound((req.params as any).id);
    if (!round) return reply.code(404).type('application/json').send({ error: 'NOT_FOUND' });
    rounds.endRound(round);
    const ranking = rounds.getResults(round);
    reply.type('application/json').send({ ok: true, ranking });
  });

  app.setNotFoundHandler((req, reply) => {
    reply.code(404).type('application/json').send({ error: 'Not found' });
  });

  app.setErrorHandler((error, _req, reply) => {
    app.log.error(error);
    reply.code(500).type('application/json').send({ error: error.message });
  });

  return { app };
}

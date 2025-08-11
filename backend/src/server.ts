import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { rounds } from './lib/round-manager';
import { fetchQuestions } from './lib/trivia';
import { Answer } from './types/models';

export function buildServer() {
  const app = Fastify({ logger: true });
  app.register(fastifyCors, { origin: true, credentials: true });

  const httpServer = createServer(app as any);
  const io = new Server(httpServer, { cors: { origin: '*' } });

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

  app.post('/api/rounds', async (req, reply) => {
    const body: any = req.body;
    const hostName = body.hostName || 'Host';
    const { round, hostId } = rounds.createRound(hostName, body.settings || {});
    reply.send({ roundId: round.id, joinCode: round.joinCode, settings: round.settings, hostId });
  });

  app.post('/api/rounds/:id/join', async (req, reply) => {
    const round = rounds.getRound((req.params as any).id);
    if (!round) return reply.code(404).send({ error: 'NOT_FOUND' });
    if (round.status !== 'lobby') return reply.code(409).send({ error: 'ROUND_ALREADY_STARTED' });
    const body: any = req.body;
    const player = rounds.joinRound(round, body.playerName);
    reply.send({ playerId: player.id, roundId: round.id, roundSummary: { settings: round.settings } });
  });

  app.get('/api/rounds/:id/questions', async (req, reply) => {
    const round = rounds.getRound((req.params as any).id);
    if (!round) return reply.code(404).send({ error: 'NOT_FOUND' });
    if (round.questions.length === 0) {
      const qs = await fetchQuestions(round.settings.numQuestions, round.settings.category || '9', round.settings.difficulty || 'medium', round.settings.language || 'de');
      rounds.startRound(round, qs);
    }
    reply.send(round.questions.map((q) => ({ id: q.id, type: q.type, text: q.text, options: q.options })));
  });

  app.post('/api/rounds/:id/finish', async (req, reply) => {
    const round = rounds.getRound((req.params as any).id);
    if (!round) return reply.code(404).send({ error: 'NOT_FOUND' });
    rounds.endRound(round);
    const ranking = rounds.getResults(round);
    reply.send({ ok: true, ranking });
  });

  return { app, httpServer };
}

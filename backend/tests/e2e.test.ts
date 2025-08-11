import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { buildServer } from '../src/server';
import * as trivia from '../src/lib/trivia';
import { rounds } from '../src/lib/round-manager';

const sampleQuestion = [{ id: 'q1', type: 'single', text: '2+2?', options: [{ id: 'a', text: '4' }, { id: 'b', text: '5' }], correct: 'a' }];

describe('quiz flow', () => {
  beforeAll(() => {
    // mock trivia
    vi.spyOn(trivia, 'fetchQuestions').mockResolvedValue(sampleQuestion as any);
  });

  it('creates round and completes flow', async () => {
    const { app } = buildServer();
    await app.ready();
    const agent = request(app.server);
    const create = await agent.post('/api/rounds').send({ hostName: 'Host', settings: { numQuestions: 1 } });
    expect(create.status).toBe(200);
    const roundId = create.body.roundId;
    const join = await agent.post(`/api/rounds/${roundId}/join`).send({ playerName: 'Alice' });
    expect(join.status).toBe(200);
    const qs = await agent.get(`/api/rounds/${roundId}/questions`);
    expect(qs.body.length).toBe(1);
    // finish
    const end = await agent.post(`/api/rounds/${roundId}/finish`).send();
    expect(end.body.ranking[0].points).toBe(0); // no answers
    await app.close();
  });

  it('blocks late joiners after start', async () => {
    const { app } = buildServer();
    await app.ready();
    const agent = request(app.server);
    const create = await agent.post('/api/rounds').send({ hostName: 'Host', settings: { numQuestions: 1 } });
    const roundId = create.body.roundId;
    await agent.post(`/api/rounds/${roundId}/join`).send({ playerName: 'Alice' });
    await agent.get(`/api/rounds/${roundId}/questions`); // start round
    const join = await agent.post(`/api/rounds/${roundId}/join`).send({ playerName: 'Bob' });
    expect(join.status).toBe(409);
    await app.close();
  });

  it('reconnect keeps progress', async () => {
    const { app } = buildServer();
    await app.ready();
    const agent = request(app.server);
    const create = await agent.post('/api/rounds').send({ hostName: 'Host', settings: { numQuestions: 1 } });
    const roundId = create.body.roundId;
    const join = await agent.post(`/api/rounds/${roundId}/join`).send({ playerName: 'Alice' });
    const playerId = join.body.playerId;
    await agent.get(`/api/rounds/${roundId}/questions`); // start
    const round = rounds.getRound(roundId)!;
    rounds.submitAnswer(round, { playerId, questionId: sampleQuestion[0].id, payload: 'a', submittedAt: Date.now() });
    // simulate reconnect by inspecting stored answers
    const again = round.players.get(playerId);
    expect(again?.answers[sampleQuestion[0].id].payload).toBe('a');
    await app.close();
  });
});

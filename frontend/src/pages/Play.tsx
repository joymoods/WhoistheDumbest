import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api } from '../lib/api';

interface Question {
  id: string;
  text: string;
  type: string;
  options?: { id: string; text: string }[];
}

export default function Play() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const playerId = search.get('player')!;
  const [questions, setQuestions] = useState<Question[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api<Question[]>(`/rounds/${id}/questions`).then(setQuestions).catch(console.error);
  }, [id]);

  const socket = io('/', { path: '/socket.io' });
  useEffect(() => {
    socket.emit('join', { roundId: id, playerId });
    return () => { socket.disconnect(); };
  }, [id, playerId]);

  function setAnswer(qid: string, val: string) {
    socket.emit('answer', { roundId: id, playerId, questionId: qid, payload: val, submittedAt: Date.now() });
  }

  async function finish() {
    const data = await api(`/rounds/${id}/finish`, { method: 'POST' });
    navigate(`/result/${id}`, { state: data });
  }

  return (
    <div className="p-4 space-y-4">
      {questions.map(q => (
        <div key={q.id} className="border p-2">
          <p className="font-bold">{q.text}</p>
          {q.options?.map(o => (
            <label key={o.id} className="block">
              <input type="radio" name={q.id} onChange={() => setAnswer(q.id, o.id)} /> {o.text}
            </label>
          ))}
        </div>
      ))}
      <button className="bg-blue-500 text-white px-4 py-2" onClick={finish}>Fertig</button>
    </div>
  );
}

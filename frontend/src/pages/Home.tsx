import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Home() {
  const navigate = useNavigate();
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [language, setLanguage] = useState('de');
  const [timeLimitSec, setTimeLimitSec] = useState(600);
  const [shuffle, setShuffle] = useState(false);

  async function createRound() {
    const data = await api<{ roundId: string }>(
      '/rounds',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: 'Host', settings: { numQuestions, difficulty, language, timeLimitSec, shuffle } }),
      }
    );
    navigate(`/lobby/${data.roundId}`);
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-2">
      <h1 className="text-2xl font-bold">Neue Runde erstellen</h1>
      <label className="block">Fragenanzahl
        <input className="border w-full" type="number" value={numQuestions} min={5} max={50} onChange={e => setNumQuestions(Number(e.target.value))} />
      </label>
      <label className="block">Schwierigkeit
        <select className="border w-full" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
          <option value="easy">Leicht</option>
          <option value="medium">Mittel</option>
          <option value="hard">Schwer</option>
        </select>
      </label>
      <label className="block">Sprache
        <select className="border w-full" value={language} onChange={e => setLanguage(e.target.value)}>
          <option value="de">Deutsch</option>
          <option value="en">Englisch</option>
        </select>
      </label>
      <label className="block">Zeitlimit (Sek)
        <input className="border w-full" type="number" value={timeLimitSec} onChange={e => setTimeLimitSec(Number(e.target.value))} />
      </label>
      <label className="block">Shuffle
        <input type="checkbox" checked={shuffle} onChange={e => setShuffle(e.target.checked)} />
      </label>
      <button className="bg-blue-500 text-white px-4 py-2" onClick={createRound}>Runde erstellen</button>
    </div>
  );
}

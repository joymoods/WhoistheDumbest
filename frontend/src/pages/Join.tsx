import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function Join() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');

  async function join() {
    const res = await fetch(`/api/rounds/${code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName: name }),
    });
    if (res.status === 409) {
      alert('Runde bereits gestartet');
      return;
    }
    const data = await res.json();
    navigate(`/lobby/${data.roundId}?player=${data.playerId}`);
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-2">
      <h1 className="text-2xl font-bold">Beitreten</h1>
      <input className="border w-full" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <button className="bg-blue-500 text-white px-4 py-2" onClick={join}>Beitreten</button>
    </div>
  );
}

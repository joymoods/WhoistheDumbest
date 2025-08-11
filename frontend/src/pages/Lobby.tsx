import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

export default function Lobby() {
  const { id } = useParams();
  const [players, setPlayers] = useState<string[]>([]);
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const playerId = search.get('player');

  useEffect(() => {
    // simplistic: just show current player
    if (playerId) setPlayers([playerId]);
  }, [playerId]);

  function start() {
    navigate(`/play/${id}?player=${playerId}`);
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-2">
      <h1 className="text-2xl font-bold">Lobby</h1>
      <ul className="border p-2 min-h-[100px]">
        {players.map(p => <li key={p}>{p}</li>)}
      </ul>
      <button className="bg-green-500 text-white px-4 py-2" onClick={start}>Runde starten</button>
    </div>
  );
}

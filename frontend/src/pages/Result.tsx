import { useLocation } from 'react-router-dom';

export default function Result() {
  const { state }: any = useLocation();
  const ranking = state?.ranking || [];
  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">Ergebnis</h1>
      <ol>
        {ranking.map((r: any, i: number) => (
          <li key={r.playerId}>{i + 1}. {r.name} - {r.points} Punkte</li>
        ))}
      </ol>
    </div>
  );
}

import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Join from './pages/Join';
import Lobby from './pages/Lobby';
import Play from './pages/Play';
import Result from './pages/Result';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/join/:code" element={<Join />} />
      <Route path="/lobby/:id" element={<Lobby />} />
      <Route path="/play/:id" element={<Play />} />
      <Route path="/result/:id" element={<Result />} />
    </Routes>
  );
}

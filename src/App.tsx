// HashRouter — działa pod każdą podścieżką (np. /apps/app/ na moście USB)
// bez basename i bez server-side fallbacku dla deep-linków.
import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Workspace from './components/Workspace';
import TeOnautsApps from './components/TeOnautsApps'; // <--- Import
import KodeksView from './components/KodeksView';

function KodeksTrasa() {
  return <KodeksView onBack={() => { window.location.hash = '#/'; }} />;
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<Workspace />} />
        <Route path="/community" element={<TeOnautsApps />} /> {/* <--- Nowa Trasa */}
        {/* 🛠️ App Studio 2.0 — Kodeks buduje apki na moście (2026-09-21) */}
        <Route path="/kodeks" element={<KodeksTrasa />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
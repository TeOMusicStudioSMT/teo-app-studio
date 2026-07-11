// HashRouter — działa pod każdą podścieżką (np. /apps/app/ na moście USB)
// bez basename i bez server-side fallbacku dla deep-linków.
import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Workspace from './components/Workspace';
import TeOnautsApps from './components/TeOnautsApps'; // <--- Import

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<Workspace />} />
        <Route path="/community" element={<TeOnautsApps />} /> {/* <--- Nowa Trasa */}
      </Routes>
    </HashRouter>
  );
}

export default App;
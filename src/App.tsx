import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Workspace from './components/Workspace';
import TeOnautsApps from './components/TeOnautsApps'; // <--- Import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<Workspace />} />
        <Route path="/community" element={<TeOnautsApps />} /> {/* <--- Nowa Trasa */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
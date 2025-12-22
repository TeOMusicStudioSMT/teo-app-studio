import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Workspace from './Workspace';
import TeOnautsApps from './TeOnautsApps'; // <--- Import

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
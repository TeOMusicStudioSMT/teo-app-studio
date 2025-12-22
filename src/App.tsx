import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Workspace from './Workspace';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ścieżka główna - Dashboard Wyboru */}
        <Route path="/" element={<Dashboard />} />

        {/* Ścieżka kreacji - Laboratorium */}
        <Route path="/create" element={<Workspace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
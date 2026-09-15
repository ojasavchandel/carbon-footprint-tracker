import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { CarbonProvider } from './context/CarbonContext';

function App() {
  return (
    <BrowserRouter>
      <CarbonProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </AppShell>
      </CarbonProvider>
    </BrowserRouter>
  );
}

export default App;

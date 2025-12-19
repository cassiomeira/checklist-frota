import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { VehiclesPage } from './pages/VehiclesPage';
import { DriversPage } from './pages/DriversPage';
import { ChecklistPage } from './pages/ChecklistPage';
import { ChecklistSettings } from './pages/ChecklistSettings';
import { FleetProvider } from './store/FleetContext';

function App() {
  return (
    <FleetProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/checklist" element={<ChecklistPage />} />
            <Route path="/settings" element={<ChecklistSettings />} />
          </Routes>
        </Layout>
      </Router>
    </FleetProvider>
  );
}

export default App;

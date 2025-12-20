import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { VehiclesPage } from './pages/VehiclesPage';
import { DriversPage } from './pages/DriversPage';
import { ChecklistPage } from './pages/ChecklistPage';
import { ChecklistSettings } from './pages/ChecklistSettings';
import { FinancialDashboard } from './pages/FinancialDashboard';
import { SuppliersPage } from './pages/financial/SuppliersPage';
import { FinancialAccountsPage } from './pages/financial/FinancialAccountsPage';
import { TransactionsPage } from './pages/financial/TransactionsPage';
import { FuelPage } from './pages/financial/FuelPage';
import { CustomersPage } from './pages/financial/CustomersPage';
import { FleetProvider } from './store/FleetContext';
import { FinancialProvider } from './store/FinancialContext';

function App() {
  return (
    <FleetProvider>
      <FinancialProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/vehicles" element={<VehiclesPage />} />
              <Route path="/drivers" element={<DriversPage />} />
              <Route path="/checklist" element={<ChecklistPage />} />
              <Route path="/settings" element={<ChecklistSettings />} />
              <Route path="/financial" element={<FinancialDashboard />} />
              <Route path="/financial/suppliers" element={<SuppliersPage />} />
              <Route path="/financial/accounts" element={<FinancialAccountsPage />} />
              <Route path="/financial/transactions" element={<TransactionsPage />} />
              <Route path="/financial/fuel" element={<FuelPage />} />
              <Route path="/financial/customers" element={<CustomersPage />} />
            </Routes>
          </Layout>
        </Router>
      </FinancialProvider>
    </FleetProvider>
  );
}

export default App;

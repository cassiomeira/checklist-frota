import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { BackupPage } from './pages/BackupPage';
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
import { TripsPage } from './pages/financial/TripsPage';
import { DriverStatementPage } from './pages/financial/DriverStatementPage';
import { MonthlyReportPage } from './pages/financial/MonthlyReportPage';
import { FleetProvider } from './store/FleetContext';
import { FinancialProvider } from './store/FinancialContext';

function App() {
  return (
    <FleetProvider>
      <FinancialProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/vehicles" element={<VehiclesPage />} />
                      <Route path="/drivers" element={<DriversPage />} />
                      <Route path="/checklist" element={<ChecklistPage />} />
                      <Route path="/settings" element={<ChecklistSettings />} />
                      <Route path="/financial" element={<FinancialDashboard />} />
                      <Route path="/financial/dashboard" element={<FinancialDashboard />} />
                      <Route path="/financial/suppliers" element={<SuppliersPage />} />
                      <Route path="/financial/accounts" element={<FinancialAccountsPage />} />
                      <Route path="/financial/trips" element={<TripsPage />} />
                      <Route path="/financial/transactions" element={<TransactionsPage />} />
                      <Route path="/financial/fuel" element={<FuelPage />} />
                      <Route path="/financial/customers" element={<CustomersPage />} />
                      <Route path="/financial/driver-statement" element={<DriverStatementPage />} />
                      <Route path="/financial/reports" element={<MonthlyReportPage />} />
                      <Route path="/backup" element={<BackupPage />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </FinancialProvider>
    </FleetProvider>
  );
}

export default App;

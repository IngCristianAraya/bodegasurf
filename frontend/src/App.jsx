// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Login from './pages/Login';
import Ventas from './pages/Ventas';
import Inventario from './pages/Inventario';
import Historial from './pages/Historial';
import Clientes from './pages/Clientes';
import Pedidos from './pages/Pedidos';
import Proveedores from './pages/Proveedores';
import Informacion from './pages/Informacion';
import TransactionsPage from './pages/TransactionsPage';
import TransactionDetails from './components/transactions/TransactionDetails';
import PaymentSettingsPage from './pages/admin/PaymentSettingsPage';

function App() {
  return (
    <AuthProvider>
      <Layout>
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/ventas" />} />
            <Route path="/ventas" element={
              <ProtectedRoute>
                <Ventas />
              </ProtectedRoute>
            } />
            <Route path="/inventario" element={
              <ProtectedRoute>
                <Inventario />
              </ProtectedRoute>
            } />
            <Route path="/historial" element={
              <ProtectedRoute>
                <Historial />
              </ProtectedRoute>
            } />
            <Route path="/clientes" element={
              <ProtectedRoute>
                <Clientes />
              </ProtectedRoute>
            } />
            <Route path="/pedidos" element={
              <ProtectedRoute>
                <Pedidos />
              </ProtectedRoute>
            } />
            <Route path="/proveedores" element={
              <ProtectedRoute>
                <Proveedores />
              </ProtectedRoute>
            } />
            <Route path="/transacciones" element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            } />
            <Route path="/transacciones/:id" element={
              <ProtectedRoute>
                <TransactionDetails />
              </ProtectedRoute>
            } />
            {/* Rutas de administración */}
            <Route path="/admin/payment-settings" element={
              <ProtectedRoute adminOnly={true}>
                <PaymentSettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/informacion" element={
              <ProtectedRoute>
                <Informacion />
              </ProtectedRoute>
            } />
          </Routes>
        </ErrorBoundary>
      </Layout>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
  );
}

export default App;

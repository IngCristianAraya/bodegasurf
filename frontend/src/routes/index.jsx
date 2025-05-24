import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from '../components/ProtectedRoute';
import ErrorBoundary from '../components/ErrorBoundary';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import Ventas from '../pages/Ventas';
import Inventario from '../pages/Inventario';
import Historial from '../pages/Historial';
import Clientes from '../pages/Clientes';
import Pedidos from '../pages/Pedidos';
import Proveedores from '../pages/Proveedores';
import Informacion from '../pages/Informacion';
import TransactionsPage from '../pages/TransactionsPage';
import TransactionDetails from '../components/transactions/TransactionDetails';
import PaymentSettingsPage from '../pages/admin/PaymentSettingsPage';

const AppRoutes = () => {
    return (
        <ErrorBoundary>
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* Rutas protegidas dentro del layout */}
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route path="/" element={<Navigate to="/ventas" replace />} />
                    <Route path="/ventas" element={<Ventas />} />
                    <Route path="/inventario" element={<Inventario />} />
                    <Route path="/historial" element={<Historial />} />
                    <Route path="/clientes" element={<Clientes />} />
                    <Route path="/pedidos" element={<Pedidos />} />
                    <Route path="/proveedores" element={<Proveedores />} />
                    <Route path="/informacion" element={<Informacion />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/transactions/:id" element={<TransactionDetails />} />
                    <Route path="/admin/payment-settings" element={<PaymentSettingsPage />} />
                </Route>

                {/* Ruta por defecto - redirigir a ventas */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </ErrorBoundary>
    );
};

export default AppRoutes; 
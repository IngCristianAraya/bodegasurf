// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout'; 
import Ventas from './pages/Ventas';
import Inventario from './pages/Inventario';
import Historial from './pages/Historial';
import Clientes from './pages/Clientes';
import Pedidos from './pages/Pedidos';
import Proveedores from './pages/Proveedores';
import Informacion from './pages/Informacion';

function App() {
  return (
    <>
      <Layout> 
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/ventas" />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/informacion" element={<Informacion />} />
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
    </>
  );
}

export default App;

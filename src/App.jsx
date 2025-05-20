// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout'; 
import Ventas from './pages/Ventas';
import Inventario from './pages/Inventario';
import Historial from './pages/Historial';

function App() {
  return (
    <>
      <Layout> 
        <Routes>
          <Route path="/" element={<Navigate to="/ventas" />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/historial" element={<Historial />} />
        </Routes>
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

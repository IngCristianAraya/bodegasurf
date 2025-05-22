import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import AuthContext from '@context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si la ruta es solo para administradores y el usuario no es admin
  if (adminOnly && user.role !== 'admin') {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="60vh"
        textAlign="center"
        p={3}
      >
        <Typography variant="h5" color="error" gutterBottom>
          Acceso restringido
        </Typography>
        <Typography variant="body1" paragraph>
          No tienes los permisos necesarios para acceder a esta sección.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.history.back()}
          sx={{ mt: 2 }}
        >
          Volver atrás
        </Button>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;

import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useAuth } from '@context/AuthContext';
import PaymentSettings from '@components/admin/PaymentSettings';
import Layout from '@components/Layout';

const PaymentSettingsPage = () => {
  const { user } = useAuth();

  // Verificar si el usuario es administrador
  if (user?.role !== 'admin') {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="60vh"
            textAlign="center"
          >
            <Typography variant="h5" color="error" gutterBottom>
              Acceso no autorizado
            </Typography>
            <Typography variant="body1">
              No tienes los permisos necesarios para acceder a esta sección.
            </Typography>
          </Box>
        </Container>
      </Layout>
    );
  }


  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Configuración de Pagos
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Gestiona el estado del sistema de pagos para tu tienda
          </Typography>
        </Box>

        <PaymentSettings />
      </Container>
    </Layout>
  );
};

export default PaymentSettingsPage;

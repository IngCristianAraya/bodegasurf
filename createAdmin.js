const axios = require('axios');

// Datos del usuario administrador
const adminUser = {
  name: 'Administrador',
  email: 'admin@bodega.com',
  password: 'admin123',
  role: 'admin',
  tenantId: 'admin-tenant'
};

// URL de la API (ajusta según sea necesario)
const API_URL = 'http://localhost:5000/api/auth/register';

// Función para crear el usuario administrador
async function createAdminUser() {
  try {
    console.log('Intentando crear usuario administrador...');
    const response = await axios.post(API_URL, adminUser);
    console.log('✅ Usuario administrador creado exitosamente:');
    console.log('Email:', adminUser.email);
    console.log('Contraseña:', adminUser.password);
  } catch (error) {
    console.error('❌ Error al crear el usuario administrador:');
    if (error.response) {
      // La solicitud fue hecha y el servidor respondió con un código de estado
      console.error('Datos del error:', error.response.data);
      console.error('Código de estado:', error.response.status);
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor. ¿El servidor está en ejecución?');
    } else {
      // Algo sucedió al configurar la solicitud
      console.error('Error al configurar la solicitud:', error.message);
    }
  }
}

// Ejecutar la función
createAdminUser();

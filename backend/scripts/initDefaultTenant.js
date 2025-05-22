import { connectDB } from '../src/config/db.js';
import { Tenant } from '../src/models/index.js';

const initDefaultTenant = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    // Verificar si ya existe un tenant por defecto
    const existingTenant = await Tenant.findOne({ subdomain: 'default' });
    
    if (existingTenant) {
      console.log('Ya existe un tenant por defecto:');
      console.log(existingTenant);
      process.exit(0);
    }
    
    // Crear tenant por defecto
    const defaultTenant = await Tenant.create({
      name: 'Tenant por Defecto',
      subdomain: 'default',
      email: 'admin@example.com',
      phone: '+1234567890',
      address: {
        street: 'Calle Falsa',
        city: 'Ciudad',
        state: 'Estado',
        zipCode: '12345',
        country: 'País'
      },
      subscription: {
        plan: 'free',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año
      },
      settings: {
        currency: 'USD',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        language: 'es',
        theme: 'light'
      },
      isActive: true
    });
    
    console.log('Tenant por defecto creado exitosamente:');
    console.log(defaultTenant);
    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar el tenant por defecto:', error);
    process.exit(1);
  }
};

// Ejecutar la función
initDefaultTenant();

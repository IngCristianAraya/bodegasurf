import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Tenant from '../src/models/Tenant.js';
import User from '../src/models/User.js';

// Cargar variables de entorno
dotenv.config({ path: '../../.env' });

// Configuración de la conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ingcristianaraya:HPLXAn17gou4e80F@ventasbodega.d0rujmo.mongodb.net/ventas_bodega?retryWrites=true&w=majority';

// Configuración de opciones de conexión
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Datos del tenant predeterminado
const defaultTenantData = {
  name: 'Tienda Principal',
  subdomain: 'default',
  email: 'admin@bodega.com',
  phone: '+1234567890',
  address: {
    street: 'Calle Principal',
    city: 'Ciudad',
    state: 'Estado',
    postalCode: '12345',
    country: 'País'
  },
  subscription: {
    plan: 'premium',
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año después
  },
  settings: {
    currency: 'USD',
    timezone: 'America/Mexico_City',
    isDefault: true
  },
  isActive: true
};

// Datos del administrador
const adminData = {
  name: 'Administrador',
  email: 'admin@bodega.com',
  password: 'admin123',
  role: 'admin',
  isActive: true,
  isEmailVerified: true
};

async function setupDefaultTenant() {
  try {
    // Conectar a la base de datos
    console.log('Conectando a la base de datos...');
    console.log('URI de conexión:', MONGODB_URI.replace(/:([^:]+)@/, ':***@'));
    
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    
    // Verificar la conexión
    await mongoose.connection.db.admin().ping();
    console.log('✅ Conexión exitosa a MongoDB Atlas');

    // Iniciar sesión
    let session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Verificar si ya existe un tenant predeterminado
      let tenant = await Tenant.findOne({ 'settings.isDefault': true }).session(session);
      
      if (!tenant) {
        console.log('Creando tenant predeterminado...');
        // Crear el tenant predeterminado
        tenant = await Tenant.create([defaultTenantData], { session });
        tenant = tenant[0];
        console.log('✅ Tenant predeterminado creado exitosamente');
      } else {
        console.log('⚠️  Ya existe un tenant predeterminado en la base de datos');
      }

      // Verificar si ya existe un administrador
      let admin = await User.findOne({ email: adminData.email }).session(session);
      
      if (!admin) {
        console.log('Creando usuario administrador...');
        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);
        
        // Crear el usuario administrador asociado al tenant
        admin = await User.create([{
          ...adminData,
          password: hashedPassword,
          tenantId: tenant._id
        }], { session });
        
        admin = admin[0];
        console.log('✅ Usuario administrador creado exitosamente');
      } else {
        console.log('⚠️  El usuario administrador ya existe en la base de datos');
      }

      await session.commitTransaction();
      console.log('\n✅ Configuración completada exitosamente');
      console.log('----------------------------------------');
      console.log('🔑 Credenciales de acceso:');
      console.log('   Email: admin@bodega.com');
      console.log('   Contraseña: admin123');
      console.log('----------------------------------------');
      
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('❌ Error durante la configuración:');
    console.error(error.message);
    
    // Mostrar información de depuración adicional
    if (error.name === 'MongoServerSelectionError') {
      console.error('\nPosibles causas:');
      console.error('- La cadena de conexión podría ser incorrecta');
      console.error('- El servidor MongoDB podría no estar accesible');
      console.error('- La dirección IP podría no estar en la lista blanca');
      console.error('- Podría haber un problema de red o firewall');
      console.error('\nSolución:');
      console.error('- Verifica que la cadena de conexión sea correcta');
      console.error('- Asegúrate de que tu IP esté en la lista blanca de MongoDB Atlas');
      console.error('- Verifica tu conexión a internet');
    }
    process.exit(1);
  } finally {
    // Cerrar la conexión a la base de datos
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Ejecutar la función
setupDefaultTenant();

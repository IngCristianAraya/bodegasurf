import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Tenant from '../src/models/Tenant.js';

// Cargar variables de entorno
dotenv.config();

// Configuración de la conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ventas_bodega';

// Datos del tenant por defecto
const DEFAULT_TENANT = {
  name: 'Bodega Principal',
  subdomain: 'default',
  email: 'admin@bodega.com',
  phone: '+1234567890',
  address: {
    street: 'Calle Principal',
    city: 'Ciudad',
    state: 'Estado',
    postalCode: '00000',
    country: 'País'
  },
  subscription: {
    plan: 'enterprise',
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año
  },
  isDefault: true,
  isActive: true
};

// Datos del administrador
const ADMIN_EMAIL = 'admin@bodega.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Administrador';

async function initAdmin() {
  let connection;
  try {
    // 1. Conectar a la base de datos
    console.log('🔌 Conectando a la base de datos...');
    connection = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conexión exitosa a MongoDB');

    // 2. Verificar o crear el tenant por defecto
    console.log('🔍 Buscando tenant por defecto...');
    let tenant = await Tenant.findOne({ isDefault: true });
    
    if (!tenant) {
      console.log('ℹ️  No se encontró un tenant por defecto. Creando uno...');
      tenant = await Tenant.create(DEFAULT_TENANT);
      console.log(`✅ Tenant creado: ${tenant.name} (${tenant._id})`);
    } else {
      console.log(`ℹ️  Tenant encontrado: ${tenant.name} (${tenant._id})`);
    }

    // 3. Verificar o crear el usuario administrador
    console.log('🔍 Buscando usuario administrador...');
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (!admin) {
      console.log('ℹ️  No se encontró el usuario administrador. Creando uno...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        tenantId: tenant._id,
        isActive: true
      });
      
      console.log('✅ Usuario administrador creado exitosamente');
    } else {
      console.log('ℹ️  El usuario administrador ya existe');
    }

    // Mostrar credenciales
    console.log('\n✨ Inicialización completada con éxito!');
    console.log('======================================');
    console.log('🔑 Credenciales de acceso:');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔑 Contraseña: ${ADMIN_PASSWORD}`);
    console.log('======================================');
    
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await mongoose.connection.close();
      console.log('🔌 Conexión a MongoDB cerrada');
    }
    process.exit(0);
  }
}

// Ejecutar la función
initAdmin();

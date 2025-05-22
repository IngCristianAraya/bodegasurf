import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Tenant from '../src/models/Tenant.js';

// Cargar variables de entorno
dotenv.config();

// Configuración de la conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ventas_bodega';

// Datos del administrador
const ADMIN_EMAIL = 'admin@bodega.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Administrador';

async function ensureAdminUser() {
  try {
    console.log('Conectando a la base de datos...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conexión exitosa a MongoDB');

    // Obtener el tenant por defecto
    const defaultTenant = await Tenant.findOne({ isDefault: true });
    
    if (!defaultTenant) {
      console.error('❌ No se encontró un tenant por defecto');
      process.exit(1);
    }

    console.log('Tenant por defecto encontrado:', defaultTenant.name);

    // Verificar si ya existe el usuario administrador
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('ℹ️  El usuario administrador ya existe');
      console.log('ID:', existingAdmin._id);
      console.log('Email:', existingAdmin.email);
      console.log('Para restablecer la contraseña, ejecuta: node scripts/resetAdminPassword.js');
      process.exit(0);
    }

    // Crear el usuario administrador
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    const adminUser = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      tenantId: defaultTenant._id,
      isActive: true
    });

    console.log('✅ Usuario administrador creado exitosamente');
    console.log('ID:', adminUser._id);
    console.log('Email:', adminUser.email);
    console.log('Contraseña:', ADMIN_PASSWORD);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear el usuario administrador:', error);
    process.exit(1);
  }
}

// Ejecutar la función
ensureAdminUser();

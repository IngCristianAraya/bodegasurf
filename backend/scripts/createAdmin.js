import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

// Cargar variables de entorno
dotenv.config();

// Configuración de la conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ventas_bodega';

// Datos del administrador
const adminData = {
  name: 'Administrador',
  email: 'admin@bodega.com',
  password: 'admin123',
  role: 'admin',
  tenantId: 'admin-tenant',
  isActive: true
};

async function createAdmin() {
  try {
    // Conectar a la base de datos
    console.log('Conectando a la base de datos...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conexión exitosa a MongoDB');

    // Verificar si ya existe un administrador
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('El administrador ya existe en la base de datos');
      console.log('Email:', existingAdmin.email);
      console.log('Contraseña: admin123');
      process.exit(0);
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    // Crear el usuario administrador
    const admin = await User.create(adminData);
    
    console.log('✅ Usuario administrador creado exitosamente');
    console.log('Email:', admin.email);
    console.log('Contraseña: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear el usuario administrador:', error);
    process.exit(1);
  }
}

// Ejecutar la función
createAdmin();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';

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

async function checkAdminUser() {
  try {
    console.log('Conectando a la base de datos...');
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('✅ Conexión exitosa a MongoDB Atlas');

    // Buscar el usuario administrador
    const adminEmail = 'admin@bodega.com';
    console.log(`\nBuscando usuario administrador con email: ${adminEmail}`);
    
    const adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      console.log('❌ No se encontró el usuario administrador');
      return;
    }

    console.log('\n✅ Usuario administrador encontrado:');
    console.log('- ID:', adminUser._id);
    console.log('- Nombre:', adminUser.name);
    console.log('- Email:', adminUser.email);
    console.log('- Rol:', adminUser.role);
    console.log('- Activo:', adminUser.isActive);
    console.log('- Verificación de email:', adminUser.isEmailVerified);
    console.log('- Fecha de creación:', adminUser.createdAt);
    
    // Verificar la contraseña
    const testPassword = 'admin123';
    const isMatch = await bcrypt.compare(testPassword, adminUser.password);
    console.log(`\n🔑 Verificación de contraseña (${testPassword}):`, isMatch ? '✅ Correcta' : '❌ Incorrecta');
    
  } catch (error) {
    console.error('\n❌ Error al verificar el usuario administrador:');
    console.error(error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Ejecutar la función
checkAdminUser().catch(console.error);

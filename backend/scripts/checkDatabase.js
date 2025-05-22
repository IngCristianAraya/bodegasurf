import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de la conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ventas_bodega';

async function checkDatabase() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conexión exitosa a MongoDB');

    // Obtener colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📂 Colecciones en la base de datos:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Verificar si existe el tenant por defecto
    const Tenant = mongoose.model('Tenant');
    const defaultTenant = await Tenant.findOne({ isDefault: true });
    
    console.log('\n🔍 Buscando tenant por defecto...');
    if (defaultTenant) {
      console.log(`✅ Tenant por defecto encontrado: ${defaultTenant.name} (${defaultTenant._id})`);
    } else {
      console.log('❌ No se encontró un tenant por defecto');
    }

    // Verificar si existe el usuario administrador
    const User = mongoose.model('User');
    const adminUser = await User.findOne({ email: 'admin@bodega.com' });
    
    console.log('\n🔍 Buscando usuario administrador...');
    if (adminUser) {
      console.log(`✅ Usuario administrador encontrado: ${adminUser.email} (${adminUser._id})`);
    } else {
      console.log('❌ No se encontró el usuario administrador');
    }

  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

// Ejecutar la función
checkDatabase();

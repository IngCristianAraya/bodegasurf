import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ventas_bodega';

async function checkConnection() {
  try {
    console.log('🔌 Intentando conectar a MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conexión exitosa a MongoDB');
    
    // Listar colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📂 Colecciones disponibles:');
    collections.forEach(c => console.log(`- ${c.name}`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    process.exit(1);
  }
}

checkConnection();

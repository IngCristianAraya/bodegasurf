import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Cargar variables de entorno
dotenv.config();

// Configuración de la conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ventas_bodega';

// Datos del administrador
const ADMIN_EMAIL = 'admin@bodega.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Administrador';

// Esquema de Usuario
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Modelo de Usuario
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conexión exitosa a MongoDB');

    // Obtener el primer tenant disponible
    const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', new mongoose.Schema({}));
    const tenant = await Tenant.findOne();
    
    if (!tenant) {
      console.error('❌ No se encontró ningún tenant en la base de datos');
      process.exit(1);
    }

    console.log(`ℹ️  Usando tenant: ${tenant._id}`);

    // Verificar si ya existe el usuario administrador
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('ℹ️  El usuario administrador ya existe:');
      console.log(`ID: ${existingAdmin._id}`);
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Rol: ${existingAdmin.role}`);
      console.log('Para restablecer la contraseña, ejecuta: node scripts/resetAdminPassword.js');
      process.exit(0);
    }

    // Crear el usuario administrador
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    const adminUser = new User({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      tenantId: tenant._id,
      isActive: true
    });

    await adminUser.save();

    console.log('✅ Usuario administrador creado exitosamente:');
    console.log(`ID: ${adminUser._id}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Contraseña: ${ADMIN_PASSWORD}`);
    
  } catch (error) {
    console.error('❌ Error al crear el usuario administrador:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

// Ejecutar la función
createAdminUser();

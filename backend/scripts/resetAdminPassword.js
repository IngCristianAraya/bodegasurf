import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Cargar variables de entorno
dotenv.config({ path: '../../.env' });

// Configuración de la conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ingcristianaraya:HPLXAn17gou4e80F@ventasbodega.d0rujmo.mongodb.net/ventas_bodega?retryWrites=true&w=majority';

// Datos del administrador
const ADMIN_EMAIL = 'admin@bodega.com';
const NEW_PASSWORD = 'admin123';

// Esquema de Usuario
const userSchema = new mongoose.Schema({
  name: String,
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
  role: String,
  tenantId: mongoose.Schema.Types.ObjectId,
  isActive: Boolean
}, {
  timestamps: true
});

// Modelo de Usuario
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function resetAdminPassword() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Conexión exitosa a MongoDB Atlas');
    
    // Verificar la conexión
    await mongoose.connection.db.admin().ping();

    // Buscar el usuario administrador
    console.log(`\nBuscando usuario administrador con email: ${ADMIN_EMAIL}`);
    let adminUser = await User.findOne({ email: ADMIN_EMAIL });
    
    if (!adminUser) {
      console.log('❌ No se encontró el usuario administrador. Creando uno nuevo...');
      // Crear un nuevo usuario administrador si no existe
      const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
      adminUser = new User({
        name: 'Administrador',
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });
      
      // Guardar el nuevo usuario administrador
      await adminUser.save();
      console.log('✅ Nuevo usuario administrador creado exitosamente');
    }

    console.log(`ℹ️  Usuario encontrado: ${adminUser.name} (${adminUser._id})`);
    
    // Actualizar la contraseña solo si el usuario ya existía
    if (adminUser._id) {
      const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
      
      // Actualizar la contraseña y otros campos importantes
      adminUser.password = hashedPassword;
      adminUser.isActive = true;
      adminUser.isEmailVerified = true;
      adminUser.role = 'admin'; // Asegurar que el rol sea admin
      
      // Guardar los cambios
      await adminUser.save();
    }
    
    console.log('✅ Operación completada exitosamente');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔑 Contraseña: ${NEW_PASSWORD}`);
    console.log('\n🔍 Detalles del usuario administrador:');
    console.log('- ID:', adminUser._id);
    console.log('- Nombre:', adminUser.name);
    console.log('- Rol:', adminUser.role);
    console.log('- Activo:', adminUser.isActive);
    console.log('- Verificación de email:', adminUser.isEmailVerified);
    console.log('- Última actualización:', new Date());
    
  } catch (error) {
    console.error('❌ Error al restablecer la contraseña:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

// Ejecutar la función
resetAdminPassword();

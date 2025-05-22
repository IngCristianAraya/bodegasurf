import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../../src/models/User.js';
import { StatusCodes } from 'http-status-codes';

// Datos de prueba
const testUserData = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Test123!',
  role: 'user',
  tenantId: new mongoose.Types.ObjectId(),
  isActive: true
};

describe('User Model', () => {
  beforeAll(async () => {
    // Configurar variables de entorno para pruebas
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRE = '30d';
    
    // Conectar a la base de datos de prueba
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    // Limpiar la colección de usuarios antes de cada prueba
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Cerrar la conexión después de las pruebas
    await mongoose.connection.close();
  });

  describe('Creación de usuario', () => {
    it('debería crear un nuevo usuario correctamente', async () => {
      const user = new User(testUserData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(testUserData.name);
      expect(savedUser.email).toBe(testUserData.email);
      expect(savedUser.role).toBe(testUserData.role);
      expect(savedUser.tenantId).toEqual(testUserData.tenantId);
      expect(savedUser.isActive).toBe(true);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('debería encriptar la contraseña al guardar', async () => {
      const user = new User(testUserData);
      const savedUser = await user.save();

      // Verificar que la contraseña no se guarda en texto plano
      expect(savedUser.password).not.toBe(testUserData.password);
      // Verificar que el hash es válido
      const isMatch = await bcrypt.compare(testUserData.password, savedUser.password);
      expect(isMatch).toBe(true);
    });

    it('debería requerir el campo email', async () => {
      const userWithoutEmail = { ...testUserData, email: undefined };
      const user = new User(userWithoutEmail);
      
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.email).toBeDefined();
    });

    it('debería requerir un email válido', async () => {
      const userWithInvalidEmail = { ...testUserData, email: 'invalid-email' };
      const user = new User(userWithInvalidEmail);
      
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.email).toBeDefined();
    });

    it('debería requerir una contraseña de al menos 6 caracteres', async () => {
      const userWithShortPassword = { ...testUserData, password: '12345' };
      const user = new User(userWithShortPassword);
      
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.password).toBeDefined();
    });
  });

  describe('Métodos de instancia', () => {
    let user;

    beforeEach(async () => {
      // Crear un usuario antes de cada prueba de métodos
      user = new User(testUserData);
      await user.save();
    });

    describe('matchPassword', () => {
      it('debería devolver true para una contraseña correcta', async () => {
        const isMatch = await user.matchPassword(testUserData.password);
        expect(isMatch).toBe(true);
      });

      it('debería devolver false para una contraseña incorrecta', async () => {
        const isMatch = await user.matchPassword('wrongpassword');
        expect(isMatch).toBe(false);
      });
    });

    describe('getSignedJwtToken', () => {
      it('debería generar un token JWT válido', () => {
        const token = user.getSignedJwtToken();
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        
        // Verificar que el token contiene los campos esperados
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded.id).toBe(user._id.toString());
        expect(decoded.tenantId).toBe(user.tenantId.toString());
        expect(decoded.role).toBe(user.role);
      });
    });

    describe('getResetPasswordToken', () => {
      it('debería generar un token de restablecimiento de contraseña', () => {
        const resetToken = user.getResetPasswordToken();
        
        expect(resetToken).toBeDefined();
        expect(typeof resetToken).toBe('string');
        expect(resetToken).toHaveLength(40); // Longitud típica de un token hexadecimal de 20 bytes
        
        // Verificar que los campos se actualizaron en el usuario
        expect(user.resetPasswordToken).toBeDefined();
        expect(user.resetPasswordExpire).toBeDefined();
        expect(user.resetPasswordExpire).toBeInstanceOf(Date);
        
        // Verificar que la fecha de expiración es en el futuro
        const now = new Date();
        expect(user.resetPasswordExpire.getTime()).toBeGreaterThan(now.getTime());
      });
    });
  });

  describe('Hooks', () => {
    it('debería convertir el email a minúsculas antes de guardar', async () => {
      const emailWithUppercase = 'Test@Example.com';
      const user = new User({
        ...testUserData,
        email: emailWithUppercase
      });
      
      await user.save();
      
      expect(user.email).toBe(emailWithUppercase.toLowerCase());
    });
  });

  describe('Índices', () => {
    it('debería tener un índice único en el campo email', async () => {
      // Crear un usuario con un email
      await User.create(testUserData);
      
      // Intentar crear otro usuario con el mismo email
      let error;
      try {
        await User.create({
          ...testUserData,
          _id: new mongoose.Types.ObjectId() // ID diferente
        });
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // Código de error de duplicado en MongoDB
    });
  });
});
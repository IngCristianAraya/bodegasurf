const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { StatusCodes } = require('http-status-codes');
const app = require('../../../src/app');
const User = require('../../../src/models/User');
const Tenant = require('../../../src/models/Tenant');

// Datos de prueba
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Test123!',
  role: 'user'
};

const testTenant = {
  name: 'Test Tenant',
  subdomain: 'test-tenant',
  email: 'tenant@example.com',
  phone: '1234567890',
  address: {
    street: 'Test St 123',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345',
    country: 'Test Country'
  },
  subscription: {
    plan: 'basic',
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
  }
};

// Configuración antes de las pruebas
describe('Auth Controller', () => {
  beforeAll(async () => {
    // Configurar variables de entorno para pruebas
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRE = '30d';
    
    // Conectar a la base de datos de prueba
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/ventas-bodega-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    // Limpiar la base de datos antes de cada prueba
    await User.deleteMany({});
    await Tenant.deleteMany({});
    
    // Crear tenant de prueba
    const tenant = await Tenant.create(testTenant);
    
    // Crear usuario de prueba
    await User.create({
      ...testUser,
      tenantId: tenant._id,
      password: await bcrypt.hash(testUser.password, 10)
    });
  });

  afterAll(async () => {
    // Limpiar y cerrar la conexión después de las pruebas
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('debería registrar un nuevo usuario', async () => {
      const newUser = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'NewUser123!',
        role: 'user'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(res.statusCode).toBe(StatusCodes.CREATED);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      
      // Verificar que el usuario se creó en la base de datos
      const user = await User.findOne({ email: newUser.email });
      expect(user).toBeDefined();
      expect(user.name).toBe(newUser.name);
      expect(user.role).toBe(newUser.role);
    });

    it('no debería registrar un usuario con un correo ya existente', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: testUser.email, // Correo ya existente
          password: 'Test123!',
          role: 'user'
        });

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('debería iniciar sesión con credenciales válidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('no debería iniciar sesión con credenciales inválidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      // Iniciar sesión para obtener el token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      token = loginRes.body.token;
    });

    it('debería obtener el perfil del usuario autenticado', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.email).toBe(testUser.email);
    });

    it('no debería permitir el acceso sin token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('PUT /api/auth/updatedetails', () => {
    let token;

    beforeEach(async () => {
      // Iniciar sesión para obtener el token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      token = loginRes.body.token;
    });

    it('debería actualizar los detalles del usuario', async () => {
      const updatedData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const res = await request(app)
        .put('/api/auth/updatedetails')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(updatedData.name);
      expect(res.body.data.email).toBe(updatedData.email);
    });
  });

  describe('PUT /api/auth/updatepassword', () => {
    let token;

    beforeEach(async () => {
      // Iniciar sesión para obtener el token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      token = loginRes.body.token;
    });

    it('debería actualizar la contraseña del usuario', async () => {
      const newPassword = 'NewPassword123!';

      const res = await request(app)
        .put('/api/auth/updatepassword')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: testUser.password,
          newPassword
        });

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      
      // Verificar que la contraseña se actualizó intentando iniciar sesión con la nueva contraseña
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: newPassword
        });
      
      expect(loginRes.statusCode).toBe(StatusCodes.OK);
      expect(loginRes.body.success).toBe(true);
    });

    it('no debería actualizar la contraseña con la contraseña actual incorrecta', async () => {
      const res = await request(app)
        .put('/api/auth/updatepassword')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'NewPassword123!'
        });

      expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgotpassword', () => {
    it('debería enviar un correo de restablecimiento de contraseña', async () => {
      const res = await request(app)
        .post('/api/auth/forgotpassword')
        .send({
          email: testUser.email
        });

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      
      // Verificar que se generó el token de restablecimiento
      const user = await User.findOne({ email: testUser.email });
      expect(user.resetPasswordToken).toBeDefined();
      expect(user.resetPasswordExpire).toBeDefined();
    });

    it('no debería enviar correo si el usuario no existe', async () => {
      const res = await request(app)
        .post('/api/auth/forgotpassword')
        .send({
          email: 'nonexistent@example.com'
        });

      expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/resetpassword/:resettoken', () => {
    let resetToken;
    let user;

    beforeEach(async () => {
      // Generar token de restablecimiento
      user = await User.findOne({ email: testUser.email });
      resetToken = user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });
    });

    it('debería restablecer la contraseña con un token válido', async () => {
      const newPassword = 'NewPassword123!';
      
      const res = await request(app)
        .put(`/api/auth/resetpassword/${resetToken}`)
        .send({
          password: newPassword
        });

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      
      // Verificar que la contraseña se actualizó
      const updatedUser = await User.findById(user._id).select('+password');
      const isMatch = await updatedUser.matchPassword(newPassword);
      expect(isMatch).toBe(true);
      
      // Verificar que los campos de restablecimiento se limpiaron
      expect(updatedUser.resetPasswordToken).toBeUndefined();
      expect(updatedUser.resetPasswordExpire).toBeUndefined();
    });

    it('no debería restablecer la contraseña con un token inválido', async () => {
      const res = await request(app)
        .put('/api/auth/resetpassword/invalidtoken')
        .send({
          password: 'NewPassword123!'
        });

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/logout', () => {
    it('debería cerrar la sesión del usuario', async () => {
      // Iniciar sesión primero
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      const token = loginRes.body.token;
      
      // Cerrar sesión
      const res = await request(app)
        .get('/api/auth/logout')
        .set('Cookie', `token=${token}`);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      
      // Verificar que la cookie se limpió
      expect(res.headers['set-cookie'][0]).toContain('token=;');
    });
  });
});
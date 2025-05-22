import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { protect, authorize } from '../../../src/middleware/auth.js';
import User from '../../../src/models/User.js';
import { createError } from '../../../src/utils/errorHandler.js';

// Mock de los objetos de solicitud, respuesta y next
const mockRequest = (headers = {}) => ({
  headers,
  cookies: {},
  user: null
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

// Mock del modelo User
jest.mock('../../../src/models/User.js');

// Mock de createError
jest.mock('../../../src/utils/errorHandler.js', () => ({
  createError: jest.fn((status, message) => {
    const error = new Error(message);
    error.statusCode = status;
    return error;
  })
}));

describe('Middleware de Autenticación', () => {
  let req, res, next;
  const testUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    role: 'user',
    tenantId: '507f1f77bcf86cd799439012',
    isActive: true,
    matchPassword: jest.fn()
  };

  beforeEach(() => {
    // Reiniciar los mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Configurar request, response y next para cada prueba
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
  });

  describe('protect', () => {
    it('debería llamar a next() si el token es válido', async () => {
      // Configurar el token JWT válido
      const token = jwt.sign(
        { id: testUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      req.headers.authorization = `Bearer ${token}`;
      
      // Mock de User.findById para devolver un usuario
      User.findById.mockResolvedValue(testUser);
      
      // Ejecutar el middleware
      await protect(req, res, next);
      
      // Verificar que se llamó a User.findById con el ID correcto
      expect(User.findById).toHaveBeenCalledWith(testUser._id);
      
      // Verificar que se estableció req.user con el usuario
      expect(req.user).toEqual(testUser);
      
      // Verificar que se llamó a next()
      expect(next).toHaveBeenCalled();
    });

    it('debería devolver un error 401 si no hay token', async () => {
      // No establecer el encabezado de autorización
      
      // Ejecutar el middleware
      await protect(req, res, next);
      
      // Verificar que se llamó a createError con los parámetros correctos
      expect(createError).toHaveBeenCalledWith(
        StatusCodes.UNAUTHORIZED,
        'No autorizado, token no proporcionado'
      );
      
      // Verificar que se llamó a next con el error
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('debería devolver un error 401 si el token no es válido', async () => {
      // Configurar un token inválido
      req.headers.authorization = 'Bearer invalid-token';
      
      // Ejecutar el middleware
      await protect(req, res, next);
      
      // Verificar que se llamó a createError con los parámetros correctos
      expect(createError).toHaveBeenCalledWith(
        StatusCodes.UNAUTHORIZED,
        'No autorizado, token no válido'
      );
      
      // Verificar que se llamó a next con el error
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('debería devolver un error 401 si el usuario no existe', async () => {
      // Configurar un token válido
      const token = jwt.sign(
        { id: testUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      req.headers.authorization = `Bearer ${token}`;
      
      // Mock de User.findById para devolver null (usuario no encontrado)
      User.findById.mockResolvedValue(null);
      
      // Ejecutar el middleware
      await protect(req, res, next);
      
      // Verificar que se llamó a createError con los parámetros correctos
      expect(createError).toHaveBeenCalledWith(
        StatusCodes.UNAUTHORIZED,
        'Usuario no encontrado con este token'
      );
      
      // Verificar que se llamó a next con el error
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('authorize', () => {
    const roles = ['admin', 'publisher'];
    
    it('debería llamar a next() si el usuario tiene el rol requerido', () => {
      // Configurar un usuario con rol de admin
      req.user = { role: 'admin' };
      
      // Crear el middleware con los roles permitidos
      const middleware = authorize(roles);
      
      // Ejecutar el middleware
      middleware(req, res, next);
      
      // Verificar que se llamó a next()
      expect(next).toHaveBeenCalled();
      // Verificar que no se llamó a createError
      expect(createError).not.toHaveBeenCalled();
    });
    
    it('debería devolver un error 403 si el usuario no tiene el rol requerido', () => {
      // Configurar un usuario con rol de usuario normal
      req.user = { role: 'user' };
      
      // Crear el middleware con los roles permitidos
      const middleware = authorize(roles);
      
      // Ejecutar el middleware
      middleware(req, res, next);
      
      // Verificar que se llamó a createError con los parámetros correctos
      expect(createError).toHaveBeenCalledWith(
        StatusCodes.FORBIDDEN,
        `El usuario con rol user no está autorizado para acceder a esta ruta`
      );
      
      // Verificar que se llamó a next con el error
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
    
    it('debería manejar múltiples roles correctamente', () => {
      // Configurar un usuario con rol de publisher
      req.user = { role: 'publisher' };
      
      // Crear el middleware con los roles permitidos
      const middleware = authorize(roles);
      
      // Ejecutar el middleware
      middleware(req, res, next);
      
      // Verificar que se llamó a next()
      expect(next).toHaveBeenCalled();
      // Verificar que no se llamó a createError
      expect(createError).not.toHaveBeenCalled();
    });
  });
});
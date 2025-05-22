import { generateToken, verifyToken } from '../../../src/utils/jwt.js';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

// Mock de process.env.JWT_SECRET
process.env.JWT_SECRET = 'test-secret';

describe('JWT Utils', () => {
  describe('generateToken', () => {
    it('debería generar un token JWT válido', () => {
      const payload = { userId: '123', role: 'admin' };
      const token = generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verificar que el token se puede decodificar correctamente
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.role).toBe(payload.role);
    });
  });

  describe('verifyToken', () => {
    it('debería verificar un token JWT válido', () => {
      const payload = { userId: '123', role: 'admin' };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      const result = verifyToken(token);
      
      expect(result).toBeDefined();
      expect(result.userId).toBe(payload.userId);
      expect(result.role).toBe(payload.role);
    });
    
    it('debería lanzar un error para un token inválido', () => {
      const invalidToken = 'invalid-token';
      
      expect(() => {
        verifyToken(invalidToken);
      }).toThrow('Token inválido');
    });
    
    it('debería lanzar un error para un token expirado', () => {
      const payload = { userId: '123', role: 'admin' };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '-1s' });
      
      expect(() => {
        verifyToken(token);
      }).toThrow('Token expirado');
    });
  });
});
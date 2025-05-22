import jwt from 'jsonwebtoken';

/**
 * Genera un token JWT para el usuario
 * @param {string} userId - ID del usuario
 * @param {string} tenantId - ID del tenant
 * @param {string} role - Rol del usuario
 * @returns {string} Token JWT
 */
const generateToken = (userId, tenantId, role) => {
  const secret = process.env.JWT_SECRET || 'default_secret_key';
  
  // Crear el payload básico
  const payload = {
    id: userId,
    tenantId: tenantId || null,
    role: role || 'user'
  };
  
  // Usar sign sin opciones para evitar problemas de tipo
  return jwt.sign(payload, secret);
};

/**
 * Verifica un token JWT
 * @param {string} token - Token JWT a verificar
 * @returns {Object} Payload del token decodificado
 * @throws {Error} Si el token no es válido
 */
const verifyToken = (token) => {
  if (!token || typeof token !== 'string') {
    throw new Error('No se proporcionó un token válido');
  }
  
  const secret = process.env.JWT_SECRET || 'default_secret_key';
  
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Error de autenticación');
    
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    }
    
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    }
    
    throw new Error('Error al verificar el token');
  }
};

export { generateToken, verifyToken };

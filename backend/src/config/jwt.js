/**
 * Configuración para JWT (JSON Web Tokens)
 */

const JWT_CONFIG = {
  // Tiempo de expiración del token (en días)
  expiresIn: process.env.JWT_EXPIRE || '30d',
  
  // Secreto para firmar el token
  secret: process.env.JWT_SECRET || 'secreto_para_desarrollo',
  
  // Tiempo de expiración de la cookie (en días)
  cookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE || '30', 10),
  
  // Opciones de la cookie
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: (parseInt(process.env.JWT_COOKIE_EXPIRE || '30', 10) * 24 * 60 * 60 * 1000) // en milisegundos
  }
};

export default JWT_CONFIG;

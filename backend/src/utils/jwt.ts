import jwt, { SignOptions, VerifyOptions, JwtPayload } from 'jsonwebtoken';
import { 
  TokenError, 
  TokenExpiredError, 
  InvalidTokenError,
  AuthError 
} from '../types/errors';
import { IUser } from '../types/models';

// Tipos para los tokens
type TokenType = 'access' | 'refresh';

interface ITokenPayload extends JwtPayload {
  id: string;
  type: TokenType;
  iat?: number;
  exp?: number;
}

// Opciones por defecto para la firma de tokens
const DEFAULT_SIGN_OPTIONS: SignOptions = {
  algorithm: 'HS256',
  issuer: 'ventas-bodega-api',
  audience: ['ventas-bodega-client'],
};

/**
 * Genera un token JWT firmado
 * @param payload - Datos a incluir en el token
 * @param secret - Clave secreta para firmar el token
 * @param expiresIn - Tiempo de expiración (ej: '1h', '7d', '30d')
 * @returns Token JWT firmado
 */
export function generateToken(
  payload: ITokenPayload,
  secret: string,
  expiresIn?: string | number
): string {
  const options: SignOptions = { ...DEFAULT_SIGN_OPTIONS };
  
  if (expiresIn) {
    options.expiresIn = expiresIn;
  }
  
  return jwt.sign(payload, secret, options);
}

/**
 * Verifica y decodifica un token JWT
 * @param token - Token JWT a verificar
 * @param secret - Clave secreta para verificar el token
 * @returns Payload decodificado
 * @throws {TokenError} Si el token es inválido
 * @throws {TokenExpiredError} Si el token ha expirado
 */
export function verifyToken<T extends ITokenPayload>(
  token: string,
  secret: string,
  options?: VerifyOptions
): T {
  try {
    const decoded = jwt.verify(token, secret, options) as T;
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new TokenExpiredError();
    } else if (error.name === 'JsonWebTokenError') {
      throw new InvalidTokenError();
    } else {
      throw new TokenError(error.message);
    }
  }
}

/**
 * Genera un token de acceso
 * @param userId - ID del usuario
 * @returns Token de acceso
 */
export function generateAccessToken(userId: string): string {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET no está definido en las variables de entorno');
  }

  return generateToken(
    { 
      id: userId, 
      type: 'access' as const 
    },
    process.env.JWT_ACCESS_SECRET,
    process.env.JWT_ACCESS_EXPIRE || '15m'
  );
}

/**
 * Genera un token de actualización
 * @param userId - ID del usuario
 * @returns Token de actualización
 */
export function generateRefreshToken(userId: string): string {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET no está definido en las variables de entorno');
  }

  return generateToken(
    { 
      id: userId, 
      type: 'refresh' as const 
    },
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRE || '7d'
  );
}

/**
 * Genera tokens de acceso y actualización
 * @param userId - ID del usuario
 * @returns Objeto con tokens de acceso y actualización
 */
export function generateTokens(userId: string): { 
  accessToken: string; 
  refreshToken: string 
} {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId),
  };
}

/**
 * Extrae el token del encabezado de autorización
 * @param authHeader - Encabezado de autorización (ej: 'Bearer token')
 * @returns Token o null si no se encuentra
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}

/**
 * Verifica un token de acceso
 * @param token - Token de acceso
 * @returns Payload del token
 */
export function verifyAccessToken(token: string): ITokenPayload {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET no está definido en las variables de entorno');
  }
  
  return verifyToken<ITokenPayload>(token, process.env.JWT_ACCESS_SECRET, {
    audience: 'ventas-bodega-client',
    issuer: 'ventas-bodega-api',
  });
}

/**
 * Verifica un token de actualización
 * @param token - Token de actualización
 * @returns Payload del token
 */
export function verifyRefreshToken(token: string): ITokenPayload {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET no está definido en las variables de entorno');
  }
  
  return verifyToken<ITokenPayload>(token, process.env.JWT_REFRESH_SECRET, {
    audience: 'ventas-bodega-client',
    issuer: 'ventas-bodega-api',
  });
}

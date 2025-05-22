import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, AuthError } from '../types/errors';
import User from '../models/User';

// Extender la interfaz de Request de Express
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware para verificar el token JWT
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Obtener el token del header Authorization
    let token: string | undefined;
    
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Obtener el token del header
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      // Obtener el token de las cookies
      token = req.cookies.token;
    }

    // Verificar si existe el token
    if (!token) {
      return next(
        new AuthError('No estás autorizado para acceder a esta ruta', 401)
      );
    }

    try {
      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as {
        id: string;
        type: string;
      };

      // Verificar que el token sea de tipo 'access'
      if (decoded.type !== 'access') {
        return next(new AuthError('Token inválido', 401, 'INVALID_TOKEN'));
      }

      // Obtener el usuario del token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(
          new AuthError('El usuario perteneciente al token ya no existe', 401)
        );
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        return next(
          new AuthError('Tu cuenta ha sido desactivada', 403, 'ACCOUNT_DISABLED')
        );
      }

      // Añadir el usuario al objeto de solicitud
      req.user = user;

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(
          new AuthError('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', 401, 'TOKEN_EXPIRED')
        );
      } else if (error instanceof jwt.JsonWebTokenError) {
        return next(
          new AuthError('Token inválido', 401, 'INVALID_TOKEN')
        );
      }
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para verificar roles de usuario
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AuthError('No estás autorizado para acceder a esta ruta', 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AuthError(
          `El rol ${req.user.role} no tiene permiso para acceder a esta ruta`,
          403
        )
      );
    }

    next();
  };
};

import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';

// Asegurarse de que el modelo User esté correctamente tipado
const UserModel = mongoose.model('User');

/**
 * Middleware para proteger rutas que requieren autenticación
 */
export const protect = async (req, res, next) => {
  let token;

  try {
    // Obtener el token del header Authorization o de las cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Formato: Bearer <token>
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Verificar si hay token
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'No estás autorizado para acceder a esta ruta. No se proporcionó token.',
      });
    }

    // Verificar token
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.id) {
      throw new Error('Token inválido o corrupto');
    }

    // Obtener usuario del token usando el modelo tipado
    const user = await UserModel.findById(decoded.id).select('-password').lean().exec();

    // Verificar si el usuario existe
    if (!user || Array.isArray(user)) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'El usuario de este token ya no existe',
      });
    }

    // Asegurarse de que user es un objeto y tiene la propiedad isActive
    const userObj = user;

    // Verificar si el usuario está activo
    if (userObj.isActive === false) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Este usuario ha sido desactivado',
      });
    }

    // Adjuntar el usuario al objeto de solicitud
    req.user = user;

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'No estás autorizado para acceder a esta ruta',
    });
  }
};

/**
 * Middleware para autorizar por roles
 * @param {...string} roles - Roles permitidos
 * @returns {Function} Middleware de autorización
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'No se encontró información de usuario en la solicitud',
        });
      }

      // Verificar que el usuario tenga un rol válido
      if (!req.user.role || typeof req.user.role !== 'string') {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: 'El usuario no tiene un rol válido asignado',
        });
      }

      // Verificar si el rol del usuario está en la lista de roles permitidos
      if (!roles.includes(req.user.role)) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: `El usuario con rol "${req.user.role}" no está autorizado para acceder a esta ruta`,
          requiredRoles: roles,
        });
      }

      // Si todo está bien, continuar
      next();
    } catch (error) {
      console.error('Error en middleware de autorización:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error al verificar los permisos del usuario',
      });
    }
  };
};

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { AuthError, ValidationError } from '../types/errors';
import User from '../models/User';
import { generateTokens, verifyToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      cookies: {
        refreshToken?: string;
      };
    }
  }
}

// @desc    Registrar usuario
// @route   POST /api/v1/auth/register
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, role } = req.body;

    // Validación básica
    if (!name || !email || !password) {
      throw new ValidationError('Por favor proporcione nombre, correo y contraseña');
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new AuthError('El correo ya está registrado', StatusCodes.CONFLICT);
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
    });

    // Generar tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Configurar cookie segura
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    };

    // Enviar respuesta
    res
      .status(StatusCodes.CREATED)
      .cookie('refreshToken', refreshToken, cookieOptions)
      .json({
        success: true,
        token: accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    next(error);
  }
};

// @desc    Iniciar sesión
// @route   POST /api/v1/auth/login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Validar entrada
    if (!email || !password) {
      throw new ValidationError('Por favor proporcione correo y contraseña');
    }

    // Verificar usuario y contraseña
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      throw new AuthError('Credenciales inválidas', StatusCodes.UNAUTHORIZED);
    }

    // Generar tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Configurar cookie segura
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    };

    // Enviar respuesta
    res
      .status(StatusCodes.OK)
      .cookie('refreshToken', refreshToken, cookieOptions)
      .json({
        success: true,
        token: accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    next(error);
  }
};

// @desc    Cerrar sesión
// @route   GET /api/v1/auth/logout
export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Sesión cerrada correctamente',
  });
};

// @desc    Obtener usuario actual
// @route   GET /api/v1/auth/me
export const getMe = (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    data: req.user,
  });
};

// @desc    Refrescar token de acceso
// @route   POST /api/v1/auth/refresh-token
export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new AuthError('No se proporcionó token de actualización', StatusCodes.UNAUTHORIZED);
    }

    // Verificar el refresh token
    const decoded = verifyToken(refreshToken, 'refresh');
    
    // Buscar al usuario
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AuthError('Usuario no encontrado', StatusCodes.NOT_FOUND);
    }

    // Generar nuevos tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Configurar cookie segura
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    };

    // Enviar respuesta
    res
      .status(StatusCodes.OK)
      .cookie('refreshToken', newRefreshToken, cookieOptions)
      .json({
        success: true,
        token: newAccessToken,
      });
  } catch (error) {
    next(error);
  }
};

// @desc    Cambiar contraseña
// @route   PUT /api/v1/auth/change-password
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AuthError('Usuario no autenticado', StatusCodes.UNAUTHORIZED);
    }

    // Validar entrada
    if (!currentPassword || !newPassword) {
      throw new ValidationError('Por favor proporcione la contraseña actual y la nueva contraseña');
    }

    // Buscar usuario
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AuthError('Usuario no encontrado', StatusCodes.NOT_FOUND);
    }

    // Verificar contraseña actual
    if (!(await user.matchPassword(currentPassword))) {
      throw new AuthError('Contraseña actual incorrecta', StatusCodes.UNAUTHORIZED);
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    // Generar nuevos tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Configurar cookie segura
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    };

    // Enviar respuesta
    res
      .status(StatusCodes.OK)
      .cookie('refreshToken', refreshToken, cookieOptions)
      .json({
        success: true,
        token: accessToken,
        message: 'Contraseña actualizada correctamente',
      });
  } catch (error) {
    next(error);
  }
};

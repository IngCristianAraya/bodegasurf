import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import {
  JWT_SECRET as JWT_SECRET_ENV,
  JWT_EXPIRE as JWT_EXPIRE_ENV,
  JWT_COOKIE_EXPIRE as JWT_COOKIE_EXPIRE_ENV,
  NODE_ENV as NODE_ENV_ENV,
  FRONTEND_URL as FRONTEND_URL_ENV
} from '../config/config.js';
import { sendWelcomeEmail } from '../utils/email.js';
import { AppError } from '../types/errors.js';

// Asignar valores predeterminados
const JWT_SECRET = JWT_SECRET_ENV || 'TuClaveSecretaMuySegura123!';
const JWT_EXPIRE = JWT_EXPIRE_ENV || '30d';
const JWT_COOKIE_EXPIRE_DAYS = parseInt(JWT_COOKIE_EXPIRE_ENV || '30', 10); // Parseado a Int y renombrado
const NODE_ENV = NODE_ENV_ENV || 'development';
const FRONTEND_URL = FRONTEND_URL_ENV || 'http://localhost:3000';

// Importar tipos para JSDoc
/**
 * @typedef {import('../types/models').IUser} IUser
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

// Verificar configuración
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido en la configuración');
}

if (!JWT_EXPIRE) {
  throw new Error('JWT_EXPIRE no está definido en la configuración');
}

/**
 * Genera un token JWT para un usuario
 * @param {string | import('mongoose').Types.ObjectId} id - ID del usuario
 * @returns {string} Token JWT
 * @throws {Error} Si hay un error al generar el token
 */
const generateToken = (id) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado');
  }

  return jwt.sign(
    { id: id.toString() },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

/**
 * Envía la respuesta con el token JWT y la información del usuario
 * @param {IUser} user - Documento del usuario
 * @param {number} statusCode - Código de estado HTTP
 * @param {Response} res - Objeto de respuesta de Express
 * @returns {void}
 */
const sendTokenResponse = (user, statusCode, res) => {
  try {
    const token = generateToken(user._id);
    const cookieExpires = new Date();
    cookieExpires.setDate(cookieExpires.getDate() + JWT_COOKIE_EXPIRE_DAYS); // Usar constante parseada

    const options = {
      expires: cookieExpires,
      httpOnly: true,
      secure: NODE_ENV === 'production', // Usar constante NODE_ENV
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax'
    };

    // Eliminar la contraseña del output
    const userData = user.toObject();
    /** @type {Partial<IUser>} */
    const userResponse = {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      tenantId: userData.tenantId,
      isActive: userData.isActive,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    };

    // Enviar respuesta
    res
      .status(statusCode)
      .cookie('token', token, options)
      .json({
        success: true,
        token,
        user: userResponse
      });
  } catch (error) {
    console.error('Error en sendTokenResponse:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error al generar el token de autenticación'
    });
  }
};

/**
 * @desc    Registrar un nuevo usuario
 * @route   POST /api/auth/register
 * @access  Public
 * @param {AuthRequest} req
 * @param {AuthResponse} res
 * @param {AuthNextFunction} next
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user', tenantId } = req.body;

    // Validar campos requeridos
    if (!name || !email || !password) {
      throw new AppError(
        'Por favor proporcione nombre, correo electrónico y contraseña',
        StatusCodes.BAD_REQUEST,
        'MISSING_FIELDS'
      );
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError(
        'Por favor proporcione un correo electrónico válido',
        StatusCodes.BAD_REQUEST,
        'INVALID_EMAIL'
      );
    }

    // Validar fortaleza de la contraseña
    if (password.length < 6) {
      throw new AppError(
        'La contraseña debe tener al menos 6 caracteres',
        StatusCodes.BAD_REQUEST,
        'WEAK_PASSWORD'
      );
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new AppError(
        'El correo electrónico ya está registrado',
        StatusCodes.BAD_REQUEST,
        'EMAIL_EXISTS'
      );
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      role,
      tenant: tenantId
    });

    // Enviar correo de bienvenida
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Error al enviar correo de bienvenida:', emailError);
      // No fallar el registro si el correo no se puede enviar
    }

    // Enviar respuesta con token
    sendTokenResponse(user, StatusCodes.CREATED, res);

    console.log('Datos extraídos del cuerpo:', JSON.stringify({
      name: name ? 'presente' : 'ausente',
      email: email ? 'presente' : 'ausente',
      password: password ? 'presente' : 'ausente',
      role,
      tenantId
    }, null, 2));

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Iniciar sesión
 * @route   POST /api/auth/login
 * @access  Public
 * @param {AuthRequest} req
 * @param {AuthResponse} res
 * @param {AuthNextFunction} next
 */
const login = async (req, res, next) => {
  console.log('Intento de login recibido');
  try {
    const { email, password } = req.body;
    console.log(`Login - Email recibido: ${email}`);
    console.log(`Login - Password recibido: ${password ? '****** (presente)' : '(ausente)'}`);

    if (!email || !password) {
      console.log('Login - Email o password ausentes en req.body');
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Por favor ingrese email y contraseña',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    console.log('Login - Usuario encontrado en BD:', user ? user.email : 'No encontrado');

    if (user) {
      console.log('Login - Hash de contraseña en BD:', user.password); // Loguear hash para depuración
    }

    if (!user) {
      console.log('Login - Usuario no encontrado o contraseña no coincide (usuario nulo)');
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    const isMatch = await user.matchPassword(password);
    console.log('Login - Resultado de matchPassword:', isMatch);

    if (!isMatch) {
      console.log('Login - Usuario no encontrado o contraseña no coincide (isMatch false)');
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    if (!user.isActive) {
      console.log('Login - Cuenta desactivada para:', user.email);
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Cuenta desactivada. Contacte al administrador.',
      });
    }

    console.log('Login - Autenticación exitosa para:', user.email);
    const token = generateToken(user._id);

    const cookieOptions = {
      expires: new Date(
        Date.now() + JWT_COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000 // Usar constante parseada
      ),
      httpOnly: true,
      secure: NODE_ENV === 'production', // Usar constante NODE_ENV
    };

    // Enviar respuesta
    res.status(StatusCodes.OK).cookie('token', token, cookieOptions).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    console.error('Login - Error en el bloque try-catch:', error);
    next(error);
  }
};

/**
 * @desc    Cerrar sesión / Limpiar cookie
 * @route   GET /api/auth/logout
 * @access  Private
 * @param {AuthRequest} req
 * @param {AuthResponse} res
 */
const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: {},
  });
};

/**
 * @desc    Obtener usuario actual
 * @route   GET /api/auth/me
 * @access  Private
 * @param {AuthRequest} req
 * @param {AuthResponse} res
 * @param {AuthNextFunction} next
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(StatusCodes.OK).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar detalles del usuario
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 * @param {AuthRequest} req
 * @param {AuthResponse} res
 * @param {AuthNextFunction} next
 */
const updateDetails = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar contraseña
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 * @param {AuthRequest} req
 * @param {AuthResponse} res
 * @param {AuthNextFunction} next
 */
const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Verificar contraseña actual
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'La contraseña actual es incorrecta',
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    // Crear token
    const token = generateToken(user._id);

    res.status(StatusCodes.OK).json({
      success: true,
      token,
      message: 'Contraseña actualizada correctamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Olvidé mi contraseña
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 * @param {AuthRequest} req
 * @param {AuthResponse} res
 * @param {AuthNextFunction} next
 */
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'No se encontró ningún usuario con ese correo electrónico',
      });
    }

    // Obtener token de restablecimiento
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // TODO: Enviar correo electrónico con el token

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Se ha enviado un correo electrónico con instrucciones',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Restablecer contraseña
 * @route   PUT /api/auth/resetpassword/:resettoken
 * @access  Public
 * @param {AuthRequest} req
 * @param {AuthResponse} res
 * @param {AuthNextFunction} next
 */
const resetPassword = async (req, res, next) => {
  try {
    // Obtener usuario por token
    const user = await User.findOne({
      resetPasswordToken: req.params.resettoken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Token inválido o expirado',
      });
    }

    // Establecer nueva contraseña
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Crear token
    const token = generateToken(user._id);

    res.status(StatusCodes.OK).json({
      success: true,
      token,
      message: 'Contraseña restablecida correctamente',
    });
  } catch (error) {
    next(error);
  }
};

export {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
};
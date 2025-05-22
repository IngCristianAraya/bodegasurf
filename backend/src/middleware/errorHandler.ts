import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError, AuthError, ValidationError, NotFoundError, TooManyRequestsError } from '../types/errors';
import { logger } from '../utils/logger';

/**
 * Middleware para manejar errores
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Establecer valores por defecto
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Error interno del servidor';
  let code = 'INTERNAL_SERVER_ERROR';
  let errors: any[] | undefined;
  let stack: string | undefined;

  // Manejar diferentes tipos de errores
  if (err instanceof AuthError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || 'AUTH_ERROR';
  } else if (err instanceof ValidationError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = err.message;
    code = err.code || 'VALIDATION_ERROR';
    errors = err.details;
  } else if (err instanceof NotFoundError) {
    statusCode = StatusCodes.NOT_FOUND;
    message = err.message;
    code = 'NOT_FOUND';
  } else if (err instanceof TooManyRequestsError) {
    statusCode = StatusCodes.TOO_MANY_REQUESTS;
    message = err.message;
    code = 'TOO_MANY_REQUESTS';
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || 'APP_ERROR';
  }

  // Log del error
  if (statusCode >= 500) {
    logger.error({
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      user: (req as any).user?._id,
    });
  } else if (statusCode >= 400) {
    logger.warn({
      message: err.message,
      path: req.path,
      method: req.method,
      user: (req as any).user?._id,
    });
  }

  // En modo desarrollo, incluir el stack trace
  if (process.env.NODE_ENV === 'development') {
    stack = err.stack;
  }

  // Enviar respuesta de error
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(errors && { errors }),
      ...(stack && { stack }),
    },
  });
};

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Ruta no encontrada: ${req.originalUrl}`,
    },
  });
};

/**
 * Middleware para manejar errores de validación de esquema
 */
export const validationErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error: any) => ({
      field: error.path,
      message: error.message,
    }));

    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Error de validación',
        errors,
      },
    });
  }
  next(err);
};

/**
 * Middleware para manejar errores de JWT
 */
export const jwtErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'JsonWebTokenError') {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token inválido o expirado',
      },
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token expirado',
      },
    });
  }
  
  next(err);
};

/**
 * Middleware para manejar errores de duplicados en MongoDB
 */
export const duplicateKeyErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    return res.status(StatusCodes.CONFLICT).json({
      success: false,
      error: {
        code: 'DUPLICATE_KEY',
        message: `El valor '${value}' ya existe para el campo '${field}'`,
        field,
        value,
      },
    });
  }
  
  next(err);
};
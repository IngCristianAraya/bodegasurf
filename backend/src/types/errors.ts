import { StatusCodes } from 'http-status-codes';

/**
 * Clase base para errores de la aplicación
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    code: string = 'INTERNAL_SERVER_ERROR',
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.details = details;

    // Esto asegura que el stack trace sea correcto
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error de autenticación
 */
export class AuthError extends AppError {
  constructor(
    message: string = 'No autorizado',
    statusCode: number = StatusCodes.UNAUTHORIZED,
    code: string = 'AUTH_ERROR',
    details?: any
  ) {
    super(message, statusCode, code, details);
  }
}

/**
 * Error de validación
 */
export class ValidationError extends AppError {
  constructor(
    message: string = 'Error de validación',
    details?: any,
    code: string = 'VALIDATION_ERROR'
  ) {
    super(message, StatusCodes.BAD_REQUEST, code, details);
  }
}

/**
 * Recurso no encontrado
 */
export class NotFoundError extends AppError {
  constructor(
    resource: string = 'Recurso',
    details?: any,
    code: string = 'NOT_FOUND'
  ) {
    super(`${resource} no encontrado`, StatusCodes.NOT_FOUND, code, details);
  }
}

/**
 * Demasiadas peticiones
 */
export class TooManyRequestsError extends AppError {
  constructor(
    message: string = 'Demasiadas peticiones',
    details?: any,
    code: string = 'TOO_MANY_REQUESTS'
  ) {
    super(
      message,
      StatusCodes.TOO_MANY_REQUESTS,
      code,
      details
    );
  }
}

/**
 * Error de permisos insuficientes
 */
export class ForbiddenError extends AppError {
  constructor(
    message: string = 'No tiene permisos para realizar esta acción',
    details?: any,
    code: string = 'FORBIDDEN'
  ) {
    super(message, StatusCodes.FORBIDDEN, code, details);
  }
}

/**
 * Error de conflicto (ej: registro duplicado)
 */
export class ConflictError extends AppError {
  constructor(
    message: string = 'Conflicto con el recurso',
    details?: any,
    code: string = 'CONFLICT'
  ) {
    super(message, StatusCodes.CONFLICT, code, details);
  }
}

/**
 * Error de validación de esquema
 */
export class SchemaValidationError extends ValidationError {
  constructor(errors: any[]) {
    super('Error de validación de esquema', errors, 'SCHEMA_VALIDATION_ERROR');
  }
}

/**
 * Error de token inválido o expirado
 */
export class TokenError extends AuthError {
  constructor(
    message: string = 'Token inválido o expirado',
    code: string = 'INVALID_TOKEN'
  ) {
    super(message, StatusCodes.UNAUTHORIZED, code);
  }
}

/**
 * Error de token expirado
 */
export class TokenExpiredError extends TokenError {
  constructor() {
    super('Token expirado', 'TOKEN_EXPIRED');
  }
}

/**
 * Error de token inválido
 */
export class InvalidTokenError extends TokenError {
  constructor() {
    super('Token inválido', 'INVALID_TOKEN');
  }
}

/**
 * Error de credenciales inválidas
 */
export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Credenciales inválidas', StatusCodes.UNAUTHORIZED, 'INVALID_CREDENTIALS');
  }
}

/**
 * Error de cuenta inactiva
 */
export class InactiveAccountError extends AuthError {
  constructor() {
    super('La cuenta está inactiva', StatusCodes.FORBIDDEN, 'INACTIVE_ACCOUNT');
  }
}

/**
 * Error de cuenta no verificada
 */
export class UnverifiedAccountError extends AuthError {
  constructor() {
    super('La cuenta no ha sido verificada', StatusCodes.FORBIDDEN, 'UNVERIFIED_ACCOUNT');
  }
}

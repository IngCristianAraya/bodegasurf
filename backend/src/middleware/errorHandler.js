import { StatusCodes } from 'http-status-codes';
import { logger } from '../utils/logger.js';

/**
 * @typedef {Object} ValidationError
 * @property {string} path - The field that failed validation
 * @property {string} message - Validation error message
 * @property {string} kind - Type of validation error
 * @property {any} value - The value that failed validation
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {string} message - Error message
 * @property {string} code - Error code
 * @property {string} [stack] - Error stack trace (only in development)
 * @property {Array<{field: string, message: string}>} [errors] - Validation errors
 */

/**
 * @typedef {Object} ExtendedError
 * @property {string} [name] - Error name
 * @property {string} [message] - Error message
 * @property {string} [stack] - Error stack trace
 * @property {number} [statusCode] - HTTP status code
 * @property {string|number} [code] - Error code (can be string or number)
 * @property {boolean} [isOperational] - Indicates if the error is operational
 * @property {Record<string, any>} [keyValue] - Key-value pairs for duplicate key errors
 * @property {Record<string, ValidationError>} [errors] - Validation errors
 */

/**
 * Creates a standardized error response object
 * @param {ExtendedError} err - The error object
 * @param {import('express').Request} _req - Express request object (unused for now)
 * @returns {ErrorResponse} Standardized error response
 */
const createErrorResponse = (err, _req) => {
  // Ensure code is always a string
  const errorCode = err.code ? String(err.code) : 'INTERNAL_SERVER_ERROR';
  
  // Default error response
  /** @type {ErrorResponse} */
  const response = {
    success: false,
    message: err.message || 'Algo salió mal, por favor inténtalo de nuevo más tarde',
    code: errorCode
  };

  // Add stack trace in development
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  return response;
};

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Create base error response with proper type casting
  const error = /** @type {ExtendedError} */ (err);
  const errorResponse = createErrorResponse(error, req);
  let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  // Handle different types of errors
  if (error.name === 'ValidationError' && error.errors) {
    // Mongoose validation error
    errorResponse.message = 'Error de validación';
    const validationErrors = Object.values(error.errors)
      .filter((e) => Boolean(e.path) && Boolean(e.message));
    
    if (validationErrors.length > 0) {
      errorResponse.errors = validationErrors.map(e => ({
        field: e.path,
        message: e.message
      }));
    }
    errorResponse.code = 'VALIDATION_ERROR';
    statusCode = StatusCodes.BAD_REQUEST;
  } else if (error.code === 11000 && error.keyValue) {
    // MongoDB duplicate key error
    const field = Object.keys(error.keyValue)[0] || 'campo';
    errorResponse.message = `El valor ingresado para el campo ${field} ya existe`;
    errorResponse.code = 'DUPLICATE_KEY';
    statusCode = StatusCodes.CONFLICT;
  } else if (error.name === 'CastError') {
    // Mongoose cast error (invalid ID format)
    errorResponse.message = 'Recurso no encontrado';
    errorResponse.code = 'RESOURCE_NOT_FOUND';
    statusCode = StatusCodes.NOT_FOUND;
  } else if (error.name === 'JsonWebTokenError') {
    // JWT invalid token
    errorResponse.message = 'Token de autenticación inválido';
    errorResponse.code = 'INVALID_TOKEN';
    statusCode = StatusCodes.UNAUTHORIZED;
  } else if (error.name === 'TokenExpiredError') {
    // JWT expired token
    errorResponse.message = 'La sesión ha expirado, por favor inicia sesión nuevamente';
    errorResponse.code = 'TOKEN_EXPIRED';
    statusCode = StatusCodes.UNAUTHORIZED;
  } else if (error.isOperational) {
    // Custom operational error
    statusCode = error.statusCode || statusCode;
  } else if (process.env.NODE_ENV === 'production') {
    // In production, don't leak error details
    errorResponse.message = 'Ocurrió un error en el servidor';
    errorResponse.code = 'SERVER_ERROR';
  }

  // Log the error
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${req.method} ${req.originalUrl} - ${statusCode} - ${req.ip}`;
  const errorMessage = error.message || 'Error desconocido';
  
  if (statusCode >= 500) {
    // Server errors (500+)
    logger.error(`${logMessage} - ${errorMessage}`);
    if (error.stack) {
      logger.error(error.stack);
    }
  } else if (statusCode >= 400) {
    // Client errors (400-499)
    logger.warn(`${logMessage} - ${errorMessage}`);
  } else {
    // Other status codes
    logger.info(`${logMessage} - ${errorMessage}`);
  }

  // Send response to client
  return res.status(statusCode).json(errorResponse);
};

export { errorHandler };

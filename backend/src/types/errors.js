/**
 * @typedef {Object} ValidationErrorDetail
 * @property {string} field - Campo que falló la validación
 * @property {string} message - Mensaje de error
 */

/**
 * @typedef {Object} ApiError
 * @property {string} message - Mensaje de error
 * @property {string} code - Código de error
 * @property {number} [statusCode] - Código de estado HTTP
 * @property {boolean} [isOperational] - Indica si el error es operacional
 */

export class AppError extends Error {
    /**
     * Crea un error de aplicación personalizado
     * @param {string} message - Mensaje de error
     * @param {number} statusCode - Código de estado HTTP
     * @param {string} code - Código de error interno
     */
    constructor(message, statusCode = 500, code = 'SERVER_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;

        // Capturar stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

export const ErrorTypes = {
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
    DUPLICATE_ERROR: 'DUPLICATE_ERROR',
    SERVER_ERROR: 'SERVER_ERROR'
}; 
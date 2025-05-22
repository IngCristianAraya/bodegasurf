// Clase base para errores personalizados
export class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error 404 - No encontrado
export class NotFoundError extends ApiError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

// Error 400 - Solicitud incorrecta
export class BadRequestError extends ApiError {
  constructor(message = 'Solicitud incorrecta') {
    super(message, 400);
  }
}

// Error 401 - No autorizado
export class UnauthorizedError extends ApiError {
  constructor(message = 'No autorizado, por favor inicia sesión') {
    super(message, 401);
  }
}

// Error 403 - Prohibido
export class ForbiddenError extends ApiError {
  constructor(message = 'No tienes permiso para realizar esta acción') {
    super(message, 403);
  }
}

// Error 409 - Conflicto
export class ConflictError extends ApiError {
  constructor(message = 'Conflicto con el recurso solicitado') {
    super(message, 409);
  }
}

// Error 500 - Error interno del servidor
export class InternalServerError extends ApiError {
  constructor(message = 'Algo salió mal en el servidor') {
    super(message, 500);
  }
}

// Función para manejar errores de validación
export const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Datos de entrada inválidos: ${errors.join('. ')}`;
  return new BadRequestError(message);
};

// Función para manejar errores de duplicados
export const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Valor duplicado: ${value}. Por favor, usa otro valor.`;
  return new BadRequestError(message);
};

// Función para manejar errores de JWT
export const handleJWTError = () =>
  new UnauthorizedError('Token inválido. Por favor, inicia sesión de nuevo.');

export const handleJWTExpiredError = () =>
  new UnauthorizedError('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');

// Función para manejar errores de desarrollo
export const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Función para manejar errores en producción
export const sendErrorProd = (err, res) => {
  // Errores operacionales, de confianza: enviar mensaje al cliente
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Enviar mensaje genérico
    res.status(500).json({
      status: 'error',
      message: 'Algo salió muy mal!',
    });
  }
};

// Manejador global de errores
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

// Función para manejar errores de casteo (CastError)
const handleCastErrorDB = (err) => {
  const message = `Valor inválido ${err.value} para el campo ${err.path}`;
  return new BadRequestError(message);
};
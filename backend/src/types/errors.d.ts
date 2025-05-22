import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  code?: string;

  constructor(
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthError extends AppError {
  constructor(
    message: string,
    statusCode: number = StatusCodes.UNAUTHORIZED,
    code: string = 'AUTH_ERROR'
  ) {
    super(message, statusCode, code);
  }
}

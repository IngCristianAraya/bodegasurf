import rateLimit from 'express-rate-limit';
import { TooManyRequestsError } from '../types/errors';

// Limitar peticiones a la API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por ventana
  handler: (req, res) => {
    throw new TooManyRequestsError(
      'Demasiadas peticiones desde esta IP, por favor intente nuevamente en 15 minutos'
    );
  },
});

// Limitar intentos de inicio de sesión
export const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // Máximo 5 intentos por hora
  handler: (req, res) => {
    throw new TooManyRequestsError(
      'Demasiados intentos de inicio de sesión. Por favor, intente nuevamente en una hora.'
    );
  },
});

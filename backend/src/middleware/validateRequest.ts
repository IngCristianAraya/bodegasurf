import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from '../types/errors';

/**
 * Middleware para validar los resultados de express-validator
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.param,
      message: error.msg,
      value: error.value,
    }));
    
    return next(
      new ValidationError('Error de validación', errorMessages, 'VALIDATION_ERROR')
    );
  }
  
  next();
};

/**
 * Función de fábrica para crear middlewares de validación
 */
export const validate = (validations: ValidationChain[]) => {
  return [
    ...validations,
    validateRequest,
  ];
};

/**
 * Middleware para validar el ID de MongoDB
 */
export const validateMongoId = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(
        new ValidationError(
          'ID no válido',
          [
            {
              field: paramName,
              message: 'El ID proporcionado no es un ID de MongoDB válido',
              value: id,
            },
          ],
          'INVALID_ID'
        )
      );
    }
    
    next();
  };
};

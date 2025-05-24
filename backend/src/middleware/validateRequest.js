import { validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            errors: errors.array().map(error => ({
                field: error.param,
                message: error.msg
            }))
        });
    }
    next();
}; 
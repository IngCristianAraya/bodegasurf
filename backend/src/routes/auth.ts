import { Router } from 'express';
import { body } from 'express-validator';
import { 
  register, 
  login, 
  logout, 
  getMe, 
  refreshAccessToken, 
  changePassword 
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

// Ruta de registro de usuario
router.post(
  '/register',
  [
    body('name', 'El nombre es requerido').notEmpty(),
    body('email', 'Por favor incluye un email válido').isEmail(),
    body('password', 'Por favor ingresa una contraseña con 6 o más caracteres').isLength({ min: 6 }),
    validateRequest
  ],
  register
);

// Ruta de inicio de sesión
router.post(
  '/login',
  [
    body('email', 'Por favor incluye un email válido').isEmail(),
    body('password', 'La contraseña es requerida').exists(),
    validateRequest
  ],
  login
);

// Ruta para cerrar sesión
router.post('/logout', logout);

// Ruta para obtener el usuario actual
router.get('/me', authenticate, getMe);

// Ruta para refrescar el token de acceso
router.post('/refresh-token', refreshAccessToken);

// Ruta para cambiar la contraseña
router.put(
  '/change-password',
  [
    authenticate,
    body('currentPassword', 'La contraseña actual es requerida').exists(),
    body('newPassword', 'Por favor ingresa una nueva contraseña con 6 o más caracteres').isLength({ min: 6 }),
    validateRequest
  ],
  changePassword
);

export default router;

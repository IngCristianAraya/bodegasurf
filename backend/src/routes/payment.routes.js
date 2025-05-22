import express from 'express';
import { 
  getPaymentStatus, 
  updatePaymentStatus,
  checkPaymentStatus
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Middleware para verificar el estado de los pagos
export { checkPaymentStatus };

// Aplicar protección a todas las rutas
router.use(protect);

/**
 * @route   GET /api/payments/status
 * @desc    Obtener el estado de pagos del tenant actual
 * @access  Private/Admin
 */
router.get('/status', authorize('admin'), (req, res) => getPaymentStatus(req, res));

/**
 * @route   PUT /api/payments/status
 * @desc    Actualizar el estado de pagos del tenant actual
 * @access  Private/Admin
 */
router.put('/status', authorize('admin'), (req, res) => updatePaymentStatus(req, res));

export default router;

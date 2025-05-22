import express from 'express';
import {
  createTransaction,
  getTransactions,
  getTransaction,
  cancelTransaction,
  updateTransactionStatus
} from '../controllers/transactionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Rutas protegidas para usuarios autenticados
router.use(protect);

// Rutas para usuarios regulares
router.route('/')
  .post(createTransaction)
  .get(getTransactions);

router.route('/:id')
  .get(getTransaction);

router.route('/:id/cancel')
  .put(cancelTransaction);

// Rutas para administradores
router.use(authorize('admin'));

router.route('/:id/status')
  .put(updateTransactionStatus);

export default router;

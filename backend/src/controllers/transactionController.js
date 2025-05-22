import Transaction from '../models/Transaction.js';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError, BadRequestError } from '../errors/index.js';

/**
 * @desc    Crear una nueva transacción
 * @route   POST /api/transactions
 * @access  Private
 */
export const createTransaction = async (req, res) => {
  const { items, paymentMethod, metadata } = req.body;
  
  // Calcular el monto total
  const amount = items.reduce((total, item) => {
    return total + (item.quantity * item.price);
  }, 0);

  const transaction = await Transaction.create({
    amount,
    user: req.user.id,
    items,
    paymentMethod,
    metadata
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: transaction
  });
};

/**
 * @desc    Obtener todas las transacciones del usuario
 * @route   GET /api/transactions
 * @access  Private
 */
export const getTransactions = async (req, res) => {
  const { status, limit = 10, page = 1 } = req.query;
  const skip = (page - 1) * limit;
  
  const query = { user: req.user.id };
  
  if (status) {
    query.status = status;
  }
  
  const transactions = await Transaction.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('items.product', 'name');
    
  const total = await Transaction.countDocuments(query);
  
  res.status(StatusCodes.OK).json({
    success: true,
    count: transactions.length,
    total,
    pages: Math.ceil(total / limit),
    data: transactions
  });
};

/**
 * @desc    Obtener una transacción por ID
 * @route   GET /api/transactions/:id
 * @access  Private
 */
export const getTransaction = async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user.id
  }).populate('items.product', 'name description');
  
  if (!transaction) {
    throw new NotFoundError(`No se encontró la transacción con id ${req.params.id}`);
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: transaction
  });
};

/**
 * @desc    Cancelar una transacción
 * @route   PUT /api/transactions/:id/cancel
 * @access  Private
 */
export const cancelTransaction = async (req, res) => {
  const { reason } = req.body;
  
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user.id
  });
  
  if (!transaction) {
    throw new NotFoundError(`No se encontró la transacción con id ${req.params.id}`);
  }
  
  // Usar el método de instancia para cancelar
  await transaction.cancel(reason || 'Solicitado por el usuario');
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Transacción cancelada exitosamente',
    data: transaction
  });
};

/**
 * @desc    Actualizar el estado de una transacción
 * @route   PUT /api/transactions/:id/status
 * @access  Private/Admin
 */
export const updateTransactionStatus = async (req, res) => {
  const { status, reason } = req.body;
  
  // Validar que el estado sea válido
  if (!['completed', 'cancelled', 'failed'].includes(status)) {
    throw new BadRequestError('Estado de transacción no válido');
  }
  
  const updateData = { status };
  
  if (status === 'cancelled') {
    updateData.cancelledAt = new Date();
    updateData.cancellationReason = reason || 'Solicitado por el administrador';
    
    // Aquí podrías agregar lógica adicional para revertir la transacción
    // como devolver productos al inventario
  }
  
  const transaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!transaction) {
    throw new NotFoundError(`No se encontró la transacción con id ${req.params.id}`);
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: `Transacción ${status} exitosamente`,
    data: transaction
  });
};

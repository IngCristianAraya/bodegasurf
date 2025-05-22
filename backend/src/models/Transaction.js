import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  amount: { 
    type: Number, 
    required: [true, 'El monto es requerido'],
    min: [0, 'El monto no puede ser negativo']
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled', 'failed'],
    default: 'pending',
    required: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  items: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'La cantidad debe ser al menos 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'El precio no puede ser negativo']
    }
  }],
  paymentMethod: {
    type: String,
    required: [true, 'El método de pago es requerido'],
    enum: ['efectivo', 'tarjeta', 'transferencia']
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'La razón de cancelación no puede exceder los 500 caracteres']
  },
  metadata: {
    type: Object,
    default: {}
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar el rendimiento de las consultas
transactionSchema.index({ user: 1, status: 1 });
transactionSchema.index({ status: 1, createdAt: -1 });

// Método para cancelar una transacción
transactionSchema.methods.cancel = async function(reason = 'Solicitado por el usuario') {
  if (this.status !== 'pending') {
    throw new Error('Solo se pueden cancelar transacciones pendientes');
  }
  
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  
  // Aquí iría la lógica para revertir la transacción (ej. devolver productos al inventario)
  await this.reverseTransaction();
  
  return this.save();
};

// Método para revertir los efectos de una transacción (a implementar según necesidades)
transactionSchema.methods.reverseTransaction = async function() {
  // Implementar lógica para revertir la transacción
  // Por ejemplo, devolver productos al inventario
  // Esta es una implementación de ejemplo
  
  // for (const item of this.items) {
  //   await Product.findByIdAndUpdate(item.product, {
  //     $inc: { stock: item.quantity }
  //   });
  // }
  
  return true;
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

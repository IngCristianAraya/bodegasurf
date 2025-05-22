import mongoose from 'mongoose';

// Esquema para los ítems de la venta
const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La cantidad debe ser al menos 1'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'El precio debe ser mayor o igual a 0'],
  },
  total: {
    type: Number,
    required: true,
  },
});

// Esquema para los detalles de pago
const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['efectivo', 'tarjeta', 'transferencia', 'otro'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'El monto debe ser mayor o igual a 0'],
  },
  reference: String,
  status: {
    type: String,
    enum: ['pendiente', 'completado', 'rechazado', 'reembolsado'],
    default: 'pendiente',
  },
});

// Esquema principal de venta
const saleSchema = new mongoose.Schema(
  {
    saleNumber: {
      type: String,
      unique: true,
    },
    items: [saleItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'El subtotal debe ser mayor o igual a 0'],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'El impuesto debe ser mayor o igual a 0'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'El descuento debe ser mayor o igual a 0'],
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'El total debe ser mayor o igual a 0'],
    },
    payment: paymentSchema,
    change: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pendiente', 'completada', 'cancelada', 'reembolsada'],
      default: 'completada',
    },
    notes: String,
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware para generar número de venta único
saleSchema.pre('save', async function (next) {
  if (!this.saleNumber) {
    const count = await this.constructor.countDocuments();
    this.saleNumber = `V-${new Date().getFullYear()}${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, '0')}${count.toString().padStart(6, '0')}`;
  }
  next();
});

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;
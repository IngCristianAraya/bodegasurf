import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor ingrese el nombre del producto'],
      trim: true,
      maxlength: [100, 'El nombre no puede tener más de 100 caracteres'],
    },
    description: {
      type: String,
      maxlength: [1000, 'La descripción no puede tener más de 1000 caracteres'],
    },
    price: {
      type: Number,
      required: [true, 'Por favor ingrese el precio del producto'],
      min: [0, 'El precio debe ser mayor o igual a 0'],
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, 'El costo debe ser mayor o igual a 0'],
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    barcode: {
      type: String,
      unique: true,
      sparse: true,
    },
    category: {
      type: String,
      required: [true, 'Por favor seleccione una categoría'],
    },
    stock: {
      type: Number,
      required: [true, 'Por favor ingrese la cantidad en stock'],
      default: 0,
      min: [0, 'El stock no puede ser menor a 0'],
    },
    minStock: {
      type: Number,
      default: 5,
      min: [0, 'El stock mínimo no puede ser menor a 0'],
    },
    unit: {
      type: String,
      enum: ['unidad', 'kg', 'g', 'l', 'ml', 'docena', 'paquete', 'caja', 'otro'],
      default: 'unidad',
    },
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para búsquedas más rápidas
productSchema.index({ name: 'text', description: 'text', barcode: 'text', sku: 'text' });

// Middleware para manejar SKU automático
productSchema.pre('save', async function (next) {
  if (!this.sku) {
    const count = await this.constructor.countDocuments();
    this.sku = `SKU-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;

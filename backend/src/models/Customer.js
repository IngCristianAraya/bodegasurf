import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor ingrese el nombre del cliente'],
      trim: true,
      maxlength: [100, 'El nombre no puede tener más de 100 caracteres'],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor ingrese un correo electrónico válido',
      ],
    },
    phone: {
      type: String,
      maxlength: [20, 'El número de teléfono no puede tener más de 20 caracteres'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    ruc: {
      type: String,
      maxlength: [20, 'El RUC no puede tener más de 20 caracteres'],
    },
    dni: {
      type: String,
      maxlength: [15, 'El DNI no puede tener más de 15 caracteres'],
    },
    notes: String,
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
customerSchema.index({ name: 'text', email: 'text', phone: 'text', ruc: 'text', dni: 'text' });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;

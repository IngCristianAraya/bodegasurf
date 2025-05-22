import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor ingrese el nombre del negocio'],
      trim: true,
      maxlength: [100, 'El nombre no puede tener más de 100 caracteres'],
    },
    subdomain: {
      type: String,
      required: [true, 'Por favor ingrese un subdominio'],
      unique: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Subdominio no válido'],
    },
    email: {
      type: String,
      required: [true, 'Por favor ingrese un correo electrónico'],
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
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'basic', 'premium', 'enterprise'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'suspended', 'canceled'],
        default: 'active',
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
      },
      paymentMethod: String,
    },
    settings: {
      currency: {
        type: String,
        default: 'PEN',
      },
      timezone: {
        type: String,
        default: 'America/Lima',
      },
      language: {
        type: String,
        default: 'es',
      },
    },
    logo: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware para manejar subdominios únicos
tenantSchema.pre('save', async function (next) {
  // Convertir a minúsculas y eliminar espacios
  this.subdomain = this.subdomain.toLowerCase().replace(/\s+/g, '');
  next();
});

const Tenant = mongoose.model('Tenant', tenantSchema);

export default Tenant;

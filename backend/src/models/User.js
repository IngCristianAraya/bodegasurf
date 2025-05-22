import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * @typedef {import('./User').IUser} IUser
 * @typedef {import('./User').IUserModel} IUserModel
 */

// No necesitamos declarar User y UserModel aquí
// ya que los exportaremos directamente

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor ingrese un nombre'],
      trim: true,
      maxlength: [50, 'El nombre no puede tener más de 50 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'Por favor ingrese un correo electrónico'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor ingrese un correo electrónico válido',
      ],
    },
    password: {
      type: String,
      required: [true, 'Por favor ingrese una contraseña'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
  // @ts-ignore - this se refiere al documento actual
  const user = this;
  
  if (!user.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    // @ts-ignore - this se refiere al documento actual
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(new Error('Error al encriptar la contraseña'));
  }
});

// Comparar contraseña ingresada con la contraseña encriptada
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    // @ts-ignore - this se refiere al documento actual
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error('Error al comparar contraseñas');
  }
};

// Generar y hashear token de restablecimiento de contraseña
userSchema.methods.getResetPasswordToken = function() {
  try {
    // @ts-ignore - this se refiere al documento actual
    const user = this;
    
    // Generar token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hashear el token y establecerlo en resetPasswordToken
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Establecer expiración (10 minutos)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
  } catch (error) {
    throw new Error('Error al generar el token de restablecimiento');
  }
};

// Método para generar token JWT
userSchema.methods.getSignedJwtToken = function() {
  try {
    const secret = process.env.JWT_SECRET || 'default_secret_key';
    
    // Crear un objeto plano con los datos necesarios
    const payload = {
      id: this._id.toString(),
      tenantId: this.tenantId ? this.tenantId.toString() : null,
      role: this.role
    };

    // Usar la firma directa sin opciones para evitar problemas de tipo
    return jwt.sign(payload, secret);
  } catch (error) {
    console.error('Error al generar el token JWT:', error);
    throw new Error('Error al generar el token de autenticación');
  }
};

// Crear el modelo
const User = mongoose.model('User', userSchema);

// Exportar el modelo
export default User;
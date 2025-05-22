import { Error, Document, Model } from 'mongoose';

// Definir la interfaz del usuario
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  tenantId: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(password: string): Promise<boolean>;
  getResetPasswordToken(): string;
  getSignedJwtToken(): string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
      MONGODB_URI: string;
      JWT_SECRET: string;
      JWT_EXPIRE: string;
      JWT_COOKIE_EXPIRE?: string;
      FRONTEND_URL: string;
      EMAIL_HOST: string;
      EMAIL_PORT: string;
      EMAIL_USERNAME: string;
      EMAIL_PASSWORD: string;
      EMAIL_FROM: string;
    }
  }

  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Extender la interfaz de Error para incluir nuestras propiedades personalizadas
declare global {
  interface Error {
    statusCode?: number;
    code?: string | number;
    isOperational?: boolean;
    keyValue?: Record<string, any>;
    errors?: Record<string, Error.ValidationError>;
    path?: string;
    value?: any;
  }

  // Tipos para el controlador de autenticación
  interface AuthResponse {
    success: boolean;
    token?: string;
    user?: Partial<IUser>;
    message?: string;
  }
}

export {}; // Este archivo necesita ser un módulo

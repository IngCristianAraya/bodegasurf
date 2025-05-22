import { Document, Model, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  tenantId: Types.ObjectId;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  isActive: boolean;
  matchPassword(password: string): Promise<boolean>;
  getResetPasswordToken(): string;
  getSignedJwtToken(): string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel extends Model<IUser> {
  // Aquí puedes agregar métodos estáticos si los tienes
}

// Extender el objeto Request de Express
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

import { Document, Model } from 'mongoose';

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

export interface IUserModel extends Model<IUser> {
  // Aquí puedes agregar métodos estáticos del modelo si los tienes
}

declare global {
  namespace Express {
    interface User extends IUser {}
    interface Request {
      user?: IUser;
    }
  }
}

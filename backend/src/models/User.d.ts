import { Document, Model, Types } from 'mongoose';

declare global {
  namespace Express {
    interface User {
      id: string;
      name: string;
      email: string;
      role: string;
      tenantId: string;
    }
  }
}

// Extender la interfaz Document para incluir los campos del modelo
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  tenantId: Types.ObjectId;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getResetPasswordToken(): string;
  getSignedJwtToken(): string;
  createdAt: Date;
  updatedAt: Date;
  save(options?: { session?: any }): Promise<this>;
}

// Extender la interfaz Model para incluir los métodos estáticos
export interface IUserModel extends Model<IUser> {
  // Métodos estáticos del modelo
  create(doc: Partial<IUser>): Promise<IUser>;
  findOne(conditions: any, projection?: any, options?: any): Promise<IUser | null>;
  findById(id: any, projection?: any, options?: any): Promise<IUser | null>;
  findByIdAndUpdate(id: any, update: any, options?: any): Promise<IUser | null>;
  // Agrega aquí otros métodos estáticos si los tienes
}

// Declarar el modelo
declare const User: IUserModel;
export default User;

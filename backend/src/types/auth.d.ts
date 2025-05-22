import { Request, Response, NextFunction } from 'express';
import { IUser } from './custom';

export interface AuthRequest extends Request {
  user?: IUser;
  body: {
    email?: string;
    password?: string;
    name?: string;
    role?: 'admin' | 'user';
    tenantId?: string;
    currentPassword?: string;
    newPassword?: string;
    resetToken?: string;
  };
  params: {
    resettoken?: string;
  };
}

export interface AuthResponse extends Response {
  status: (code: number) => AuthResponse;
  json: (body: {
    success: boolean;
    token?: string;
    user?: Partial<IUser>;
    message?: string;
  }) => AuthResponse;
  cookie: (name: string, val: string, options: any) => AuthResponse;
  clearCookie: (name: string, options: any) => AuthResponse;
}

export type AuthNextFunction = NextFunction;

export interface IAuthController {
  register(req: AuthRequest, res: AuthResponse, next: AuthNextFunction): Promise<void>;
  login(req: AuthRequest, res: AuthResponse, next: AuthNextFunction): Promise<void>;
  logout(req: AuthRequest, res: AuthResponse): void;
  getMe(req: AuthRequest, res: AuthResponse, next: AuthNextFunction): Promise<void>;
  updateDetails(req: AuthRequest, res: AuthResponse, next: AuthNextFunction): Promise<void>;
  updatePassword(req: AuthRequest, res: AuthResponse, next: AuthNextFunction): Promise<void>;
  forgotPassword(req: AuthRequest, res: AuthResponse, next: AuthNextFunction): Promise<void>;
  resetPassword(req: AuthRequest, res: AuthResponse, next: AuthNextFunction): Promise<void>;
}

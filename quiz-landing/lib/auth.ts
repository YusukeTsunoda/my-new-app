import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 12;

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPayload {
  id: string;
  email: string;
  username: string;
  displayName?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: UserPayload;
  token?: string;
  message: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    throw new Error('パスワードのハッシュ化に失敗しました');
  }
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('パスワードの検証に失敗しました');
  }
};

export const generateToken = (user: UserPayload): string => {
  try {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
      },
      JWT_SECRET,
      {
        expiresIn: '7d',
        issuer: 'quiz-app',
        audience: 'quiz-app-users',
      }
    );
  } catch (error) {
    throw new Error('トークンの生成に失敗しました');
  }
};

export const verifyToken = (token: string): UserPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'quiz-app',
      audience: 'quiz-app-users',
    }) as UserPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('トークンが期限切れです');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('無効なトークンです');
    } else {
      throw new Error('トークンの検証に失敗しました');
    }
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'パスワードは8文字以上である必要があります' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'パスワードには小文字を含める必要があります' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'パスワードには大文字を含める必要があります' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'パスワードには数字を含める必要があります' };
  }
  
  return { isValid: true };
};

export const validateUsername = (username: string): { isValid: boolean; message?: string } => {
  if (username.length < 3) {
    return { isValid: false, message: 'ユーザー名は3文字以上である必要があります' };
  }
  
  if (username.length > 20) {
    return { isValid: false, message: 'ユーザー名は20文字以下である必要があります' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, message: 'ユーザー名には英数字とアンダースコアのみ使用できます' };
  }
  
  return { isValid: true };
};

export const extractBearerToken = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
};

export class AuthError extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}
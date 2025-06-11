import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyPassword, 
  generateToken, 
  validateEmail,
  AuthError,
  type AuthResponse 
} from '../../../../../lib/auth';

const users: Array<{
  id: string;
  email: string;
  username: string;
  displayName?: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'メールアドレスとパスワードは必須です',
        } as AuthResponse,
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: '有効なメールアドレスを入力してください',
        } as AuthResponse,
        { status: 400 }
      );
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'メールアドレスまたはパスワードが間違っています',
        } as AuthResponse,
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'メールアドレスまたはパスワードが間違っています',
        } as AuthResponse,
        { status: 401 }
      );
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
    };

    const token = generateToken(userPayload);

    user.updatedAt = new Date();

    return NextResponse.json(
      {
        success: true,
        user: userPayload,
        token,
        message: 'ログインしました',
      } as AuthResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        } as AuthResponse,
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'サーバーエラーが発生しました',
      } as AuthResponse,
      { status: 500 }
    );
  }
}
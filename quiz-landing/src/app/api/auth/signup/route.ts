import { NextRequest, NextResponse } from 'next/server';
import { 
  hashPassword, 
  generateToken, 
  validateEmail, 
  validatePassword, 
  validateUsername,
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
    const { email, username, password, displayName } = body;

    if (!email || !username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'メールアドレス、ユーザー名、パスワードは必須です',
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

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: usernameValidation.message || 'ユーザー名が無効です',
        } as AuthResponse,
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: passwordValidation.message || 'パスワードが無効です',
        } as AuthResponse,
        { status: 400 }
      );
    }

    const existingUserByEmail = users.find(user => user.email === email);
    if (existingUserByEmail) {
      return NextResponse.json(
        {
          success: false,
          message: 'このメールアドレスは既に使用されています',
        } as AuthResponse,
        { status: 409 }
      );
    }

    const existingUserByUsername = users.find(user => user.username === username);
    if (existingUserByUsername) {
      return NextResponse.json(
        {
          success: false,
          message: 'このユーザー名は既に使用されています',
        } as AuthResponse,
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const newUser = {
      id: userId,
      email,
      username,
      displayName: displayName || username,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    users.push(newUser);

    const userPayload = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      displayName: newUser.displayName,
    };

    const token = generateToken(userPayload);

    return NextResponse.json(
      {
        success: true,
        user: userPayload,
        token,
        message: 'ユーザー登録が完了しました',
      } as AuthResponse,
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);

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
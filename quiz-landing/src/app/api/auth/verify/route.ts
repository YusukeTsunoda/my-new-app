import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyToken, 
  extractBearerToken,
  AuthError,
  type AuthResponse 
} from '../../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractBearerToken(authHeader);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: '認証トークンが提供されていません',
        } as AuthResponse,
        { status: 401 }
      );
    }

    const userPayload = verifyToken(token);

    return NextResponse.json(
      {
        success: true,
        user: userPayload,
        message: 'トークンが有効です',
      } as AuthResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error('Token verification error:', error);

    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        } as AuthResponse,
        { status: error.statusCode }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        } as AuthResponse,
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'トークンの検証に失敗しました',
      } as AuthResponse,
      { status: 401 }
    );
  }
}
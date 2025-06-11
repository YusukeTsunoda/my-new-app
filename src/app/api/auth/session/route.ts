import { NextRequest, NextResponse } from 'next/server';
import { SessionManager, MockUserDB } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = SessionManager.getSessionFromRequest(request);
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session found', authenticated: false },
        { status: 401 }
      );
    }

    const sessionData = await SessionManager.verifySession(sessionToken);
    
    if (!sessionData) {
      const response = NextResponse.json(
        { error: 'Session expired', authenticated: false },
        { status: 401 }
      );
      SessionManager.clearSessionCookie(response);
      return response;
    }

    // Get current user data
    const user = MockUserDB.findById(sessionData.userId);
    
    if (!user) {
      const response = NextResponse.json(
        { error: 'User not found', authenticated: false },
        { status: 401 }
      );
      SessionManager.clearSessionCookie(response);
      return response;
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName
      },
      session: {
        createdAt: sessionData.createdAt,
        expiresAt: sessionData.expiresAt
      }
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Internal server error', authenticated: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = SessionManager.getSessionFromRequest(request);
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session to refresh' },
        { status: 401 }
      );
    }

    const newToken = await SessionManager.refreshSession(sessionToken);
    
    if (!newToken) {
      const response = NextResponse.json(
        { error: 'Session refresh failed' },
        { status: 401 }
      );
      SessionManager.clearSessionCookie(response);
      return response;
    }

    const response = NextResponse.json({
      success: true,
      message: 'Session refreshed'
    });

    SessionManager.setSessionCookie(response, newToken);
    return response;
  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
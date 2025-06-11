import { NextRequest, NextResponse } from 'next/server';
import { SessionManager, MockUserDB } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = SessionManager.getSessionFromRequest(request);
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const sessionData = await SessionManager.verifySession(sessionToken);
    
    if (!sessionData) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    const user = MockUserDB.findById(sessionData.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile: user
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionToken = SessionManager.getSessionFromRequest(request);
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const sessionData = await SessionManager.verifySession(sessionToken);
    
    if (!sessionData) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    const updateData = await request.json();
    const allowedFields = ['displayName', 'bio', 'avatar'];
    const filteredData: any = {};

    // Only allow specific fields to be updated
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedUser = MockUserDB.updateUser(sessionData.userId, filteredData);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
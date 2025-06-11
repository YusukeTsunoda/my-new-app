import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.SESSION_SECRET || 'default-secret-key';
const key = new TextEncoder().encode(secretKey);

export interface SessionData {
  userId: string;
  email: string;
  username: string;
  createdAt: number;
  expiresAt: number;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export class SessionManager {
  private static readonly COOKIE_NAME = 'quiz-session';
  private static readonly SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  static async createSession(userData: Omit<SessionData, 'createdAt' | 'expiresAt'>): Promise<string> {
    const now = Date.now();
    const sessionData: SessionData = {
      ...userData,
      createdAt: now,
      expiresAt: now + this.SESSION_DURATION
    };

    const token = await new SignJWT(sessionData)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(key);

    return token;
  }

  static async verifySession(token: string): Promise<SessionData | null> {
    try {
      const { payload } = await jwtVerify(token, key);
      const sessionData = payload as SessionData;

      // Check if session is expired
      if (Date.now() > sessionData.expiresAt) {
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error('Session verification failed:', error);
      return null;
    }
  }

  static setSessionCookie(response: NextResponse, token: string): void {
    response.cookies.set(this.COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: this.SESSION_DURATION / 1000,
      path: '/'
    });
  }

  static clearSessionCookie(response: NextResponse): void {
    response.cookies.delete(this.COOKIE_NAME);
  }

  static getSessionFromRequest(request: NextRequest): string | null {
    return request.cookies.get(this.COOKIE_NAME)?.value || null;
  }

  static async refreshSession(currentToken: string): Promise<string | null> {
    const sessionData = await this.verifySession(currentToken);
    if (!sessionData) return null;

    // Create new session with extended expiration
    return await this.createSession({
      userId: sessionData.userId,
      email: sessionData.email,
      username: sessionData.username
    });
  }
}

// Client-side session utilities
export class ClientSession {
  private static readonly STORAGE_KEY = 'quiz-user-session';

  static setUserData(userData: Partial<UserProfile>): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        ...userData,
        lastUpdated: Date.now()
      }));
    }
  }

  static getUserData(): Partial<UserProfile> | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static clearUserData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  static isSessionExpired(): boolean {
    const userData = this.getUserData();
    if (!userData || !userData.lastUpdated) return true;

    const now = Date.now();
    const sessionAge = now - (userData.lastUpdated as number);
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    return sessionAge > maxAge;
  }
}

// Mock user database (in real app, this would be a database)
export class MockUserDB {
  private static users: Map<string, UserProfile> = new Map();

  static {
    // Initialize with sample users
    this.users.set('user1', {
      id: 'user1',
      email: 'john@example.com',
      username: 'john_doe',
      displayName: 'John Doe',
      bio: 'プログラミング学習中です',
      avatar: '/avatars/default.png',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    this.users.set('user2', {
      id: 'user2',
      email: 'jane@example.com',
      username: 'jane_smith',
      displayName: 'Jane Smith',
      bio: 'Web開発エンジニア',
      avatar: '/avatars/default.png',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  static findByEmail(email: string): UserProfile | null {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  static findByUsername(username: string): UserProfile | null {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return null;
  }

  static findById(id: string): UserProfile | null {
    return this.users.get(id) || null;
  }

  static updateUser(id: string, updates: Partial<UserProfile>): UserProfile | null {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updates,
      id, // Ensure ID cannot be changed
      updatedAt: new Date().toISOString()
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  static createUser(userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): UserProfile {
    const id = 'user' + (this.users.size + 1);
    const now = new Date().toISOString();
    
    const newUser: UserProfile = {
      ...userData,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.users.set(id, newUser);
    return newUser;
  }

  static validateCredentials(email: string, password: string): UserProfile | null {
    // Mock password validation (in real app, use proper hashing)
    const user = this.findByEmail(email);
    if (user && password === 'password123') { // Mock password
      return user;
    }
    return null;
  }
}
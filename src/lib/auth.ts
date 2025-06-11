import { User, Session } from '../../generated/prisma'
import { prisma } from './prisma'
import * as jose from 'jose'

export interface CreateUserData {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
  avatar?: string
}

export interface LoginCredentials {
  emailOrUsername: string
  password: string
}

export interface AuthResult {
  user: User
  session: Session
  token: string
}

// User operations
export async function createUser(data: CreateUserData): Promise<User> {
  return await prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      password: data.password, // In production, hash this password
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: data.avatar,
    },
  })
}

export async function getUserById(id: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      sessions: true,
      quizzes: true,
      results: true,
    },
  })
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email },
  })
}

export async function getUserByUsername(username: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { username },
  })
}

export async function updateUser(
  id: string,
  data: Partial<CreateUserData>
): Promise<User> {
  return await prisma.user.update({
    where: { id },
    data,
  })
}

export async function deleteUser(id: string): Promise<User> {
  return await prisma.user.delete({
    where: { id },
  })
}

// Session operations
export async function createSession(userId: string): Promise<AuthResult> {
  const user = await getUserById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  // Create JWT token
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'default-secret-key'
  )
  
  const token = await new jose.SignJWT({ userId, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)

  // Create session in database
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return { user, session, token }
}

export async function getSessionByToken(token: string): Promise<Session | null> {
  return await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })
}

export async function validateSession(token: string): Promise<User | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'default-secret-key'
    )
    
    const { payload } = await jose.jwtVerify(token, secret)
    const userId = payload.userId as string

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      return null
    }

    return session.user
  } catch (error) {
    return null
  }
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.delete({
    where: { token },
  })
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  })
}

// Authentication flow
export async function authenticateUser(
  credentials: LoginCredentials
): Promise<AuthResult | null> {
  const { emailOrUsername, password } = credentials

  // Find user by email or username
  let user = await getUserByEmail(emailOrUsername)
  if (!user) {
    user = await getUserByUsername(emailOrUsername)
  }

  if (!user || !user.isActive) {
    return null
  }

  // In production, compare hashed password
  if (user.password !== password) {
    return null
  }

  // Create new session
  return await createSession(user.id)
}

export async function refreshSession(token: string): Promise<AuthResult | null> {
  const session = await getSessionByToken(token)
  if (!session || session.expiresAt < new Date()) {
    return null
  }

  // Delete old session and create new one
  await deleteSession(token)
  return await createSession(session.userId)
}
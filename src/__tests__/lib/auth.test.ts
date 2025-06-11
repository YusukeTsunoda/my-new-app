import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { 
  createUser, 
  getUserById, 
  getUserByEmail, 
  getUserByUsername,
  createSession,
  validateSession,
  authenticateUser,
  deleteSession,
  deleteAllUserSessions
} from '@/lib/auth'
import { prisma } from '@/lib/prisma'

describe('Auth Library', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.session.deleteMany()
    await prisma.user.deleteMany()
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.session.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('User operations', () => {
    it('should create a user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      }

      const user = await createUser(userData)

      expect(user.id).toBeDefined()
      expect(user.email).toBe(userData.email)
      expect(user.username).toBe(userData.username)
      expect(user.firstName).toBe(userData.firstName)
      expect(user.lastName).toBe(userData.lastName)
      expect(user.role).toBe('USER')
      expect(user.isActive).toBe(true)
    })

    it('should get user by ID', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      }

      const createdUser = await createUser(userData)
      const foundUser = await getUserById(createdUser.id)

      expect(foundUser).toBeDefined()
      expect(foundUser!.id).toBe(createdUser.id)
      expect(foundUser!.email).toBe(userData.email)
    })

    it('should get user by email', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      }

      await createUser(userData)
      const foundUser = await getUserByEmail(userData.email)

      expect(foundUser).toBeDefined()
      expect(foundUser!.email).toBe(userData.email)
    })

    it('should get user by username', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      }

      await createUser(userData)
      const foundUser = await getUserByUsername(userData.username)

      expect(foundUser).toBeDefined()
      expect(foundUser!.username).toBe(userData.username)
    })

    it('should return null for non-existent user', async () => {
      const foundUser = await getUserById('non-existent-id')
      expect(foundUser).toBeNull()
    })
  })

  describe('Session operations', () => {
    let testUser: any

    beforeEach(async () => {
      testUser = await createUser({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      })
    })

    it('should create a session successfully', async () => {
      const authResult = await createSession(testUser.id)

      expect(authResult.user.id).toBe(testUser.id)
      expect(authResult.session.userId).toBe(testUser.id)
      expect(authResult.session.token).toBeDefined()
      expect(authResult.token).toBeDefined()
      expect(authResult.session.expiresAt).toBeInstanceOf(Date)
    })

    it('should validate a valid session', async () => {
      const authResult = await createSession(testUser.id)
      const validatedUser = await validateSession(authResult.token)

      expect(validatedUser).toBeDefined()
      expect(validatedUser!.id).toBe(testUser.id)
    })

    it('should return null for invalid token', async () => {
      const validatedUser = await validateSession('invalid-token')
      expect(validatedUser).toBeNull()
    })

    it('should delete a session', async () => {
      const authResult = await createSession(testUser.id)
      
      await deleteSession(authResult.token)
      
      const validatedUser = await validateSession(authResult.token)
      expect(validatedUser).toBeNull()
    })

    it('should delete all user sessions', async () => {
      const authResult1 = await createSession(testUser.id)
      const authResult2 = await createSession(testUser.id)

      await deleteAllUserSessions(testUser.id)

      const validatedUser1 = await validateSession(authResult1.token)
      const validatedUser2 = await validateSession(authResult2.token)
      
      expect(validatedUser1).toBeNull()
      expect(validatedUser2).toBeNull()
    })
  })

  describe('Authentication flow', () => {
    let testUser: any

    beforeEach(async () => {
      testUser = await createUser({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      })
    })

    it('should authenticate user with email', async () => {
      const authResult = await authenticateUser({
        emailOrUsername: 'test@example.com',
        password: 'password123',
      })

      expect(authResult).toBeDefined()
      expect(authResult!.user.id).toBe(testUser.id)
      expect(authResult!.session).toBeDefined()
      expect(authResult!.token).toBeDefined()
    })

    it('should authenticate user with username', async () => {
      const authResult = await authenticateUser({
        emailOrUsername: 'testuser',
        password: 'password123',
      })

      expect(authResult).toBeDefined()
      expect(authResult!.user.id).toBe(testUser.id)
    })

    it('should return null for wrong password', async () => {
      const authResult = await authenticateUser({
        emailOrUsername: 'test@example.com',
        password: 'wrongpassword',
      })

      expect(authResult).toBeNull()
    })

    it('should return null for non-existent user', async () => {
      const authResult = await authenticateUser({
        emailOrUsername: 'nonexistent@example.com',
        password: 'password123',
      })

      expect(authResult).toBeNull()
    })

    it('should return null for inactive user', async () => {
      await prisma.user.update({
        where: { id: testUser.id },
        data: { isActive: false },
      })

      const authResult = await authenticateUser({
        emailOrUsername: 'test@example.com',
        password: 'password123',
      })

      expect(authResult).toBeNull()
    })
  })
})
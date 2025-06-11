import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { prisma } from '@/lib/prisma'

describe('Prisma Client', () => {
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

  it('should connect to database successfully', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as test`
    expect(result).toBeDefined()
  })

  it('should create and read user', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    }

    const user = await prisma.user.create({
      data: userData,
    })

    expect(user.id).toBeDefined()
    expect(user.email).toBe(userData.email)
    expect(user.username).toBe(userData.username)

    const foundUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    expect(foundUser).toBeDefined()
    expect(foundUser!.email).toBe(userData.email)
  })

  it('should enforce unique email constraint', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser1',
      password: 'password123',
    }

    await prisma.user.create({ data: userData })

    // Try to create another user with same email
    await expect(
      prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser2',
          password: 'password123',
        },
      })
    ).rejects.toThrow()
  })

  it('should create session with user relation', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      },
    })

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: 'test-token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    expect(session.id).toBeDefined()
    expect(session.userId).toBe(user.id)
    expect(session.token).toBe('test-token')

    const sessionWithUser = await prisma.session.findUnique({
      where: { id: session.id },
      include: { user: true },
    })

    expect(sessionWithUser!.user.email).toBe('test@example.com')
  })
})
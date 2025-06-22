import { prisma } from '@/lib/prisma'
import { User } from '@prisma/client'

export interface CreateUserData {
  uid: string
  email: string
  name?: string
  picture?: string
  emailVerified?: boolean
}

export interface UpdateUserLoginData {
  lastLoggedInAt: Date
  loginCount: number
}

export class UserService {
  
  /**
   * Create a new user
   */
  static async createUser(data: CreateUserData): Promise<User> {
    return await prisma.user.create({
      data: {
        uid: data.uid,
        email: data.email,
        name: data.name,
        picture: data.picture,
        emailVerified: data.emailVerified ?? false,
        loginCount: 1,
        lastLoggedInAt: new Date(),
      },
    })
  }

  /**
   * Find user by UID (Google UID)
   */
  static async findByUid(uid: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { uid },
    })
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    })
  }

  /**
   * Update user login information
   */
  static async updateUserLogin(uid: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { uid },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return await prisma.user.update({
      where: { uid },
      data: {
        lastLoggedInAt: new Date(),
        loginCount: user.loginCount + 1,
      },
    })
  }

  /**
   * Update user profile information
   */
  static async updateProfile(uid: string, data: Partial<Pick<User, 'name' | 'picture' | 'emailVerified'>>): Promise<User> {
    return await prisma.user.update({
      where: { uid },
      data,
    })
  }

  /**
   * Get user by ID
   */
  static async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    })
  }

  /**
   * Block/unblock user
   */
  static async updateUserStatus(uid: string, isBlocked: boolean): Promise<User> {
    return await prisma.user.update({
      where: { uid },
      data: { isBlocked },
    })
  }

  /**
   * Get all active users (for admin purposes)
   */
  static async getActiveUsers(): Promise<User[]> {
    return await prisma.user.findMany({
      where: {
        isActive: true,
        isBlocked: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }
} 
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth'

export interface RegisterData {
  email: string
  password: string
  name: string
  companyName: string
  companyEmail: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: string
    companyId: string
  }
}

export class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      throw new Error('User already exists')
    }

    // Check if company already exists
    const existingCompany = await prisma.company.findUnique({
      where: { email: data.companyEmail }
    })

    if (existingCompany) {
      throw new Error('Company already exists')
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password)

    // Create company and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: data.companyName,
          email: data.companyEmail,
        }
      })

      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: 'ADMIN', // First user is admin
          companyId: company.id,
        }
      })

      return { company, user }
    })

    // Generate JWT token
    const token = await generateToken({
      userId: result.user.id,
      email: result.user.email,
      companyId: result.user.companyId,
      role: result.user.role
    })

    return {
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        companyId: result.user.companyId
      }
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    // Find user with company
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { company: true }
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.password)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role
    })

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId
      }
    }
  }

  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    })
  }
}

export const authService = new AuthService() 
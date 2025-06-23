import { register, login, getUserById } from '@/services/authService';

// Mock the auth library
jest.mock('@/lib/auth', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
  sign: jest.fn(),
}));

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    company: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Import the mocked modules
import { hash, verify, sign } from '@/lib/auth';
import prisma from '@/lib/prisma';

const mockHash = hash as jest.MockedFunction<typeof hash>;
const mockVerify = verify as jest.MockedFunction<typeof verify>;
const mockSign = sign as jest.MockedFunction<typeof sign>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockRegisterData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      companyName: 'Test Company',
      companyEmail: 'company@example.com',
    };

    it('should register a new user and company successfully', async () => {
      const mockCompany = { id: 'company-1', name: 'Test Company' };
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
        companyId: 'company-1',
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockHash.mockResolvedValue('hashed-password');
      mockSign.mockResolvedValue('mock-jwt-token');
      mockPrisma.$transaction.mockResolvedValue([mockCompany, mockUser]);

      const result = await register(mockRegisterData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockHash).toHaveBeenCalledWith('password123');
      expect(result).toEqual(
        expect.objectContaining({
          token: 'mock-jwt-token',
          user: mockUser,
        })
      );
    });

    it('should throw error if user already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com',
      } as any);

      await expect(register(mockRegisterData)).rejects.toThrow(
        'User already exists'
      );
    });
  });

  describe('login', () => {
    const mockLoginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user with correct credentials', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
        role: 'ADMIN',
        companyId: 'company-1',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
      mockVerify.mockResolvedValue(true);
      mockSign.mockResolvedValue('mock-jwt-token');

      const result = await login(mockLoginData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockVerify).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(result).toEqual(
        expect.objectContaining({
          token: 'mock-jwt-token',
          user: expect.objectContaining({
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'ADMIN',
            companyId: 'company-1',
          }),
        })
      );
    });

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(login(mockLoginData)).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw error if password is incorrect', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed-password',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
      mockVerify.mockResolvedValue(false);

      await expect(login(mockLoginData)).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
        companyId: 'company-1',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await getUserById('user-1');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          companyId: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await getUserById('non-existent');

      expect(result).toBeNull();
    });
  });
});
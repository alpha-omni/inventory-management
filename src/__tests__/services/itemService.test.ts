import {
  createItem,
  getItemsByCompany,
  getItemById,
  updateItem,
  deleteItem,
  getMedicationsWithSafetyFlags,
  getItemStats,
} from '@/services/itemService';
import prisma from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    item: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('ItemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createItem', () => {
    it('should create a medication with drugId', async () => {
      const mockItemData = {
        name: 'Aspirin',
        description: 'Pain reliever',
        type: 'MEDICATION' as const,
        drugId: 'ASP-001',
        isHazardous: false,
        isHighAlert: false,
        isLASA: false,
        companyId: 'company-1',
      };

      const mockCreatedItem = {
        id: 'item-1',
        ...mockItemData,
        inventory: [],
      };

      mockPrisma.item.create.mockResolvedValue(mockCreatedItem as any);

      const result = await createItem(mockItemData);

      expect(mockPrisma.item.create).toHaveBeenCalledWith({
        data: mockItemData,
        include: {
          inventory: {
            include: {
              stockArea: {
                include: {
                  site: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockCreatedItem);
    });

    it('should create a supply without drugId', async () => {
      const mockItemData = {
        name: 'Bandages',
        description: 'Medical supplies',
        type: 'SUPPLY' as const,
        isHazardous: false,
        isHighAlert: false,
        isLASA: false,
        companyId: 'company-1',
      };

      const mockCreatedItem = {
        id: 'item-1',
        ...mockItemData,
        drugId: null,
        inventory: [],
      };

      mockPrisma.item.create.mockResolvedValue(mockCreatedItem as any);

      const result = await createItem(mockItemData);

      expect(result).toEqual(mockCreatedItem);
    });
  });

  describe('getItemsByCompany', () => {
    it('should return all items for a company', async () => {
      const mockItems = [
        {
          id: 'item-1',
          name: 'Aspirin',
          type: 'MEDICATION',
          companyId: 'company-1',
          inventory: [],
        },
        {
          id: 'item-2',
          name: 'Bandages',
          type: 'SUPPLY',
          companyId: 'company-1',
          inventory: [],
        },
      ];

      mockPrisma.item.findMany.mockResolvedValue(mockItems as any);

      const result = await getItemsByCompany('company-1');

      expect(mockPrisma.item.findMany).toHaveBeenCalledWith({
        where: { companyId: 'company-1' },
        include: {
          inventory: {
            include: {
              stockArea: {
                include: {
                  site: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockItems);
    });

    it('should filter items by type', async () => {
      const mockItems = [
        {
          id: 'item-1',
          name: 'Aspirin',
          type: 'MEDICATION',
          companyId: 'company-1',
          inventory: [],
        },
      ];

      mockPrisma.item.findMany.mockResolvedValue(mockItems as any);

      const result = await getItemsByCompany('company-1', { type: 'MEDICATION' });

      expect(mockPrisma.item.findMany).toHaveBeenCalledWith({
        where: {
          companyId: 'company-1',
          type: 'MEDICATION',
        },
        include: {
          inventory: {
            include: {
              stockArea: {
                include: {
                  site: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockItems);
    });

    it('should filter items by safety flags', async () => {
      const mockItems = [
        {
          id: 'item-1',
          name: 'Warfarin',
          type: 'MEDICATION',
          isHighAlert: true,
          companyId: 'company-1',
          inventory: [],
        },
      ];

      mockPrisma.item.findMany.mockResolvedValue(mockItems as any);

      const result = await getItemsByCompany('company-1', { isHighAlert: true });

      expect(mockPrisma.item.findMany).toHaveBeenCalledWith({
        where: {
          companyId: 'company-1',
          isHighAlert: true,
        },
        include: {
          inventory: {
            include: {
              stockArea: {
                include: {
                  site: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockItems);
    });

    it('should search items by name and description', async () => {
      const mockItems = [
        {
          id: 'item-1',
          name: 'Aspirin',
          description: 'Pain reliever',
          companyId: 'company-1',
          inventory: [],
        },
      ];

      mockPrisma.item.findMany.mockResolvedValue(mockItems as any);

      const result = await getItemsByCompany('company-1', { search: 'pain' });

      expect(mockPrisma.item.findMany).toHaveBeenCalledWith({
        where: {
          companyId: 'company-1',
          OR: [
            { name: { contains: 'pain', mode: 'insensitive' } },
            { description: { contains: 'pain', mode: 'insensitive' } },
          ],
        },
        include: {
          inventory: {
            include: {
              stockArea: {
                include: {
                  site: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockItems);
    });
  });

  describe('getMedicationsWithSafetyFlags', () => {
    it('should return medications with safety flags', async () => {
      const mockMedications = [
        {
          id: 'item-1',
          name: 'Warfarin',
          type: 'MEDICATION',
          isHighAlert: true,
          isLASA: false,
          isHazardous: false,
          companyId: 'company-1',
        },
        {
          id: 'item-2',
          name: 'Chemotherapy Drug',
          type: 'MEDICATION',
          isHighAlert: false,
          isLASA: false,
          isHazardous: true,
          companyId: 'company-1',
        },
      ];

      mockPrisma.item.findMany.mockResolvedValue(mockMedications as any);

      const result = await getMedicationsWithSafetyFlags('company-1');

      expect(mockPrisma.item.findMany).toHaveBeenCalledWith({
        where: {
          companyId: 'company-1',
          type: 'MEDICATION',
          OR: [
            { isHazardous: true },
            { isHighAlert: true },
            { isLASA: true },
          ],
        },
        select: {
          id: true,
          name: true,
          drugId: true,
          isHazardous: true,
          isHighAlert: true,
          isLASA: true,
        },
      });
      expect(result).toEqual(mockMedications);
    });
  });

  describe('getItemStats', () => {
    it('should return item statistics', async () => {
      mockPrisma.item.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(60)  // medications
        .mockResolvedValueOnce(40)  // supplies
        .mockResolvedValueOnce(5)   // hazardous
        .mockResolvedValueOnce(10)  // high alert
        .mockResolvedValueOnce(3);  // LASA

      const result = await getItemStats('company-1');

      expect(result).toEqual({
        total: 100,
        medications: 60,
        supplies: 40,
        hazardous: 5,
        highAlert: 10,
        lasa: 3,
      });

      expect(mockPrisma.item.count).toHaveBeenCalledTimes(6);
    });
  });

  describe('deleteItem', () => {
    it('should delete item successfully', async () => {
      const mockItem = {
        id: 'item-1',
        name: 'Test Item',
        companyId: 'company-1',
      };

      mockPrisma.item.findFirst.mockResolvedValue(mockItem as any);
      mockPrisma.item.delete.mockResolvedValue(mockItem as any);

      const result = await deleteItem('item-1', 'company-1');

      expect(mockPrisma.item.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'item-1',
          companyId: 'company-1',
        },
      });
      expect(mockPrisma.item.delete).toHaveBeenCalledWith({
        where: { id: 'item-1' },
      });
      expect(result).toEqual(mockItem);
    });

    it('should throw error if item not found', async () => {
      mockPrisma.item.findFirst.mockResolvedValue(null);

      await expect(deleteItem('item-1', 'company-1')).rejects.toThrow(
        'Item not found'
      );
    });
  });
});
import {
  createInventory,
  getInventoryByCompany,
  adjustQuantity,
  getLowStockItems,
  getInventoryStats,
  deleteInventory,
} from '@/services/inventoryService';
import prisma from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    inventory: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    stockArea: {
      findFirst: jest.fn(),
    },
    item: {
      findFirst: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('InventoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createInventory', () => {
    it('should create inventory record successfully', async () => {
      const mockInventoryData = {
        itemId: 'item-1',
        stockAreaId: 'stock-area-1',
        currentQuantity: 100,
        maxCapacity: 500,
        reorderThreshold: 50,
      };

      const mockStockArea = {
        id: 'stock-area-1',
        site: { companyId: 'company-1' },
      };

      const mockItem = {
        id: 'item-1',
        companyId: 'company-1',
      };

      const mockCreatedInventory = {
        id: 'inventory-1',
        ...mockInventoryData,
        item: mockItem,
        stockArea: mockStockArea,
      };

      mockPrisma.stockArea.findFirst.mockResolvedValue(mockStockArea as any);
      mockPrisma.item.findFirst.mockResolvedValue(mockItem as any);
      mockPrisma.inventory.findFirst.mockResolvedValue(null); // No existing inventory
      mockPrisma.inventory.create.mockResolvedValue(mockCreatedInventory as any);

      const result = await createInventory(mockInventoryData, 'company-1');

      expect(mockPrisma.stockArea.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'stock-area-1',
          site: { companyId: 'company-1' },
        },
        include: { site: true },
      });

      expect(mockPrisma.item.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'item-1',
          companyId: 'company-1',
        },
      });

      expect(mockPrisma.inventory.create).toHaveBeenCalledWith({
        data: mockInventoryData,
        include: {
          item: true,
          stockArea: {
            include: {
              site: true,
            },
          },
        },
      });

      expect(result).toEqual(mockCreatedInventory);
    });

    it('should throw error if stock area not found', async () => {
      mockPrisma.stockArea.findFirst.mockResolvedValue(null);

      await expect(
        createInventory({
          itemId: 'item-1',
          stockAreaId: 'invalid-stock-area',
          currentQuantity: 100,
        }, 'company-1')
      ).rejects.toThrow('Stock area not found');
    });

    it('should throw error if item not found', async () => {
      const mockStockArea = {
        id: 'stock-area-1',
        site: { companyId: 'company-1' },
      };

      mockPrisma.stockArea.findFirst.mockResolvedValue(mockStockArea as any);
      mockPrisma.item.findFirst.mockResolvedValue(null);

      await expect(
        createInventory({
          itemId: 'invalid-item',
          stockAreaId: 'stock-area-1',
          currentQuantity: 100,
        }, 'company-1')
      ).rejects.toThrow('Item not found');
    });

    it('should throw error if inventory already exists', async () => {
      const mockStockArea = {
        id: 'stock-area-1',
        site: { companyId: 'company-1' },
      };

      const mockItem = {
        id: 'item-1',
        companyId: 'company-1',
      };

      const mockExistingInventory = {
        id: 'existing-inventory',
        itemId: 'item-1',
        stockAreaId: 'stock-area-1',
      };

      mockPrisma.stockArea.findFirst.mockResolvedValue(mockStockArea as any);
      mockPrisma.item.findFirst.mockResolvedValue(mockItem as any);
      mockPrisma.inventory.findFirst.mockResolvedValue(mockExistingInventory as any);

      await expect(
        createInventory({
          itemId: 'item-1',
          stockAreaId: 'stock-area-1',
          currentQuantity: 100,
        }, 'company-1')
      ).rejects.toThrow('Inventory record already exists for this item in this stock area');
    });
  });

  describe('getInventoryByCompany', () => {
    it('should return inventory for a company', async () => {
      const mockInventory = [
        {
          id: 'inventory-1',
          itemId: 'item-1',
          stockAreaId: 'stock-area-1',
          currentQuantity: 100,
          item: { name: 'Aspirin' },
          stockArea: { name: 'Pharmacy', site: { name: 'Hospital A' } },
        },
      ];

      mockPrisma.inventory.findMany.mockResolvedValue(mockInventory as any);

      const result = await getInventoryByCompany('company-1');

      expect(mockPrisma.inventory.findMany).toHaveBeenCalledWith({
        where: {
          stockArea: {
            site: {
              companyId: 'company-1',
            },
          },
        },
        include: {
          item: true,
          stockArea: {
            include: {
              site: true,
            },
          },
        },
      });

      expect(result).toEqual(mockInventory);
    });

    it('should filter by low stock', async () => {
      const mockLowStockInventory = [
        {
          id: 'inventory-1',
          currentQuantity: 10,
          reorderThreshold: 50,
          item: { name: 'Low Stock Item' },
        },
      ];

      mockPrisma.inventory.findMany.mockResolvedValue(mockLowStockInventory as any);

      const result = await getInventoryByCompany('company-1', { lowStock: true });

      expect(mockPrisma.inventory.findMany).toHaveBeenCalledWith({
        where: {
          stockArea: {
            site: {
              companyId: 'company-1',
            },
          },
          currentQuantity: {
            lte: { reorderThreshold: {} },
          },
        },
        include: {
          item: true,
          stockArea: {
            include: {
              site: true,
            },
          },
        },
      });

      expect(result).toEqual(mockLowStockInventory);
    });
  });

  describe('adjustQuantity', () => {
    it('should adjust quantity successfully', async () => {
      const mockInventory = {
        id: 'inventory-1',
        currentQuantity: 100,
        stockArea: { site: { companyId: 'company-1' } },
      };

      const mockUpdatedInventory = {
        ...mockInventory,
        currentQuantity: 150,
        item: { name: 'Test Item' },
        stockArea: { name: 'Test Area', site: { name: 'Test Site' } },
      };

      mockPrisma.inventory.findFirst.mockResolvedValue(mockInventory as any);
      mockPrisma.inventory.update.mockResolvedValue(mockUpdatedInventory as any);

      const result = await adjustQuantity('inventory-1', 'company-1', 50);

      expect(mockPrisma.inventory.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'inventory-1',
          stockArea: {
            site: {
              companyId: 'company-1',
            },
          },
        },
        include: {
          stockArea: {
            include: {
              site: true,
            },
          },
        },
      });

      expect(mockPrisma.inventory.update).toHaveBeenCalledWith({
        where: { id: 'inventory-1' },
        data: { currentQuantity: 150 },
        include: {
          item: true,
          stockArea: {
            include: {
              site: true,
            },
          },
        },
      });

      expect(result).toEqual(mockUpdatedInventory);
    });

    it('should throw error if adjustment would result in negative quantity', async () => {
      const mockInventory = {
        id: 'inventory-1',
        currentQuantity: 30,
        stockArea: { site: { companyId: 'company-1' } },
      };

      mockPrisma.inventory.findFirst.mockResolvedValue(mockInventory as any);

      await expect(
        adjustQuantity('inventory-1', 'company-1', -50)
      ).rejects.toThrow('Insufficient quantity');
    });

    it('should throw error if inventory not found', async () => {
      mockPrisma.inventory.findFirst.mockResolvedValue(null);

      await expect(
        adjustQuantity('invalid-inventory', 'company-1', 10)
      ).rejects.toThrow('Inventory not found');
    });
  });

  describe('getLowStockItems', () => {
    it('should return low stock items', async () => {
      const mockLowStockItems = [
        {
          id: 'inventory-1',
          currentQuantity: 10,
          reorderThreshold: 50,
          item: { name: 'Low Stock Item' },
          stockArea: { name: 'Test Area', site: { name: 'Test Site' } },
        },
      ];

      mockPrisma.inventory.findMany.mockResolvedValue(mockLowStockItems as any);

      const result = await getLowStockItems('company-1');

      expect(mockPrisma.inventory.findMany).toHaveBeenCalledWith({
        where: {
          stockArea: {
            site: {
              companyId: 'company-1',
            },
          },
          reorderThreshold: {
            not: null,
          },
          currentQuantity: {
            lte: { reorderThreshold: {} },
          },
        },
        include: {
          item: true,
          stockArea: {
            include: {
              site: true,
            },
          },
        },
      });

      expect(result).toEqual(mockLowStockItems);
    });
  });

  describe('getInventoryStats', () => {
    it('should return inventory statistics', async () => {
      mockPrisma.inventory.count
        .mockResolvedValueOnce(100) // total items
        .mockResolvedValueOnce(15); // low stock items

      mockPrisma.inventory.aggregate.mockResolvedValue({
        _sum: { currentQuantity: 5000 },
        _avg: { currentQuantity: 50 },
      } as any);

      const result = await getInventoryStats('company-1');

      expect(result).toEqual({
        totalItems: 100,
        lowStockItems: 15,
        totalQuantity: 5000,
        averageQuantity: 50,
      });

      expect(mockPrisma.inventory.count).toHaveBeenCalledTimes(2);
      expect(mockPrisma.inventory.aggregate).toHaveBeenCalledTimes(1);
    });
  });
});
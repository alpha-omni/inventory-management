import {
  createSite,
  getSitesByCompany,
  getSiteById,
  updateSite,
  deleteSite,
} from '@/services/siteService';
import prisma from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    site: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('SiteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSite', () => {
    it('should create a new site successfully', async () => {
      const mockSiteData = {
        name: 'Test Hospital',
        address: '123 Main St',
        companyId: 'company-1',
      };

      const mockCreatedSite = {
        id: 'site-1',
        ...mockSiteData,
        stockAreas: [],
        company: { id: 'company-1', name: 'Test Company' },
      };

      mockPrisma.site.create.mockResolvedValue(mockCreatedSite as any);

      const result = await createSite(mockSiteData);

      expect(mockPrisma.site.create).toHaveBeenCalledWith({
        data: mockSiteData,
        include: {
          stockAreas: true,
          company: true,
        },
      });
      expect(result).toEqual(mockCreatedSite);
    });

    it('should create site without address', async () => {
      const mockSiteData = {
        name: 'Test Hospital',
        companyId: 'company-1',
      };

      const mockCreatedSite = {
        id: 'site-1',
        ...mockSiteData,
        address: null,
        stockAreas: [],
        company: { id: 'company-1', name: 'Test Company' },
      };

      mockPrisma.site.create.mockResolvedValue(mockCreatedSite as any);

      const result = await createSite(mockSiteData);

      expect(result).toEqual(mockCreatedSite);
    });
  });

  describe('getSitesByCompany', () => {
    it('should return sites for a company', async () => {
      const mockSites = [
        {
          id: 'site-1',
          name: 'Hospital A',
          address: '123 Main St',
          companyId: 'company-1',
          stockAreas: [],
          company: { id: 'company-1', name: 'Test Company' },
        },
        {
          id: 'site-2',
          name: 'Hospital B',
          address: '456 Oak Ave',
          companyId: 'company-1',
          stockAreas: [],
          company: { id: 'company-1', name: 'Test Company' },
        },
      ];

      mockPrisma.site.findMany.mockResolvedValue(mockSites as any);

      const result = await getSitesByCompany('company-1');

      expect(mockPrisma.site.findMany).toHaveBeenCalledWith({
        where: { companyId: 'company-1' },
        include: {
          stockAreas: true,
          company: true,
        },
      });
      expect(result).toEqual(mockSites);
    });

    it('should return empty array if no sites found', async () => {
      mockPrisma.site.findMany.mockResolvedValue([]);

      const result = await getSitesByCompany('company-1');

      expect(result).toEqual([]);
    });
  });

  describe('getSiteById', () => {
    it('should return site by id and company', async () => {
      const mockSite = {
        id: 'site-1',
        name: 'Test Hospital',
        address: '123 Main St',
        companyId: 'company-1',
        stockAreas: [],
        company: { id: 'company-1', name: 'Test Company' },
      };

      mockPrisma.site.findFirst.mockResolvedValue(mockSite as any);

      const result = await getSiteById('site-1', 'company-1');

      expect(mockPrisma.site.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'site-1',
          companyId: 'company-1',
        },
        include: {
          stockAreas: true,
          company: true,
        },
      });
      expect(result).toEqual(mockSite);
    });

    it('should return null if site not found or belongs to different company', async () => {
      mockPrisma.site.findFirst.mockResolvedValue(null);

      const result = await getSiteById('site-1', 'wrong-company');

      expect(result).toBeNull();
    });
  });

  describe('updateSite', () => {
    it('should update site successfully', async () => {
      const updateData = {
        name: 'Updated Hospital',
        address: '789 New St',
      };

      const mockUpdatedSite = {
        id: 'site-1',
        companyId: 'company-1',
        ...updateData,
        stockAreas: [],
        company: { id: 'company-1', name: 'Test Company' },
      };

      mockPrisma.site.findFirst.mockResolvedValue({ id: 'site-1' } as any);
      mockPrisma.site.update.mockResolvedValue(mockUpdatedSite as any);

      const result = await updateSite('site-1', 'company-1', updateData);

      expect(mockPrisma.site.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'site-1',
          companyId: 'company-1',
        },
      });
      expect(mockPrisma.site.update).toHaveBeenCalledWith({
        where: { id: 'site-1' },
        data: updateData,
        include: {
          stockAreas: true,
          company: true,
        },
      });
      expect(result).toEqual(mockUpdatedSite);
    });

    it('should throw error if site not found', async () => {
      mockPrisma.site.findFirst.mockResolvedValue(null);

      await expect(
        updateSite('site-1', 'company-1', { name: 'Updated' })
      ).rejects.toThrow('Site not found');
    });
  });

  describe('deleteSite', () => {
    it('should delete site successfully', async () => {
      const mockSite = {
        id: 'site-1',
        name: 'Test Hospital',
        companyId: 'company-1',
      };

      mockPrisma.site.findFirst.mockResolvedValue(mockSite as any);
      mockPrisma.site.delete.mockResolvedValue(mockSite as any);

      const result = await deleteSite('site-1', 'company-1');

      expect(mockPrisma.site.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'site-1',
          companyId: 'company-1',
        },
      });
      expect(mockPrisma.site.delete).toHaveBeenCalledWith({
        where: { id: 'site-1' },
      });
      expect(result).toEqual(mockSite);
    });

    it('should throw error if site not found', async () => {
      mockPrisma.site.findFirst.mockResolvedValue(null);

      await expect(deleteSite('site-1', 'company-1')).rejects.toThrow(
        'Site not found'
      );
    });
  });
});
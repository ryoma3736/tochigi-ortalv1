import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface InstagramPost {
  id: string;
  media_url: string;
  caption?: string;
  permalink: string;
  timestamp: string;
}

export class InstagramService {
  private baseUrl = 'https://graph.instagram.com';

  async fetchUserPosts(accessToken: string, userId: string): Promise<InstagramPost[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/${userId}/media`, {
        params: {
          fields: 'id,media_url,caption,permalink,timestamp',
          access_token: accessToken,
          limit: 20,
        },
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Instagram API error:', error);
      return [];
    }
  }

  async syncCompanyPosts(companyId: string): Promise<number> {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company || !company.instagramHandle) {
        return 0;
      }

      // In production, you'd fetch the actual posts
      // For now, we'll create mock posts
      const mockPosts = [
        {
          postUrl: `https://instagram.com/p/mock1`,
          imageUrl: `https://picsum.photos/seed/${companyId}1/600/600`,
          caption: 'リフォーム施工例 #1',
        },
        {
          postUrl: `https://instagram.com/p/mock2`,
          imageUrl: `https://picsum.photos/seed/${companyId}2/600/600`,
          caption: 'リフォーム施工例 #2',
        },
        {
          postUrl: `https://instagram.com/p/mock3`,
          imageUrl: `https://picsum.photos/seed/${companyId}3/600/600`,
          caption: 'リフォーム施工例 #3',
        },
      ];

      // Delete old posts
      await prisma.instagramPost.deleteMany({
        where: { companyId },
      });

      // Create new posts
      await prisma.instagramPost.createMany({
        data: mockPosts.map((post) => ({
          companyId,
          ...post,
          postedAt: new Date(),
        })),
      });

      return mockPosts.length;
    } catch (error) {
      console.error('Error syncing Instagram posts:', error);
      return 0;
    }
  }

  async getCompanyPosts(companyId: string) {
    return prisma.instagramPost.findMany({
      where: { companyId },
      orderBy: { postedAt: 'desc' },
      take: 20,
    });
  }

  async syncAllCompanies() {
    const companies = await prisma.company.findMany({
      where: {
        instagramHandle: { not: null },
        subscriptionStatus: 'active',
      },
    });

    const results = await Promise.allSettled(
      companies.map((company) => this.syncCompanyPosts(company.id))
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    return { total: companies.length, success: successCount };
  }
}

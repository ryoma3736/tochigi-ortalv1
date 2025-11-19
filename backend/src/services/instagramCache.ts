import { PrismaClient, InstagramPost } from '@prisma/client'
import { instagramService } from './instagram.js'
import logger from '../utils/logger.js'

const prisma = new PrismaClient()

interface CacheOptions {
  forceRefresh?: boolean
  maxAge?: number // in milliseconds
}

interface InstagramCacheResult {
  posts: InstagramPost[]
  fromCache: boolean
  lastUpdated: Date | null
}

export class InstagramCacheService {
  private readonly defaultMaxAge = 60 * 60 * 1000 // 1 hour in milliseconds

  /**
   * Get Instagram posts for a company with caching
   * @param companyId - Company ID
   * @param accessToken - Instagram access token
   * @param limit - Number of posts to retrieve
   * @param options - Cache options
   * @returns Cached or fresh Instagram posts
   */
  async getCompanyPosts(
    companyId: string,
    accessToken: string,
    limit: number = 20,
    options: CacheOptions = {}
  ): Promise<InstagramCacheResult> {
    const { forceRefresh = false, maxAge = this.defaultMaxAge } = options

    try {
      // Check if we have cached posts
      if (!forceRefresh) {
        const cachedPosts = await this.getCachedPosts(companyId, maxAge)

        if (cachedPosts.length > 0) {
          logger.info(`Returning ${cachedPosts.length} cached Instagram posts for company: ${companyId}`)

          const lastUpdated = cachedPosts.length > 0
            ? cachedPosts[0].updatedAt
            : null

          return {
            posts: cachedPosts,
            fromCache: true,
            lastUpdated,
          }
        }
      }

      // Fetch fresh data from Instagram API
      logger.info(`Fetching fresh Instagram posts for company: ${companyId}`)
      const freshPosts = await instagramService.getPosts(accessToken, limit)

      // Update cache
      const updatedPosts = await this.updateCache(companyId, freshPosts)

      return {
        posts: updatedPosts,
        fromCache: false,
        lastUpdated: new Date(),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error(`Failed to get Instagram posts for company ${companyId}:`, { error: errorMessage })

      // Try to return cached data as fallback
      const cachedPosts = await this.getCachedPosts(companyId, Infinity)

      if (cachedPosts.length > 0) {
        logger.warn(`Returning stale cached data for company: ${companyId}`)
        return {
          posts: cachedPosts,
          fromCache: true,
          lastUpdated: cachedPosts[0].updatedAt,
        }
      }

      throw error
    }
  }

  /**
   * Get cached posts from database
   * @param companyId - Company ID
   * @param maxAge - Maximum age of cached data in milliseconds
   * @returns Array of cached Instagram posts
   */
  private async getCachedPosts(companyId: string, maxAge: number): Promise<InstagramPost[]> {
    const cutoffTime = new Date(Date.now() - maxAge)

    const posts = await prisma.instagramPost.findMany({
      where: {
        companyId,
        updatedAt: {
          gte: cutoffTime,
        },
      },
      orderBy: {
        postedAt: 'desc',
      },
    })

    return posts
  }

  /**
   * Update cache with fresh Instagram data
   * @param companyId - Company ID
   * @param freshPosts - Fresh posts from Instagram API
   * @returns Array of updated Instagram posts
   */
  private async updateCache(
    companyId: string,
    freshPosts: Array<{
      id: string
      permalink: string
      media_url: string
      caption?: string
      timestamp: string
    }>
  ): Promise<InstagramPost[]> {
    const updatedPosts: InstagramPost[] = []

    for (const post of freshPosts) {
      try {
        const existingPost = await prisma.instagramPost.findUnique({
          where: { postUrl: post.permalink },
        })

        let savedPost: InstagramPost

        if (existingPost) {
          // Update existing post
          savedPost = await prisma.instagramPost.update({
            where: { id: existingPost.id },
            data: {
              imageUrl: post.media_url,
              caption: post.caption || null,
              postedAt: new Date(post.timestamp),
              updatedAt: new Date(),
            },
          })
          logger.debug(`Updated cached post: ${post.id}`)
        } else {
          // Create new post
          savedPost = await prisma.instagramPost.create({
            data: {
              companyId,
              postUrl: post.permalink,
              imageUrl: post.media_url,
              caption: post.caption || null,
              postedAt: new Date(post.timestamp),
            },
          })
          logger.debug(`Created new cached post: ${post.id}`)
        }

        updatedPosts.push(savedPost)
      } catch (error) {
        logger.error(`Failed to cache Instagram post ${post.id}:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        // Continue with other posts even if one fails
      }
    }

    // Clean up old posts (keep only latest 50 posts per company)
    await this.cleanupOldPosts(companyId, 50)

    logger.info(`Updated cache with ${updatedPosts.length} Instagram posts for company: ${companyId}`)
    return updatedPosts
  }

  /**
   * Remove old posts beyond the retention limit
   * @param companyId - Company ID
   * @param retentionLimit - Number of posts to keep
   */
  private async cleanupOldPosts(companyId: string, retentionLimit: number): Promise<void> {
    try {
      const allPosts = await prisma.instagramPost.findMany({
        where: { companyId },
        orderBy: { postedAt: 'desc' },
        select: { id: true },
      })

      if (allPosts.length > retentionLimit) {
        const postsToDelete = allPosts.slice(retentionLimit)
        const idsToDelete = postsToDelete.map(post => post.id)

        await prisma.instagramPost.deleteMany({
          where: {
            id: { in: idsToDelete },
          },
        })

        logger.info(`Cleaned up ${idsToDelete.length} old Instagram posts for company: ${companyId}`)
      }
    } catch (error) {
      logger.error(`Failed to cleanup old posts for company ${companyId}:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Clear all cached posts for a company
   * @param companyId - Company ID
   */
  async clearCache(companyId: string): Promise<void> {
    try {
      await prisma.instagramPost.deleteMany({
        where: { companyId },
      })
      logger.info(`Cleared Instagram cache for company: ${companyId}`)
    } catch (error) {
      logger.error(`Failed to clear cache for company ${companyId}:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  /**
   * Get cache statistics for a company
   * @param companyId - Company ID
   * @returns Cache statistics
   */
  async getCacheStats(companyId: string): Promise<{
    totalPosts: number
    oldestPost: Date | null
    newestPost: Date | null
    lastUpdated: Date | null
  }> {
    try {
      const posts = await prisma.instagramPost.findMany({
        where: { companyId },
        orderBy: { postedAt: 'desc' },
        select: {
          postedAt: true,
          updatedAt: true,
        },
      })

      return {
        totalPosts: posts.length,
        oldestPost: posts.length > 0 ? posts[posts.length - 1].postedAt : null,
        newestPost: posts.length > 0 ? posts[0].postedAt : null,
        lastUpdated: posts.length > 0 ? posts[0].updatedAt : null,
      }
    } catch (error) {
      logger.error(`Failed to get cache stats for company ${companyId}:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  /**
   * Sync Instagram posts for all active companies
   * @returns Summary of sync operation
   */
  async syncAllCompanies(): Promise<{
    success: number
    failed: number
    total: number
    errors: Array<{ companyId: string; error: string }>
  }> {
    try {
      // Get all companies with Instagram handles and active subscriptions
      const companies = await prisma.company.findMany({
        where: {
          instagramHandle: { not: null },
          subscriptionStatus: 'active',
        },
        select: {
          id: true,
          name: true,
          instagramHandle: true,
        },
      })

      logger.info(`Starting Instagram sync for ${companies.length} companies`)

      let successCount = 0
      let failedCount = 0
      const errors: Array<{ companyId: string; error: string }> = []

      for (const company of companies) {
        try {
          // Note: In production, you should store access tokens per company
          // For now, we'll use a placeholder - this needs to be implemented
          const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || ''

          if (!accessToken) {
            throw new Error('No access token configured')
          }

          await this.getCompanyPosts(company.id, accessToken, 20, {
            forceRefresh: true,
          })

          successCount++
          logger.info(`Successfully synced Instagram posts for company: ${company.name}`)
        } catch (error) {
          failedCount++
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          errors.push({
            companyId: company.id,
            error: errorMessage,
          })
          logger.error(`Failed to sync Instagram posts for company ${company.name}:`, {
            error: errorMessage,
          })
        }
      }

      logger.info(`Instagram sync completed: ${successCount} succeeded, ${failedCount} failed`)

      return {
        success: successCount,
        failed: failedCount,
        total: companies.length,
        errors,
      }
    } catch (error) {
      logger.error('Failed to sync all companies:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }
}

// Export singleton instance
export const instagramCacheService = new InstagramCacheService()

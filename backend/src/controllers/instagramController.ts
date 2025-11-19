import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import { instagramService } from '../services/instagram.js'
import { instagramCacheService } from '../services/instagramCache.js'
import { instagramSyncJob } from '../jobs/instagramSync.js'
import logger from '../utils/logger.js'

/**
 * Get Instagram OAuth authorization URL
 */
export const getAuthUrl = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const clientId = process.env.INSTAGRAM_CLIENT_ID
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI

    if (!clientId || !redirectUri) {
      return res.status(500).json({
        success: false,
        error: 'Instagram OAuth not configured',
      })
    }

    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`

    logger.info('Instagram auth URL generated')

    res.json({
      success: true,
      data: { authUrl },
    })
  } catch (error) {
    logger.error('Failed to generate Instagram auth URL:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    next(error)
  }
}

/**
 * Handle Instagram OAuth callback
 */
export const handleCallback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code is required',
      })
    }

    // TODO: Exchange code for access token
    // Note: This requires Instagram app credentials
    // const tokenResponse = await exchangeCodeForToken(code)
    // TODO: Store access token in database linked to company

    logger.info('Instagram OAuth callback processed')

    res.json({
      success: true,
      message: 'Instagram connected successfully',
    })
  } catch (error) {
    logger.error('Failed to handle Instagram callback:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    next(error)
  }
}

/**
 * Get Instagram posts for a company
 */
export const getPosts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.query
    const { forceRefresh } = req.query

    if (!companyId || typeof companyId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required',
      })
    }

    // Get access token from environment (in production, this should come from database)
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN

    if (!accessToken) {
      return res.status(500).json({
        success: false,
        error: 'Instagram access token not configured',
      })
    }

    // Get posts with caching
    const result = await instagramCacheService.getCompanyPosts(
      companyId,
      accessToken,
      20,
      {
        forceRefresh: forceRefresh === 'true',
      }
    )

    logger.info(`Returned ${result.posts.length} Instagram posts for company: ${companyId}`)

    res.json({
      success: true,
      data: {
        posts: result.posts,
        fromCache: result.fromCache,
        lastUpdated: result.lastUpdated,
        count: result.posts.length,
      },
    })
  } catch (error) {
    logger.error('Failed to get Instagram posts:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    next(error)
  }
}

/**
 * Get cache statistics for a company
 */
export const getCacheStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.query

    if (!companyId || typeof companyId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required',
      })
    }

    const stats = await instagramCacheService.getCacheStats(companyId)

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    logger.error('Failed to get cache stats:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    next(error)
  }
}

/**
 * Clear Instagram cache for a company
 */
export const clearCache = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.body

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required',
      })
    }

    await instagramCacheService.clearCache(companyId)

    logger.info(`Cleared Instagram cache for company: ${companyId}`)

    res.json({
      success: true,
      message: 'Cache cleared successfully',
    })
  } catch (error) {
    logger.error('Failed to clear cache:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    next(error)
  }
}

/**
 * Validate Instagram access token
 */
export const validateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { accessToken } = req.body

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Access token is required',
      })
    }

    const isValid = await instagramService.validateToken(accessToken)

    res.json({
      success: true,
      data: { isValid },
    })
  } catch (error) {
    logger.error('Failed to validate token:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    next(error)
  }
}

/**
 * Manually trigger Instagram sync for all companies
 */
export const syncAllCompanies = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user has admin privileges (add proper auth check)
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      })
    }

    const result = await instagramSyncJob.triggerManualSync()

    logger.info('Manual Instagram sync completed', {
      total: result.total,
      success: result.success,
      failed: result.failed,
    })

    res.json({
      success: true,
      data: {
        total: result.total,
        success: result.success,
        failed: result.failed,
        errors: result.errors,
      },
    })
  } catch (error) {
    logger.error('Failed to sync all companies:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    next(error)
  }
}

/**
 * Get Instagram sync job status
 */
export const getSyncStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const status = instagramSyncJob.getStatus()

    res.json({
      success: true,
      data: status,
    })
  } catch (error) {
    logger.error('Failed to get sync status:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    next(error)
  }
}

/**
 * Get Instagram insights for a company (requires additional permissions)
 */
export const getInsights = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.query
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN

    if (!companyId || typeof companyId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required',
      })
    }

    if (!accessToken) {
      return res.status(500).json({
        success: false,
        error: 'Instagram access token not configured',
      })
    }

    const insights = await instagramService.getInsights(accessToken)

    res.json({
      success: true,
      data: insights,
    })
  } catch (error) {
    logger.error('Failed to get Instagram insights:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    next(error)
  }
}

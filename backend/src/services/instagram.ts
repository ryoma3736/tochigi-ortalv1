import axios, { AxiosError } from 'axios'
import logger from '../utils/logger.js'

interface InstagramMedia {
  id: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  thumbnail_url?: string
  permalink: string
  caption?: string
  timestamp: string
  username?: string
}

interface InstagramApiResponse {
  data: InstagramMedia[]
  paging?: {
    cursors?: {
      before?: string
      after?: string
    }
    next?: string
    previous?: string
  }
}

interface InstagramError {
  message: string
  type: string
  code: number
  error_subcode?: number
  fbtrace_id?: string
}

export class InstagramService {
  private readonly apiVersion = 'v18.0'
  private readonly baseUrl = `https://graph.facebook.com/${this.apiVersion}`
  private readonly fieldsToFetch = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,username'

  /**
   * Get Instagram posts for a business account
   * @param accessToken - Instagram Graph API access token
   * @param limit - Number of posts to retrieve (default: 20, max: 100)
   * @returns Array of Instagram media objects
   */
  async getPosts(accessToken: string, limit: number = 20): Promise<InstagramMedia[]> {
    try {
      if (!accessToken || accessToken.trim() === '') {
        throw new Error('Access token is required')
      }

      if (limit < 1 || limit > 100) {
        throw new Error('Limit must be between 1 and 100')
      }

      logger.info(`Fetching Instagram posts (limit: ${limit})`)

      // First, get the user's Instagram Business Account ID
      const userResponse = await axios.get(`${this.baseUrl}/me`, {
        params: {
          fields: 'id,username',
          access_token: accessToken,
        },
        timeout: 10000,
      })

      const userId = userResponse.data.id
      logger.info(`Instagram user ID: ${userId}`)

      // Then fetch the media
      const mediaResponse = await axios.get<InstagramApiResponse>(
        `${this.baseUrl}/${userId}/media`,
        {
          params: {
            fields: this.fieldsToFetch,
            limit: limit,
            access_token: accessToken,
          },
          timeout: 15000,
        }
      )

      const posts = mediaResponse.data.data || []
      logger.info(`Successfully fetched ${posts.length} Instagram posts`)

      return posts
    } catch (error) {
      return this.handleInstagramError(error)
    }
  }

  /**
   * Get a single Instagram media item by ID
   * @param mediaId - Instagram media ID
   * @param accessToken - Instagram Graph API access token
   * @returns Instagram media object
   */
  async getMediaById(mediaId: string, accessToken: string): Promise<InstagramMedia> {
    try {
      if (!mediaId || !accessToken) {
        throw new Error('Media ID and access token are required')
      }

      logger.info(`Fetching Instagram media: ${mediaId}`)

      const response = await axios.get<InstagramMedia>(
        `${this.baseUrl}/${mediaId}`,
        {
          params: {
            fields: this.fieldsToFetch,
            access_token: accessToken,
          },
          timeout: 10000,
        }
      )

      logger.info(`Successfully fetched media: ${mediaId}`)
      return response.data
    } catch (error) {
      return this.handleInstagramError(error)
    }
  }

  /**
   * Validate Instagram access token
   * @param accessToken - Instagram Graph API access token
   * @returns Boolean indicating if token is valid
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      if (!accessToken || accessToken.trim() === '') {
        return false
      }

      await axios.get(`${this.baseUrl}/me`, {
        params: {
          fields: 'id',
          access_token: accessToken,
        },
        timeout: 5000,
      })

      logger.info('Instagram access token is valid')
      return true
    } catch (error) {
      logger.warn('Instagram access token validation failed')
      return false
    }
  }

  /**
   * Get Instagram account insights (requires additional permissions)
   * @param accessToken - Instagram Graph API access token
   * @param metrics - Array of metric names to fetch
   * @returns Insights data
   */
  async getInsights(
    accessToken: string,
    metrics: string[] = ['impressions', 'reach', 'profile_views']
  ): Promise<any> {
    try {
      if (!accessToken) {
        throw new Error('Access token is required')
      }

      logger.info('Fetching Instagram insights')

      const userResponse = await axios.get(`${this.baseUrl}/me`, {
        params: {
          fields: 'id',
          access_token: accessToken,
        },
        timeout: 5000,
      })

      const userId = userResponse.data.id

      const insightsResponse = await axios.get(
        `${this.baseUrl}/${userId}/insights`,
        {
          params: {
            metric: metrics.join(','),
            period: 'day',
            access_token: accessToken,
          },
          timeout: 10000,
        }
      )

      logger.info('Successfully fetched Instagram insights')
      return insightsResponse.data
    } catch (error) {
      return this.handleInstagramError(error)
    }
  }

  /**
   * Refresh long-lived access token
   * @param accessToken - Current access token
   * @returns New access token with extended expiration
   */
  async refreshAccessToken(accessToken: string): Promise<{
    access_token: string
    token_type: string
    expires_in: number
  }> {
    try {
      if (!accessToken) {
        throw new Error('Access token is required')
      }

      logger.info('Refreshing Instagram access token')

      const response = await axios.get(`${this.baseUrl}/oauth/access_token`, {
        params: {
          grant_type: 'ig_refresh_token',
          access_token: accessToken,
        },
        timeout: 10000,
      })

      logger.info('Successfully refreshed Instagram access token')
      return response.data
    } catch (error) {
      return this.handleInstagramError(error)
    }
  }

  /**
   * Handle Instagram API errors with detailed logging
   * @param error - Error object from axios or Instagram API
   * @throws Enhanced error with context
   */
  private handleInstagramError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error: InstagramError }>

      if (axiosError.response) {
        const instagramError = axiosError.response.data?.error
        const status = axiosError.response.status
        const errorMessage = instagramError?.message || 'Unknown Instagram API error'
        const errorCode = instagramError?.code || status
        const errorType = instagramError?.type || 'UnknownError'

        logger.error('Instagram API Error:', {
          status,
          code: errorCode,
          type: errorType,
          message: errorMessage,
          subcode: instagramError?.error_subcode,
          trace: instagramError?.fbtrace_id,
        })

        // Handle specific error codes
        switch (status) {
          case 400:
            throw new Error(`Instagram API: Invalid request - ${errorMessage}`)
          case 401:
            throw new Error('Instagram API: Invalid or expired access token')
          case 403:
            throw new Error('Instagram API: Permission denied - check app permissions')
          case 404:
            throw new Error('Instagram API: Resource not found')
          case 429:
            throw new Error('Instagram API: Rate limit exceeded - please try again later')
          case 500:
          case 503:
            throw new Error('Instagram API: Service temporarily unavailable')
          default:
            throw new Error(`Instagram API Error (${errorCode}): ${errorMessage}`)
        }
      } else if (axiosError.request) {
        logger.error('Instagram API: No response received', {
          message: axiosError.message,
        })
        throw new Error('Instagram API: Network error - no response received')
      }
    }

    // Generic error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Instagram Service Error:', { error: errorMessage })
    throw new Error(`Instagram Service Error: ${errorMessage}`)
  }
}

// Export singleton instance
export const instagramService = new InstagramService()

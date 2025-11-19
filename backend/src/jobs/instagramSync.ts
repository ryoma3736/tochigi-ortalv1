import cron from 'node-cron'
import { instagramCacheService } from '../services/instagramCache.js'
import logger from '../utils/logger.js'

/**
 * Instagram Sync Job
 * Runs every hour to sync Instagram posts for all active companies
 */
export class InstagramSyncJob {
  private cronJob: cron.ScheduledTask | null = null
  private isRunning = false

  /**
   * Start the Instagram sync cron job
   * Runs every hour at minute 0 (e.g., 1:00, 2:00, 3:00)
   */
  start(): void {
    if (this.cronJob) {
      logger.warn('Instagram sync job is already running')
      return
    }

    // Run every hour at minute 0
    // Cron format: minute hour day month weekday
    const schedule = '0 * * * *'

    this.cronJob = cron.schedule(
      schedule,
      async () => {
        await this.run()
      },
      {
        scheduled: true,
        timezone: 'Asia/Tokyo', // JST timezone
      }
    )

    logger.info(`Instagram sync job started with schedule: ${schedule} (JST)`)

    // Run immediately on startup (optional)
    if (process.env.INSTAGRAM_SYNC_ON_STARTUP === 'true') {
      logger.info('Running Instagram sync on startup')
      this.run().catch(error => {
        logger.error('Failed to run Instagram sync on startup:', {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      })
    }
  }

  /**
   * Stop the Instagram sync cron job
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop()
      this.cronJob = null
      logger.info('Instagram sync job stopped')
    }
  }

  /**
   * Execute the Instagram sync task
   */
  async run(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Instagram sync is already running, skipping this execution')
      return
    }

    this.isRunning = true
    const startTime = Date.now()

    logger.info('Starting Instagram sync job')

    try {
      const result = await instagramCacheService.syncAllCompanies()

      const duration = Date.now() - startTime
      const durationSeconds = (duration / 1000).toFixed(2)

      logger.info('Instagram sync job completed successfully', {
        duration: `${durationSeconds}s`,
        total: result.total,
        success: result.success,
        failed: result.failed,
      })

      // Log errors if any
      if (result.errors.length > 0) {
        logger.warn('Instagram sync had errors:', {
          errorCount: result.errors.length,
          errors: result.errors,
        })

        // Send notification for failures (optional)
        await this.notifyOnFailures(result.errors)
      }
    } catch (error) {
      const duration = Date.now() - startTime
      const durationSeconds = (duration / 1000).toFixed(2)

      logger.error('Instagram sync job failed', {
        duration: `${durationSeconds}s`,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      // Send critical notification
      await this.notifyOnCriticalFailure(error)
    } finally {
      this.isRunning = false
    }
  }

  /**
   * Get the current status of the sync job
   */
  getStatus(): {
    isScheduled: boolean
    isRunning: boolean
    nextRun: Date | null
  } {
    return {
      isScheduled: this.cronJob !== null,
      isRunning: this.isRunning,
      nextRun: this.cronJob ? this.getNextRunTime() : null,
    }
  }

  /**
   * Get the next scheduled run time
   */
  private getNextRunTime(): Date {
    const now = new Date()
    const nextRun = new Date(now)

    // Set to next hour, minute 0
    nextRun.setHours(now.getHours() + 1)
    nextRun.setMinutes(0)
    nextRun.setSeconds(0)
    nextRun.setMilliseconds(0)

    return nextRun
  }

  /**
   * Send notification when sync has failures
   * @param errors - Array of errors from sync operation
   */
  private async notifyOnFailures(
    errors: Array<{ companyId: string; error: string }>
  ): Promise<void> {
    try {
      // TODO: Implement notification system (email, Slack, etc.)
      // For now, just log the errors

      const errorSummary = errors
        .slice(0, 5) // Limit to first 5 errors
        .map(e => `- Company ${e.companyId}: ${e.error}`)
        .join('\n')

      logger.warn(`Instagram sync failures:\n${errorSummary}`)

      // Example: Send email notification
      // await emailService.send({
      //   to: process.env.ADMIN_EMAIL,
      //   subject: 'Instagram Sync Failures',
      //   body: `Instagram sync completed with ${errors.length} failures:\n\n${errorSummary}`,
      // })
    } catch (error) {
      logger.error('Failed to send failure notification:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Send notification when sync completely fails
   * @param error - Error that caused the failure
   */
  private async notifyOnCriticalFailure(error: unknown): Promise<void> {
    try {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      logger.error('CRITICAL: Instagram sync job failed completely', {
        error: errorMessage,
      })

      // TODO: Implement critical notification system
      // Example: Send urgent notification
      // await notificationService.sendUrgent({
      //   title: 'CRITICAL: Instagram Sync Failure',
      //   message: `Instagram sync job failed: ${errorMessage}`,
      // })
    } catch (notificationError) {
      logger.error('Failed to send critical failure notification:', {
        error: notificationError instanceof Error
          ? notificationError.message
          : 'Unknown error',
      })
    }
  }

  /**
   * Manually trigger a sync (for testing or admin panel)
   */
  async triggerManualSync(): Promise<{
    success: number
    failed: number
    total: number
    errors: Array<{ companyId: string; error: string }>
  }> {
    logger.info('Manual Instagram sync triggered')
    await this.run()

    // Return the result
    return await instagramCacheService.syncAllCompanies()
  }
}

// Export singleton instance
export const instagramSyncJob = new InstagramSyncJob()

/**
 * Initialize and start Instagram sync job
 * Call this from your main server file
 */
export function initializeInstagramSync(): void {
  const isEnabled = process.env.INSTAGRAM_SYNC_ENABLED !== 'false'

  if (!isEnabled) {
    logger.info('Instagram sync job is disabled')
    return
  }

  instagramSyncJob.start()
}

/**
 * Gracefully shutdown Instagram sync job
 * Call this when server is shutting down
 */
export function shutdownInstagramSync(): void {
  instagramSyncJob.stop()
}

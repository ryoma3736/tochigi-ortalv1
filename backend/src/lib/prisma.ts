import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger.js'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  logger.info('Disconnecting Prisma client...')
  await prisma.$disconnect()
})

export default prisma

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler.js'
import { logger } from './utils/logger.js'

// Import routes
import authRoutes from './routes/auth.js'
import businessRoutes from './routes/business.js'
import projectRoutes from './routes/project.js'
import paymentRoutes from './routes/payment.js'
import instagramRoutes from './routes/instagram.js'
import companyRoutes from './routes/company.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/business', businessRoutes)
app.use('/api/companies', companyRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/instagram', instagramRoutes)

// Error handler
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app

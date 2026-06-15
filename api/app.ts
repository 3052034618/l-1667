import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import taskRoutes from './routes/tasks.js'
import materialRoutes from './routes/materials.js'
import approvalRoutes from './routes/approvals.js'
import notificationRoutes from './routes/notifications.js'
import dashboardRoutes from './routes/dashboard.js'
import reportRoutes from './routes/reports.js'
import userRoutes from './routes/users.js'
import { verifyToken } from './middleware/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/tasks', verifyToken, taskRoutes)
app.use('/api/materials', verifyToken, materialRoutes)
app.use('/api/approvals', verifyToken, approvalRoutes)
app.use('/api/notifications', verifyToken, notificationRoutes)
app.use('/api/dashboard', verifyToken, dashboardRoutes)
app.use('/api/reports', verifyToken, reportRoutes)
app.use('/api/users', verifyToken, userRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error.message, error.stack)
  res.status(500).json({
    success: false,
    message: 'Server internal error',
    detail: error.message,
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API not found',
  })
})

export default app

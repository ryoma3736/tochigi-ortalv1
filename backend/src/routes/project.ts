import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import * as projectController from '../controllers/projectController.js'

const router = Router()

router.use(authenticate)

router.get('/', projectController.getProjects)
router.get('/:id', projectController.getProjectById)
router.post('/', projectController.createProject)
router.put('/:id', projectController.updateProject)
router.delete('/:id', projectController.deleteProject)

export default router

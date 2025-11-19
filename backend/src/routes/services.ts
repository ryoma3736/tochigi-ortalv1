import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/services - Get all services
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const services = await prisma.service.findMany({
      where: category ? { category: String(category) } : undefined,
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch services' });
  }
});

// GET /api/services/:id - Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch service' });
  }
});

// GET /api/services/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    const categories = services.map((s) => s.category);
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

export default router;

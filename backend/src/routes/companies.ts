import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

const MAX_COMPANIES = 300;

// GET /api/companies - Get all companies with filters
router.get('/', async (req, res) => {
  try {
    const { subscriptionStatus, search } = req.query;

    const companies = await prisma.company.findMany({
      where: {
        subscriptionStatus: subscriptionStatus
          ? String(subscriptionStatus)
          : undefined,
        OR: search
          ? [
              { name: { contains: String(search), mode: 'insensitive' } },
              { email: { contains: String(search), mode: 'insensitive' } },
            ]
          : undefined,
      },
      orderBy: { name: 'asc' },
      include: {
        subscription: true,
      },
    });

    res.json({ success: true, companies, total: companies.length, maxSlots: MAX_COMPANIES });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch companies' });
  }
});

// GET /api/companies/:id - Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        subscription: true,
        instagramPosts: {
          orderBy: { postedAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    res.json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch company' });
  }
});

// POST /api/companies/register - Register new company (with 300 limit check)
router.post('/register', async (req, res) => {
  try {
    const currentCount = await prisma.company.count({
      where: { subscriptionStatus: 'active' },
    });

    if (currentCount >= MAX_COMPANIES) {
      return res.status(400).json({
        success: false,
        error: `現在満員です（${MAX_COMPANIES}社上限）。キャンセル待ちリストに追加しますか？`,
        waitlistAvailable: true,
      });
    }

    const company = await prisma.company.create({
      data: {
        ...req.body,
        subscriptionStatus: 'pending',
      },
    });

    res.status(201).json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to register company' });
  }
});

// PATCH /api/companies/:id - Update company
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.update({
      where: { id },
      data: req.body,
    });
    res.json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update company' });
  }
});

// DELETE /api/companies/:id - Delete company (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.company.delete({ where: { id } });
    res.json({ success: true, message: 'Company deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete company' });
  }
});

export default router;

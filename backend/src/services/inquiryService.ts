import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateInquiryDTO {
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceIds: string[];
  companyIds: string[];
  message: string;
}

export class InquiryService {
  async createInquiry(data: CreateInquiryDTO) {
    const inquiry = await prisma.inquiry.create({
      data: {
        userId: data.userId,
        message: data.message,
        status: 'pending',
        services: {
          connect: data.serviceIds.map((id) => ({ id })),
        },
        selectedCompanies: {
          connect: data.companyIds.map((id) => ({ id })),
        },
      },
      include: {
        services: true,
        selectedCompanies: true,
      },
    });

    return inquiry;
  }

  async getInquiriesByCompany(companyId: string) {
    return prisma.inquiry.findMany({
      where: {
        selectedCompanies: {
          some: {
            id: companyId,
          },
        },
      },
      include: {
        services: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getInquiryById(id: string) {
    return prisma.inquiry.findUnique({
      where: { id },
      include: {
        services: true,
        selectedCompanies: true,
        user: true,
      },
    });
  }

  async updateInquiryStatus(id: string, status: string) {
    return prisma.inquiry.update({
      where: { id },
      data: { status },
    });
  }
}

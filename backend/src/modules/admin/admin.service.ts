import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [total, draft, future, past, byUser] = await Promise.all([
      this.prisma.plan.count(),
      this.prisma.plan.count({ where: { status: 'DRAFT'  } }),
      this.prisma.plan.count({ where: { status: 'FUTURE' } }),
      this.prisma.plan.count({ where: { status: 'PAST'   } }),
      this.prisma.plan.groupBy({ by: ['userId'], _count: true }),
    ]);
    return { total, draft, future, past, uniqueUsers: byUser.length };
  }

  async findAllPlans() {
    return this.prisma.plan.findMany({
      include: { subplans: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOnePlan(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
      include: { subplans: { orderBy: { order: 'asc' } } },
    });
    if (!plan) throw new NotFoundException(`Plan ${id} no encontrado`);
    return plan;
  }

  async updatePlan(id: string, data: any) {
    await this.findOnePlan(id);
    if (data.scheduledAt) {
      data.scheduledAt = new Date(data.scheduledAt);
      data.status = data.scheduledAt > new Date() ? 'FUTURE' : 'PAST';
    }
    return this.prisma.plan.update({
      where: { id },
      data,
      include: { subplans: { orderBy: { order: 'asc' } } },
    });
  }

  async deletePlan(id: string) {
    await this.findOnePlan(id);
    await this.prisma.plan.delete({ where: { id } });
    return { message: 'Plan eliminado' };
  }
}
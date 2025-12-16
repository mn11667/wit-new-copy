import { Role, UserStatus } from '@prisma/client';
import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { hashPassword } from '../utils/password';

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      isActive: true,
      lastLoginDate: true,
      createdAt: true,
      phone: true,
      school: true,
      preparingFor: true,
      avatarUrl: true,
      subscription: {
        select: {
          id: true,
          status: true,
          startDate: true,
          plan: {
            select: {
              id: true,
              tier: true,
            },
          },
          endDate: true,
        },
      },
    },
  });
}

export async function createUser(data: { name: string; email: string; password: string; role?: Role; isActive?: boolean }) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError(400, 'Email already exists');
  }
  const passwordHash = await hashPassword(data.password);
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role || Role.USER,
      status: data.role === Role.ADMIN ? UserStatus.ACTIVE : UserStatus.PENDING, // Admins are active by default
      isActive: data.isActive ?? true, // Default to true
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      isActive: true,
      lastLoginDate: true,
      phone: true,
      school: true,
      preparingFor: true,
      avatarUrl: true,
    },
  });
}

export async function updateUser(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    status: UserStatus;
    isActive: boolean;
    role: Role;
    phone: string;
    school: string;
    preparingFor: string;
    avatarUrl: string;
    subscriptionPlanId: string;
    subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE';
    subscriptionStartDate: string;
    subscriptionEndDate: string;
  }>,
) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { subscription: true },
  });
  if (!user) throw new AppError(404, 'User not found');

  // Prevent changing the last admin's role or deactivating them
  if (user.role === Role.ADMIN) {
    const adminCount = await prisma.user.count({ where: { role: Role.ADMIN, isActive: true } });
    // If this is the only active admin and we're trying to deactivate or change role
    if (adminCount === 1 && (data.isActive === false || (data.role && data.role !== Role.ADMIN))) {
      throw new AppError(400, 'Cannot deactivate or change role of the last active admin.');
    }
  }

  const {
    subscriptionPlanId,
    subscriptionStatus,
    subscriptionStartDate,
    subscriptionEndDate,
    ...userData
  } = data;

  return prisma.$transaction(async (tx) => {
    const existingSub = await tx.subscription.findUnique({ where: { userId: id } });

    const updatedUser = await tx.user.update({
      where: { id },
      data: {
        ...userData,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        isActive: true,
        lastLoginDate: true,
        phone: true,
        school: true,
        preparingFor: true,
        avatarUrl: true,
        subscription: {
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            plan: { select: { id: true, tier: true } },
          },
        },
      },
    });

    const subscriptionFieldsProvided =
      subscriptionPlanId !== undefined ||
      subscriptionStatus !== undefined ||
      subscriptionStartDate !== undefined ||
      subscriptionEndDate !== undefined;

    const shouldUpdateSubscription =
      subscriptionFieldsProvided && (subscriptionPlanId !== undefined || existingSub !== null);

    if (shouldUpdateSubscription) {
      const planId = subscriptionPlanId ?? existingSub?.planId;
      if (!planId) {
        throw new AppError(400, 'subscriptionPlanId is required to set a subscription.');
      }

      const startDate =
        subscriptionStartDate !== undefined
          ? new Date(subscriptionStartDate)
          : existingSub?.startDate;
      const endDate =
        subscriptionEndDate !== undefined ? new Date(subscriptionEndDate) : existingSub?.endDate;

      if (!existingSub && (!startDate || !endDate)) {
        throw new AppError(
          400,
          'subscriptionStartDate and subscriptionEndDate are required to create a subscription.',
        );
      }

      await tx.subscription.upsert({
        where: { userId: id },
        create: {
          userId: id,
          planId,
          status: (subscriptionStatus as any) ?? 'ACTIVE',
          startDate: startDate!,
          endDate: endDate!,
        },
        update: {
          planId,
          status: (subscriptionStatus as any) ?? existingSub!.status,
          startDate: startDate ?? existingSub!.startDate,
          endDate: endDate ?? existingSub!.endDate,
        },
      });
    }

    return updatedUser;
  });
}

export async function deleteUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError(404, 'User not found');
  if (user.role === Role.ADMIN) {
    const adminCount = await prisma.user.count({ where: { role: Role.ADMIN, isActive: true } });
    if (adminCount === 1) {
      throw new AppError(400, 'Cannot delete the last active admin.');
    }
  }

  await prisma.$transaction([
    // Clean up dependent records first to avoid FK violations
    prisma.passwordResetToken.deleteMany({ where: { userId: id } }),
    prisma.bookmark.deleteMany({ where: { userId: id } }),
    prisma.fileProgress.deleteMany({ where: { userId: id } }),
    prisma.file.updateMany({ where: { ownerId: id }, data: { ownerId: null } }),
    prisma.folder.updateMany({ where: { createdById: id }, data: { createdById: null } }),
    prisma.user.delete({ where: { id } }),
  ]);

  return true;
}

export async function fetchUserProgressSummary() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: {
          bookmarks: true,
          progress: {
            where: {
              completed: true
            }
          }
        }
      }
    }
  });

  const totalFiles = await prisma.file.count();

  const summaries = users.map(user => {
    const completed = user._count.progress;
    const bookmarks = user._count.bookmarks;
    const percent = totalFiles > 0 ? parseFloat(((completed / totalFiles) * 100).toFixed(2)) : 0;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      completed,
      bookmarks,
      percent
    };
  });

  return { summaries };
}

export async function fetchUserDetails(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: {
          bookmarks: true,
          progress: {
            where: {
              completed: true
            }
          }
        }
      }
    }
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const totalFiles = await prisma.file.count();
  const completedCount = user._count.progress;
  const bookmarks = user._count.bookmarks;
  const percent = totalFiles > 0 ? parseFloat(((completedCount / totalFiles) * 100).toFixed(2)) : 0;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    completedCount,
    bookmarks,
    percent
  };
}

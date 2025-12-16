import { Router } from 'express';
import { z } from 'zod';
import { createUserHandler, deleteUserHandler, listUsersHandler, updateUserHandler } from './user.controller';
import { validateRequest } from '../middleware/validateRequest';
import { requireAuth, requireRole } from '../middleware/requireAuth';

const router = Router();

const createSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['USER', 'ADMIN']).optional(),
  }),
});

const updateSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    isActive: z.boolean().optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
    status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED']).optional(),
    phone: z.string().optional(),
    school: z.string().optional(),
    preparingFor: z.string().optional(),
    avatarUrl: z.string().url().optional().nullable(),
    subscriptionPlanId: z.string().uuid().optional(),
    subscriptionStatus: z.enum(['ACTIVE', 'INACTIVE', 'PAST_DUE']).optional(),
    subscriptionStartDate: z.string().datetime().optional(),
    subscriptionEndDate: z.string().datetime().optional(),
  }),
});

const idSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

router.get('/admin/users', requireAuth, requireRole('ADMIN'), listUsersHandler);
router.post('/admin/users', requireAuth, requireRole('ADMIN'), validateRequest(createSchema), createUserHandler);
router.patch('/admin/users/:id', requireAuth, requireRole('ADMIN'), validateRequest(updateSchema), updateUserHandler);
router.delete('/admin/users/:id', requireAuth, requireRole('ADMIN'), validateRequest(idSchema), deleteUserHandler);

export default router;

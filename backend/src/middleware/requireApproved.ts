import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/db';
import { AppError } from './errorHandler';

/**
 * Refreshes the user's status from the database and attaches it to the request object.
 * This is useful for ensuring that downstream middleware has the most up-to-date
 * user status without having to query the database again.
 */
export async function refreshUserStatus(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError(401, 'Unauthorized'));
  }

  // Admin users are always considered active and approved
  if (req.user.role === 'ADMIN') {
    return next();
  }

  // For non-admin users, fetch their latest status
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { isActive: true, status: true },
  });

  if (user) {
    // Update the user object on the request with the latest status
    req.user.isActive = user.isActive;
    req.user.status = user.status;
  } else {
    // This case should ideally not be reached if requireAuth runs before, but for safety
    req.user.isActive = false;
    req.user.status = 'INACTIVE';
  }

  next();
}

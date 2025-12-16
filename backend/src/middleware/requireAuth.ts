import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken, verifyRefreshToken, signAccessToken, signRefreshToken } from '../utils/token';
import { AppError } from './errorHandler';
import { prisma } from '../config/db';
import { env } from '../config/env';

const baseCookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: 'none' as const,
  path: '/',
  ...(env.cookieDomain ? { domain: env.cookieDomain } : {}),
};

const accessCookieOptions = {
  ...baseCookieOptions,
  maxAge: 1000 * 60 * 15,
};

const refreshCookieOptions = {
  ...baseCookieOptions,
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const bearer = req.headers.authorization?.replace('Bearer ', '');
    let token = req.cookies?.accessToken || bearer;
    const refresh = req.cookies?.refreshToken;

    if (!token && refresh) {
      try {
        const payload = verifyRefreshToken(refresh);
        const newAccess = signAccessToken({ userId: payload.userId, role: payload.role });
        const newRefresh = signRefreshToken({ userId: payload.userId, role: payload.role });
        req.res?.cookie('accessToken', newAccess, accessCookieOptions);
        req.res?.cookie('refreshToken', newRefresh, refreshCookieOptions);
        token = newAccess;
      } catch (e) {
        console.warn('requireAuth: refresh token invalid');
      }
    }

    if (!token) {
      console.warn('requireAuth: no token found (cookie, bearer, or refresh)');
      throw new AppError(401, 'Unauthorized');
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        isActive: true,
        subscription: {
          select: {
            status: true,
            endDate: true,
            plan: { select: { tier: true } },
          },
        },
      },
    });

    if (!user) {
      console.warn('requireAuth: token valid but user missing in DB');
      throw new AppError(401, 'Unauthorized');
    }

    // Attach full user context; downstream middlewares can apply stricter rules.
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      isActive: user.isActive,
      subscription: user.subscription
        ? {
            status: user.subscription.status,
            endDate: user.subscription.endDate,
            tier: user.subscription.plan.tier,
          }
        : undefined,
    };
    next();
  } catch (err) {
    console.warn('requireAuth: token verification failed');
    next(new AppError(401, 'Unauthorized'));
  }
}

export function requireRole(role: 'USER' | 'ADMIN') {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Unauthorized'));
    }
    if (req.user.role !== role) {
      return next(new AppError(403, 'Forbidden'));
    }
    next();
  };
}

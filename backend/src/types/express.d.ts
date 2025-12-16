import { Role, UserStatus, SubscriptionStatus, SubscriptionTier } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        status: UserStatus;
        isActive: boolean;
        subscription?: {
          status: SubscriptionStatus;
          endDate: Date;
          tier: SubscriptionTier;
        };
      };
    }
  }
}

export {};

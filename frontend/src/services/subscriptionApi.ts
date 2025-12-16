import api from './apiClient';

export type SubscriptionPlan = {
  id: string;
  name: string;
  tier: 'FREE' | 'BASIC' | 'PREMIUM';
  price: number;
  durationDays: number;
};

export async function getSubscriptionPlans() {
  const res = await api.get<{ plans: SubscriptionPlan[] }>('/api/subscriptions');
  return res.data.plans;
}

export async function createCheckoutSession(planId: string) {
  const res = await api.post<{ url: string }>('/api/subscriptions', {
    planId,
    successUrl: `${window.location.origin}/subscription/success`,
    cancelUrl: `${window.location.origin}/subscription/cancel`,
  });
  return res.data.url;
}

export async function updateSubscriptionPlan(planId: string, updates: Partial<SubscriptionPlan>) {
  const res = await api.patch<{ plan: SubscriptionPlan }>(`/api/admin/subscriptions/${planId}`, updates);
  return res.data.plan;
}

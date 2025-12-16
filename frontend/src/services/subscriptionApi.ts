export type SubscriptionPlan = any;
export async function fetchSubscriptionPlans() { return { plans: [] }; }
export async function createCheckoutSession(priceId: string) { throw new Error('Static Mode'); }
export async function verifySession(sessionId: string) { throw new Error('Static Mode'); }
export async function updateSubscriptionPlan(id: string, payload: any) { throw new Error('Static Mode'); }
export async function cancelSubscription() { throw new Error('Static Mode'); }

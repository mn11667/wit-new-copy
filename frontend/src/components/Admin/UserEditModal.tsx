import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { User } from '../../services/authApi';
import { listSubscriptionPlans, SubscriptionPlan } from '../../services/adminApi';

interface UserEditModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    userId: string,
    data: {
      status?: User['status'];
      role?: User['role'];
      isActive?: boolean;
      subscriptionStatus?: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE';
      subscriptionStartDate?: string | null;
      subscriptionEndDate?: string | null;
      subscriptionPlanId?: string;
    },
  ) => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<{
    status?: User['status'];
    role?: User['role'];
    isActive?: boolean;
    subscriptionStatus?: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE';
    subscriptionStartDate?: string | null;
    subscriptionEndDate?: string | null;
    subscriptionPlanId?: string;
  }>({});
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        status: user.status,
        role: user.role,
        isActive: user.isActive,
        subscriptionStatus: user.subscription?.status,
        subscriptionStartDate: user.subscription?.startDate ?? undefined,
        subscriptionEndDate: user.subscription?.endDate ?? undefined,
        subscriptionPlanId: user.subscription?.plan?.id,
      });
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) return;
    const loadPlans = async () => {
      try {
        setLoadingPlans(true);
        setPlanError(null);
        const data = await listSubscriptionPlans();
        setPlans(data);
      } catch (err: any) {
        setPlanError(err.message || 'Failed to load plans');
      } finally {
        setLoadingPlans(false);
      }
    };
    loadPlans();
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'subscriptionPlanId') {
      const plan = plans.find((p) => p.id === value);
      setFormData((prev) => {
        // If no dates yet, default to today and today + durationDays for convenience
        const next: typeof prev = { ...prev, subscriptionPlanId: value || undefined };
        if (plan) {
          const now = new Date();
          if (!prev.subscriptionStartDate) {
            next.subscriptionStartDate = now.toISOString();
          }
          if (!prev.subscriptionEndDate) {
            const end = new Date(now);
            end.setDate(end.getDate() + plan.durationDays);
            next.subscriptionEndDate = end.toISOString();
          }
        }
        return next;
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(user.id, formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit User: ${user?.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300">Status</label>
          <select
            name="status"
            value={formData.status || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-black/20 text-white"
          >
            <option value="PENDING">PENDING</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Role</label>
          <select
            name="role"
            value={formData.role || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-black/20 text-white"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={!!formData.isActive}
            onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
            className="form-checkbox h-4 w-4 text-primary rounded border-gray-300"
          />
          <label className="text-sm font-medium text-slate-300">Is Active</label>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Subscription Plan ID</label>
          <select
            name="subscriptionPlanId"
            value={formData.subscriptionPlanId ?? ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-black/20 text-white"
          >
            <option value="">-- Select a plan --</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.tier}) • {p.durationDays} days • ${p.price}
              </option>
            ))}
          </select>
          {loadingPlans && <p className="text-xs text-slate-400">Loading plans...</p>}
          {planError && <p className="text-xs text-rose-500">{planError}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Subscription Status</label>
          <select
            name="subscriptionStatus"
            value={formData.subscriptionStatus || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-black/20 text-white"
          >
            <option value="">-- Select --</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="PAST_DUE">PAST_DUE</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Subscription Start Date</label>
          <input
            type="date"
            name="subscriptionStartDate"
          value={
            formData.subscriptionStartDate
              ? new Date(formData.subscriptionStartDate).toISOString().split('T')[0]
              : ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              subscriptionStartDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
            }))
          }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-black/20 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Subscription End Date</label>
          <input
            type="date"
            name="subscriptionEndDate"
          value={
            formData.subscriptionEndDate
              ? new Date(formData.subscriptionEndDate).toISOString().split('T')[0]
              : ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              subscriptionEndDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
            }))
          }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-black/20 text-white"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
};

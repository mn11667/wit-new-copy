import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from '../components/Layout/AuthLayout';

const AccountPendingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <AuthLayout title="Account Pending" subtitle="Awaiting Approval">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Account Pending</h1>
        <p className="mt-4 text-slate-300">
          Hello, {user?.name}. Your account is currently awaiting approval from an administrator.
        </p>
        <p className="mt-2 text-slate-400">
          You will receive an email once your account has been activated.
        </p>
      </div>
    </AuthLayout>
  );
};

export default AccountPendingPage;
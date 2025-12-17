import React from 'react';

type BadgeProps = {
  children: React.ReactNode;
  status?: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'ADMIN' | string | null;
  variant?: string;
};

export const Badge: React.FC<BadgeProps> = ({ children, status, variant }) => {
  const baseClasses = 'px-2 py-0.5 text-xs font-semibold rounded-full';

  const statusClasses = {
    ACTIVE: 'bg-green-500/20 text-green-300',
    PENDING: 'bg-amber-500/20 text-amber-300',
    INACTIVE: 'bg-red-500/20 text-red-300',
    ADMIN: 'bg-indigo-500/20 text-indigo-300',
    USER: 'bg-slate-500/20 text-slate-300',
    blue: 'bg-blue-500/20 text-blue-300',
    slate: 'bg-slate-500/20 text-slate-300',
  };

  const key = (status || variant) as keyof typeof statusClasses;
  const badgeClass = `${baseClasses} ${key && statusClasses[key] ? statusClasses[key] : 'bg-slate-500/20 text-slate-300'}`;

  return <span className={badgeClass}>{children}</span>;
};
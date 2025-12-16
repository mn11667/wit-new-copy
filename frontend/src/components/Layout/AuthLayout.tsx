import React from 'react';
import { Link } from 'react-router-dom';
import { MacShell } from './MacShell';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export const AuthLayout: React.FC<Props> = ({ title, subtitle, children }) => (
  <MacShell title={title} subtitle={subtitle} menuLabel="Edu Hub">
    <div className="mac-auth-card">
      <div className="mac-auth-header">
        <div>
          <h1 className="mac-auth-title">{title}</h1>
          {subtitle && <p className="mac-auth-subtitle">{subtitle}</p>}
        </div>
        <Link to="/" className="text-sm font-semibold text-primary hover:underline">
          ← Back to home
        </Link>
      </div>
      <div>{children}</div>
    </div>
  </MacShell>
);

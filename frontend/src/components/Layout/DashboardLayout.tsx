import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../UI/Button';
import { ThemeToggle } from '../UI/ThemeToggle';
import { Badge } from '../UI/Badge';
import { MacShell } from './MacShell';


type Props = {
  title: string;
  children: React.ReactNode;
  statusExtra?: React.ReactNode;
};

const formatDate = (dateString: string | Date | undefined | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const DashboardLayout: React.FC<Props> = ({ title, children, statusExtra }) => {
  const { user, logout, showCookieMessage, dismissCookieMessage } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Slow down scroll speed across dashboard screens except inside library panels
  useEffect(() => {
    const handler = (event: WheelEvent) => {
      const target = event.target as HTMLElement | null;
      // If a modal is open, let it handle its own scroll and do not override
      if (document.body.classList.contains('modal-open')) return;

      const libraryScroll = target?.closest('.library-scroll');
      if (libraryScroll) {
        event.preventDefault();
        const scale = 0.4;
        libraryScroll.scrollTop += event.deltaY * scale;
        libraryScroll.scrollLeft += event.deltaX * scale;
        return;
      }

      event.preventDefault();
      const scale = 0.4; // smaller = slower scroll
      window.scrollBy({
        top: event.deltaY * scale,
        left: event.deltaX * scale,
        behavior: 'auto',
      });
    };
    window.addEventListener('wheel', handler, { passive: false });
    return () => window.removeEventListener('wheel', handler);
  }, []);

  const accountMenu = (
    <div className="mac-account-menu" ref={menuRef}>
      <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} className="mac-account-button">
        <div className="text-left">
          <p className="text-sm font-semibold leading-tight">{user?.name}</p>
          <p className="text-xs text-slate-300 leading-tight">{user?.role}</p>
        </div>
        {user?.avatarUrl && <img src={user.avatarUrl} alt="avatar" className="h-10 w-10 rounded-full object-cover" />}
      </button>
      {isMenuOpen && (
        <div className="mac-account-dropdown">
          <div className="mac-account-meta text-sm text-white">
            <div className="mac-account-row">
              <span>Status:</span>
              <Badge status={user?.status}>{user?.status || 'UNKNOWN'}</Badge>
            </div>
            <div className="mac-account-row">
              <span>Plan:</span>
              <span className="font-medium">{user?.subscription?.plan?.tier ?? 'FREE'}</span>
            </div>
            <div className="mac-account-row">
              <span>Expires:</span>
              <span className="font-medium">{formatDate(user?.subscription?.endDate)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <ThemeToggle className="w-full justify-start" />

            <div className="border-t border-white/10 my-2"></div>

            <Button variant="ghost" className="w-full justify-start text-sm text-red-400 hover:text-red-300" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      <MacShell title={title} subtitle="Education Hub" headerActions={accountMenu} statusExtra={statusExtra}>
        <div className="container mx-auto max-w-7xl md:p-6 p-4">
          {showCookieMessage && (
            <div className="mac-banner">
              <span>Please use your Gmail for cookies to be able to access content properly.</span>
              <Button onClick={dismissCookieMessage} variant="ghost" className="text-white hover:bg-white/10">
                Dismiss
              </Button>
            </div>
          )}
          <div className="space-y-4">{children}</div>
        </div>
      </MacShell>
    </div>
  );
};

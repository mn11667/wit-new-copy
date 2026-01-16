import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { Clock } from '../UI/Clock';

type MacShellProps = {
  title?: string;
  subtitle?: string;
  menuLabel?: string;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  statusExtra?: React.ReactNode;
  timerComponent?: React.ReactNode; // Timer for status bar
};



export const MacShell: React.FC<MacShellProps> = ({
  title,
  subtitle,
  menuLabel = 'GlassDesk',
  sidebar,
  headerActions,
  children,
  statusExtra,
  timerComponent,
}) => {
  // const [now, setNow] = useState(() => new Date()); // Moved to Clock component
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => (typeof window !== 'undefined' ? window.innerWidth > 900 : true));
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryCharging, setBatteryCharging] = useState<boolean>(false);

  // Responsive sidebar
  useEffect(() => {
    if (!sidebar) return;
    const handleResize = () => setSidebarOpen(window.innerWidth > 900);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebar]);

  // Reactive glow
  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        if (glowRef.current) {
          glowRef.current.style.transform = `translate(${clientX}px, ${clientY}px)`;
        }
        rafRef.current = undefined;
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Battery info (best effort)
  useEffect(() => {
    const navBattery = (navigator as any).getBattery;
    if (!navBattery) return;
    let batteryRef: any;
    navBattery()
      .then((battery: any) => {
        batteryRef = battery;
        setBatteryLevel(battery.level);
        setBatteryCharging(battery.charging);
        const handleLevel = () => setBatteryLevel(battery.level);
        const handleCharge = () => setBatteryCharging(battery.charging);
        battery.addEventListener('levelchange', handleLevel);
        battery.addEventListener('chargingchange', handleCharge);
        return () => {
          battery.removeEventListener('levelchange', handleLevel);
          battery.removeEventListener('chargingchange', handleCharge);
        };
      })
      .catch(() => { });
    return () => {
      if (batteryRef) {
        batteryRef.removeEventListener('levelchange', () => { });
        batteryRef.removeEventListener('chargingchange', () => { });
      }
    };
  }, []);



  return (
    <div className="mac-wrapper">
      <div className="mac-glow" ref={glowRef} />

      <header className="mac-menu">
        <div className="mac-menu-left">
          <div className="mac-apple" aria-hidden="true" />
          <span className="mac-menu-label">{menuLabel}</span>
        </div>
        <div className="mac-menu-right">
          <div className="mac-status-dot" title="Online" />
          <span className="mac-menu-item">Wi‑Fi</span>

          {/* Pomodoro Timer in status bar */}
          {timerComponent && <span className="mac-menu-item">{timerComponent}</span>}

          <span className="mac-menu-item">
            🔋{' '}
            {batteryLevel !== null ? `${Math.round(batteryLevel * 100)}%${batteryCharging ? ' ⚡' : ''}` : '—'}
          </span>
          {statusExtra ? <span className="mac-menu-item">{statusExtra}</span> : null}
          <span className="mac-menu-time">
            <Clock options={{ hour: '2-digit', minute: '2-digit' }} refreshInterval={30000} />
          </span>
        </div>
      </header>

      <main className="mac-shell">
        <section className={clsx('mac-window glass-panel glass-depth-1', !sidebar && 'mac-window-single')} aria-label={title || 'Workspace'}>
          <div className="mac-window-header">
            <div className="mac-lights">
              <span className="mac-light mac-light-red" aria-label="Close" />
              <span className="mac-light mac-light-yellow" aria-label="Minimize" />
              <span className="mac-light mac-light-green" aria-label="Expand" />
            </div>
            <div className="mac-window-title-group">
              <span className="mac-window-title">{title || 'Workspace'}</span>
              {subtitle && <span className="mac-window-subtitle">{subtitle}</span>}
            </div>
            <div className="mac-header-actions">
              {headerActions}
              {sidebar && (
                <button
                  type="button"
                  className="mac-hamburger"
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  aria-label="Toggle navigation"
                >
                  ☰
                </button>
              )}
            </div>
          </div>

          {sidebar ? (
            <nav className={clsx('mac-sidebar glass-panel glass-depth-2', { open: sidebarOpen })} aria-label="Page navigation">
              {sidebar}
            </nav>
          ) : null}

          <div className="mac-content mac-content-page">{children}</div>
        </section>
      </main>
    </div>
  );
};

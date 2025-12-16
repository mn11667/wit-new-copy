import React, { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/UI/Button';

type FeatureKey = 'dashboard' | 'files' | 'settings';

const featureData: Record<
  FeatureKey,
  {
    title: string;
    subtitle: string;
    bullets: string[];
    primaryCta: { label: string; to: string };
    secondaryCta?: { label: string; to: string };
    hero: string;
  }
> = {
  dashboard: {
    title: 'Dashboard Workspace',
    subtitle: 'A macOS-inspired glass shell for learning flow and instant context.',
    bullets: [
      'Quick access to curated playlists, notes, and syllabus panels.',
      'Live progress, bookmarks, and completion at a glance.',
      'Responsive glass UI with subtle motion and depth.',
    ],
    primaryCta: { label: 'Open dashboard', to: '/dashboard' },
    secondaryCta: { label: 'Chat with AI', to: '/chat' },
    hero: 'Glass dashboard with learning flow and live progress.',
  },
  files: {
    title: 'Files & Library',
    subtitle: 'Organize, preview, and share content with nested folders and type-aware labels.',
    bullets: [
      'Tree-based navigation with previews for video and PDF.',
      'Admin uploads with instant updates for learners.',
      'Role-aware access—admins curate, learners consume.',
    ],
    primaryCta: { label: 'Browse library', to: '/dashboard' },
    secondaryCta: { label: 'Admin uploads', to: '/admin' },
    hero: 'Nested explorer with frosted glass panels and quick previews.',
  },
  settings: {
    title: 'Settings & Control',
    subtitle: 'Fine-tune roles, themes, and account health in a single pane.',
    bullets: [
      'Manage admin/learner roles and permissions.',
      'Adjust blur, spacing, and accent intensity to your taste.',
      'Monitor subscription, token refresh, and account state.',
    ],
    primaryCta: { label: 'Open settings', to: '/dashboard' },
    secondaryCta: { label: 'Manage users', to: '/admin' },
    hero: 'Control center for roles, themes, and account health.',
  },
};

const FeatureLandingPage: React.FC = () => {
  const { feature } = useParams<{ feature: FeatureKey }>();
  const navigate = useNavigate();
  const data = useMemo(() => featureData[feature ?? 'dashboard'] ?? featureData.dashboard, [feature]);

  return (
    <div className="mac-wrapper">
      <div className="mac-glow" />
      <header className="mac-menu">
        <div className="mac-menu-left">
          <div className="mac-apple" aria-hidden="true" />
          <span className="mac-menu-label">GlassDesk</span>
        </div>
        <div className="mac-menu-right">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>
      </header>

      <main className="mac-shell">
        <section className="mac-window glass-panel glass-depth-1" aria-label={data.title}>
          <div className="mac-window-header">
            <div className="mac-lights">
              <span className="mac-light mac-light-red" aria-label="Close" />
              <span className="mac-light mac-light-yellow" aria-label="Minimize" />
              <span className="mac-light mac-light-green" aria-label="Expand" />
            </div>
            <span className="mac-window-title">{data.title}</span>
          </div>

          <div className="mac-content">
            <section className="mac-section mac-card glass-panel glass-depth-1 active">
              <p className="mac-pill">Feature</p>
              <h2>{data.title}</h2>
              <p className="mac-lead">{data.subtitle}</p>

              <div className="mac-card-grid">
                <div className="mac-card glass-depth-2">
                  <div className="mac-card-label" />
                  <h3>Why you’ll love it</h3>
                  <ul className="mt-2 space-y-2 text-sm text-slate-200">
                    {data.bullets.map((b) => (
                      <li key={b}>• {b}</li>
                    ))}
                  </ul>
                </div>
                <div className="mac-card glass-depth-2">
                  <div className="mac-card-label" />
                  <h3>Get started</h3>
                  <p className="mt-2 text-sm text-slate-200">{data.hero}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link to={data.primaryCta.to}>
                      <Button>{data.primaryCta.label}</Button>
                    </Link>
                    {data.secondaryCta && (
                      <Link to={data.secondaryCta.to}>
                        <Button variant="ghost">{data.secondaryCta.label}</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
};

export default FeatureLandingPage;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import {
  FileItem,
  FolderNode,
  addBookmark,
  fetchAnnouncement,
  fetchUserTree,
  getDownloadUrl,
  removeBookmark,
  setProgress,
  uploadAvatar,
  markOpened,
} from '../services/contentApi';
import { Library } from '../components/User/Library';
import { Bookmarks } from '../components/User/Bookmarks';
import { Completed } from '../components/User/Completed';

import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

import { extractDriveId } from '../utils/fileHelpers';
import { Clock } from '../components/UI/Clock';
import { MCQSection } from '../components/MCQ/MCQSection';
import { getRandomQuote } from '../data/quotes';
import { PomodoroTimer } from '../components/UI/PomodoroTimer';

// Lazy load heavy sections
const YouTubeSection = React.lazy(() => import('../components/YouTube/YouTubeSection').then(module => ({ default: module.YouTubeSection })));

import { DefinitionPopup } from '../components/UI/DefinitionPopup';
// Lazy load DiscoverSection for code splitting
const DiscoverSection = React.lazy(() => import('../components/User/DiscoverSection').then(module => ({ default: module.DiscoverSection })));
const SpaceSection = React.lazy(() => import('../components/User/SpaceSection').then(module => ({ default: module.SpaceSection })));
const BrainGymSection = React.lazy(() => import('../components/User/BrainGymSection').then(module => ({ default: module.BrainGymSection })));


const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tree, setTree] = useState<FolderNode[]>([]);
  const [rootFiles, setRootFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [progress, setProgressValue] = useState<number>(0);
  const [quote, setQuote] = useState('');
  const [greeting, setGreeting] = useState('');

  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Streak Logic
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('last_visit');
    const storedStreak = localStorage.getItem('streak_count');
    let currentStreak = storedStreak ? parseInt(storedStreak, 10) : 0;

    if (lastVisit !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastVisit === yesterday.toDateString()) {
        currentStreak += 1;
      } else {
        currentStreak = 1; // Reset if broken or first visit
      }

      localStorage.setItem('streak_count', currentStreak.toString());
      localStorage.setItem('last_visit', today);
    }
    setStreak(currentStreak);

    // Initial load
    setQuote(getRandomQuote());

    // Smart Greeting Logic (Time + Weather)
    const updateGreeting = (temp?: number, isFallback = false) => {
      const hour = new Date().getHours();
      let timeMsg = 'Good Morning';
      if (hour >= 12) timeMsg = 'Good Afternoon';
      if (hour >= 18) timeMsg = 'Good Evening';

      if (temp !== undefined) {
        let weatherMsg = "Perfect weather to focus.";
        if (temp < 10) weatherMsg = "Stay warm and study hard ☕";
        else if (temp > 28) weatherMsg = "Stay cool and keep learning 🍦";

        const locSuffix = isFallback ? " (Kathmandu)" : "";
        setGreeting(`${timeMsg}. It's ${temp}°C${locSuffix}. ${weatherMsg}`);
      } else {
        setGreeting(timeMsg);
      }
    };

    updateGreeting(); // Default time-based first

    const getWeatherData = async (lat: number, lon: number, fallback = false) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        if (data.current_weather) {
          updateGreeting(data.current_weather.temperature, fallback);
        }
      } catch (e) {
        if (!fallback) getWeatherData(27.7172, 85.3240, true);
      }
    };

    const fetchWeatherLocation = async () => {
      const fallback = () => getWeatherData(27.7172, 85.3240, true);

      if (!("geolocation" in navigator)) return fallback();

      try {
        // Check permission explicitly to avoid "blocked" console warning
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'denied') {
          return fallback();
        }
      } catch (e) {
        // Permissions API might not be supported, ignore
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          getWeatherData(position.coords.latitude, position.coords.longitude);
        },
        () => fallback()
      );
    };

    fetchWeatherLocation();
  }, []);

  // const [now, setNow] = useState<string>(new Date().toLocaleString()); // Moved to Clock component
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'bookmarks' | 'completed' | 'practice' | 'youtube' | 'discover' | 'space' | 'braingym'>('library');
  const [playerFile, setPlayerFile] = useState<{ id: string; name: string; src: string } | null>(null);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [showPomodoro, setShowPomodoro] = useState(() => {
    // Check if user had pomodoro open before
    return localStorage.getItem('loksewa-pomodoro-visible') === 'true';
  });

  const [mounted, setMounted] = useState(false);

  // Persist pomodoro visibility
  useEffect(() => {
    localStorage.setItem('loksewa-pomodoro-visible', showPomodoro.toString());
  }, [showPomodoro]);


  const load = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError(null);
    setError(null);
    try {
      const [data, ann] = await Promise.all([fetchUserTree(user?.id), fetchAnnouncement()]);
      setTree(data.tree);
      setRootFiles(data.rootFiles);
      setProgressValue(data.progress || 0);
      setAnnouncement(ann?.content || null);
    } catch (err: any) {
      const message = err.message || 'Failed to load content';
      setError(message);
      if (message.toLowerCase().includes('unauthorized')) {

      }
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Clock moved to component
  }, [load]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep a marker class so other handlers (like wheel throttling) know a modal is open
  useEffect(() => {
    const body = document.body;
    if (playerFile) {
      body.classList.add('modal-open');
    } else {
      body.classList.remove('modal-open');
    }
    return () => {
      body.classList.remove('modal-open');
    };
  }, [playerFile]);



  const closePlayer = () => {
    setPlayerFile(null);
  };

  const allFiles = useMemo(() => {
    const flat: FileItem[] = [...rootFiles];
    const walk = (nodes: FolderNode[]) => {
      nodes.forEach((n) => {
        flat.push(...n.files);
        walk(n.children);
      });
    };
    walk(tree);
    return flat;
  }, [tree, rootFiles]);

  const bookmarks = allFiles.filter((f) => f.bookmarked);
  const overallProgress =
    progress || (allFiles.length ? Math.round((allFiles.filter((f) => f.completed).length / allFiles.length) * 100) : 0);

  const toggleBookmark = async (file: FileItem) => {
    try {
      if (file.bookmarked) {
        await removeBookmark(file.id, user?.id);
      } else {
        await addBookmark(file.id, user?.id);
      }
      load(false);
    } catch (err: any) {
      setError(err.message || 'Bookmark update failed');
    }
  };

  const toggleCompleted = async (file: FileItem) => {
    try {
      await setProgress(file.id, !file.completed, user?.id);
      load(false);
    } catch (err: any) {
      setError(err.message || 'Progress update failed');
    }
  };

  const handleOpen = async (file: FileItem) => {


    setDownloadingFileId(file.id);
    setError(null);

    try {
      await markOpened(file.id);
      const url = await getDownloadUrl(file.id);

      if (file.fileType === 'VIDEO') {
        const fileId = extractDriveId(url);
        const preview = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url;
        setPlayerLoading(true);
        setPlayerFile({ id: fileId || file.id, name: file.name, src: preview });
      } else {
        window.open(url, '_blank');
      }
    } catch (err: any) {
      setError(err.message || 'Could not open file.');
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadAvatar(file);
      await load(false);
      alert('Avatar updated');
    } catch (err: any) {
      setError(err.message || 'Avatar upload failed');
    } finally {
      setUploading(false);
    }
  };

  const [discoverVisited, setDiscoverVisited] = useState(false);
  const [youtubeVisited, setYoutubeVisited] = useState(false);
  const [brainGymVisited, setBrainGymVisited] = useState(false);
  const [spaceVisited, setSpaceVisited] = useState(false);

  useEffect(() => {
    if (activeTab === 'discover') setDiscoverVisited(true);
    if (activeTab === 'youtube') setYoutubeVisited(true);
    if (activeTab === 'braingym') setBrainGymVisited(true);
    if (activeTab === 'space') setSpaceVisited(true);
  }, [activeTab]);

  const renderView = () => {
    if (activeTab !== 'practice' && activeTab !== 'discover' && activeTab !== 'youtube' && activeTab !== 'braingym' && activeTab !== 'space' && !loading && tree.length === 0 && rootFiles.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-lg text-slate-400">Your library is currently empty.</p>
          <p className="text-sm text-slate-500">Please check back later for content.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'library':
        return (
          <Library
            tree={tree}
            rootFiles={rootFiles}

            setPlayerFile={setPlayerFile}
            canOpenFiles={canOpenFiles}
            onFileChange={() => load(false)}
          />
        );
      case 'bookmarks':
        return <Bookmarks bookmarks={bookmarks} toggleBookmark={toggleBookmark} toggleCompleted={toggleCompleted} handleOpen={handleOpen} downloadingFileId={downloadingFileId} />;
      case 'completed':
        return <Completed allFiles={allFiles} toggleCompleted={toggleCompleted} handleOpen={handleOpen} downloadingFileId={downloadingFileId} />;
      case 'practice':
        return <MCQSection />;
      case 'youtube':
        return null; // Handled persistently
      case 'discover':
        return null; // Handled persistently
      case 'space':
        return null; // Handled persistently
      case 'braingym':
        return null; // Handled persistently
      default:
        return (
          <Library
            tree={tree}
            rootFiles={rootFiles}

            setPlayerFile={setPlayerFile}
            canOpenFiles={canOpenFiles}
            onFileChange={() => load(false)}
          />
        );
    }
  };

  // Subscription logic: all users have access
  const canOpenFiles = true;

  return (
    <DashboardLayout title="Dashboard">
      <DefinitionPopup />
      <div className="space-y-4">
        {user?.status === 'PENDING' && (
          <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 text-center">
            <p className="text-sm font-semibold text-amber-200">
              Your account is awaiting approval from an administrator. Content is locked until your account is activated.
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white mb-0.5">
              {greeting}, {user?.name?.split(' ')[0] || 'Scholar'}.
            </h1>
            <p className="text-slate-400 italic text-sm">"{quote}"</p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full animate-in fade-in slide-in-from-right-4 shadow-lg shadow-orange-900/10">
              <span className="text-orange-500 text-lg drop-shadow-md animate-pulse">🔥</span>
              <span className="text-orange-200 font-bold text-sm tracking-wide">{streak} Day Streak</span>
            </div>
            <div className="mac-pill inline-block">Your learning workspace</div>
            <div className="text-sm text-slate-400">Local time: <Clock className="inline text-slate-200" /></div>
          </div>
        </div>

        <div className="mac-cta-row">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={activeTab === 'library' ? 'primary' : 'ghost'} onClick={() => setActiveTab('library')}>
              Library
            </Button>
            <Button variant={activeTab === 'bookmarks' ? 'primary' : 'ghost'} onClick={() => setActiveTab('bookmarks')}>
              Bookmarks
            </Button>
            <Button variant={activeTab === 'completed' ? 'primary' : 'ghost'} onClick={() => setActiveTab('completed')}>
              Completed
            </Button>
            <Button variant={activeTab === 'practice' ? 'primary' : 'ghost'} onClick={() => setActiveTab('practice')}>
              Practice
            </Button>
            <Button variant={activeTab === 'youtube' ? 'primary' : 'ghost'} onClick={() => setActiveTab('youtube')}>
              YouTube
            </Button>
            <Button variant={activeTab === 'discover' ? 'primary' : 'ghost'} onClick={() => setActiveTab('discover')}>
              Discover 🚀
            </Button>
            <Button variant={activeTab === 'space' ? 'primary' : 'ghost'} onClick={() => setActiveTab('space')}>
              Space 🌌
            </Button>
            <Button variant={activeTab === 'braingym' ? 'primary' : 'ghost'} onClick={() => setActiveTab('braingym')}>
              Brain Gym 🧠
            </Button>

            {/* Pomodoro Timer Toggle */}
            <Button
              variant={showPomodoro ? 'primary' : 'ghost'}
              onClick={() => setShowPomodoro(!showPomodoro)}
              className="ml-auto"
            >
              <svg className="w-4 h-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Timer
            </Button>

          </div>

        </div>

        <div className="mac-card-grid">




          {announcement && (
            <div className="mac-card">
              <p className="mac-pill">Message from admin</p>
              <p className="mt-2 text-white">{announcement}</p>
            </div>
          )}

          <>
            {youtubeVisited && (
              <div style={{ display: activeTab === 'youtube' ? 'contents' : 'none' }}>
                <React.Suspense fallback={<div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-slate-300 border-t-red-600 rounded-full animate-spin"></div></div>}>
                  <YouTubeSection />
                </React.Suspense>
              </div>
            )}

            {brainGymVisited && (
              <div style={{ display: activeTab === 'braingym' ? 'contents' : 'none' }}>
                <React.Suspense fallback={<div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-slate-300 border-t-purple-600 rounded-full animate-spin"></div></div>}>
                  <BrainGymSection />
                </React.Suspense>
              </div>
            )}

            {discoverVisited && (
              <div style={{ display: activeTab === 'discover' ? 'contents' : 'none' }}>
                <React.Suspense fallback={<div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div></div>}>
                  <DiscoverSection />
                </React.Suspense>
              </div>
            )}

            {spaceVisited && (
              <div style={{ display: activeTab === 'space' ? 'contents' : 'none' }}>
                <React.Suspense fallback={<div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div></div>}>
                  <SpaceSection />
                </React.Suspense>
              </div>
            )}
            {renderView()}
          </>
        </div>

        {playerFile && (
          <div className="video-inline-layer">
            <div className="video-modal glass" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-secondary">Now playing</p>
                  <h3 className="text-lg font-semibold text-white">{playerFile.name}</h3>
                </div>
                <Button variant="ghost" onClick={closePlayer}>
                  Close
                </Button>
              </div>
              <div className="video-modal__frame">
                {playerLoading && (
                  <div className="absolute inset-0 z-10 grid place-items-center bg-black/60 text-white text-sm">
                    Loading video...
                  </div>
                )}
                <iframe
                  key={playerFile.src}
                  src={playerFile.src}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  onLoad={() => setPlayerLoading(false)}
                  onError={() => setPlayerLoading(false)}
                  title="Video player"
                />
              </div>
              {/* Button removed as requested */}
            </div>
          </div>
        )}

        {/* Pomodoro Timer */}
        {showPomodoro && <PomodoroTimer onClose={() => setShowPomodoro(false)} />}

      </div>
    </DashboardLayout >
  );
};

export default UserDashboardPage;

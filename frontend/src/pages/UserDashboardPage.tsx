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

import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const extractDriveId = (url: string): string | null => {
  const matchPath = url.match(/\/d\/([^/]+)/);
  if (matchPath && matchPath[1]) return matchPath[1];
  const query = url.includes('?') ? url.split('?')[1] : '';
  const params = new URLSearchParams(query);
  const qId = params.get('id');
  if (qId) return qId;
  return null;
};

const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tree, setTree] = useState<FolderNode[]>([]);
  const [rootFiles, setRootFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [progress, setProgressValue] = useState<number>(0);
  const [now, setNow] = useState<string>(new Date().toLocaleString());
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'bookmarks'>('library');
  const [playerFile, setPlayerFile] = useState<{ id: string; name: string; src: string } | null>(null);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);


  const load = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError(null);
    setError(null);
    try {
      const [data, ann] = await Promise.all([fetchUserTree(), fetchAnnouncement()]);
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
    const t = setInterval(() => setNow(new Date().toLocaleString()), 1000);
    return () => clearInterval(t);
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
        await removeBookmark(file.id);
      } else {
        await addBookmark(file.id);
      }
      load(false);
    } catch (err: any) {
      setError(err.message || 'Bookmark update failed');
    }
  };

  const toggleCompleted = async (file: FileItem) => {
    try {
      await setProgress(file.id, !file.completed);
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

  const renderView = () => {
    if (!loading && tree.length === 0 && rootFiles.length === 0) {
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
            viewSyllabus={() => { }}
            setPlayerFile={setPlayerFile}
            canOpenFiles={canOpenFiles}
            onFileChange={() => load(false)}
          />
        );
      case 'bookmarks':
        return <Bookmarks bookmarks={bookmarks} toggleBookmark={toggleBookmark} toggleCompleted={toggleCompleted} handleOpen={handleOpen} downloadingFileId={downloadingFileId} />;


      default:
        return (
          <Library
            tree={tree}
            rootFiles={rootFiles}
            viewSyllabus={() => { }}
            setPlayerFile={setPlayerFile}
            canOpenFiles={canOpenFiles}
            onFileChange={() => load(false)}
          />
        );
    }
  };

  const completedCount = useMemo(() => allFiles.filter((f) => f.completed).length, [allFiles]);
  // Subscription logic removed - all users have access
  const canOpenFiles = true;
  const totalFiles = allFiles.length;
  const videoCount = useMemo(() => allFiles.filter((f) => f.fileType === 'VIDEO').length, [allFiles]);

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-4">
        {user?.status === 'PENDING' && (
          <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 text-center">
            <p className="text-sm font-semibold text-amber-200">
              Your account is awaiting approval from an administrator. Content is locked until your account is activated.
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="mac-pill">Your learning workspace</p>
          <div className="text-sm text-slate-300">Local time: {now}</div>
        </div>

        <div className="mac-cta-row">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={activeTab === 'library' ? 'primary' : 'ghost'} onClick={() => setActiveTab('library')}>
              Library
            </Button>
            <Button variant={activeTab === 'bookmarks' ? 'primary' : 'ghost'} onClick={() => setActiveTab('bookmarks')}>
              Bookmarks
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

      </div>
    </DashboardLayout >
  );
};

export default UserDashboardPage;

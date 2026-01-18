import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  FileItem,
  FolderNode,
  addBookmark,
  getDownloadUrl,
  removeBookmark,
  setProgress,
  markOpened,
} from '../../services/contentApi';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import { TreeView } from '../UI/TreeView';
import { Spinner } from '../UI/Spinner';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { useNavigate } from 'react-router-dom';
import { SyllabusModal } from './SyllabusModal';
import { getSyllabusForFolder } from '../../data/syllabus';

const findFolder = (tree: FolderNode[], id: string | null): FolderNode | null => {
  if (!id) return null;
  for (const node of tree) {
    if (node.id === id) return node;
    const found = findFolder(node.children, id);
    if (found) return found;
  }
  return null;
};

// Helper to calculate folder depth (0 = root folders like "1st papper", "2nd papper")
const getFolderDepth = (tree: FolderNode[], folderId: string | null, depth = 0): number => {
  if (!folderId) return 0;
  for (const node of tree) {
    if (node.id === folderId) return depth;
    const found = getFolderDepth(node.children, folderId, depth + 1);
    if (found > 0 || (found === 0 && node.children.some(c => c.id === folderId))) return found;
  }
  return depth;
};

import { extractDriveId } from '../../utils/fileHelpers';

interface LibraryProps {
  tree: FolderNode[];
  rootFiles: FileItem[];

  setPlayerFile: (file: { id: string; name: string; src: string } | null) => void;
  canOpenFiles: boolean;
  onFileChange: () => void;
}

export const Library: React.FC<LibraryProps> = ({ tree, rootFiles, setPlayerFile, canOpenFiles, onFileChange }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const canInteract = user?.status === 'ACTIVE';

  // Calculate if we're in a subfolder (depth > 0 means we're beyond root folders)
  const folderDepth = useMemo(() => getFolderDepth(tree, selectedFolder), [tree, selectedFolder]);
  const isInSubfolder = folderDepth > 0;

  // Determine if user can access files in current folder
  const isPremiumUser = user?.subscription?.plan?.tier === 'PREMIUM' || user?.subscription?.status === 'ACTIVE';
  const canAccessFiles = canOpenFiles && (isPremiumUser || !isInSubfolder);

  const currentFolder = useMemo(() => findFolder(tree, selectedFolder), [tree, selectedFolder]);
  const filesToShow = selectedFolder ? currentFolder?.files || [] : rootFiles;
  const folderChildren = selectedFolder ? currentFolder?.children || [] : tree;
  const subfolderScrollable = folderChildren.length > 4;
  const filesScrollable = (filesToShow?.length || 0) > 4;

  const filesContainerRef = useRef<HTMLDivElement>(null);

  // Syllabus modal state
  const [showSyllabus, setShowSyllabus] = useState(false);
  const syllabusData = useMemo(() => getSyllabusForFolder(selectedFolder, tree), [selectedFolder, tree]);

  useEffect(() => {
    if (filesContainerRef.current) {
      filesContainerRef.current.scrollTop = 0;
    }
  }, [selectedFolder]);

  const toggleBookmark = async (file: FileItem) => {
    try {
      if (file.bookmarked) {
        await removeBookmark(file.id, user?.id);
      } else {
        await addBookmark(file.id, user?.id);
      }
      onFileChange();
    } catch (err: any) {
      setError(err.message || 'Bookmark update failed');
    }
  };

  const toggleCompleted = async (file: FileItem) => {
    try {
      await setProgress(file.id, !file.completed, user?.id);
      onFileChange();
    } catch (err: any) {
      setError(err.message || 'Progress update failed');
    }
  };

  const handleOpen = async (file: FileItem) => {
    if (!canAccessFiles) {
      // Redirect to login instead of showing alert
      navigate('/login');
      return;
    }

    setDownloadingFileId(file.id);
    setError(null);

    try {
      await markOpened(file.id);
      const url = await getDownloadUrl(file.id);

      if (file.fileType === 'VIDEO') {
        const fileId = extractDriveId(url);
        const preview = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url;
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

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { ease: [0.25, 0.1, 0.25, 1.0], duration: 0.3 }
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
      <Card className="hidden lg:block glass-muted">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Content Tree</h3>
        </div>
        <div className="max-h-[70vh] overflow-auto pr-2 library-scroll">
          <TreeView tree={tree} selectedId={selectedFolder} onSelect={(id) => setSelectedFolder(id)} />
        </div>
      </Card>
      <Card className="min-h-[60vh] glass-muted">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-secondary">Files</p>
            <h3 className="text-xl font-semibold text-white">{selectedFolder ? currentFolder?.name : 'Root Files'}</h3>
          </div>
          <Button
            variant="ghost"
            onClick={() => setShowSyllabus(true)}
            className="hidden md:flex items-center gap-2"
            title="View Syllabus"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Syllabus
          </Button>
        </div>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <div className="space-y-6">
          <div className="relative max-h-[40vh] overflow-auto pr-2 library-scroll"
            style={{ maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}>
            {subfolderScrollable && (
              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.12em] text-slate-400">
                Scroll ↓
              </div>
            )}
            <p className="text-xs uppercase tracking-[0.22em] text-secondary">Sub-folders</p>
            <motion.div
              className="mt-3 grid gap-4 sm:grid-cols-2 pb-8"
              variants={container}
              initial="hidden"
              animate="show"
              key={selectedFolder || 'root'} // Trigger re-animation on folder change
            >
              {folderChildren.length === 0 && <p className="text-sm text-slate-400">No folders here.</p>}
              {folderChildren.map((f) => (
                <motion.div
                  key={f.id}
                  variants={item}
                  className="glass glass-nested rounded-2xl p-4 transition-all hover:bg-white/8 cursor-pointer"
                  onClick={() => setSelectedFolder(f.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h4 className="text-lg font-semibold text-white">{f.name}</h4>
                  {f.description && <p className="text-sm text-slate-300">{f.description}</p>}
                  <p className="text-xs text-slate-400 mt-1">{f.files.length} files · {f.children.length} sub-folders</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.22em] text-secondary">Files</p>
              {selectedFolder && (
                <Button variant="ghost" onClick={() => setSelectedFolder(currentFolder?.parentId || null)}>
                  ← Back
                </Button>
              )}
            </div>
            <div
              ref={filesContainerRef}
              className="relative max-h-[50vh] overflow-auto pr-2 library-scroll"
              style={{ maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}>
              {filesScrollable && (
                <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.12em] text-slate-400">
                  Scroll ↓
                </div>
              )}

              <motion.div
                className="mt-3 space-y-3 pb-8"
                variants={container}
                initial="hidden"
                animate="show"
                key={`files-${selectedFolder || 'root'}`}
              >
                {filesToShow && filesToShow.length > 0 ? (
                  filesToShow.map((file) => (
                    <motion.div
                      key={file.id}
                      variants={item}
                      layout // Smooth reordering
                      className="glass glass-nested flex flex-row items-center gap-4 justify-between rounded-2xl p-4 transition-all hover:bg-white/6"
                    >
                      <div className="min-w-0 flex-1 w-full sm:mr-4">
                        <h4 className="text-base sm:text-lg font-semibold text-white break-words">{file.name}</h4>
                        {file.description && <p className="text-xs sm:text-sm text-slate-300 break-words">{file.description}</p>}
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                          <Badge status={file.fileType === 'VIDEO' ? 'blue' : 'slate'}>
                            {file.fileType === 'VIDEO' ? 'Video' : 'PDF'}
                          </Badge>
                          {file.completed && <span className="text-emerald-400">Completed</span>}
                          {file.lastOpenedAt && <span>Last opened: {new Date(file.lastOpenedAt).toLocaleString()}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          onClick={() => toggleBookmark(file)}
                          disabled={!canInteract}
                          className="hidden sm:inline-flex"
                          title={file.bookmarked ? 'Remove bookmark' : 'Add to bookmarks'}
                        >
                          {file.bookmarked ? '★' : '☆'}
                        </Button>

                        <Button
                          variant="ghost"
                          onClick={() => toggleCompleted(file)}
                          disabled={!canInteract}
                          title={file.completed ? 'Mark as not done' : 'Mark as done'}
                          className={`${file.completed ? 'text-emerald-400' : ''} hidden sm:inline-flex`}
                        >
                          {file.completed ? '✓' : '○'}
                        </Button>

                        <Button
                          onClick={() => handleOpen(file)}
                          disabled={!canAccessFiles || downloadingFileId === file.id}
                          title={!canAccessFiles ? (isInSubfolder && !isPremiumUser ? 'Upgrade to premium to access files in subfolders' : 'Pay your dues to get access to collection point databases.') : undefined}
                          className="min-w-[80px]"
                        >
                          {downloadingFileId === file.id ? <Spinner size="sm" /> : canAccessFiles ? 'Open' : (isInSubfolder && !isPremiumUser ? '🔒 Premium' : 'Pay to access')}
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <svg className="h-12 w-12 opacity-20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">No files in this folder yet.</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </Card>

      {/* Syllabus Modal */}
      <SyllabusModal
        isOpen={showSyllabus}
        onClose={() => setShowSyllabus(false)}
        syllabus={syllabusData}
        folderName={selectedFolder ? currentFolder?.name : undefined}
      />
    </div>
  );
};

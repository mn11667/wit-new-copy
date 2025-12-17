import React, { useMemo, useState } from 'react';
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

const findFolder = (tree: FolderNode[], id: string | null): FolderNode | null => {
  if (!id) return null;
  for (const node of tree) {
    if (node.id === id) return node;
    const found = findFolder(node.children, id);
    if (found) return found;
  }
  return null;
};

const extractDriveId = (url: string): string | null => {
  const matchPath = url.match(/\/d\/([^/]+)/);
  if (matchPath && matchPath[1]) return matchPath[1];
  const query = url.includes('?') ? url.split('?')[1] : '';
  const params = new URLSearchParams(query);
  const qId = params.get('id');
  if (qId) return qId;
  return null;
};

interface LibraryProps {
  tree: FolderNode[];
  rootFiles: FileItem[];
  viewSyllabus: (sectionId: string) => void;
  setPlayerFile: (file: { id: string; name: string; src: string } | null) => void;
  canOpenFiles: boolean;
  onFileChange: () => void;
}

export const Library: React.FC<LibraryProps> = ({ tree, rootFiles, viewSyllabus, setPlayerFile, canOpenFiles, onFileChange }) => {
  const { user } = useAuth();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const canInteract = user?.status === 'ACTIVE';

  const currentFolder = useMemo(() => findFolder(tree, selectedFolder), [tree, selectedFolder]);
  const filesToShow = selectedFolder ? currentFolder?.files || [] : rootFiles;
  const folderChildren = selectedFolder ? currentFolder?.children || [] : tree;
  const subfolderScrollable = folderChildren.length > 4;
  const filesScrollable = (filesToShow?.length || 0) > 4;

  const toggleBookmark = async (file: FileItem) => {
    try {
      if (file.bookmarked) {
        await removeBookmark(file.id);
      } else {
        await addBookmark(file.id);
      }
      onFileChange();
    } catch (err: any) {
      setError(err.message || 'Bookmark update failed');
    }
  };

  const toggleCompleted = async (file: FileItem) => {
    try {
      await setProgress(file.id, !file.completed);
      onFileChange();
    } catch (err: any) {
      setError(err.message || 'Progress update failed');
    }
  };

  const handleOpen = async (file: FileItem) => {
    if (!canOpenFiles) {
      alert('Pay your dues to get access to collection point databases.');
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
            <div className="mt-3 grid gap-4 sm:grid-cols-2 pb-8">
              {folderChildren.length === 0 && <p className="text-sm text-slate-400">No folders here.</p>}
              {folderChildren.map((f) => (
                <motion.div
                  key={f.id}
                  className="glass glass-nested rounded-2xl p-4 transition-all hover:bg-white/8 cursor-pointer"
                  initial={{ opacity: 0.9 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSelectedFolder(f.id)}
                >
                  <h4 className="text-lg font-semibold text-white">{f.name}</h4>
                  {f.description && <p className="text-sm text-slate-300">{f.description}</p>}
                  <p className="text-xs text-slate-400 mt-1">{f.files.length} files · {f.children.length} sub-folders</p>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.22em] text-secondary">Files</p>
              {selectedFolder && (
                <Button variant="ghost" onClick={() => setSelectedFolder(null)}>
                  ← Back
                </Button>
              )}
            </div>
            <div className="relative max-h-[50vh] overflow-auto pr-2 library-scroll"
              style={{ maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}>
              {filesScrollable && (
                <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.12em] text-slate-400">
                  Scroll ↓
                </div>
              )}
              {currentFolder?.syllabusSections && currentFolder.syllabusSections.length > 0 && (
                <div className="mt-1 rounded-xl border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary/80">Related syllabus</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    {currentFolder.syllabusSections.map((s) => (
                      <li key={s.id} className="flex items-center justify-between">
                        <span className="text-slate-300">{s.title}</span>
                        <Button variant="ghost" onClick={() => viewSyllabus(s.id)}>
                          View
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-3 space-y-3 pb-8">
                {filesToShow && filesToShow.length > 0 ? (
                  filesToShow.map((file) => (
                    <motion.div
                      key={file.id}
                      className="glass glass-nested flex items-center justify-between rounded-2xl p-4 transition-all hover:bg-white/6"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div>
                        <h4 className="text-lg font-semibold text-white">{file.name}</h4>
                        {file.description && <p className="text-sm text-slate-300">{file.description}</p>}
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                          <Badge status={file.fileType === 'VIDEO' ? 'blue' : 'slate'}>
                            {file.fileType === 'VIDEO' ? 'Video' : 'PDF'}
                          </Badge>
                          {file.completed && <span className="text-emerald-400">Completed</span>}
                          {file.lastOpenedAt && <span>Last opened: {new Date(file.lastOpenedAt).toLocaleString()}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => toggleBookmark(file)}
                          disabled={!canInteract}
                          title={file.bookmarked ? 'Remove bookmark' : 'Add to bookmarks'}
                        >
                          {file.bookmarked ? '★' : '☆'}
                        </Button>

                        <Button
                          onClick={() => handleOpen(file)}
                          disabled={!canOpenFiles || downloadingFileId === file.id}
                          title={!canOpenFiles ? 'Pay your dues to get access to collection point databases.' : undefined}
                          className="min-w-[80px]"
                        >
                          {downloadingFileId === file.id ? <Spinner size="sm" /> : canOpenFiles ? 'Open' : 'Pay to access'}
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
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

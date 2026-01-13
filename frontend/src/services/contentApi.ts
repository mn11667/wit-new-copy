import dbData from '../data/db.json';

export type FileItem = {
  id: string;
  name: string;
  description?: string | null;
  fileType: 'VIDEO' | 'PDF';
  folderId?: string | null;
  bookmarked?: boolean;
  completed?: boolean;
  lastOpenedAt?: string | null;
  googleDriveUrl?: string; // Added for internal use
};

export type FolderNode = {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  children: FolderNode[];
  syllabusSections?: { id: string; title: string }[];
  files: FileItem[];
};

export type FolderTreeResponse = {
  tree: FolderNode[];
  rootFiles: FileItem[];
  progress?: number;
};

// Helper to build tree from flat data
const buildTree = (folders: any[], files: any[], userId?: string): { tree: FolderNode[], rootFiles: FileItem[] } => {
  const folderMap = new Map<string, FolderNode>();

  // Initialize all folders
  folders.forEach(f => {
    folderMap.set(f.id, {
      ...f,
      children: [],
      files: [],
      syllabusSections: [], // static data doesn't have this structure in export, but we keep the type
    });
  });

  const rootFolders: FolderNode[] = [];
  const rootFiles: FileItem[] = [];

  // Assemble folder structure
  folders.forEach(f => {
    const node = folderMap.get(f.id)!;
    if (f.parentId) {
      const parent = folderMap.get(f.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        rootFolders.push(node); // Orphaned or parent missing
      }
    } else {
      rootFolders.push(node);
    }
  });

  // Sort root folders by name
  rootFolders.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

  // Distribute files
  files.forEach(f => {
    // Check locally stored state
    const bookmarkKey = userId ? `bookmarks_${userId}` : 'bookmarks';
    const progressKey = userId ? `progress_${userId}` : 'progress';
    const bookmarks = JSON.parse(localStorage.getItem(bookmarkKey) || '{}');
    const progress = JSON.parse(localStorage.getItem(progressKey) || '{}');

    const fileWithState: FileItem = {
      ...f,
      bookmarked: !!bookmarks[f.id],
      completed: !!progress[f.id]
    };

    if (f.folderId) {
      const folder = folderMap.get(f.folderId);
      if (folder) {
        folder.files.push(fileWithState);
      } else {
        rootFiles.push(fileWithState);
      }
    } else {
      rootFiles.push(fileWithState);
    }
  });

  // Sort root files by name (or order if you prefer)
  rootFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

  // Sort sub-folders and files within each folder
  folderMap.forEach(folder => {
    folder.children.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    folder.files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  });

  return { tree: rootFolders, rootFiles };
};

export async function fetchUserTree(userId?: string) {
  // Simulate network
  await new Promise(r => setTimeout(r, 200));
  const { tree, rootFiles } = buildTree(dbData.folders, dbData.files, userId);

  // Calculate total progress ??
  // For now simple return
  return {
    tree,
    rootFiles,
    progress: 0
  };
}

export async function getDownloadUrl(fileId: string) {
  const file = dbData.files.find((f: any) => f.id === fileId);
  if (!file) throw new Error('File not found');

  // Return the direct URL or formatted one
  return file.googleDriveUrl || '#';
}

export async function fetchAdminTree() {
  return fetchUserTree();
}

// Admin Write Operations - Disabled for Static Site
export async function createFolder(payload: any) { throw new Error('Static Mode: Write disabled'); }
export async function updateFolder(id: string, payload: any) { throw new Error('Static Mode: Write disabled'); }
export async function deleteFolder(id: string) { throw new Error('Static Mode: Write disabled'); }
export async function createFile(payload: any) { throw new Error('Static Mode: Write disabled'); }
export async function updateFile(id: string, payload: any) { throw new Error('Static Mode: Write disabled'); }
export async function deleteFile(id: string) { throw new Error('Static Mode: Write disabled'); }
export async function reorderFiles(parentId: any, orderedIds: any) { return { success: true }; }
export async function reorderFolders(parentId: any, orderedIds: any) { return { success: true }; }


// Bookmarks - LocalStorage
export async function addBookmark(fileId: string, userId?: string) {
  const key = userId ? `bookmarks_${userId}` : 'bookmarks';
  const bookmarks = JSON.parse(localStorage.getItem(key) || '{}');
  bookmarks[fileId] = true;
  localStorage.setItem(key, JSON.stringify(bookmarks));
  return { success: true };
}

export async function removeBookmark(fileId: string, userId?: string) {
  const key = userId ? `bookmarks_${userId}` : 'bookmarks';
  const bookmarks = JSON.parse(localStorage.getItem(key) || '{}');
  delete bookmarks[fileId];
  localStorage.setItem(key, JSON.stringify(bookmarks));
  return { success: true };
}

export async function listBookmarks() {
  // Not implemented fully as tree view usually handles it, 
  // but if needed we can filter dbData.files
  return [];
}

// Progress - LocalStorage
// Progress - LocalStorage
export async function setProgress(fileId: string, completed: boolean, userId?: string) {
  const key = userId ? `progress_${userId}` : 'progress';
  const progress = JSON.parse(localStorage.getItem(key) || '{}');
  if (completed) {
    progress[fileId] = true;
  } else {
    delete progress[fileId];
  }
  localStorage.setItem(key, JSON.stringify(progress));
  return { success: true };
}

export async function markOpened(fileId: string) {
  return { success: true };
}

// Announcement
export async function fetchAnnouncement() {
  return { content: null };
}

export async function setAnnouncement(content: string, active = true) {
  return { id: 'static', content, active };
}

export async function uploadAvatar(file: File) {
  return { url: 'https://placehold.co/150' };
}

export async function uploadMedia(file: File, label?: string) {
  return { id: 'static', url: '#', label };
}

export async function fetchAllFiles() {
  return dbData.files.map((f: any) => ({ ...f, folder: null }));
}

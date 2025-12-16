import { NextFunction, Request, Response } from 'express';
import {
  createFile,
  deleteFile,
  getAuthorizedFileUrl,
  getFileMetadata,
  listAllFiles,
  listFilesTree,
  updateFile,
} from './file.service';

export async function listAllFilesHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const files = await listAllFiles();
    res.json({ files });
  } catch (err) {
    next(err);
  }
}

export async function listFilesHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const tree = await listFilesTree(_req.user?.id);
    res.json(tree);
  } catch (err) {
    next(err);
  }
}

export async function getFileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const file = await getFileMetadata(id);
    res.json({ file });
  } catch (err) {
    next(err);
  }
}

export async function downloadFileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!req.user) {
      // This should ideally be caught by requireAuth middleware, but it's good practice
      return res.status(401).json({ message: 'Authentication required' });
    }
    const url = await getAuthorizedFileUrl(id, req.user.id);
    res.json({ url });
  } catch (err) {
    next(err);
  }
}

export async function createFileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description, fileType, googleDriveUrl, folderId } = req.body;
    const file = await createFile({
      name,
      description,
      fileType,
      googleDriveUrl,
      folderId,
      ownerId: req.user?.id,
    });
    res.status(201).json({ file });
  } catch (err) {
    next(err);
  }
}

export async function updateFileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, description, fileType, googleDriveUrl, folderId } = req.body;
    const file = await updateFile(id, { name, description, fileType, googleDriveUrl, folderId });
    res.json({ file });
  } catch (err) {
    next(err);
  }
}

export async function deleteFileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await deleteFile(id);
    res.json({ message: 'File deleted' });
  } catch (err) {
    next(err);
  }
}

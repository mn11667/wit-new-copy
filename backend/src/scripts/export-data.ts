import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgres://edu_user:edu_password@pg-1a139054-mn11github-96ed.g.aivencloud.com:16012/edu_platform?sslmode=require'
        }
    }
});

async function exportData() {
    try {
        console.log('Fetching folders...');
        const folders = await prisma.folder.findMany({
            include: {
                files: true,
                children: {
                    include: {
                        files: true
                    }
                }
            }
        });

        console.log('Fetching root files...');
        const rootFiles = await prisma.file.findMany({
            where: {
                folderId: null
            }
        });

        // We need to structure this to match what the frontend expects.
        // However, the frontend creates the tree structure dynamically from the flat list or uses a specific endpoint structure.
        // Let's replicate the structure returned by `fetchUserTree`.
        // The current backend `folder.controller.ts` likely builds a tree.
        // For simplicity, we will export all folders and files and let the frontend rebuild the tree,
        // OR we can try to build the tree here if we want to minimize frontend logic changes.
        // Given the task is to make it static, pre-computing the tree is better.

        // Let's actually just dump everything and update the frontend to handle it,
        // OR better, dump the exact structure the frontend expects if possible.
        // Frontend expects `FolderNode[]` and `FileItem[]`.

        // A recursive function to build the tree would be ideal, but `prisma` result is flat-ish usually unless nested includes are deep.
        // Let's fetch ALL folders and ALL files and build the tree in memory.

        const allFolders = await prisma.folder.findMany();
        const allFiles = await prisma.file.findMany();

        const data = {
            folders: allFolders,
            files: allFiles
        };

        const outputPath = path.resolve(__dirname, '../../../frontend/src/data/db.json');
        const dataDir = path.dirname(outputPath);

        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`Data exported to ${outputPath}`);

    } catch (error) {
        console.error('Error exporting data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

exportData();

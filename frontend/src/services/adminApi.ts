import { fetchAllFiles, FileItem, uploadMedia } from './contentApi';
import { User } from '../context/AuthContext';

export type File = FileItem;
export type FileType = 'VIDEO' | 'PDF';
export type AdminUser = User & { isActive: boolean; lastLoginDate?: string };

export type SubscriptionPlan = {
    id: string;
    name: string;
    price: number;
    duration: number;
    description: string;
    features: string[];
    tier: 'FREE' | 'BASIC' | 'PREMIUM';
    isActive: boolean;
};

// Files
export async function listAllFiles() {
    return fetchAllFiles();
}

export async function createFile(payload: any) { throw new Error('Static Mode: Write disabled'); }
export async function updateFile(id: string, payload: any) { throw new Error('Static Mode: Write disabled'); }
export async function deleteFile(id: string) { throw new Error('Static Mode: Write disabled'); }

// Users - Mocked
export async function listUsers(): Promise<AdminUser[]> {
    return [{
        id: 'static-user-id',
        name: 'Loksewa Student',
        email: 'loksewa@gmail.com',
        role: 'USER',
        status: 'ACTIVE',
        isActive: true,
        lastLoginDate: new Date().toISOString(),
        subscription: { status: 'ACTIVE', plan: { tier: 'PREMIUM' } }
    }];
}

export async function createUser(payload: any) { throw new Error('Static Mode: Write disabled'); }
export async function updateUser(id: string, payload: any) { throw new Error('Static Mode: Write disabled'); }
export async function deleteUser(id: string) { throw new Error('Static Mode: Write disabled'); }

export async function fetchUserProgressSummary() {
    return {
        summaries: [{
            id: 'static-user-id',
            name: 'Loksewa Student',
            email: 'loksewa@gmail.com',
            completed: 0,
            bookmarks: 0,
            percent: 0
        }]
    };
}

export async function fetchUserDetails(id: string) {
    return {
        user: { id: 'static-user-id' },
        progress: [],
        bookmarks: [],
        completedCount: 0,
        percent: 0
    };
}

// Subscriptions - Mocked
export async function listSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return [];
}
export async function createSubscriptionPlan(payload: any) { throw new Error('Static Mode: Write disabled'); }
export async function updateSubscriptionPlan(id: string, payload: any) { throw new Error('Static Mode: Write disabled'); }
export async function deleteSubscriptionPlan(id: string) { throw new Error('Static Mode: Write disabled'); }

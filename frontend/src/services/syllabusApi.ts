export type SyllabusNode = {
    id: string;
    title: string;
    content?: string;
    children: SyllabusNode[];
};
export async function fetchUserTree() { return { tree: [], rootFiles: [], progress: 0 }; }
export async function fetchSyllabusTree(): Promise<{ tree: SyllabusNode[]; rootFiles: any[] }> { return { tree: [], rootFiles: [] }; }
export async function createSyllabusSection(payload: any) { throw new Error('Static Mode'); }
export async function updateSyllabusSection(id: string, payload: any) { throw new Error('Static Mode'); }
export async function deleteSyllabusSection(id: string) { throw new Error('Static Mode'); }
export async function fetchAdminTree() { return { tree: [], rootFiles: [] }; }

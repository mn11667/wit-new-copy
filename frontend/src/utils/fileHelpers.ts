export const extractDriveId = (url: string): string | null => {
    const matchPath = url.match(/\/d\/([^/]+)/);
    if (matchPath && matchPath[1]) return matchPath[1];
    const query = url.includes('?') ? url.split('?')[1] : '';
    const params = new URLSearchParams(query);
    const qId = params.get('id');
    if (qId) return qId;
    return null;
};

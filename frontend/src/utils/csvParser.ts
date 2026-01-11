
/**
 * Simple CSV Parser that handles quoted fields containing commas
 */
export const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length === 0) return [];

    const headers = parseLine(lines[0]);

    const result = lines.slice(1).map(line => {
        // Handle cases where a line might be split incorrectly if newlines are inside quotes
        // But for this simple specific sheet, we assume one line per record for simplicity 
        // unless we implement a full state machine parser which might be overkill.
        // Given the Google Sheet export usually puts complete rows on lines, this should work.

        const values = parseLine(line);
        const obj: any = {};

        headers.forEach((header, index) => {
            // Clean header name
            const key = header.toLowerCase().trim();
            obj[key] = values[index] || '';
        });

        return obj;
    });

    return result;
};

const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            // Check for escaped quote (two quotes)
            if (i + 1 < line.length && line[i + 1] === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
};

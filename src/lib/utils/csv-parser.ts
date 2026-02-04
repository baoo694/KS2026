import { FlashcardInput } from '@/types';

interface ParseResult {
  success: boolean;
  flashcards: FlashcardInput[];
  errors: string[];
}

/**
 * Parse CSV content into flashcard data
 * Expected format: term,definition (one pair per line)
 * Supports quoted values for terms/definitions containing commas
 */
export function parseCSV(content: string): ParseResult {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  const flashcards: FlashcardInput[] = [];
  const errors: string[] = [];
  
  // Check if first line is a header
  const firstLine = lines[0]?.toLowerCase();
  const hasHeader = firstLine?.includes('term') || firstLine?.includes('definition');
  const startIndex = hasHeader ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const lineNumber = i + 1;
    const line = lines[i].trim();
    
    if (!line) continue;
    
    try {
      const parsed = parseCSVLine(line);
      
      if (parsed.length < 2) {
        errors.push(`Line ${lineNumber}: Expected at least 2 columns (term, definition)`);
        continue;
      }
      
      const term = parsed[0].trim();
      const definition = parsed[1].trim();
      
      if (!term) {
        errors.push(`Line ${lineNumber}: Term is empty`);
        continue;
      }
      
      if (!definition) {
        errors.push(`Line ${lineNumber}: Definition is empty`);
        continue;
      }
      
      flashcards.push({ term, definition });
    } catch (err) {
      errors.push(`Line ${lineNumber}: ${err instanceof Error ? err.message : 'Parse error'}`);
    }
  }
  
  return {
    success: flashcards.length > 0,
    flashcards,
    errors
  };
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Don't forget the last field
  result.push(current);
  
  return result;
}

/**
 * Generate CSV content from flashcards
 */
export function generateCSV(flashcards: FlashcardInput[]): string {
  const header = 'term,definition';
  const rows = flashcards.map(fc => {
    const term = escapeCSVValue(fc.term);
    const definition = escapeCSVValue(fc.definition);
    return `${term},${definition}`;
  });
  
  return [header, ...rows].join('\n');
}

/**
 * Escape a CSV value (wrap in quotes if contains comma or quotes)
 */
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

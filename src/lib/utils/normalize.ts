/**
 * Normalize a string for comparison
 * Used for grading written answers leniently
 */
export function normalizeAnswer(input: string): string {
  return input
    .toLowerCase()
    .trim()
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Remove common punctuation
    .replace(/[.,!?;:'"()[\]{}]/g, '')
    // Normalize unicode characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Compare two answers for equality
 * Returns true if answers are considered equivalent
 */
export function compareAnswers(userAnswer: string, correctAnswer: string): boolean {
  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);
  
  if (normalizedUser === normalizedCorrect) {
    return true;
  }
  
  // Check if user answer contains the key parts of correct answer
  // Useful for partial credit scenarios
  const userWords = new Set(normalizedUser.split(' '));
  const correctWords = normalizedCorrect.split(' ');
  
  // If the answer is short (1-2 words), require exact match
  if (correctWords.length <= 2) {
    return normalizedUser === normalizedCorrect;
  }
  
  // For longer answers, check if most key words are present
  const matchedWords = correctWords.filter(word => 
    word.length > 2 && userWords.has(word)
  );
  
  const matchRatio = matchedWords.length / correctWords.filter(w => w.length > 2).length;
  return matchRatio >= 0.8; // 80% match threshold
}

/**
 * Calculate Levenshtein distance between two strings
 * Useful for fuzzy matching short answers
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

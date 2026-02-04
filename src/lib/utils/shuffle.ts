/**
 * Fisher-Yates (Knuth) Shuffle Algorithm
 * Shuffles array in place with O(n) time complexity
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  
  for (let i = result.length - 1; i > 0; i--) {
    // Generate random index from 0 to i (inclusive)
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

/**
 * Get random items from array without repetition
 */
export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Get random items from array excluding certain items
 */
export function getRandomItemsExcluding<T>(
  array: T[],
  count: number,
  exclude: T[],
  compareFn: (a: T, b: T) => boolean = (a, b) => a === b
): T[] {
  const filtered = array.filter(
    item => !exclude.some(ex => compareFn(item, ex))
  );
  return getRandomItems(filtered, count);
}

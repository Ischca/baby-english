
export const COLOR_WORDS_BASIC = [
  'red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown'
];

export const NUMBER_WORDS_BASIC = [
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'
];

export const GREETING_WORDS_BASIC = [
  'hi', 'hello', 'bye', 'goodbye', 'yes', 'no', 'please', 'thank you', 'sorry', 'good'
];

const vocabularyCache: Record<string, string[]> = {};

/**
 * Get vocabulary for a specific age level and category
 * @param category The vocabulary category (colors, numbers, greetings, etc.)
 * @param ageLevel The user's age level (0-18)
 * @param supabaseClient Optional Supabase client for database access
 * @returns Array of words for the specified category and age level
 */
export async function getVocabularyByCategory(
  category: string, 
  ageLevel: number,
  supabaseClient?: any
): Promise<string[]> {
  const cacheKey = `${category}-${ageLevel}`;
  
  if (vocabularyCache[cacheKey]) {
    return vocabularyCache[cacheKey];
  }
  
  if (!supabaseClient) {
    switch (category) {
      case 'colors':
        return COLOR_WORDS_BASIC;
      case 'numbers':
        return NUMBER_WORDS_BASIC;
      case 'greetings':
        return GREETING_WORDS_BASIC;
      default:
        return [];
    }
  }
  
  try {
    const { data, error } = await supabaseClient
      .from('vocabulary_lists')
      .select('words')
      .eq('category', category)
      .lte('min_age_level', ageLevel)
      .gte('max_age_level', ageLevel)
      .single();
    
    if (error) {
      console.error('Error fetching vocabulary:', error);
      return getFallbackVocabulary(category);
    }
    
    if (data && data.words) {
      vocabularyCache[cacheKey] = data.words;
      return data.words;
    }
    
    return getFallbackVocabulary(category);
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return getFallbackVocabulary(category);
  }
}

/**
 * Get all vocabulary for a specific age level across all categories
 * @param ageLevel The user's age level (0-18)
 * @param supabaseClient Optional Supabase client for database access
 * @returns Array of all words appropriate for the age level
 */
export async function getVocabularyForAge(
  ageLevel: number,
  supabaseClient?: any
): Promise<string[]> {
  if (!supabaseClient) {
    return [...COLOR_WORDS_BASIC, ...NUMBER_WORDS_BASIC, ...GREETING_WORDS_BASIC];
  }
  
  try {
    const { data, error } = await supabaseClient
      .from('vocabulary_lists')
      .select('words')
      .lte('min_age_level', ageLevel)
      .gte('max_age_level', ageLevel);
    
    if (error) {
      console.error('Error fetching vocabulary:', error);
      return [...COLOR_WORDS_BASIC, ...NUMBER_WORDS_BASIC, ...GREETING_WORDS_BASIC];
    }
    
    if (data && data.length > 0) {
      const allWords = data.flatMap((item: { words: string[] }) => item.words);
      return [...new Set(allWords)] as string[];
    }
    
    return [...COLOR_WORDS_BASIC, ...NUMBER_WORDS_BASIC, ...GREETING_WORDS_BASIC];
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return [...COLOR_WORDS_BASIC, ...NUMBER_WORDS_BASIC, ...GREETING_WORDS_BASIC];
  }
}

/**
 * Check if text contains only allowed vocabulary for the given age level
 * @param text The text to check
 * @param ageLevel The user's age level (0-18)
 * @param allowedWords Optional pre-fetched list of allowed words
 * @returns Boolean indicating if all words are allowed
 */
export function isAllowedVocabulary(
  text: string, 
  ageLevel: number, 
  allowedWords?: string[]
): boolean {
  const vocabulary = allowedWords || 
    [...COLOR_WORDS_BASIC, ...NUMBER_WORDS_BASIC, ...GREETING_WORDS_BASIC];
  
  const words = text.toLowerCase().split(/\s+/).map(word => 
    word.replace(/[.,!?;:'"()]/g, '')
  ).filter(word => word.length > 0);
  
  return words.every(word => vocabulary.includes(word));
}

/**
 * Get vocabulary for a specific mission type
 * @param mission The mission type (colors, numbers, greetings)
 * @param ageLevel Optional age level for age-appropriate vocabulary
 * @param supabaseClient Optional Supabase client for database access
 * @returns Array of words for the specified mission
 */
export async function getMissionVocabulary(
  mission: 'colors' | 'numbers' | 'greetings',
  ageLevel?: number,
  supabaseClient?: any
): Promise<string[]> {
  if (ageLevel !== undefined && supabaseClient) {
    return getVocabularyByCategory(mission, ageLevel, supabaseClient);
  }
  
  return getFallbackVocabulary(mission);
}

/**
 * Get fallback vocabulary for a category when database is not available
 * @param category The vocabulary category
 * @returns Array of basic words for the category
 */
function getFallbackVocabulary(category: string): string[] {
  switch (category) {
    case 'colors':
      return COLOR_WORDS_BASIC;
    case 'numbers':
      return NUMBER_WORDS_BASIC;
    case 'greetings':
      return GREETING_WORDS_BASIC;
    default:
      return [];
  }
}

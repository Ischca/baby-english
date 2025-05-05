
/**
 * Centralized vocabulary management for Baby-English
 * 
 * This module provides a single source of truth for vocabulary data
 * and functions to retrieve vocabulary based on age level and category.
 */

// Define vocabulary categories
export type VocabularyCategory = 'colors' | 'numbers' | 'greetings' | 'verbs' | 'nouns' | 'adjectives';

export const AGE_RANGES = [
  { min: 0, max: 3 },
  { min: 4, max: 6 },
  { min: 7, max: 10 },
  { min: 11, max: 14 },
  { min: 15, max: 18 }
];

export const VOCABULARY = {
  colors: {
    basic: [
      'red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown'
    ],
    intermediate: [
      'gray', 'gold', 'silver', 'navy', 'teal', 'maroon', 'violet', 'beige', 'turquoise', 'magenta'
    ],
    advanced: [
      'crimson', 'azure', 'indigo', 'lavender', 'amber', 'emerald', 'sapphire', 'ivory', 'coral', 'burgundy'
    ]
  },
  numbers: {
    basic: [
      'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'
    ],
    intermediate: [
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'
    ],
    advanced: [
      'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'thousand', 'million'
    ]
  },
  greetings: {
    basic: [
      'hi', 'hello', 'bye', 'goodbye', 'yes', 'no', 'please', 'thank you', 'sorry', 'good'
    ],
    intermediate: [
      'welcome', 'morning', 'afternoon', 'evening', 'night', 'excuse me', 'pardon', 'how are you', 'fine', 'great'
    ],
    advanced: [
      'pleasure', 'delighted', 'wonderful', 'farewell', 'appreciate', 'certainly', 'absolutely', 'regards', 'sincerely', 'cheers'
    ]
  },
  verbs: {
    basic: [
      'go', 'come', 'see', 'look', 'eat', 'drink', 'sleep', 'play', 'run', 'jump'
    ],
    intermediate: [
      'walk', 'talk', 'read', 'write', 'listen', 'watch', 'work', 'study', 'help', 'make'
    ],
    advanced: [
      'create', 'develop', 'analyze', 'consider', 'explain', 'describe', 'discuss', 'present', 'achieve', 'accomplish'
    ]
  },
  nouns: {
    basic: [
      'dog', 'cat', 'house', 'car', 'book', 'ball', 'toy', 'food', 'water', 'bed'
    ],
    intermediate: [
      'school', 'teacher', 'student', 'friend', 'family', 'parent', 'child', 'computer', 'phone', 'game'
    ],
    advanced: [
      'education', 'technology', 'environment', 'community', 'development', 'relationship', 'experience', 'opportunity', 'responsibility', 'achievement'
    ]
  },
  adjectives: {
    basic: [
      'big', 'small', 'hot', 'cold', 'good', 'bad', 'happy', 'sad', 'new', 'old'
    ],
    intermediate: [
      'beautiful', 'ugly', 'interesting', 'boring', 'difficult', 'easy', 'important', 'funny', 'serious', 'smart'
    ],
    advanced: [
      'extraordinary', 'magnificent', 'fascinating', 'challenging', 'significant', 'essential', 'remarkable', 'exceptional', 'innovative', 'sophisticated'
    ]
  }
};

const vocabularyCache: Record<string, string[]> = {};

/**
 * Get vocabulary level based on age
 * @param ageLevel User's age level (0-18)
 * @returns Vocabulary level (basic, intermediate, advanced)
 */
export function getVocabularyLevelForAge(ageLevel: number): 'basic' | 'intermediate' | 'advanced' {
  if (ageLevel <= 3) return 'basic';
  if (ageLevel <= 10) return 'intermediate';
  return 'advanced';
}

/**
 * Get vocabulary for a specific age level and category
 * @param category The vocabulary category
 * @param ageLevel The user's age level (0-18)
 * @param supabaseClient Optional Supabase client for database access
 * @returns Array of words for the specified category and age level
 */
export async function getVocabularyByCategory(
  category: VocabularyCategory, 
  ageLevel: number,
  supabaseClient?: any
): Promise<string[]> {
  const cacheKey = `${category}-${ageLevel}`;
  
  if (vocabularyCache[cacheKey]) {
    return vocabularyCache[cacheKey];
  }
  
  // If no database client or connection fails, use in-memory vocabulary
  if (!supabaseClient) {
    return getInMemoryVocabularyByCategory(category, ageLevel);
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
      return getInMemoryVocabularyByCategory(category, ageLevel);
    }
    
    if (data && data.words) {
      vocabularyCache[cacheKey] = data.words;
      return data.words;
    }
    
    return getInMemoryVocabularyByCategory(category, ageLevel);
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return getInMemoryVocabularyByCategory(category, ageLevel);
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
    return getInMemoryVocabularyForAge(ageLevel);
  }
  
  try {
    const { data, error } = await supabaseClient
      .from('vocabulary_lists')
      .select('words')
      .lte('min_age_level', ageLevel)
      .gte('max_age_level', ageLevel);
    
    if (error) {
      console.error('Error fetching vocabulary:', error);
      return getInMemoryVocabularyForAge(ageLevel);
    }
    
    if (data && data.length > 0) {
      const allWords = data.flatMap((item: { words: string[] }) => item.words);
      return [...new Set(allWords)] as string[];
    }
    
    return getInMemoryVocabularyForAge(ageLevel);
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return getInMemoryVocabularyForAge(ageLevel);
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
  const vocabulary = allowedWords || getInMemoryVocabularyForAge(ageLevel);
  
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
  
  return getInMemoryVocabularyByCategory(mission, ageLevel || 0);
}

/**
 * Get in-memory vocabulary for a category and age level
 * @param category The vocabulary category
 * @param ageLevel The user's age level (0-18)
 * @returns Array of words for the specified category and age level
 */
function getInMemoryVocabularyByCategory(
  category: VocabularyCategory, 
  ageLevel: number
): string[] {
  const level = getVocabularyLevelForAge(ageLevel);
  
  if (!VOCABULARY[category]) {
    return [];
  }
  
  let words: string[] = [];
  
  if (level === 'basic' || level === 'intermediate' || level === 'advanced') {
    words = [...words, ...VOCABULARY[category].basic];
  }
  
  if (level === 'intermediate' || level === 'advanced') {
    words = [...words, ...VOCABULARY[category].intermediate];
  }
  
  if (level === 'advanced') {
    words = [...words, ...VOCABULARY[category].advanced];
  }
  
  return words;
}

/**
 * Get in-memory vocabulary for all categories at a specific age level
 * @param ageLevel The user's age level (0-18)
 * @returns Array of all words appropriate for the age level
 */
function getInMemoryVocabularyForAge(ageLevel: number): string[] {
  const categories: VocabularyCategory[] = ['colors', 'numbers', 'greetings', 'verbs', 'nouns', 'adjectives'];
  
  const allWords = categories.flatMap(category => 
    getInMemoryVocabularyByCategory(category, ageLevel)
  );
  
  return [...new Set(allWords)];
}

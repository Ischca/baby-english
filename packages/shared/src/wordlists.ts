
export const COLOR_WORDS_BASIC = [
  'red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown'
];

export const NUMBER_WORDS_BASIC = [
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'
];

export const GREETING_WORDS_BASIC = [
  'hi', 'hello', 'bye', 'goodbye', 'yes', 'no', 'please', 'thank you', 'sorry', 'good'
];

export function getVocabularyForAge(ageLevel: number): string[] {
  if (ageLevel <= 3) {
    return [...COLOR_WORDS_BASIC, ...NUMBER_WORDS_BASIC, ...GREETING_WORDS_BASIC];
  }
  
  return [...COLOR_WORDS_BASIC, ...NUMBER_WORDS_BASIC, ...GREETING_WORDS_BASIC];
}

export function isAllowedVocabulary(text: string, ageLevel: number): boolean {
  const allowedWords = getVocabularyForAge(ageLevel);
  
  const words = text.toLowerCase().split(/\s+/).map(word => 
    word.replace(/[.,!?;:'"()]/g, '')
  ).filter(word => word.length > 0);
  
  return words.every(word => allowedWords.includes(word));
}

export function getMissionVocabulary(mission: 'colors' | 'numbers' | 'greetings'): string[] {
  switch (mission) {
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

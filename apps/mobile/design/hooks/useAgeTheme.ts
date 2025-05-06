import { useContext } from 'react';
import { Theme } from '../theme';
import { createContext } from 'react';

export interface AgeThemeContextType {
  theme: Theme;
  ageLevel: number;
  setAgeLevel: (level: number) => void;
}

export const AgeThemeContext = createContext<AgeThemeContextType | undefined>(undefined);

/**
 * Hook to access the current age-based theme
 * @returns The current theme based on age level
 */
export function useAgeTheme(): Theme {
  const context = useContext(AgeThemeContext);
  
  if (!context) {
    throw new Error('useAgeTheme must be used within an AgeThemeProvider');
  }
  
  return context.theme;
}

/**
 * Hook to access the current age level
 * @returns The current age level (0-18)
 */
export function useAgeLevel(): number {
  const context = useContext(AgeThemeContext);
  
  if (!context) {
    throw new Error('useAgeLevel must be used within an AgeThemeProvider');
  }
  
  return context.ageLevel;
}

/**
 * Hook to check if text labels should be shown based on current age level
 * @returns Boolean indicating whether text labels should be shown
 */
export function useShouldShowTextLabels(): boolean {
  const context = useContext(AgeThemeContext);
  
  if (!context) {
    throw new Error('useShouldShowTextLabels must be used within an AgeThemeProvider');
  }
  
  return context.ageLevel >= 7; // Show text labels for Child+ levels (7+)
}

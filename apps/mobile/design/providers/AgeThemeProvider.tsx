import { ReactNode, useEffect, useState } from 'react';
import { getAgeTheme, Theme } from '../theme';
import { AgeThemeContext } from '../hooks/useAgeTheme';

interface AgeThemeProviderProps {
  initialAgeLevel?: number;
  children: ReactNode;
}

/**
 * Provider component for age-based theming
 * Provides theme values and age level to child components
 */
export function AgeThemeProvider({ initialAgeLevel = 0, children }: AgeThemeProviderProps) {
  const [ageLevel, setAgeLevel] = useState<number>(initialAgeLevel);
  const [theme, setTheme] = useState<Theme>(getAgeTheme(initialAgeLevel));
  
  useEffect(() => {
    setTheme(getAgeTheme(ageLevel));
  }, [ageLevel]);
  
  const value = {
    theme,
    ageLevel,
    setAgeLevel,
  };
  
  return (
    <AgeThemeContext.Provider value={value}>
      {children}
    </AgeThemeContext.Provider>
  );
}

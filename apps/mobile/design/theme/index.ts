export * from './colors';
export * from './typography';
export * from './spacing';

import { z } from 'zod';
import { 
  getAgeColorPalette, 
  ColorPalette, 
  ColorPaletteSchema 
} from './colors';
import { 
  getAgeTypographyScale, 
  TypographyScale, 
  TypographyScaleSchema 
} from './typography';
import { 
  getAgeSpacingScale, 
  SpacingScale, 
  SpacingScaleSchema 
} from './spacing';

export const ThemeSchema = z.object({
  colors: ColorPaletteSchema,
  typography: TypographyScaleSchema,
  spacing: SpacingScaleSchema,
});

export type Theme = z.infer<typeof ThemeSchema>;

/**
 * Get the complete theme for a given age level
 * @param ageLevel - The current age level (0-18)
 * @returns The complete theme for the age level
 */
export function getAgeTheme(ageLevel: number): Theme {
  return {
    colors: getAgeColorPalette(ageLevel),
    typography: getAgeTypographyScale(ageLevel),
    spacing: getAgeSpacingScale(ageLevel),
  };
}

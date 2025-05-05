import { z } from 'zod';

export const AGE_RANGES = {
  BABY: { min: 0, max: 3 },
  TODDLER: { min: 4, max: 6 },
  CHILD: { min: 7, max: 10 },
  TEEN: { min: 11, max: 14 },
  ADULT: { min: 15, max: 18 },
};

export const ColorPaletteSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  background: z.string(),
  text: z.string(),
});

export type ColorPalette = z.infer<typeof ColorPaletteSchema>;

export const AGE_COLOR_PALETTES: Record<string, ColorPalette> = {
  BABY: {
    primary: '#4a86e8', // Gentle blue
    secondary: '#a4c2f4', // Light blue
    accent: '#ff9900', // Bright orange
    background: '#f5f9ff', // Very light blue
    text: '#333333', // Dark gray
  },
  TODDLER: {
    primary: '#43a047', // Bright green
    secondary: '#a8e6a8', // Light green
    accent: '#ffcc00', // Yellow
    background: '#f5fff5', // Very light green
    text: '#333333', // Dark gray
  },
  CHILD: {
    primary: '#fb8c00', // Orange
    secondary: '#ffcc80', // Light orange
    accent: '#4a86e8', // Blue
    background: '#fffaf5', // Very light orange
    text: '#333333', // Dark gray
  },
  TEEN: {
    primary: '#8e24aa', // Purple
    secondary: '#d1a7e2', // Light purple
    accent: '#43a047', // Green
    background: '#f9f5ff', // Very light purple
    text: '#333333', // Dark gray
  },
  ADULT: {
    primary: '#d32f2f', // Red
    secondary: '#ef9a9a', // Light red
    accent: '#8e24aa', // Purple
    background: '#fff5f5', // Very light red
    text: '#333333', // Dark gray
  },
};

/**
 * Get the age category for a given age level
 * @param ageLevel - The current age level (0-18)
 * @returns The age category (BABY, TODDLER, CHILD, TEEN, ADULT)
 */
export function getAgeCategory(ageLevel: number): keyof typeof AGE_COLOR_PALETTES {
  if (ageLevel <= AGE_RANGES.BABY.max) return 'BABY';
  if (ageLevel <= AGE_RANGES.TODDLER.max) return 'TODDLER';
  if (ageLevel <= AGE_RANGES.CHILD.max) return 'CHILD';
  if (ageLevel <= AGE_RANGES.TEEN.max) return 'TEEN';
  return 'ADULT';
}

/**
 * Get the color palette for a given age level
 * @param ageLevel - The current age level (0-18)
 * @returns The color palette for the age level
 */
export function getAgeColorPalette(ageLevel: number): ColorPalette {
  const category = getAgeCategory(ageLevel);
  return AGE_COLOR_PALETTES[category];
}

/**
 * Get a specific color for a given age level
 * @param ageLevel - The current age level (0-18)
 * @param colorKey - The color key to get (primary, secondary, accent, background, text)
 * @returns The color value
 */
export function getAgeColor(ageLevel: number, colorKey: keyof ColorPalette = 'primary'): string {
  const palette = getAgeColorPalette(ageLevel);
  return palette[colorKey];
}

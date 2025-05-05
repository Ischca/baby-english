import { z } from 'zod';
import { getAgeCategory } from './colors';

export const SpacingScaleSchema = z.object({
  xs: z.number(),
  sm: z.number(),
  md: z.number(),
  lg: z.number(),
  xl: z.number(),
  touchTarget: z.number(),
});

export type SpacingScale = z.infer<typeof SpacingScaleSchema>;

export const AGE_SPACING_SCALES: Record<string, SpacingScale> = {
  BABY: {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
    touchTarget: 60, // Larger touch targets for babies
  },
  TODDLER: {
    xs: 8,
    sm: 12,
    md: 20,
    lg: 28,
    xl: 40,
    touchTarget: 56, // Still larger touch targets for toddlers
  },
  CHILD: {
    xs: 6,
    sm: 12,
    md: 18,
    lg: 24,
    xl: 36,
    touchTarget: 52, // Slightly smaller touch targets for children
  },
  TEEN: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    touchTarget: 48, // Standard touch targets for teens
  },
  ADULT: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    touchTarget: 44, // Standard touch targets for adults
  },
};

/**
 * Get the spacing scale for a given age level
 * @param ageLevel - The current age level (0-18)
 * @returns The spacing scale for the age level
 */
export function getAgeSpacingScale(ageLevel: number): SpacingScale {
  const category = getAgeCategory(ageLevel);
  return AGE_SPACING_SCALES[category];
}

/**
 * Get a specific spacing value for a given age level
 * @param ageLevel - The current age level (0-18)
 * @param key - The spacing key to get (xs, sm, md, lg, xl, touchTarget)
 * @returns The spacing value
 */
export function getAgeSpacing(ageLevel: number, key: keyof SpacingScale): number {
  const scale = getAgeSpacingScale(ageLevel);
  return scale[key];
}

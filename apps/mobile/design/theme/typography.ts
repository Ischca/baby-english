import { z } from 'zod';
import { getAgeCategory, AGE_RANGES } from './colors';

export const TypographyScaleSchema = z.object({
  headers: z.number(),
  body: z.number(),
  buttons: z.number(),
  fontWeight: z.string(),
  fontStyle: z.string().optional(),
});

export type TypographyScale = z.infer<typeof TypographyScaleSchema>;

export const AGE_TYPOGRAPHY_SCALES: Record<string, TypographyScale> = {
  BABY: {
    headers: 24,
    body: 18,
    buttons: 20,
    fontWeight: 'bold',
    fontStyle: 'rounded',
  },
  TODDLER: {
    headers: 22,
    body: 16,
    buttons: 18,
    fontWeight: 'bold',
    fontStyle: 'rounded',
  },
  CHILD: {
    headers: 20,
    body: 16,
    buttons: 16,
    fontWeight: 'semibold',
    fontStyle: 'slightly-rounded',
  },
  TEEN: {
    headers: 18,
    body: 14,
    buttons: 14,
    fontWeight: 'semibold',
    fontStyle: 'slightly-angular',
  },
  ADULT: {
    headers: 16,
    body: 14,
    buttons: 14,
    fontWeight: 'medium',
    fontStyle: 'angular',
  },
};

/**
 * Get the typography scale for a given age level
 * @param ageLevel - The current age level (0-18)
 * @returns The typography scale for the age level
 */
export function getAgeTypographyScale(ageLevel: number): TypographyScale {
  const category = getAgeCategory(ageLevel);
  return AGE_TYPOGRAPHY_SCALES[category];
}

/**
 * Get a specific typography value for a given age level
 * @param ageLevel - The current age level (0-18)
 * @param key - The typography key to get (headers, body, buttons, fontWeight, fontStyle)
 * @returns The typography value
 */
export function getAgeTypography(ageLevel: number, key: keyof TypographyScale): number | string {
  const scale = getAgeTypographyScale(ageLevel);
  const value = scale[key];
  return value !== undefined ? value : '';
}

/**
 * Determine if text labels should be shown based on age level
 * @param ageLevel - The current age level (0-18)
 * @returns Boolean indicating whether text labels should be shown
 */
export function shouldShowTextLabels(ageLevel: number): boolean {
  return ageLevel >= AGE_RANGES.CHILD.min;
}

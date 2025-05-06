import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { useAgeTheme, useAgeLevel } from '../hooks/useAgeTheme';
import { getAgeCategory, AGE_RANGES } from '../theme/colors';

interface AvatarProps {
  style?: ViewStyle;
  size?: number;
}

/**
 * Age-responsive avatar component
 * Displays a baby avatar that changes based on the user's age level
 */
export function Avatar({ style, size }: AvatarProps) {
  const theme = useAgeTheme();
  const ageLevel = useAgeLevel();
  
  const avatarSize = size || theme.spacing.xl * 3;
  
  const ageCategory = getAgeCategory(ageLevel);
  
  const getAvatarPlaceholderColor = () => {
    switch (ageCategory) {
      case 'BABY':
        return theme.colors.primary;
      case 'TODDLER':
        return theme.colors.secondary;
      case 'CHILD':
        return theme.colors.accent;
      case 'TEEN':
        return '#8e24aa'; // Purple
      case 'ADULT':
        return '#d32f2f'; // Red
      default:
        return theme.colors.primary;
    }
  };
  
  const styles = StyleSheet.create({
    container: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      backgroundColor: getAvatarPlaceholderColor(),
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: theme.colors.secondary,
    },
    placeholder: {
      width: '100%',
      height: '100%',
      backgroundColor: getAvatarPlaceholderColor(),
    },
  });
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.placeholder} />
    </View>
  );
}

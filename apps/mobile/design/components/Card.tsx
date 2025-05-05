import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useAgeTheme } from '../hooks/useAgeTheme';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

/**
 * Age-responsive card component
 * Adapts its appearance based on the user's age level
 */
export function Card({ title, children, style, titleStyle }: CardProps) {
  const theme = useAgeTheme();
  
  const borderRadius = theme.spacing.sm;
  const backgroundColor = theme.colors.background;
  const titleColor = theme.colors.primary;
  const titleSize = theme.typography.headers;
  
  const styles = StyleSheet.create({
    card: {
      backgroundColor,
      borderRadius,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.secondary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    title: {
      color: titleColor,
      fontSize: titleSize,
      fontWeight: theme.typography.fontWeight as TextStyle['fontWeight'],
      marginBottom: theme.spacing.sm,
    },
  });
  
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
      {children}
    </View>
  );
}

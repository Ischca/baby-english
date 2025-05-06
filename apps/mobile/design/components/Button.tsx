import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useAgeTheme, useAgeLevel, useShouldShowTextLabels } from '../hooks/useAgeTheme';

interface ButtonProps {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Age-responsive button component
 * Adapts its appearance based on the user's age level
 */
export function Button({ label, icon, onPress, style, textStyle }: ButtonProps) {
  const theme = useAgeTheme();
  const ageLevel = useAgeLevel();
  const showTextLabel = useShouldShowTextLabels();
  
  const buttonSize = theme.spacing.touchTarget;
  const fontSize = theme.typography.buttons;
  const backgroundColor = theme.colors.primary;
  const textColor = '#ffffff';
  
  const styles = StyleSheet.create({
    button: {
      backgroundColor,
      borderRadius: buttonSize / 4,
      padding: theme.spacing.sm,
      minHeight: buttonSize,
      minWidth: buttonSize,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    buttonText: {
      color: textColor,
      fontSize,
      fontWeight: theme.typography.fontWeight as TextStyle['fontWeight'],
      marginLeft: icon ? theme.spacing.xs : 0,
    },
  });
  
  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon}
      {showTextLabel && <Text style={[styles.buttonText, textStyle]}>{label}</Text>}
    </TouchableOpacity>
  );
}

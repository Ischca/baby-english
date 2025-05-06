import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing, ViewStyle } from 'react-native';
import { useAgeTheme, useAgeLevel } from '../../design/hooks/useAgeTheme';
import { getAgeCategory } from '../../design/theme/colors';

interface BabyAvatarProps {
  style?: ViewStyle;
  size?: number;
  onAnimationComplete?: () => void;
}

export const BabyAvatar: React.FC<BabyAvatarProps> = ({ 
  style, 
  size,
  onAnimationComplete
}) => {
  const theme = useAgeTheme();
  const ageLevel = useAgeLevel();
  const breathAnim = useRef(new Animated.Value(0)).current;
  
  const avatarSize = size || theme.spacing.xl * 4;
  
  const ageCategory = getAgeCategory(ageLevel);
  
  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin)
        }),
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin)
        })
      ])
    );
    
    breathingAnimation.start();
    
    return () => {
      breathingAnimation.stop();
    };
  }, [breathAnim]);
  
  const breathingScale = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05]
  });
  
  const getAvatarSource = () => {
    return require('../../assets/avatars/baby_avatar.png');
  };
  
  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.avatarContainer,
          {
            width: avatarSize,
            height: avatarSize,
            transform: [{ scale: breathingScale }]
          }
        ]}
      >
        <Image
          source={getAvatarSource()}
          style={styles.avatarImage}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  }
});

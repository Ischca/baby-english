import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface AgeMeterProps {
  ageLevel: number;
  isLevelingUp: boolean;
  onAnimationComplete?: () => void;
}

export const AgeMeter: React.FC<AgeMeterProps> = ({ 
  ageLevel, 
  isLevelingUp,
  onAnimationComplete
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isLevelingUp) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease)
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        })
      ]).start(() => {
        rotateAnim.setValue(0);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      });
    }
  }, [isLevelingUp, scaleAnim, rotateAnim, onAnimationComplete]);
  
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  const getAgeDescription = () => {
    if (ageLevel < 3) return 'Baby';
    if (ageLevel < 6) return 'Toddler';
    if (ageLevel < 10) return 'Child';
    if (ageLevel < 14) return 'Teen';
    return 'Adult';
  };
  
  const getAgeColor = () => {
    if (ageLevel < 3) return '#4a86e8'; // Baby - Blue
    if (ageLevel < 6) return '#43a047'; // Toddler - Green
    if (ageLevel < 10) return '#fb8c00'; // Child - Orange
    if (ageLevel < 14) return '#8e24aa'; // Teen - Purple
    return '#d32f2f'; // Adult - Red
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Age Level</Text>
      <Animated.View 
        style={[
          styles.meterContainer,
          { 
            transform: [
              { scale: scaleAnim },
              { rotate }
            ],
            backgroundColor: getAgeColor()
          }
        ]}
      >
        <Text style={styles.ageText}>{ageLevel}</Text>
      </Animated.View>
      <Text style={styles.ageDescription}>{getAgeDescription()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  meterContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4a86e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  ageText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  ageDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  }
});

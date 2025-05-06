import React from 'react';
import { View, StyleSheet } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
}

export const ColorIcon: React.FC<IconProps> = ({ size = 24, color = '#4a86e8' }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.colorCircle, { backgroundColor: '#FF5252', width: size/2.5, height: size/2.5 }]} />
      <View style={[styles.colorCircle, { backgroundColor: '#4CAF50', width: size/2.5, height: size/2.5 }]} />
      <View style={[styles.colorCircle, { backgroundColor: '#2196F3', width: size/2.5, height: size/2.5 }]} />
    </View>
  );
};

export const NumberIcon: React.FC<IconProps> = ({ size = 24, color = '#4a86e8' }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.numberBox, { width: size*0.8, height: size*0.8, borderColor: color }]}>
        <View style={[styles.numberLine, { width: size*0.5, backgroundColor: color }]} />
        <View style={[styles.numberLine, { width: size*0.3, backgroundColor: color }]} />
      </View>
    </View>
  );
};

export const GreetingIcon: React.FC<IconProps> = ({ size = 24, color = '#4a86e8' }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.greetingCircle, { width: size*0.8, height: size*0.8, borderColor: color }]}>
        <View style={[styles.greetingSmile, { width: size*0.4, height: size*0.2, borderColor: color }]} />
      </View>
    </View>
  );
};

export const StartIcon: React.FC<IconProps> = ({ size = 24, color = '#ffffff' }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.playTriangle, { borderLeftWidth: size*0.7, borderTopWidth: size*0.4, borderBottomWidth: size*0.4, borderLeftColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorCircle: {
    borderRadius: 50,
    margin: 1,
  },
  numberBox: {
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  numberLine: {
    height: 2,
    marginVertical: 2,
  },
  greetingCircle: {
    borderWidth: 2,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingSmile: {
    width: '50%',
    height: '30%',
    borderBottomWidth: 2,
    borderRadius: 10,
    marginTop: 5,
  },
  playTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  }
});

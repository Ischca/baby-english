import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BabyAvatar } from '../components/avatar';
import { MissionScreen } from './MissionScreen';

type MissionType = 'colors' | 'numbers' | 'greetings';

interface MainScreenProps {
  onStartChat: (missionType: MissionType) => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({ onStartChat }) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <BabyAvatar size={200} />
      </View>
      <View style={styles.missionsContainer}>
        <MissionScreen onStartChat={onStartChat} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    position: 'absolute',
    top: '10%',
    alignItems: 'center',
    zIndex: 10,
  },
  missionsContainer: {
    width: '100%',
    marginTop: 220, // Space for the avatar
  }
});

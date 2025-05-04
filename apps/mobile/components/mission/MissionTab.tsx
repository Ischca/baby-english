import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MissionTabProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
}

export const MissionTab: React.FC<MissionTabProps> = ({ 
  title, 
  isActive, 
  onPress 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.tab, isActive && styles.activeTab]} 
      onPress={onPress}
    >
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#4a86e8',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

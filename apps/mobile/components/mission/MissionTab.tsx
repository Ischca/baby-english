import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../design/components/Button';
import { ColorIcon, NumberIcon, GreetingIcon } from './icons';

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
  const getIcon = () => {
    switch (title.toLowerCase()) {
      case 'colors':
        return <ColorIcon size={24} color={isActive ? '#ffffff' : '#666'} />;
      case 'numbers':
        return <NumberIcon size={24} color={isActive ? '#ffffff' : '#666'} />;
      case 'greetings':
        return <GreetingIcon size={24} color={isActive ? '#ffffff' : '#666'} />;
      default:
        return null;
    }
  };

  return (
    <Button
      label={title}
      icon={getIcon()}
      onPress={onPress}
      style={isActive ? {...styles.tab, ...styles.activeTab} : styles.tab}
      textStyle={isActive ? {...styles.tabText, ...styles.activeTabText} : styles.tabText}
    />
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

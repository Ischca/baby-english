import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Button } from '../../design/components/Button';
import { StartIcon } from './icons';

interface MissionDetailsProps {
  missionType: 'colors' | 'numbers' | 'greetings';
  vocabulary: string[];
  onStartMission: (missionType: string) => void;
}

export const MissionDetails: React.FC<MissionDetailsProps> = ({ 
  missionType,
  vocabulary,
  onStartMission
}) => {
  const getMissionTitle = () => {
    switch (missionType) {
      case 'colors':
        return 'Colors Mission';
      case 'numbers':
        return 'Numbers Mission';
      case 'greetings':
        return 'Greetings Mission';
      default:
        return 'Mission';
    }
  };
  
  const getMissionDescription = () => {
    switch (missionType) {
      case 'colors':
        return 'Learn to identify and name different colors in English.';
      case 'numbers':
        return 'Count and recognize numbers from one to ten.';
      case 'greetings':
        return 'Practice common greetings and polite expressions.';
      default:
        return 'Complete this mission to level up!';
    }
  };
  
  const renderVocabularyItem = ({ item }: { item: string }) => (
    <View style={styles.vocabItem}>
      <Text style={styles.vocabText}>{item}</Text>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{getMissionTitle()}</Text>
      <Text style={styles.description}>{getMissionDescription()}</Text>
      
      <View style={styles.vocabContainer}>
        <Text style={styles.vocabTitle}>Words to Learn:</Text>
        <FlatList
          data={vocabulary}
          renderItem={renderVocabularyItem}
          keyExtractor={(item) => item}
          numColumns={2}
          contentContainerStyle={styles.vocabList}
        />
      </View>
      
      <Button 
        label="Start Mission"
        icon={<StartIcon size={24} />}
        onPress={() => onStartMission(missionType)}
        style={styles.startButton}
        textStyle={styles.startButtonText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  vocabContainer: {
    marginBottom: 24,
  },
  vocabTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  vocabList: {
    paddingVertical: 8,
  },
  vocabItem: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 12,
    margin: 4,
    flex: 1,
    alignItems: 'center',
  },
  vocabText: {
    fontSize: 16,
    color: '#4a86e8',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#4a86e8',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { MissionTab } from '../components/mission/MissionTab';
import { MissionDetails } from '../components/mission/MissionDetails';
import { getMissions, Mission } from 'shared/src/api';

type MissionType = 'colors' | 'numbers' | 'greetings';

interface MissionScreenProps {
  onStartChat: (missionType: MissionType) => void;
}

export const MissionScreen: React.FC<MissionScreenProps> = ({ onStartChat }) => {
  const [activeMission, setActiveMission] = useState<MissionType>('colors');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setIsLoading(true);
        const response = await getMissions();
        setMissions(response.missions);
        setError(null);
      } catch (err) {
        setError('Failed to load missions. Please try again.');
        console.error('Error fetching missions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMissions();
  }, []);
  
  const handleMissionChange = (mission: MissionType) => {
    setActiveMission(mission);
  };
  
  const handleStartMission = (missionType: string) => {
    onStartChat(missionType as MissionType);
  };
  
  const getActiveMissionVocabulary = () => {
    const mission = missions.find(m => m.id === activeMission);
    return mission ? mission.vocabulary : [];
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a86e8" />
        <Text style={styles.loadingText}>Loading missions...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Baby English</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <MissionTab 
            title="Colors" 
            isActive={activeMission === 'colors'} 
            onPress={() => handleMissionChange('colors')} 
          />
          <MissionTab 
            title="Numbers" 
            isActive={activeMission === 'numbers'} 
            onPress={() => handleMissionChange('numbers')} 
          />
          <MissionTab 
            title="Greetings" 
            isActive={activeMission === 'greetings'} 
            onPress={() => handleMissionChange('greetings')} 
          />
        </ScrollView>
      </View>
      
      <MissionDetails 
        missionType={activeMission}
        vocabulary={getActiveMissionVocabulary()}
        onStartMission={handleStartMission} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#4a86e8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
});

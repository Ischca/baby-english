import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView
} from 'react-native';
import { MissionScreen } from './screens/MissionScreen';
import { ChatScreen } from './screens/ChatScreen';
import { AgeMeter } from './components/age/AgeMeter';
import { getUser, updateUser } from 'shared/src/api';

type MissionType = 'colors' | 'numbers' | 'greetings';
type AppScreen = 'missions' | 'chat';

const AGE_LEVEL_THRESHOLDS = [
  10,   // Level 0 -> 1
  25,   // Level 1 -> 2
  50,   // Level 2 -> 3
  100,  // Level 3 -> 4
  200,  // Level 4 -> 5
  350,  // Level 5 -> 6
  500,  // Level 6 -> 7
  700,  // Level 7 -> 8
  900,  // Level 8 -> 9
  1200, // Level 9 -> 10
  1500, // Level 10 -> 11
  1800, // Level 11 -> 12
  2200, // Level 12 -> 13
  2600, // Level 13 -> 14
  3000, // Level 14 -> 15
  3500, // Level 15 -> 16
  4000, // Level 16 -> 17
  5000  // Level 17 -> 18
];

export function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('missions');
  const [activeMission, setActiveMission] = useState<MissionType>('colors');
  const [totalScore, setTotalScore] = useState(0);
  const [sessionId, setSessionId] = useState('');
  const [userId, setUserId] = useState('');
  const [ageLevel, setAgeLevel] = useState(0);
  const [isLevelingUp, setIsLevelingUp] = useState(false);

  useEffect(() => {
    const newSessionId = crypto.randomUUID();
    const newUserId = crypto.randomUUID();
    
    setSessionId(newSessionId);
    setUserId(newUserId);
    
    const fetchUser = async () => {
      try {
        const userData = await getUser(newUserId);
        setAgeLevel(userData.ageLevel);
      } catch (error) {
        console.error('Error fetching user:', error);
        setAgeLevel(0);
      }
    };
    
    fetchUser();
  }, []);

  useEffect(() => {
    if (totalScore > 0 && ageLevel < 18) {
      const nextLevelThreshold = AGE_LEVEL_THRESHOLDS[ageLevel];
      
      if (nextLevelThreshold && totalScore >= nextLevelThreshold) {
        handleLevelUp();
      }
    }
  }, [totalScore, ageLevel]);

  const handleLevelUp = useCallback(async () => {
    if (ageLevel < 18) {
      setIsLevelingUp(true);
      
      try {
        const newAgeLevel = ageLevel + 1;
        await updateUser({
          userId,
          ageLevel: newAgeLevel
        });
        
      } catch (error) {
        console.error('Error updating user age level:', error);
        setIsLevelingUp(false);
      }
    }
  }, [ageLevel, userId]);

  const handleAnimationComplete = useCallback(() => {
    setAgeLevel(prevLevel => prevLevel + 1);
    setIsLevelingUp(false);
  }, []);

  const handleStartChat = (missionType: MissionType) => {
    setActiveMission(missionType);
    setCurrentScreen('chat');
  };

  const handleBackToMissions = () => {
    setCurrentScreen('missions');
  };

  const handleScoreUpdate = (score: number) => {
    setTotalScore(prevScore => prevScore + score);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AgeMeter 
          ageLevel={ageLevel} 
          isLevelingUp={isLevelingUp}
          onAnimationComplete={handleAnimationComplete}
        />
      </View>
      
      {currentScreen === 'missions' ? (
        <MissionScreen onStartChat={handleStartChat} />
      ) : (
        <ChatScreen 
          sessionId={sessionId}
          missionType={activeMission}
          onScoreUpdate={handleScoreUpdate}
          onBack={handleBackToMissions}
        />
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
});

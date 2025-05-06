import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  Text
} from 'react-native';
import { MainScreen } from './screens/MainScreen';
import { ChatScreen } from './screens/ChatScreen';
import { SessionsScreen } from './screens/SessionsScreen';
import { AgeMeter } from './components/age/AgeMeter';
import { getUser, updateUser } from '@shared/api';
import { AgeThemeProvider } from './design';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

type MissionType = 'colors' | 'numbers' | 'greetings';
type AppScreen = 'missions' | 'chat' | 'sessions';

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
    const newSessionId = uuidv4();
    const newUserId = uuidv4();

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

  const handleViewSessions = () => {
    setCurrentScreen('sessions');
  };

  const handleBackFromSessions = () => {
    setCurrentScreen('missions');
  };

  return (
    <AgeThemeProvider initialAgeLevel={ageLevel}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <AgeMeter
            ageLevel={ageLevel}
            isLevelingUp={isLevelingUp}
            onAnimationComplete={handleAnimationComplete}
          />
          {currentScreen === 'missions' && (
            <TouchableOpacity
              style={styles.historyButton}
              onPress={handleViewSessions}
            >
              <Text style={styles.historyButtonText}>View History</Text>
            </TouchableOpacity>
          )}
        </View>

        {currentScreen === 'missions' ? (
          <MainScreen onStartChat={handleStartChat} />
        ) : currentScreen === 'chat' ? (
        <ChatScreen
          sessionId={sessionId}
          missionType={activeMission}
          onScoreUpdate={handleScoreUpdate}
          onBack={handleBackToMissions}
        />
      ) : (
        <SessionsScreen
          userId={userId}
          onBack={handleBackFromSessions}
        />
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
    </AgeThemeProvider>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyButton: {
    backgroundColor: '#4a86e8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

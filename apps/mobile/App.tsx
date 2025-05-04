import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView
} from 'react-native';
import { MissionScreen } from './screens/MissionScreen';
import { ChatScreen } from './screens/ChatScreen';

type MissionType = 'colors' | 'numbers' | 'greetings';
type AppScreen = 'missions' | 'chat';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('missions');
  const [activeMission, setActiveMission] = useState<MissionType>('colors');
  const [totalScore, setTotalScore] = useState(0);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    setSessionId(crypto.randomUUID());
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
});

import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatResponse {
  reply: string;
  evaluation: {
    targetMet: boolean;
    score: number;
  };
  tokens: number;
}

export function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: inputText,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    setInputText('');
    
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:54321/functions/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: userMessage.content
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get response');
      }

      const data: ChatResponse = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: data.reply,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);

      if (data.evaluation.targetMet) {
        setTotalScore(prevScore => prevScore + data.evaluation.score);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: `Error: ${error.message}`,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageBubble,
      item.role === 'user' ? styles.userMessage : styles.assistantMessage
    ]}>
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Baby English</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Score: {totalScore}</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        inverted={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          onSubmitEditing={sendMessage}
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[styles.sendButton, isLoading && styles.disabledButton]} 
          onPress={sendMessage}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#4a86e8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scoreText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  messageList: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#4a86e8',
    borderRadius: 20,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

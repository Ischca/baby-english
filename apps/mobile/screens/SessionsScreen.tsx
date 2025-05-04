import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  Platform
} from 'react-native';
import { getSessions, exportSession, SessionDetails } from 'shared/src/api';

interface SessionsScreenProps {
  userId: string;
  onBack: () => void;
}

export const SessionsScreen: React.FC<SessionsScreenProps> = ({ userId, onBack }) => {
  const [sessions, setSessions] = useState<SessionDetails[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async (refresh = false) => {
    try {
      if (refresh) {
        setPage(0);
        setLoading(true);
      }
      
      const currentPage = refresh ? 0 : page;
      
      const response = await getSessions({
        userId,
        limit: PAGE_SIZE,
        offset: currentPage * PAGE_SIZE
      });
      
      if (refresh) {
        setSessions(response.sessions);
      } else {
        setSessions(prev => [...prev, ...response.sessions]);
      }
      
      setTotalCount(response.totalCount);
      setHasMore(response.sessions.length === PAGE_SIZE);
      
      if (!refresh) {
        setPage(currentPage + 1);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to load sessions. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchSessions();
    }
  };

  const handleRefresh = () => {
    fetchSessions(true);
  };

  const handleExport = async (sessionId: string) => {
    try {
      setExporting(true);
      
      const response = await exportSession({
        sessionId,
        format: 'json'
      });
      
      if (Platform.OS === 'web') {
        window.open(response.exportUrl, '_blank');
      } else {
        await Share.share({
          title: 'Learning Session Export',
          message: `Check out my learning session: ${response.exportUrl}`,
          url: response.exportUrl
        });
      }
    } catch (error) {
      Alert.alert(
        'Export Failed',
        'Unable to export session data. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Error exporting session:', error);
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getMissionEmoji = (missionType: string) => {
    switch (missionType) {
      case 'colors':
        return '🎨';
      case 'numbers':
        return '🔢';
      case 'greetings':
        return '👋';
      default:
        return '📚';
    }
  };

  const renderItem = ({ item }: { item: SessionDetails }) => (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Text style={styles.missionType}>
          {getMissionEmoji(item.missionType)} {item.missionType.charAt(0).toUpperCase() + item.missionType.slice(1)}
        </Text>
        <Text style={styles.date}>{formatDate(item.startedAt)}</Text>
      </View>
      
      <View style={styles.sessionStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.messageCount}</Text>
          <Text style={styles.statLabel}>Messages</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.totalScore}</Text>
          <Text style={styles.statLabel}>Score</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {item.endedAt ? Math.round((new Date(item.endedAt).getTime() - new Date(item.startedAt).getTime()) / 60000) : '-'}
          </Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.exportButton}
        onPress={() => handleExport(item.id)}
        disabled={exporting}
      >
        <Text style={styles.exportButtonText}>Export Data</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#4a86e8" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No learning sessions found</Text>
        <Text style={styles.emptySubtext}>Complete a mission to see your progress here</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Learning History</Text>
        <View style={styles.placeholder} />
      </View>
      
      <FlatList
        data={sessions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={loading && page === 0}
      />
      
      {exporting && (
        <View style={styles.exportingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.exportingText}>Exporting...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4a86e8',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  missionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a86e8',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  exportButton: {
    backgroundColor: '#4a86e8',
    borderRadius: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  exportingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { theme } from '../styles/theme';
import { apiClient } from '../services/apiClient';

export const HomeScreen: React.FC<any> = ({ navigation }) => {
  const [news, setNews] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/news?status=PUBLISHED').then(res => setNews(res.data.data.slice(0, 2))).catch(() => {});
    apiClient.get('/events?status=UPCOMING').then(res => setEvents(res.data.data.slice(0, 2))).catch(() => {});
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Mobile Top Header Banner */}
      <View className="header" style={styles.header}>
        <Text style={styles.headerSubtitle}>COMMUNITY PLATFORM</Text>
        <Text style={styles.headerTitle}>Welcome, John Doe</Text>
      </View>

      {/* Membership Card Preview Widget */}
      <View style={styles.cardWidget}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>OFFICIAL MEMBER ID</Text>
          <Text style={styles.statusBadge}>APPROVED</Text>
        </View>
        <Text style={styles.memberId}>ORG-2026-000003</Text>
        <Text style={styles.unitName}>Unit 02 - Green Park Community</Text>

        <TouchableOpacity style={styles.qrButton} onPress={() => navigation.navigate('DigitalID')}>
          <Text style={styles.qrButtonText}>View Digital ID Card & QR</Text>
        </TouchableOpacity>
      </View>

      {/* Latest News Feed */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Latest Bulletins</Text>
        {news.map(item => (
          <TouchableOpacity key={item.id} style={styles.newsItem} onPress={() => navigation.navigate('NewsDetail', { id: item.id })}>
            <Text style={styles.newsCategory}>{item.category_name || 'Announcement'}</Text>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsSummary} numberOfLines={2}>{item.summary}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
  header: { backgroundColor: theme.colors.primaryMaroon, padding: 24, paddingTop: 40, borderBottomRightRadius: 20, borderBottomLeftRadius: 20 },
  headerSubtitle: { color: theme.colors.accentGold, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', marginTop: 4 },
  cardWidget: { backgroundColor: theme.colors.primaryMaroonDark, margin: 16, padding: 20, borderRadius: 16, borderColor: theme.colors.accentGold, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: theme.colors.accentGold, fontSize: 11, fontWeight: '700' },
  statusBadge: { backgroundColor: '#10B981', color: '#FFF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, fontSize: 10, fontWeight: '700' },
  memberId: { color: '#FFF', fontSize: 20, fontWeight: '800', marginVertical: 4 },
  unitName: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 16 },
  qrButton: { backgroundColor: theme.colors.accentGold, padding: 12, borderRadius: 8, alignItems: 'center' },
  qrButtonText: { color: theme.colors.primaryMaroonDark, fontWeight: '800', fontSize: 13 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.primaryMaroon, marginBottom: 12 },
  newsItem: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border },
  newsCategory: { color: theme.colors.accentGold, fontSize: 11, fontWeight: '700', marginBottom: 4 },
  newsTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.textDark, marginBottom: 4 },
  newsSummary: { fontSize: 13, color: theme.colors.textMuted },
});

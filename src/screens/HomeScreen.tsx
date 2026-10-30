import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

export const HomeScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAuth();
  const [news, setNews] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const memberName = user?.member?.full_name || user?.email || 'Member';
  const memberId = user?.member?.member_id || 'Pending approval';
  const status = user?.member?.status || 'PENDING';
  const isApproved = status === 'APPROVED';

  const loadFeed = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [newsRes, eventsRes] = await Promise.all([
        apiClient.get('/news').catch(() => null),
        apiClient.get('/events').catch(() => null),
      ]);
      const newsRows = newsRes?.data?.data;
      const eventRows = eventsRes?.data?.data;
      setNews(Array.isArray(newsRows) ? newsRows.slice(0, 8) : []);
      setEvents(Array.isArray(eventRows) ? eventRows.slice(0, 3) : []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFeed();
    }, [])
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadFeed(true)}
          tintColor={theme.colors.primaryMaroon}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image
            source={require('../../assets/logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.brand}>NMPI</Text>
            <Text style={styles.welcome}>Vanakkam, {memberName}</Text>
          </View>
        </View>
        <Text style={styles.tagline}>Netaji Makkal Pathukappu Iyakkam</Text>
      </View>

      <View style={styles.idCard}>
        <View style={styles.idTop}>
          <Text style={styles.idLabel}>DIGITAL MEMBERSHIP</Text>
          <Text style={[styles.statusPill, !isApproved && styles.statusPending]}>
            {status}
          </Text>
        </View>
        <Text style={styles.idNumber}>{memberId}</Text>
        <Text style={styles.idHint}>Carry your official card in the app — like a movement ID.</Text>
        <TouchableOpacity
          style={styles.idBtn}
          onPress={() => navigation.navigate('DigitalIDTab')}
          activeOpacity={0.85}
        >
          <Ionicons name="card" size={16} color={theme.colors.primaryMaroonDark} />
          <Text style={styles.idBtnText}>Open Digital ID</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickRow}>
        <TouchableOpacity
          style={styles.quickItem}
          onPress={() => navigation.navigate('EventsTab')}
        >
          <Ionicons name="calendar" size={22} color={theme.colors.accentGold} />
          <Text style={styles.quickText}>Events</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickItem}
          onPress={() => navigation.navigate('DigitalIDTab')}
        >
          <Ionicons name="id-card" size={22} color={theme.colors.accentGold} />
          <Text style={styles.quickText}>ID Card</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickItem}
          onPress={() => navigation.navigate('ProfileTab')}
        >
          <Ionicons name="person" size={22} color={theme.colors.accentGold} />
          <Text style={styles.quickText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={theme.colors.primaryMaroon} />
      ) : (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <TouchableOpacity onPress={() => navigation.navigate('EventsTab')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {events.length === 0 ? (
              <Text style={styles.empty}>No upcoming events yet.</Text>
            ) : (
              events.map((item) => (
                <View key={item.id} style={styles.eventCard}>
                  <Ionicons name="calendar-outline" size={18} color={theme.colors.primaryMaroon} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.eventTitle}>{item.title}</Text>
                    <Text style={styles.eventMeta}>
                      {[item.event_date, item.location].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Community Updates</Text>
            <Text style={styles.sectionSub}>News & announcements from NMPI</Text>
            {news.length === 0 ? (
              <Text style={styles.empty}>No updates published yet.</Text>
            ) : (
              news.map((item) => (
                <View key={item.id} style={styles.newsCard}>
                  <Text style={styles.newsCat}>{item.category || 'Announcement'}</Text>
                  <Text style={styles.newsTitle}>{item.title}</Text>
                  <Text style={styles.newsSummary} numberOfLines={3}>
                    {item.summary}
                  </Text>
                </View>
              ))
            )}
          </View>
        </>
      )}
      <View style={{ height: 28 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
  header: {
    backgroundColor: theme.colors.primaryMaroon,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: theme.colors.accentGold,
    marginRight: 12,
    backgroundColor: '#FFF',
  },
  brand: {
    color: theme.colors.accentGold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  welcome: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  tagline: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
  },
  idCard: {
    marginHorizontal: 16,
    marginTop: -14,
    backgroundColor: theme.colors.primaryMaroonDark,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.accentGold,
  },
  idTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idLabel: {
    color: theme.colors.accentGold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statusPill: {
    backgroundColor: '#10B981',
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  statusPending: { backgroundColor: '#F59E0B' },
  idNumber: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
  },
  idHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  idBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.accentGold,
    paddingVertical: 11,
    borderRadius: 10,
  },
  idBtnText: {
    color: theme.colors.primaryMaroonDark,
    fontWeight: '800',
    fontSize: 13,
  },
  quickRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    gap: 10,
  },
  quickItem: {
    flex: 1,
    backgroundColor: theme.colors.primaryMaroon,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  quickText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginTop: 22 },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primaryMaroon,
  },
  sectionSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 10,
    marginTop: -4,
  },
  seeAll: {
    color: theme.colors.primaryMaroon,
    fontWeight: '700',
    fontSize: 13,
  },
  empty: { color: theme.colors.textMuted, fontSize: 13, paddingVertical: 8 },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  eventTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.textDark },
  eventMeta: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  newsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  newsCat: {
    color: theme.colors.accentGold,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textDark,
    marginBottom: 4,
  },
  newsSummary: { fontSize: 13, color: theme.colors.textMuted, lineHeight: 18 },
});

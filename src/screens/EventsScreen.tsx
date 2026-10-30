import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { apiClient } from '../services/apiClient';
import { communityApi } from '../services/communityApi';

function formatEventDate(item: any) {
  const date = item.event_date || item.date;
  const time = item.start_time;
  if (!date) return 'Date TBA';
  try {
    const d = new Date(date);
    const datePart = d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return time ? `${datePart} · ${String(time).slice(0, 5)}` : datePart;
  } catch {
    return String(date);
  }
}

export const EventsScreen: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [rsvpMap, setRsvpMap] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadEvents = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await apiClient.get('/events');
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      setEvents(rows);

      const map: Record<number, any> = {};
      await Promise.all(
        rows.slice(0, 20).map(async (ev: any) => {
          try {
            map[ev.id] = await communityApi.myEventRsvp(ev.id);
          } catch {
            // ignore per-event failures
          }
        })
      );
      setRsvpMap(map);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  const setRsvp = async (eventId: number, status: 'GOING' | 'INTERESTED' | 'NOT_GOING') => {
    setBusyId(eventId);
    try {
      const data = await communityApi.eventRsvp(eventId, status);
      setRsvpMap((prev) => ({ ...prev, [eventId]: data }));
    } catch (e: any) {
      Alert.alert('RSVP failed', e?.response?.data?.message || 'Could not save RSVP.');
    } finally {
      setBusyId(null);
    }
  };

  const checkIn = async (eventId: number) => {
    setBusyId(eventId);
    try {
      const data = await communityApi.eventCheckIn(eventId);
      setRsvpMap((prev) => ({ ...prev, [eventId]: data }));
      Alert.alert('Checked in', 'You are checked in for this event.');
    } catch (e: any) {
      Alert.alert('Check-in failed', e?.response?.data?.message || 'RSVP as Going first.');
    } finally {
      setBusyId(null);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const mine = rsvpMap[item.id];
    const myStatus = mine?.rsvp?.status;
    const checkedIn = Boolean(mine?.rsvp?.checked_in);
    const counts = mine?.counts || {};
    const busy = busyId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.status || 'UPCOMING'}</Text>
          </View>
          <Text style={styles.dateText}>{formatEventDate(item)}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        {(item.location || item.venue_address) && (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={2}>
              {[item.location, item.venue_address].filter(Boolean).join(' · ')}
            </Text>
          </View>
        )}
        {!!item.description && (
          <Text style={styles.desc} numberOfLines={3}>
            {item.description}
          </Text>
        )}

        <Text style={styles.counts}>
          Going {counts.going || 0} · Interested {counts.interested || 0}
          {counts.checked_in ? ` · Checked in ${counts.checked_in}` : ''}
        </Text>

        <View style={styles.rsvpRow}>
          {(['GOING', 'INTERESTED', 'NOT_GOING'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.rsvpChip, myStatus === status && styles.rsvpChipActive]}
              disabled={busy}
              onPress={() => setRsvp(item.id, status)}
            >
              <Text style={[styles.rsvpChipText, myStatus === status && styles.rsvpChipTextActive]}>
                {status === 'GOING' ? 'Going' : status === 'INTERESTED' ? 'Interested' : 'No'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {myStatus === 'GOING' && (
          <TouchableOpacity
            style={[styles.checkInBtn, checkedIn && styles.checkInDone]}
            disabled={busy || checkedIn}
            onPress={() => checkIn(item.id)}
          >
            {busy ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons
                  name={checkedIn ? 'checkmark-circle' : 'qr-code-outline'}
                  size={16}
                  color="#FFF"
                />
                <Text style={styles.checkInText}>{checkedIn ? 'Checked in' : 'Check in'}</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primaryMaroon} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadEvents(true)}
            tintColor={theme.colors.primaryMaroon}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={styles.pageTitle}>Events</Text>
            <Text style={styles.pageSub}>RSVP and check in at NMPI programmes</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={40} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No events yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 32 },
  headerBlock: { marginBottom: 12 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: theme.colors.primaryMaroon },
  pageSub: { marginTop: 4, fontSize: 13, color: theme.colors.textMuted },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: theme.colors.primaryMaroon,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: theme.colors.accentGold,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dateText: { fontSize: 12, color: theme.colors.textMuted, fontWeight: '600' },
  title: { fontSize: 16, fontWeight: '800', color: theme.colors.textDark, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  metaText: { flex: 1, marginLeft: 6, fontSize: 12, color: theme.colors.textMuted },
  desc: { fontSize: 13, color: theme.colors.textMuted, lineHeight: 18, marginTop: 4 },
  counts: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryMaroon,
  },
  rsvpRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  rsvpChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  rsvpChipActive: {
    backgroundColor: theme.colors.primaryMaroon,
    borderColor: theme.colors.primaryMaroon,
  },
  rsvpChipText: { fontSize: 12, fontWeight: '700', color: theme.colors.textDark },
  rsvpChipTextActive: { color: '#FFF' },
  checkInBtn: {
    marginTop: 10,
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  checkInDone: { backgroundColor: '#6B7280' },
  checkInText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { marginTop: 12, fontSize: 16, fontWeight: '800', color: theme.colors.textDark },
});

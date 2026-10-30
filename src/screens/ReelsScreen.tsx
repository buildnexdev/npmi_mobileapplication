import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Linking,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { communityApi } from '../services/communityApi';

const { width } = Dimensions.get('window');

export const ReelsScreen: React.FC = () => {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      setReels(await communityApi.listReels());
    } catch {
      Alert.alert('Reels', 'Could not load reels.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const openReel = async (item: any) => {
    try {
      await communityApi.recordReelView(item.id);
      if (item.video_url) await Linking.openURL(item.video_url);
    } catch {
      Alert.alert('Unable to open video');
    }
  };

  const onLike = async (item: any) => {
    try {
      const res = await communityApi.toggleReelLike(item.id);
      setReels((prev) =>
        prev.map((r) =>
          r.id === item.id ? { ...r, liked_by_me: res.liked, like_count: res.like_count } : r
        )
      );
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primaryMaroon} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={reels}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => load(true)}
          tintColor={theme.colors.primaryMaroon}
        />
      }
      ListHeaderComponent={
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.title}>Reels</Text>
          <Text style={styles.sub}>Short videos from the movement</Text>
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.empty}>No reels yet. Admins can publish short videos from the backend.</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => openReel(item)}>
            {item.thumbnail_url ? (
              <Image source={{ uri: item.thumbnail_url }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbFallback]}>
                <Ionicons name="play-circle" size={56} color={theme.colors.accentGold} />
              </View>
            )}
            <View style={styles.playOverlay}>
              <Ionicons name="play" size={22} color="#FFF" />
            </View>
          </TouchableOpacity>
          <View style={styles.meta}>
            <Text style={styles.reelTitle}>{item.title}</Text>
            {!!item.caption && (
              <Text style={styles.caption} numberOfLines={2}>
                {item.caption}
              </Text>
            )}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(item)}>
                <Ionicons
                  name={item.liked_by_me ? 'heart' : 'heart-outline'}
                  size={18}
                  color={item.liked_by_me ? '#EF4444' : theme.colors.textMuted}
                />
                <Text style={styles.actionText}>{item.like_count || 0}</Text>
              </TouchableOpacity>
              <View style={styles.actionBtn}>
                <Ionicons name="eye-outline" size={18} color={theme.colors.textMuted} />
                <Text style={styles.actionText}>{item.view_count || 0}</Text>
              </View>
              <Text style={styles.author}>{item.author_name}</Text>
            </View>
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: theme.colors.primaryMaroon },
  sub: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  empty: { textAlign: 'center', color: theme.colors.textMuted, marginTop: 40, fontSize: 13 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  thumb: {
    width: width - 32,
    height: (width - 32) * 0.56,
    backgroundColor: theme.colors.primaryMaroonDark,
  },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
  playOverlay: {
    position: 'absolute',
    top: '42%',
    alignSelf: 'center',
    left: '46%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { padding: 14 },
  reelTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.textDark },
  caption: { marginTop: 4, fontSize: 13, color: theme.colors.textMuted, lineHeight: 18 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 14,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12, fontWeight: '700', color: theme.colors.textMuted },
  author: { marginLeft: 'auto', fontSize: 12, color: theme.colors.textMuted, fontWeight: '600' },
});

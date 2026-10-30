import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { communityApi } from '../services/communityApi';
import { useAuth } from '../context/AuthContext';

export const FeedScreen: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posting, setPosting] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const rows = await communityApi.listFeed({ limit: 50 });
      setPosts(rows);
    } catch {
      Alert.alert('Feed', 'Could not load community posts.');
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

  const submitPost = async () => {
    if (!body.trim()) return;
    setPosting(true);
    try {
      await communityApi.createPost(body.trim());
      setBody('');
      await load(true);
    } catch (e: any) {
      Alert.alert('Post failed', e?.response?.data?.message || 'Could not publish post.');
    } finally {
      setPosting(false);
    }
  };

  const onLike = async (post: any) => {
    try {
      const res = await communityApi.toggleFeedLike(post.id);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, liked_by_me: res.liked, like_count: res.like_count }
            : p
        )
      );
    } catch {
      // ignore
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.authorRow}>
        {item.author_photo ? (
          <Image source={{ uri: item.author_photo }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Ionicons name="person" size={16} color={theme.colors.accentGold} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.authorName}>{item.author_name || 'Member'}</Text>
          <Text style={styles.timeText}>
            {item.created_at ? String(item.created_at).replace('T', ' ').slice(0, 16) : ''}
          </Text>
        </View>
      </View>
      <Text style={styles.body}>{item.body}</Text>
      {!!item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.postImage} resizeMode="cover" />
      )}
      <TouchableOpacity style={styles.likeBtn} onPress={() => onLike(item)}>
        <Ionicons
          name={item.liked_by_me ? 'heart' : 'heart-outline'}
          size={18}
          color={item.liked_by_me ? '#EF4444' : theme.colors.textMuted}
        />
        <Text style={styles.likeText}>{item.like_count || 0}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.composer}>
        <Text style={styles.composerHint}>Share an update with NMPI members</Text>
        <TextInput
          style={styles.input}
          placeholder={`What's happening, ${user?.member?.full_name?.split(' ')[0] || 'member'}?`}
          placeholderTextColor="#9CA3AF"
          value={body}
          onChangeText={setBody}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          style={[styles.postBtn, (!body.trim() || posting) && { opacity: 0.5 }]}
          onPress={submitPost}
          disabled={!body.trim() || posting}
        >
          {posting ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.postBtnText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={theme.colors.primaryMaroon} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={theme.colors.primaryMaroon}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No posts yet. Be the first to share an update.</Text>
          }
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
  composer: {
    backgroundColor: '#FFF',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  composerHint: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryMaroon,
    marginBottom: 8,
  },
  input: {
    minHeight: 64,
    maxHeight: 120,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: theme.colors.textDark,
    textAlignVertical: 'top',
  },
  postBtn: {
    alignSelf: 'flex-end',
    marginTop: 10,
    backgroundColor: theme.colors.primaryMaroon,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  postBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  avatarFallback: {
    backgroundColor: theme.colors.primaryMaroon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: { fontSize: 14, fontWeight: '800', color: theme.colors.textDark },
  timeText: { fontSize: 11, color: theme.colors.textMuted, marginTop: 1 },
  body: { fontSize: 14, color: theme.colors.textDark, lineHeight: 20 },
  postImage: {
    marginTop: 10,
    width: '100%',
    height: 180,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  likeBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 6 },
  likeText: { fontSize: 13, fontWeight: '700', color: theme.colors.textMuted },
  empty: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    marginTop: 40,
    fontSize: 13,
  },
});

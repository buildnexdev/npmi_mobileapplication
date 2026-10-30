import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { communityApi } from '../services/communityApi';

export const SurveysScreen: React.FC = () => {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [active, setActive] = useState<any | null>(null);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      setSurveys(await communityApi.listSurveys());
    } catch {
      Alert.alert('Surveys', 'Could not load surveys.');
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

  const openSurvey = async (item: any) => {
    if (item.already_answered) {
      Alert.alert('Already submitted', 'You have already answered this survey.');
      return;
    }
    try {
      const full = await communityApi.getSurvey(item.id);
      setActive(full);
      setAnswers({});
    } catch (e: any) {
      Alert.alert('Survey', e?.response?.data?.message || 'Could not open survey.');
    }
  };

  const setSingle = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { question_id: questionId, option_id: optionId } }));
  };

  const setText = (questionId: number, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { question_id: questionId, text_answer: text } }));
  };

  const toggleMulti = (questionId: number, optionId: number) => {
    setAnswers((prev) => {
      const current = prev[questionId]?.option_ids || [];
      const next = current.includes(optionId)
        ? current.filter((id: number) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [questionId]: { question_id: questionId, option_ids: next } };
    });
  };

  const submit = async () => {
    if (!active) return;
    setSubmitting(true);
    try {
      const payload = Object.values(answers);
      await communityApi.submitSurvey(active.id, payload);
      Alert.alert('Thank you', 'Your response was submitted.');
      setActive(null);
      await load(true);
    } catch (e: any) {
      Alert.alert('Submit failed', e?.response?.data?.message || 'Could not submit survey.');
    } finally {
      setSubmitting(false);
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
    <View style={styles.container}>
      <FlatList
        data={surveys}
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
            <Text style={styles.title}>Surveys</Text>
            <Text style={styles.sub}>Share your voice and help shape NMPI decisions</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No open surveys right now.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openSurvey(item)} activeOpacity={0.85}>
            <View style={styles.cardTop}>
              <Ionicons name="clipboard-outline" size={20} color={theme.colors.accentGold} />
              {item.already_answered ? (
                <Text style={styles.doneBadge}>Answered</Text>
              ) : (
                <Text style={styles.openBadge}>Open</Text>
              )}
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {!!item.description && (
              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            <Text style={styles.qCount}>{item.question_count} question(s)</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!active} animationType="slide" onRequestClose={() => setActive(null)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActive(null)}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {active?.title}
            </Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            {(active?.questions || []).map((q: any) => (
              <View key={q.id} style={styles.qCard}>
                <Text style={styles.qText}>
                  {q.question_text}
                  {q.is_required ? ' *' : ''}
                </Text>
                {q.question_type === 'TEXT' ? (
                  <TextInput
                    style={styles.textAns}
                    placeholder="Type your answer"
                    placeholderTextColor="#9CA3AF"
                    value={answers[q.id]?.text_answer || ''}
                    onChangeText={(t) => setText(q.id, t)}
                    multiline
                  />
                ) : (
                  (q.options || []).map((opt: any) => {
                    const selected =
                      q.question_type === 'MULTI'
                        ? (answers[q.id]?.option_ids || []).includes(opt.id)
                        : answers[q.id]?.option_id === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[styles.opt, selected && styles.optActive]}
                        onPress={() =>
                          q.question_type === 'MULTI'
                            ? toggleMulti(q.id, opt.id)
                            : setSingle(q.id, opt.id)
                        }
                      >
                        <Ionicons
                          name={
                            selected
                              ? q.question_type === 'MULTI'
                                ? 'checkbox'
                                : 'radio-button-on'
                              : q.question_type === 'MULTI'
                              ? 'square-outline'
                              : 'radio-button-off'
                          }
                          size={18}
                          color={selected ? '#FFF' : theme.colors.primaryMaroon}
                        />
                        <Text style={[styles.optText, selected && styles.optTextActive]}>
                          {opt.option_text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            ))}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={submit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitText}>Submit Survey</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: theme.colors.primaryMaroon },
  sub: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  empty: { textAlign: 'center', color: theme.colors.textMuted, marginTop: 40 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  openBadge: {
    backgroundColor: '#10B981',
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  doneBadge: {
    backgroundColor: '#6B7280',
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textDark,
  },
  cardDesc: { marginTop: 4, fontSize: 13, color: theme.colors.textMuted, lineHeight: 18 },
  qCount: { marginTop: 8, fontSize: 12, fontWeight: '700', color: theme.colors.primaryMaroon },
  modal: { flex: 1, backgroundColor: theme.colors.backgroundLight },
  modalHeader: {
    backgroundColor: theme.colors.primaryMaroon,
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: { color: '#FFF', fontWeight: '800', fontSize: 16, flex: 1, textAlign: 'center' },
  qCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  qText: { fontSize: 14, fontWeight: '800', color: theme.colors.textDark, marginBottom: 10 },
  textAns: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 10,
    minHeight: 70,
    textAlignVertical: 'top',
    color: theme.colors.textDark,
  },
  opt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optActive: {
    backgroundColor: theme.colors.primaryMaroon,
    borderColor: theme.colors.primaryMaroon,
  },
  optText: { flex: 1, fontSize: 13, fontWeight: '600', color: theme.colors.textDark },
  optTextActive: { color: '#FFF' },
  submitBtn: {
    backgroundColor: theme.colors.primaryMaroon,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});

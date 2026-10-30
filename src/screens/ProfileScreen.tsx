import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

export const ProfileScreen: React.FC<any> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const member = user?.member;
  const name = member?.full_name || user?.email || 'Member';
  const photo = member?.profile_photo || member?.profile_image;
  const status = member?.status || 'PENDING';

  const performLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      const rootNav = navigation.getParent() || navigation;
      try {
        rootNav.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          })
        );
      } catch (err) {
        rootNav.navigate('Welcome');
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined'
        ? window.confirm('Sign out of your NMPI member account?')
        : true;
      if (confirmed) {
        performLogout();
      }
      return;
    }

    Alert.alert('Sign Out', 'Sign out of your NMPI member account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: performLogout,
      },
    ]);
  };

  const rows = [
    { label: 'Member ID', value: member?.member_id || 'Pending' },
    { label: 'Email', value: user?.email || '—' },
    { label: 'Mobile', value: user?.mobile || user?.phone_number || member?.phone_number || '—' },
    { label: 'Status', value: status },
    { label: 'Role', value: member?.role_name || user?.roles?.join(', ') || 'Member' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Ionicons name="person" size={36} color={theme.colors.accentGold} />
          </View>
        )}
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.brand}>NMPI Member Profile</Text>
      </View>

      <View style={styles.card}>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text style={styles.rowValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.idBtn}
        onPress={() => navigation.navigate('DigitalIDTab')}
        activeOpacity={0.85}
      >
        <Ionicons name="card-outline" size={18} color={theme.colors.primaryMaroonDark} />
        <Text style={styles.idBtnText}>Open Digital ID Card</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.surveyBtn}
        onPress={() => navigation.navigate('Surveys')}
        activeOpacity={0.85}
      >
        <Ionicons name="clipboard-outline" size={18} color="#FFF" />
        <Text style={styles.logoutText}>Surveys</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        activeOpacity={0.85}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={18} color="#FFF" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
  content: { paddingBottom: 40 },
  hero: {
    backgroundColor: theme.colors.primaryMaroon,
    paddingTop: 28,
    paddingBottom: 32,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: theme.colors.accentGold,
    backgroundColor: '#FFF',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryMaroonDark,
  },
  name: {
    marginTop: 12,
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  brand: {
    marginTop: 4,
    color: theme.colors.accentGold,
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    marginHorizontal: 16,
    marginTop: -16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.textMuted },
  rowValue: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textDark,
  },
  idBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.accentGold,
    paddingVertical: 14,
    borderRadius: 12,
  },
  idBtnText: {
    color: theme.colors.primaryMaroonDark,
    fontWeight: '800',
    fontSize: 14,
  },
  surveyBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primaryMaroonDark,
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primaryMaroon,
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
});

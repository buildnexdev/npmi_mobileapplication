import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export const WelcomeScreen: React.FC<any> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Image
            source={require('../../assets/logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brand}>NMPI</Text>
          <Text style={styles.subtitle}>Netaji Makkal Pathukappu Iyakkam</Text>
          <Text style={styles.caption}>
            Member portal — register or sign in with the same account as the website.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Ionicons
              name="log-in-outline"
              size={20}
              color={theme.colors.primaryMaroonDark}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.primaryBtnText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.85}
          >
            <Ionicons
              name="person-add-outline"
              size={20}
              color={theme.colors.primaryMaroon}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.secondaryBtnText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.primaryMaroon,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 24 : 32,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.colors.accentGold,
    backgroundColor: '#FFF',
    marginBottom: 20,
  },
  brand: {
    color: theme.colors.accentGold,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 4,
  },
  subtitle: {
    marginTop: 8,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  caption: {
    marginTop: 16,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  actions: {
    gap: 12,
    marginBottom: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accentGold,
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: theme.colors.primaryMaroonDark,
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 12,
  },
  secondaryBtnText: {
    color: theme.colors.primaryMaroon,
    fontSize: 16,
    fontWeight: '800',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC<any> = ({ navigation }) => {
  const { login, prefilledEmail } = useAuth();

  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (prefilledEmail) {
      setLoginInput(prefilledEmail);
    }
  }, [prefilledEmail]);

  const handleLogin = async () => {
    setErrorMsg(null);

    if (!loginInput.trim()) {
      setErrorMsg('Please enter your email address or mobile number.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(loginInput.trim(), password);
      setLoading(false);

      if (res.success) {
        navigation.replace('MainTabs');
      } else {
        setErrorMsg(res.message || 'Invalid credentials. Please verify your login details.');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Unable to connect. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate('Welcome')}
          >
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <Image
            source={require('../../assets/logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>NMPI</Text>
          <Text style={styles.brandSubtitle}>Member Sign In</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Use the same email or mobile and password as the NMPI website.
            </Text>
          </View>

          {errorMsg && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email or Mobile Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="email@example.com or 10-digit mobile"
                placeholderTextColor="#9CA3AF"
                value={loginInput}
                onChangeText={(text) => {
                  setLoginInput(text);
                  if (errorMsg) setErrorMsg(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {loginInput.length > 0 && (
                <TouchableOpacity onPress={() => setLoginInput('')} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMsg) setErrorMsg(null);
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <View style={styles.btnContentRow}>
                <Text style={styles.loginButtonText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.registerDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>NEW MEMBER?</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerHereButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.85}
          >
            <Ionicons
              name="person-add"
              size={16}
              color={theme.colors.primaryMaroonDark}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.registerHereButtonText}>Register Here</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  heroHeader: {
    backgroundColor: theme.colors.primaryMaroon,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    top: Platform.OS === 'ios' ? 54 : 38,
    padding: 6,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: theme.colors.accentGold,
    backgroundColor: '#FFF',
    marginBottom: 12,
  },
  brandTitle: {
    color: theme.colors.accentGold,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
  brandSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primaryMaroon,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textDark,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.textDark,
  },
  clearBtn: {
    padding: 6,
  },
  eyeBtn: {
    padding: 6,
  },
  loginButton: {
    backgroundColor: theme.colors.primaryMaroon,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  registerDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  registerHereButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accentGold,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  registerHereButtonText: {
    color: theme.colors.primaryMaroonDark,
    fontSize: 14,
    fontWeight: '800',
  },
});

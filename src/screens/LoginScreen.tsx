import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { theme } from '../styles/theme';

export const LoginScreen: React.FC<any> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Member Sign In</Text>
      <Text style={styles.subtitle}>Enter your verified organization credentials</Text>

      <TextInput
        style={styles.input}
        placeholder="Email or Mobile"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundLight, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: theme.colors.primaryMaroon, marginBottom: 8 },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 32 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: theme.colors.border, padding: 14, borderRadius: 10, marginBottom: 16, fontSize: 14 },
  button: { backgroundColor: theme.colors.primaryMaroon, padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});

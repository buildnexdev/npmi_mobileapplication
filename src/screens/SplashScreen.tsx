import React, { useEffect, useRef } from 'react';
import { View, Image, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { theme } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export const SplashScreen: React.FC<any> = ({ navigation }) => {
  const { token, isLoading } = useAuth();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.86)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (token) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Welcome');
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [isLoading, token, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        <Image
          source={require('../../assets/logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brand}>NMPI</Text>
        <Text style={styles.tagline}>Netaji Makkal Pathukappu Iyakkam</Text>
      </Animated.View>
      <Text style={styles.footer}>Member App</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primaryMaroon,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoWrap: {
    alignItems: 'center',
  },
  logo: {
    width: Math.min(width * 0.42, 160),
    height: Math.min(width * 0.42, 160),
    borderRadius: Math.min(width * 0.21, 80),
    borderWidth: 3,
    borderColor: theme.colors.accentGold,
    backgroundColor: '#FFF',
  },
  brand: {
    marginTop: 20,
    color: theme.colors.accentGold,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 3,
  },
  tagline: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 18,
    maxWidth: 280,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

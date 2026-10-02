import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { DigitalIdScreen } from '../screens/DigitalIdScreen';
import { QrScannerScreen } from '../screens/QrScannerScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { theme } from '../styles/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primaryMaroon },
        headerTintColor: '#FFF',
        tabBarActiveTintColor: theme.colors.accentGold,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { backgroundColor: theme.colors.primaryMaroonDark },
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="DigitalIDTab" component={DigitalIdScreen} options={{ title: 'Digital ID' }} />
      <Tab.Screen name="QRScanTab" component={QrScannerScreen} options={{ title: 'QR Scanner' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen name="DigitalID" component={DigitalIdScreen} />
    </Stack.Navigator>
  );
}

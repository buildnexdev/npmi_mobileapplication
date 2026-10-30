import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { ReelsScreen } from '../screens/ReelsScreen';
import { EventsScreen } from '../screens/EventsScreen';
import { DigitalIdScreen } from '../screens/DigitalIdScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SurveysScreen } from '../screens/SurveysScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { theme } from '../styles/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primaryMaroon },
        headerTintColor: '#FFF',
        headerTitleStyle: { fontWeight: '800' },
        tabBarActiveTintColor: theme.colors.accentGold,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.55)',
        tabBarStyle: {
          backgroundColor: theme.colors.primaryMaroonDark,
          borderTopColor: 'rgba(212, 175, 55, 0.2)',
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="FeedTab"
        component={FeedScreen}
        options={{
          title: 'Feed',
          headerTitle: 'Community Feed',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ReelsTab"
        component={ReelsScreen}
        options={{
          title: 'Reels',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="play-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsScreen}
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="DigitalIDTab"
        component={DigitalIdScreen}
        options={{
          title: 'ID Card',
          headerTitle: 'Digital ID',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="card" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="MainTabs"
        component={BottomTabs}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="Surveys"
        component={SurveysScreen}
        options={{
          headerShown: true,
          title: 'Surveys',
          headerStyle: { backgroundColor: theme.colors.primaryMaroon },
          headerTintColor: '#FFF',
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}

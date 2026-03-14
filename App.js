import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert } from 'react-native';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import FocusSessionScreen from './src/screens/FocusSessionScreen';
import RewardsScreen from './src/screens/RewardsScreen';
import SquadsScreen from './src/screens/SquadsScreen';
import ReflectionScreen from './src/screens/ReflectionScreen';
import InterventionScreen from './src/screens/InterventionScreen';
import SquadSessionScreen from './src/screens/SquadSessionScreen';
import Web3ProfileScreen from './src/screens/Web3ProfileScreen';
import QACommunityScreen from './src/screens/QACommunityScreen';

import DoomscrollingDetector from './src/native/DoomscrollingDetector';
import { colors } from './src/theme';
import { AlertProvider } from './src/context/AlertContext';
import { TokenProvider } from './src/context/TokenContext';

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: { fontSize: 11, fontWeight: 'bold', textTransform: 'none' },
        tabBarStyle: {
          backgroundColor: colors.white,
          elevation: 10,
          shadowColor: colors.shadow,
          paddingTop: 45, // Account for device status bar
          paddingBottom: 5,
        },
        tabBarIndicatorStyle: { backgroundColor: colors.accent, height: 4, borderRadius: 2 },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: '🧠 Hub' }}
      />
      <Tab.Screen 
        name="DAOs" 
        component={SquadsScreen} 
        options={{ tabBarLabel: '👥 Squads' }}
      />
      <Tab.Screen 
        name="Network" 
        component={QACommunityScreen} 
        options={{ tabBarLabel: '🌐 Forum' }}
      />
      <Tab.Screen 
        name="dApps" 
        component={RewardsScreen} 
        options={{ tabBarLabel: '🎁 Rewards' }}
      />
      <Tab.Screen 
        name="Identity" 
        component={Web3ProfileScreen} 
        options={{ tabBarLabel: '👻 Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // Request permissions (simulate)
    const setupServices = async () => {
      const granted = await DoomscrollingDetector.requestAndroidPermissions();
      if (!granted) {
        Alert.alert("Permissions needed", "We need accessibility permissions to detect doomscrolling patterns");
      }
    };
    setupServices();
  }, []);

  return (
    <TokenProvider>
      <AlertProvider>
        <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen 
            name="FocusSession" 
            component={FocusSessionScreen} 
            options={{ presentation: 'fullScreenModal' }}
          />
          <Stack.Screen 
            name="Vent" 
            component={ReflectionScreen} 
          />
          <Stack.Screen 
            name="InterventionScreen" 
            component={InterventionScreen} 
            options={{ presentation: 'fullScreenModal' }}
          />
          <Stack.Screen 
            name="SquadSession" 
            component={SquadSessionScreen} 
            options={{ presentation: 'fullScreenModal' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      </AlertProvider>
    </TokenProvider>
  );
}

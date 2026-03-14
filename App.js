import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert } from 'react-native';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import FocusSessionScreen from './src/screens/FocusSessionScreen';
import RewardsScreen from './src/screens/RewardsScreen';
import SquadsScreen from './src/screens/SquadsScreen';
import ReflectionScreen from './src/screens/ReflectionScreen';
import InterventionScreen from './src/screens/InterventionScreen';

import DoomscrollingDetector from './src/native/DoomscrollingDetector';
import { colors } from './src/theme';
import { AlertProvider } from './src/context/AlertContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: colors.shadow,
          height: 60,
          paddingBottom: 10,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarIcon: () => <></>, tabBarLabel: '🧠 Home' }}
      />
      <Tab.Screen 
        name="Squads" 
        component={SquadsScreen} 
        options={{ tabBarIcon: () => <></>, tabBarLabel: '👥 Squads' }}
      />
      <Tab.Screen 
        name="Rewards" 
        component={RewardsScreen} 
        options={{ tabBarIcon: () => <></>, tabBarLabel: '🎁 Rewards' }}
      />
      <Tab.Screen 
        name="Vent" 
        component={ReflectionScreen} 
        options={{ tabBarIcon: () => <></>, tabBarLabel: '☁️ Space' }}
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
            name="InterventionScreen" 
            component={InterventionScreen} 
            options={{ presentation: 'fullScreenModal' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AlertProvider>
  );
}

import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { View, Text } from 'react-native';

// Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SocialFeedScreen from '../screens/SocialFeedScreen';
import ExamArenaScreen from '../screens/ExamArenaScreen';
import BattleArenaScreen from '../screens/BattleArenaScreen';
import ChatScreen from '../screens/ChatScreen';
import FriendCenterScreen from '../screens/FriendCenterScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { COLORS } from '../constants/theme';

// Try different import methods
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.background,
            borderTopColor: COLORS.border,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarActiveTintColor: COLORS.arenaBlue,
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
          tabBarLabelStyle: {
            fontSize: 9,
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: 1,
          },
          tabBarIcon: ({ color, size, focused }) => {

            let iconName = 'view-dashboard';
            switch (route.name) {
              case 'Dashboard': iconName = 'view-dashboard'; break;
              case 'Battle': iconName = 'sword-cross'; break;
              case 'Social': iconName = 'chat'; break;
              case 'Friends': iconName = 'account-group'; break;
              case 'Profile': iconName = 'account-circle'; break;
              default: iconName = 'help-circle';
            }

            return (
              <MaterialCommunityIcons
                name={iconName}
                size={size}
                color={color}
              />
            );
          },
        };
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Battle" component={BattleArenaScreen} />
      <Tab.Screen name="Social" component={SocialFeedScreen} />
      <Tab.Screen name="Friends" component={FriendCenterScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showOnboarding && !isAuthenticated) {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  }

  if (!isAuthenticated) {
    return isRegistering ? (
      <RegisterScreen onSwitch={() => setIsRegistering(false)} />
    ) : (
      <LoginScreen onSwitch={() => setIsRegistering(true)} />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="ExamArena" component={ExamArenaScreen} />
        <Stack.Screen name="BattleArena" component={BattleArenaScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
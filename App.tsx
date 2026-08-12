import React, { useState, useEffect } from 'react';
import { StatusBar, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import mobileAds from 'react-native-google-mobile-ads';
import { loadConfig, clearConfig, AppConfig } from './src/utils/storage';
import { SetupScreen } from './src/screens/SetupScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { CalculatorScreen } from './src/screens/CalculatorScreen';
import { useInterstitialAd } from './src/hooks/useInterstitialAd';

const Tab = createBottomTabNavigator();

function TabIcon({ label, color }: { label: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{label}</Text>;
}

function MainApp({ config, onReset }: { config: AppConfig; onReset: () => void }) {
  const { showIfReady } = useInterstitialAd();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#0284c7',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: { borderTopColor: '#e2e8f0', paddingTop: 4, paddingBottom: 4, height: 56 },
        }}
        screenListeners={{
          tabPress: () => showIfReady(),
        }}
      >
        <Tab.Screen
          name="Countdown"
          options={{
            tabBarLabel: 'Countdown',
            tabBarIcon: ({ color }) => <TabIcon label="R" color={color} />,
          }}
        >
          {() => <DashboardScreen config={config} onReset={onReset} />}
        </Tab.Screen>
        <Tab.Screen
          name="Calendar"
          options={{
            tabBarLabel: 'Calendar',
            tabBarIcon: ({ color }) => <TabIcon label="C" color={color} />,
          }}
        >
          {() => <CalendarScreen config={config} />}
        </Tab.Screen>
        <Tab.Screen
          name="Million"
          options={{
            tabBarLabel: '$1M',
            tabBarIcon: ({ color }) => <TabIcon label="$" color={color} />,
          }}
          component={CalculatorScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => {});

    loadConfig().then(cfg => {
      setConfig(cfg);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  if (!config) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <SetupScreen onComplete={setConfig} />
      </SafeAreaProvider>
    );
  }

  const handleReset = async () => {
    await clearConfig();
    setConfig(null);
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <MainApp config={config} onReset={handleReset} />
    </SafeAreaProvider>
  );
}

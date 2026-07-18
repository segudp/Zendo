import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#00E676',
        tabBarInactiveTintColor: '#A0A0A0',
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopWidth: 1,
          borderTopColor: '#2C2C2E',
          height: 65,
          paddingBottom: 10,
        },
        headerStyle: {
          backgroundColor: '#1E1E1E',
          shadowOpacity: 0,
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#2C2C2E'
        },
        headerTitleStyle: {
          color: '#FFFFFF',
          fontWeight: '900',
        }
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'ESTADO',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 28, height: 28, backgroundColor: color, borderRadius: 14 }} />
          )
        }} 
      />
      <Tabs.Screen 
        name="active-trip" 
        options={{ 
          title: 'VIAJE ACTIVO',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 28, height: 28, backgroundColor: color, borderRadius: 4 }} />
          )
        }} 
      />
      <Tabs.Screen 
        name="history" 
        options={{ 
          title: 'GANANCIAS',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: color }} />
          )
        }} 
      />
    </Tabs>
  );
}

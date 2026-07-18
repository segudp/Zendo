import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#FF4B3A',
        tabBarInactiveTintColor: '#8A8A8F',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F5F5F8',
          height: 60,
          paddingBottom: 10,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTitleStyle: {
          color: '#2D2D2D',
          fontWeight: 'bold',
        }
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Explorar',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 12 }} />
          )
        }} 
      />
      <Tabs.Screen 
        name="orders" 
        options={{ 
          title: 'Pedidos',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 4 }} />
          )
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: color }} />
          )
        }} 
      />
    </Tabs>
  );
}

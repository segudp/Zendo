import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { apiClient } from '../../src/api/client';
import { CommerceCard } from '../../src/components/CommerceCard';

export default function HomeFeedScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [commerces, setCommerces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos tu ubicación para mostrarte comercios cercanos.');
        setLoading(false);
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        fetchCommerces(currentLocation.coords.latitude, currentLocation.coords.longitude);
      } catch (error) {
        Alert.alert('Error', 'No pudimos obtener tu ubicación.');
        setLoading(false);
      }
    })();
  }, []);

  const fetchCommerces = async (lat: number, lng: number) => {
    try {
      const response = await apiClient.get(`/catalog/commerces?lat=${lat}&lng=${lng}&radius=5000`);
      setCommerces(response.data);
    } catch (error) {
      console.error('Error fetching commerces:', error);
      Alert.alert('Error', 'No pudimos cargar los comercios cercanos.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#FF4B3A" />
        <Text className="text-textSecondary mt-4">Buscando comercios cercanos...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background px-4 pt-4">
      <FlatList
        data={commerces}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CommerceCard commerce={item} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-textSecondary text-lg text-center">
              No encontramos comercios en tu zona.{'\n'}¡Intenta más tarde!
            </Text>
          </View>
        }
      />
    </View>
  );
}

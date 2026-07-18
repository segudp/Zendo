import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { apiClient } from '../../src/api/client';

export default function ActiveTripScreen() {
  const [activeOrder, setActiveOrder] = useState<any>(null);

  useEffect(() => {
    // Polling simple o cargar al montar para ver si hay viaje
    // Idealmente, se integra en Zustand la orden activa, pero para demo:
    const fetchActiveOrder = async () => {
      try {
        const response = await apiClient.get('/logistics/driver/active-order');
        setActiveOrder(response.data);
      } catch (e) {
        // No hay orden activa
      }
    };
    fetchActiveOrder();
  }, []);

  const openNavigation = (lat: number, lng: number) => {
    // google.navigation:q=lat,lng delega a Google Maps en Android, 
    // en iOS puede abrir Apple Maps u otro usando geo: o url scheme universal.
    const url = `google.navigation:q=${lat},${lng}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          // Fallback universal web
          Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => Alert.alert('Error', 'No pudimos abrir la navegación.'));
  };

  if (!activeOrder) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-textSecondary text-xl font-bold">No tienes viajes activos.</Text>
      </View>
    );
  }

  // Determinar el destino (Si va al comercio o al cliente)
  const isGoingToCommerce = activeOrder.status === 'DRIVER_ASSIGNED';
  const destinationLat = isGoingToCommerce ? activeOrder.commerceLocation.lat : activeOrder.dropoffLocation.lat;
  const destinationLng = isGoingToCommerce ? activeOrder.commerceLocation.lng : activeOrder.dropoffLocation.lng;
  const destinationLabel = isGoingToCommerce ? 'Hacia el Comercio' : 'Hacia el Cliente';

  return (
    <View className="flex-1 bg-background px-6 pt-6">
      <Text className="text-primary font-black text-2xl mb-6">VIAJE EN CURSO</Text>

      <View className="bg-surface p-6 rounded-3xl border border-[#2C2C2E] mb-6">
        <Text className="text-textSecondary font-bold text-sm uppercase mb-1">Destino Actual</Text>
        <Text className="text-textPrimary text-xl font-black mb-6">{destinationLabel}</Text>
        
        <Text className="text-textSecondary font-bold text-sm uppercase mb-1">Dirección</Text>
        <Text className="text-textPrimary text-lg font-semibold mb-8">
          {isGoingToCommerce ? activeOrder.commerceAddress : activeOrder.dropoffAddress}
        </Text>

        <TouchableOpacity 
          className="bg-primary rounded-2xl py-6 items-center shadow-[0_0_15px_rgba(0,230,118,0.3)]"
          onPress={() => openNavigation(destinationLat, destinationLng)}
        >
          <Text className="text-background font-black text-2xl uppercase tracking-wider">
            NAVEGAR CON GPS
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

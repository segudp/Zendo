import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import MapView, { Marker, AnimatedRegion } from 'react-native-maps';
import { useSocket } from '../../../src/hooks/useSocket';
import { apiClient } from '../../../src/api/client';

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams();
  const { socket, isConnected } = useSocket(`order_${id}`);
  
  const [order, setOrder] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<AnimatedRegion | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    // 1. Obtener datos iniciales del pedido (ubicación del cliente y comercio)
    const fetchOrder = async () => {
      try {
        const response = await apiClient.get(`/orders/${id}`);
        setOrder(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    // 2. Escuchar cambios de estado del pedido
    socket.on('order.status.updated', (data: { orderId: string, newStatus: string }) => {
      if (data.orderId === id) {
        setOrder((prev: any) => ({ ...prev, status: data.newStatus }));
      }
    });

    // 3. Escuchar ubicación del repartidor (sin guardar en Zustand/Redux para no re-renderizar todo)
    socket.on('driver.location.updated', (data: { lat: number, lng: number }) => {
      const newCoordinate = { latitude: data.lat, longitude: data.lng };
      
      if (driverLocation) {
        // Animación fluida hacia la nueva ubicación
        driverLocation.timing({
          latitude: data.lat,
          longitude: data.lng,
          duration: 1000,
          useNativeDriver: false
        }).start();
      } else {
        setDriverLocation(new AnimatedRegion({
          latitude: data.lat,
          longitude: data.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }));
      }

      // Centrar el mapa si es necesario (opcional)
      // mapRef.current?.animateCamera({ center: newCoordinate });
    });

    return () => {
      socket.off('order.status.updated');
      socket.off('driver.location.updated');
    };
  }, [socket, driverLocation, id]);

  if (!order) return <View className="flex-1 bg-background" />;

  const getStatusText = (status: string) => {
    const states: any = {
      PENDING: 'Esperando al comercio...',
      ACCEPTED: 'Comercio aceptó el pedido',
      PREPARING: 'Preparando tu comida',
      READY: 'Buscando repartidor',
      DRIVER_ASSIGNED: 'Repartidor en camino al local',
      PICKED_UP: 'Tu pedido está en camino',
      DELIVERED: 'Entregado'
    };
    return states[status] || status;
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1">
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: -34.6037, // TODO: Usar ubicación del comercio o cliente
            longitude: -58.3816,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {/* Marcador del destino (Cliente) */}
          <Marker 
            coordinate={{ latitude: -34.6037, longitude: -58.3816 }}
            title="Tu ubicación"
            pinColor="#2D2D2D"
          />

          {/* Marcador del Repartidor (Animado) */}
          {driverLocation && (
            <Marker.Animated
              coordinate={driverLocation as any}
              title="Repartidor"
              pinColor="#FF4B3A"
            />
          )}
        </MapView>
      </View>

      {/* Panel inferior de estado */}
      <View className="bg-surface rounded-t-3xl p-6 shadow-[0_-10px_20px_rgba(0,0,0,0.1)] absolute bottom-0 w-full min-h-[200px]">
        <View className="items-center mb-4">
          <View className="w-12 h-1 bg-gray-200 rounded-full mb-4" />
          <Text className="text-textSecondary font-semibold">Estado del pedido</Text>
          <Text className="text-textPrimary font-bold text-2xl mt-1 text-center">
            {getStatusText(order.status)}
          </Text>
        </View>

        <View className="flex-row items-center justify-center mb-6">
          <View className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <Text className="text-textSecondary text-xs ml-2">
            {isConnected ? 'Conexión en tiempo real activa' : 'Reconectando...'}
          </Text>
        </View>
      </View>
    </View>
  );
}

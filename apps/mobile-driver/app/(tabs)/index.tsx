import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useDriverStore } from '../../src/store/useDriverStore';
import { useDriverSocket } from '../../src/hooks/useDriverSocket';
import { OrderOfferModal } from '../../src/components/OrderOfferModal';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { LOCATION_TASK_NAME } from '../../src/background/locationTask';

export default function HomeScreen() {
  const { isOnline, toggleStatus } = useDriverStore();
  const socket = useDriverSocket();
  const [offer, setOffer] = useState<any>(null);

  // Escuchar ofertas de pedidos vía Socket
  useEffect(() => {
    if (!socket) return;
    
    socket.on('order.offer', (data: any) => {
      setOffer(data); // Mostrar el modal
    });

    return () => {
      socket.off('order.offer');
    };
  }, [socket]);

  const handleToggle = async () => {
    if (!isOnline) {
      // PRE-PERMISSIONS UX LOGIC
      Alert.alert(
        'Permisos de Ubicación Necesarios',
        'Necesitamos acceder a tu ubicación "Todo el tiempo" (incluso en segundo plano) para poder asignarte pedidos cercanos de manera eficiente y mostrarle al cliente por dónde vas cuando tienes la pantalla apagada.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Entendido', onPress: requestPermissions }
        ]
      );
    } else {
      // Pasar a Offline
      toggleStatus();
      Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
  };

  const requestPermissions = async () => {
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus === 'granted') {
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus === 'granted') {
        // Iniciar tracking y cambiar estado
        toggleStatus();
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10,
          showsBackgroundLocationIndicator: true,
          deferredUpdatesInterval: 10000 // Cada 10s
        });
      } else {
        Alert.alert('Atención', 'Necesitamos acceso en segundo plano para poder operar.');
      }
    }
  };

  return (
    <View className="flex-1 bg-background justify-center items-center px-4">
      <View className={`w-64 h-64 rounded-full justify-center items-center shadow-[0_0_50px_rgba(0,230,118,0.2)] border-8 ${isOnline ? 'border-primary shadow-primary/50' : 'border-surface'}`}>
        <TouchableOpacity 
          className={`w-48 h-48 rounded-full justify-center items-center ${isOnline ? 'bg-primary' : 'bg-surface'}`}
          onPress={handleToggle}
          activeOpacity={0.8}
        >
          <Text className={`font-black text-4xl ${isOnline ? 'text-background' : 'text-textSecondary'}`}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-textSecondary text-lg font-bold text-center mt-10">
        {isOnline 
          ? 'Conectado al sistema.\nEsperando pedidos...' 
          : 'Desconectado.\nNo recibirás pedidos.'}
      </Text>

      {/* MODAL INVASIVO DE OFERTA */}
      {offer && (
        <OrderOfferModal 
          offer={offer} 
          onClose={() => setOffer(null)} 
        />
      )}
    </View>
  );
}

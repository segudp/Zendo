import { View, Text, TouchableOpacity, Alert, StyleSheet, Modal } from 'react-native';
import { useState } from 'react';
import { apiClient } from '../api/client';
import { useRouter } from 'expo-router';

interface OfferProps {
  offer: {
    orderId: string;
    pickup: string;
    dropoff: string;
    fee: number;
    commerceName: string;
    distance: number;
  };
  onClose: () => void;
}

// TODO: sonido de alerta al recibir una oferta. Pendiente de definir la librería
// de audio a usar (expo-av está deprecado en SDKs recientes; ver expo-audio) y
// de agregar el asset en apps/mobile-driver/assets/alert.mp3.
export function OrderOfferModal({ offer, onClose }: OfferProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const acceptOrder = async () => {
    setLoading(true);
    try {
      await apiClient.patch(`/orders/${offer.orderId}/claim`);
      // Ganó la race condition
      Alert.alert('¡Pedido Aceptado!', 'Ve hacia el comercio.');
      onClose();
      router.replace('/(tabs)/active-trip');
    } catch (error: unknown) {
      console.error('Error accepting order:', error);
      if ((error as any).response?.status === 409) {
        Alert.alert('Demasiado tarde', 'Otro repartidor tomó este pedido.');
      } else {
        Alert.alert('Error', 'Hubo un problema al aceptar el pedido.');
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide">
      <View className="flex-1 bg-black/80 justify-end">
        <View className="bg-surface rounded-t-3xl p-6 h-2/3 border-t-4 border-primary">
          <Text className="text-primary font-black text-3xl mb-2 text-center uppercase tracking-widest">
            ¡NUEVO VIAJE!
          </Text>
          
          <View className="bg-[#2C2C2E] p-6 rounded-2xl my-6 items-center">
            <Text className="text-textSecondary font-bold text-sm uppercase mb-1">Ganancia Estimada</Text>
            <Text className="text-primary font-black text-6xl">${offer.fee}</Text>
          </View>

          <View className="mb-8 flex-1">
            <View className="mb-4 flex-row items-center">
              <View className="w-4 h-4 rounded-full bg-primary mr-3" />
              <View>
                <Text className="text-textSecondary text-xs uppercase font-bold">Retiro (Comercio)</Text>
                <Text className="text-textPrimary text-lg font-bold">{offer.commerceName}</Text>
              </View>
            </View>
            <View className="w-1 h-8 bg-gray-600 ml-1.5 -my-2" />
            <View className="mt-4 flex-row items-center">
              <View className="w-4 h-4 rounded-full bg-white mr-3 border-4 border-[#2C2C2E]" />
              <View>
                <Text className="text-textSecondary text-xs uppercase font-bold">Entrega al Cliente</Text>
                <Text className="text-textPrimary text-lg font-bold">{offer.dropoff}</Text>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between pb-6">
            <TouchableOpacity 
              className="bg-[#2C2C2E] rounded-2xl py-6 flex-1 mr-3 items-center"
              onPress={onClose}
              disabled={loading}
            >
              <Text className="text-danger font-black text-lg">RECHAZAR</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-primary rounded-2xl py-6 flex-1 ml-3 items-center shadow-[0_0_15px_rgba(0,230,118,0.3)]"
              onPress={acceptOrder}
              disabled={loading}
            >
              <Text className="text-background font-black text-lg">
                {loading ? 'PROCESANDO...' : 'ACEPTAR'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

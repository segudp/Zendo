import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../src/store/useCartStore';
import { apiClient } from '../../src/api/client';
import { useState } from 'react';

export default function CheckoutScreen() {
  const { items, getTotal, clearCart, commerceId } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const subtotal = getTotal();
  const deliveryFee = 2.50; // TODO: Calculate based on PostGIS distance in backend
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setLoading(true);
    try {
      const payload = {
        commerceId,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        dropoffAddress: "Mi Casa", // TODO: Obtener del perfil/mapa
        dropoffLocation: { lat: -34.6037, lng: -58.3816 } // TODO: Obtener ubicación real
      };

      const response = await apiClient.post('/orders', payload);
      const newOrder = response.data;
      
      clearCart();
      router.replace(`/order/tracking/${newOrder.id}`);
    } catch (error) {
      Alert.alert('Error', 'No pudimos procesar tu pedido. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-bold text-textPrimary mb-6">Tu Pedido</Text>
        
        <View className="bg-surface rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
          {items.map((item) => (
            <View key={item.productId} className="flex-row justify-between mb-4 border-b border-gray-50 pb-2">
              <View className="flex-row items-center">
                <Text className="text-primary font-bold mr-2">{item.quantity}x</Text>
                <Text className="text-textPrimary">{item.name}</Text>
              </View>
              <Text className="text-textPrimary font-semibold">
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View className="bg-surface rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
          <View className="flex-row justify-between mb-2">
            <Text className="text-textSecondary">Subtotal</Text>
            <Text className="text-textPrimary">${subtotal.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-4 border-b border-gray-50 pb-4">
            <Text className="text-textSecondary">Costo de envío</Text>
            <Text className="text-textPrimary">${deliveryFee.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-textPrimary font-bold text-lg">Total</Text>
            <Text className="text-primary font-bold text-lg">${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View className="p-4 bg-surface border-t border-gray-100 pb-8">
        <TouchableOpacity 
          className="bg-primary rounded-xl py-4 items-center flex-row justify-center"
          onPress={handleCheckout}
          disabled={loading || items.length === 0}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" className="mr-2" />
          ) : null}
          <Text className="text-surface font-bold text-lg">
            {loading ? 'Procesando...' : 'Confirmar Pedido'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

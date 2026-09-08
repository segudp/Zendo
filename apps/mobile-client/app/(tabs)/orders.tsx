import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { apiClient } from '../../src/api/client';

interface OrderSummary {
  id: string;
  status: string;
  totalAmount: string | number;
  createdAt: string;
  commerce: { id: string; name: string; logoUrl?: string | null };
}

const STATUS_LABELS: Record<string, string> = {
  PAYMENT_PENDING: 'Pago pendiente',
  PENDING: 'Esperando confirmación',
  ACCEPTED: 'Aceptado',
  PREPARING: 'En preparación',
  READY: 'Listo para retirar',
  DRIVER_ASSIGNED: 'Repartidor asignado',
  PICKED_UP: 'En camino',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await apiClient.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#FF4B3A" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background px-4 pt-4">
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isActive = !['DELIVERED', 'CANCELLED'].includes(item.status);
          return (
            <TouchableOpacity
              className="bg-surface p-4 rounded-xl border border-gray-100 mb-3"
              onPress={() => isActive && router.push(`/order/tracking/${item.id}`)}
            >
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-textPrimary font-bold text-base">{item.commerce?.name}</Text>
                <Text className="text-primary font-bold">${Number(item.totalAmount).toFixed(2)}</Text>
              </View>
              <Text className="text-textSecondary text-sm">
                {STATUS_LABELS[item.status] || item.status}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View className="mt-20 items-center">
            <Text className="text-textSecondary text-lg text-center">
              Todavía no hiciste ningún pedido.
            </Text>
          </View>
        }
      />
    </View>
  );
}

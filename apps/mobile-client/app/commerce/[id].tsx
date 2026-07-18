import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { apiClient } from '../../src/api/client';
import { useCartStore } from '../../src/store/useCartStore';

export default function CommerceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, items } = useCartStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get(`/catalog/commerces/${id}/products`);
        setProducts(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [id]);

  const handleAddToCart = (product: any) => {
    addItem(id as string, {
      productId: product.id,
      name: product.name,
      price: Number(product.price),
    });
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View className="bg-surface p-4 border-b border-gray-100 flex-row justify-between items-center">
      <View className="flex-1 mr-4">
        <Text className="text-textPrimary font-bold text-lg mb-1">{item.name}</Text>
        <Text className="text-textSecondary text-sm mb-2" numberOfLines={2}>{item.description}</Text>
        <Text className="text-primary font-bold">${item.price}</Text>
      </View>
      <TouchableOpacity 
        className="bg-primary/10 px-4 py-2 rounded-lg"
        onPress={() => handleAddToCart(item)}
      >
        <Text className="text-primary font-bold">+ Agregar</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#FF4B3A" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      
      {items.length > 0 && (
        <View className="absolute bottom-6 left-4 right-4">
          <TouchableOpacity 
            className="bg-primary p-4 rounded-xl flex-row justify-between items-center shadow-md"
            onPress={() => router.push('/checkout')}
          >
            <View className="bg-white/20 px-3 py-1 rounded-full">
              <Text className="text-surface font-bold">{items.length}</Text>
            </View>
            <Text className="text-surface font-bold text-lg">Ver Carrito</Text>
            <Text className="text-surface font-bold text-lg">
              ${items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

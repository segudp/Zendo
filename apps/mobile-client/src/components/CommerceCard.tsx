import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

interface CommerceProps {
  commerce: {
    id: string;
    name: string;
    description: string;
    logoUrl?: string;
    distance?: number; // en metros
  }
}

export function CommerceCard({ commerce }: CommerceProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/commerce/${commerce.id}`);
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={handlePress}
      className="bg-surface rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex-row items-center"
    >
      <View className="w-20 h-20 bg-gray-100 rounded-lg mr-4 overflow-hidden">
        {commerce.logoUrl ? (
          <Image source={{ uri: commerce.logoUrl }} className="w-full h-full" />
        ) : (
          <View className="w-full h-full justify-center items-center bg-primary/10">
            <Text className="text-primary font-bold text-xl">{commerce.name.charAt(0)}</Text>
          </View>
        )}
      </View>
      <View className="flex-1">
        <Text className="text-textPrimary font-bold text-lg mb-1">{commerce.name}</Text>
        <Text className="text-textSecondary text-sm mb-2" numberOfLines={2}>
          {commerce.description || 'Sin descripción'}
        </Text>
        {commerce.distance !== undefined && (
          <View className="flex-row items-center">
            <Text className="text-primary font-semibold text-xs">
              {(commerce.distance / 1000).toFixed(1)} km
            </Text>
            <Text className="text-textSecondary text-xs mx-1">•</Text>
            <Text className="text-textSecondary text-xs">15-20 min</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

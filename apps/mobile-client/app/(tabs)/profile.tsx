import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que querés salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View className="flex-1 bg-background px-6 pt-8">
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-primary/10 justify-center items-center mb-4">
          <Text className="text-primary font-bold text-3xl">{user?.firstName?.[0] ?? '?'}</Text>
        </View>
        <Text className="text-textPrimary font-bold text-xl">
          {user?.firstName} {user?.lastName}
        </Text>
        <Text className="text-textSecondary">{user?.email}</Text>
      </View>

      <TouchableOpacity
        className="bg-surface border border-red-200 rounded-xl py-4 items-center"
        onPress={handleLogout}
      >
        <Text className="text-red-600 font-bold text-base">Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

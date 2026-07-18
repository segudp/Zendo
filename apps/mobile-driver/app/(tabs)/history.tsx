import { View, Text } from 'react-native';

export default function HistoryScreen() {
  return (
    <View className="flex-1 bg-background justify-center items-center">
      <Text className="text-textSecondary font-bold text-xl uppercase tracking-widest">
        Historial de Ganancias
      </Text>
      <Text className="text-textSecondary mt-2">
        Próximamente...
      </Text>
    </View>
  );
}

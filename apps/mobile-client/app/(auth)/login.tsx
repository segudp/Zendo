import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useAuthStore } from '../../src/store/useAuthStore';
import { apiClient } from '../../src/api/client';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }
    
    setLoading(true);
    try {
      // Consumo del endpoint POST /api/v1/auth/login/email
      const response = await apiClient.post('/auth/login/email', { email, password });
      const { user, accessToken } = response.data;
      
      // Guardar en Zustand + expo-secure-store
      await login(user, accessToken);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al iniciar sesión';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background justify-center px-6">
      <View className="mb-10 items-center">
        <Text className="text-4xl font-bold text-primary mb-2">Zendo</Text>
        <Text className="text-textSecondary text-lg text-center">Delivery rápido, donde estés.</Text>
      </View>

      <View className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
        <Text className="text-textPrimary font-semibold mb-2">Correo electrónico</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-textPrimary"
          placeholder="tu@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text className="text-textPrimary font-semibold mb-2">Contraseña</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-textPrimary"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity 
          className="bg-primary rounded-xl py-4 items-center"
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-surface font-bold text-lg">{loading ? 'Cargando...' : 'Ingresar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

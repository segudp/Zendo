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
      Alert.alert('Atención', 'Ingresa email y contraseña');
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login/email', { email, password });
      const { user, accessToken } = response.data;
      
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
      <View className="mb-12 items-center">
        <Text className="text-5xl font-black text-primary mb-2">Zendo</Text>
        <Text className="text-textSecondary text-xl font-bold">DRIVER APP</Text>
      </View>

      <View className="bg-surface p-6 rounded-3xl">
        <Text className="text-textSecondary font-bold mb-2 uppercase text-xs">Correo electrónico</Text>
        <TextInput
          className="bg-[#2C2C2E] rounded-xl p-5 mb-6 text-textPrimary text-lg font-semibold"
          placeholder="tu@email.com"
          placeholderTextColor="#A0A0A0"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text className="text-textSecondary font-bold mb-2 uppercase text-xs">Contraseña</Text>
        <TextInput
          className="bg-[#2C2C2E] rounded-xl p-5 mb-10 text-textPrimary text-lg font-semibold"
          placeholder="••••••••"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity 
          className="bg-primary rounded-2xl py-5 items-center shadow-[0_0_15px_rgba(0,230,118,0.3)]"
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-background font-black text-xl">{loading ? 'CONECTANDO...' : 'INGRESAR'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

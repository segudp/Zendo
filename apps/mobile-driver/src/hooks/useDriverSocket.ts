import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { useDriverStore } from '../store/useDriverStore';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'http://192.168.1.100:3000';

export function useDriverSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { isOnline } = useDriverStore();

  useEffect(() => {
    let socketInstance: Socket | null = null;

    const connectSocket = async () => {
      if (!isOnline) {
        if (socketInstance) socketInstance.disconnect();
        return;
      }

      const token = await SecureStore.getItemAsync('jwt_token');
      
      socketInstance = io(WS_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity
      });

      socketInstance.on('connect', () => {
        console.log('Driver Socket Connected');
        socketInstance?.emit('driver_online');
      });

      socketInstance.on('disconnect', () => {
        console.log('Driver Socket Disconnected');
      });

      setSocket(socketInstance);
    };

    connectSocket();

    return () => {
      if (socketInstance) {
        socketInstance.emit('driver_offline');
        socketInstance.disconnect();
      }
    };
  }, [isOnline]);

  return socket;
}

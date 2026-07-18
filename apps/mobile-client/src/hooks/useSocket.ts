import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'http://192.168.1.100:3000';

export function useSocket(roomId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let socketInstance: Socket;

    const connectSocket = async () => {
      const token = await SecureStore.getItemAsync('jwt_token');
      
      socketInstance = io(WS_URL, {
        auth: {
          token
        },
        transports: ['websocket'],
      });

      socketInstance.on('connect', () => {
        setIsConnected(true);
        // Unirse a la sala específica del pedido
        socketInstance.emit('joinRoom', roomId);
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });

      setSocket(socketInstance);
    };

    connectSocket();

    return () => {
      if (socketInstance) {
        socketInstance.emit('leaveRoom', roomId);
        socketInstance.disconnect();
      }
    };
  }, [roomId]);

  return { socket, isConnected };
}

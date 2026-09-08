"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/useAuthStore";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const token = useAuthStore((state) => state.token);
  const commerceId = useAuthStore((state) => state.user?.commerce?.id);

  useEffect(() => {
    if (!token) return;

    // Conectar a Socket.IO enviando el token
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:3000";

    const instance = io(baseUrl, {
      auth: { token },
      // El gateway une a la sala `commerce_{id}` en el handshake para los dueños de comercio
      query: commerceId ? { commerceId } : undefined,
      transports: ["websocket"],
    });

    instance.on("connect", () => {
      console.log("🟢 Conectado al Gateway de WebSockets");
    });

    instance.on("disconnect", () => {
      console.log("🔴 Desconectado del Gateway");
    });

    // Conexión a un sistema externo (patrón documentado por React para efectos de
    // suscripción): el socket vive fuera de React, esto sólo expone su instancia.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(instance);

    return () => {
      instance.disconnect();
      setSocket(null);
    };
  }, [token, commerceId]);

  return { socket };
}

"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { useSocket } from "@/hooks/useSocket";
import { Order, OrderStatus } from "@/types/api";

export default function OrdersKanbanPage() {
  const token = useAuthStore((state) => state.token);
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

  // Fetch initial orders
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error fetching orders");
      return res.json();
    },
  });

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (data: { orderData: Order }) => {
      console.log("Nueva orden recibida:", data);
      queryClient.setQueryData(["orders"], (old: Order[] = []) => [data.orderData, ...old]);
      // Aquí se podría lanzar un sonido (beep) de alerta visual/sonora
    };

    const handleStatusUpdated = (data: { orderId: string; newStatus: OrderStatus }) => {
      console.log("Estado actualizado:", data);
      queryClient.setQueryData(["orders"], (old: Order[] = []) =>
        old.map((order) =>
          order.id === data.orderId ? { ...order, status: data.newStatus } : order
        )
      );
    };

    socket.on("new.order.received", handleNewOrder);
    socket.on("order.status.updated", handleStatusUpdated);

    return () => {
      socket.off("new.order.received", handleNewOrder);
      socket.off("order.status.updated", handleStatusUpdated);
    };
  }, [socket, queryClient]);

  const columns: { title: string; states: OrderStatus[] }[] = [
    { title: "NUEVOS", states: ["PAYMENT_PENDING", "PENDING"] },
    { title: "EN PREPARACIÓN", states: ["ACCEPTED", "PREPARING"] },
    { title: "LISTOS", states: ["READY"] },
    { title: "EN CAMINO", states: ["DRIVER_ASSIGNED", "PICKED_UP"] },
  ];

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-[600px] rounded-xl"></div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Kanban de Pedidos en Tiempo Real</h1>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium text-gray-600">Conectado</span>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {columns.map((column) => (
          <div key={column.title} className="flex-1 min-w-[300px] bg-gray-100 rounded-xl p-4 flex flex-col">
            <h2 className="text-sm font-bold text-gray-600 mb-4 tracking-wider">{column.title}</h2>
            <div className="space-y-3 overflow-y-auto flex-1">
              {orders
                .filter((order) => column.states.includes(order.status))
                .map((order) => (
                  <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-900">#{order.id.slice(0, 6)}</span>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 font-medium">
                      Total: ${Number(order.totalAmount).toFixed(2)}
                    </p>
                    <div className="text-xs text-gray-500">
                      {order.items?.length || 0} ítems
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

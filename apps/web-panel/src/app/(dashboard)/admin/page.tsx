"use client";

import { useQuery } from "@tanstack/react-query";
import { Store, ShoppingBag, Users, Bike } from "lucide-react";

// Endpoints ficticios sugeridos en el plan
interface DashboardStats {
  totalOrdersToday: number;
  activeCommerces: number;
  onlineDrivers: number;
  totalUsers: number;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["admin_stats"],
    queryFn: async () => {
      // Mocked endpoint response
      return {
        totalOrdersToday: 142,
        activeCommerces: 35,
        onlineDrivers: 18,
        totalUsers: 1042,
      };
    },
  });

  const cards = [
    { label: "Pedidos Hoy", value: stats?.totalOrdersToday, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Comercios Activos", value: stats?.activeCommerces, icon: Store, color: "text-green-600", bg: "bg-green-100" },
    { label: "Repartidores Online", value: stats?.onlineDrivers, icon: Bike, color: "text-orange-600", bg: "bg-orange-100" },
    { label: "Usuarios Totales", value: stats?.totalUsers, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Vista Global</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className={`p-4 rounded-full ${card.bg} ${card.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Actividad Reciente</h2>
        <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          Gráfico de métricas en desarrollo...
        </div>
      </div>
    </div>
  );
}

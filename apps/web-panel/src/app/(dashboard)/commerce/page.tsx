"use client";

import Link from "next/link";
import { ShoppingBag, Package, Settings } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function CommerceDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const shortcuts = [
    { href: "/commerce/orders", label: "Kanban de Pedidos", description: "Ver y gestionar pedidos en tiempo real", icon: ShoppingBag },
    { href: "/commerce/products", label: "Mi Catálogo", description: "Administrar productos y precios", icon: Package },
    { href: "/commerce/settings", label: "Configuración", description: "Datos del comercio, horarios y estado", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hola{user?.firstName ? `, ${user.firstName}` : ""} 👋
        </h1>
        <p className="text-gray-500 mt-1">Este es el panel de tu comercio en Zendo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
            >
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 w-fit">
                <Icon size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{item.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard,
  Store,
  Users,
  Bike,
  Package,
  ShoppingBag,
  Settings,
  CreditCard,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const userRole = useAuthStore((state) => state.user?.role);

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/commerces", label: "Comercios", icon: Store },
    { href: "/admin/users", label: "Usuarios", icon: Users },
    { href: "/admin/drivers", label: "Repartidores", icon: Bike },
    { href: "/admin/finances", label: "Finanzas", icon: CreditCard },
  ];

  const commerceLinks = [
    { href: "/commerce", label: "Dashboard", icon: LayoutDashboard },
    { href: "/commerce/orders", label: "Kanban Pedidos", icon: ShoppingBag },
    { href: "/commerce/products", label: "Mi Catálogo", icon: Package },
    { href: "/commerce/settings", label: "Configuración", icon: Settings },
  ];

  const links = userRole === "SUPER_ADMIN" ? adminLinks : commerceLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] sticky top-16 hidden md:block">
      <nav className="p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon size={20} className={isActive ? "text-blue-700" : "text-gray-400"} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

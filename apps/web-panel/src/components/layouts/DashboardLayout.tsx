"use client";

import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const isAuth = useAuthStore((state) => state.isAuthenticated());
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Guard de hidratación: el estado de auth persiste en localStorage y sólo existe
    // en el cliente, así que la primera pasada de render en el servidor no lo conoce.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (!isAuth) {
      router.push("/login");
    }
  }, [isAuth, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

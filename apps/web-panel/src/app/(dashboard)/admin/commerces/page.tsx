"use client";

import { useQuery } from "@tanstack/react-query";
import { Commerce } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Table, TableHeader, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";

export default function AdminCommercesPage() {
  const token = useAuthStore((state) => state.token);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

  const { data: commerces = [], isLoading } = useQuery<Commerce[]>({
    queryKey: ["admin_commerces"],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/catalog/commerces`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error fetching commerces");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Comercios</h1>
        <Button>Alta de Comercio</Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse bg-gray-200 h-64 rounded-xl"></div>
      ) : (
        <Table>
          <TableHeader>
            <TableHead>Nombre</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Abierto</TableHead>
            <TableHead>Acciones</TableHead>
          </TableHeader>
          <tbody>
            {commerces.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  No hay comercios registrados.
                </TableCell>
              </TableRow>
            ) : (
              commerces.map((commerce) => (
                <TableRow key={commerce.id}>
                  <TableCell className="font-medium text-gray-900">{commerce.name}</TableCell>
                  <TableCell className="text-gray-500">{commerce.address}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        commerce.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {commerce.isActive ? "Activo" : "Suspendido"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        commerce.isOpen ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {commerce.isOpen ? "Abierto" : "Cerrado"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm">Editar</Button>
                      <Button variant="danger" size="sm">Suspender</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
}

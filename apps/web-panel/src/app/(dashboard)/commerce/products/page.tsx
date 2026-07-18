"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Table, TableHeader, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

export default function ProductsPage() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [isModalOpen, setModalOpen] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

  // Fetch Products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      // Usamos el ID del comercio (aunque en el backend real esto podría sacarse del token)
      // Como estamos mockeando o asumiendo el contrato:
      const res = await fetch(`${baseUrl}/catalog/commerces/me/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error fetching products");
      return res.json();
    },
  });

  // Solo como un ejemplo visual (mock), definimos una tabla simple
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mi Catálogo</h1>
        <Button onClick={() => setModalOpen(true)}>Nuevo Producto</Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse bg-gray-200 h-64 rounded-xl"></div>
      ) : (
        <Table>
          <TableHeader>
            <TableHead>Nombre</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableHeader>
          <tbody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                  No hay productos disponibles.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium text-gray-900">{product.name}</TableCell>
                  <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        product.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.isAvailable ? "Disponible" : "Agotado"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Editar</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Modal de Creación */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Crear Producto">
        <div className="space-y-4">
          <Input label="Nombre del Producto" placeholder="Ej. Hamburguesa Doble" />
          <Input label="Precio" type="number" placeholder="0.00" />
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={() => setModalOpen(false)}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

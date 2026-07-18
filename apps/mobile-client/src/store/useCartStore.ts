import { create } from 'zustand';
import { Alert } from 'react-native';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  commerceId: string | null;
  items: CartItem[];
  addItem: (commerceId: string, item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  commerceId: null,
  items: [],
  addItem: (commerceId, item) => {
    const currentCommerceId = get().commerceId;

    if (currentCommerceId && currentCommerceId !== commerceId) {
      Alert.alert(
        'Cambio de Comercio',
        '¿Deseas vaciar el carrito actual para pedir en este nuevo comercio?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Vaciar',
            style: 'destructive',
            onPress: () => set({ commerceId, items: [{ ...item, quantity: 1 }] }),
          },
        ]
      );
      return;
    }

    const currentItems = get().items;
    const existingItem = currentItems.find((i) => i.productId === item.productId);

    if (existingItem) {
      set({
        items: currentItems.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({ commerceId, items: [...currentItems, { ...item, quantity: 1 }] });
    }
  },
  removeItem: (productId) => {
    const newItems = get().items.filter((i) => i.productId !== productId);
    set({
      items: newItems,
      commerceId: newItems.length === 0 ? null : get().commerceId,
    });
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      ),
    });
  },
  clearCart: () => set({ commerceId: null, items: [] }),
  getTotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));

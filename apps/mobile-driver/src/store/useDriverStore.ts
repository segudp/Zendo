import { create } from 'zustand';
import { apiClient } from '../api/client';

interface DriverStore {
  isOnline: boolean;
  toggleStatus: () => Promise<void>;
  setOnline: (status: boolean) => void;
}

export const useDriverStore = create<DriverStore>((set, get) => ({
  isOnline: false,
  setOnline: (status: boolean) => set({ isOnline: status }),
  toggleStatus: async () => {
    const currentStatus = get().isOnline;
    const newStatus = !currentStatus;
    
    // Optistic update para UI inmediata
    set({ isOnline: newStatus });
    
    try {
      // Impactar en Base de Datos (REST)
      await apiClient.patch('/logistics/driver/status', { isOnline: newStatus });
    } catch (error) {
      console.error('Error changing driver status in backend', error);
      // Rollback si falla
      set({ isOnline: currentStatus });
    }
  }
}));

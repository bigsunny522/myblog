import { create } from 'zustand';

interface UIState {
  isHeaderVisible: boolean;
  showHeader: () => void;
  hideHeader: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isHeaderVisible: false, // Default to hidden
  showHeader: () => set({ isHeaderVisible: true }),
  hideHeader: () => set({ isHeaderVisible: false }),
}));

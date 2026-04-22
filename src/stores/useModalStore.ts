import { create } from 'zustand';
import { ReactNode } from 'react';

interface ModalOptions {
  subtitle?: string;
  headerAction?: ReactNode;
}

interface ModalState {
  isOpen: boolean;
  content: ReactNode | null;
  title: string;
  subtitle?: string;
  headerAction?: ReactNode;
  openModal: (title: string, content: ReactNode, options?: ModalOptions) => void;
  closeModal: () => void;
  setHeaderAction: (action: ReactNode | undefined) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  content: null,
  title: '',
  subtitle: undefined,
  headerAction: undefined,
  openModal: (title, content, options) => set({ 
    isOpen: true, 
    title, 
    content, 
    subtitle: options?.subtitle,
    headerAction: options?.headerAction 
  }),
  closeModal: () => set({ 
    isOpen: false, 
    content: null, 
    title: '',
    subtitle: undefined,
    headerAction: undefined
  }),
  setHeaderAction: (action) => set({ headerAction: action }),
}));

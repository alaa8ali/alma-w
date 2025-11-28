import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings, Language, Theme, VerticalType, Address } from '@types/index';

interface AppStore extends AppSettings {
  // Navigation
  activeVertical: VerticalType;
  setActiveVertical: (vertical: VerticalType) => void;
  
  // Location
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address | null) => void;
  
  // Settings
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setNotifications: (enabled: boolean) => void;
  setSoundEffects: (enabled: boolean) => void;
  
  // Modals & UI State
  isCartOpen: boolean;
  isMenuOpen: boolean;
  isLocationModalOpen: boolean;
  isAuthModalOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  setLocationModalOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Settings defaults
      language: 'ar',
      theme: 'light',
      notifications: true,
      soundEffects: true,
      
      // Navigation
      activeVertical: 'store',
      setActiveVertical: (vertical) => set({ activeVertical: vertical }),
      
      // Location
      selectedAddress: null,
      setSelectedAddress: (address) => set({ selectedAddress: address }),
      
      // Settings actions
      setLanguage: (language) => {
        set({ language });
        // Update HTML dir attribute
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
      },
      
      setTheme: (theme) => {
        set({ theme });
        // Update HTML class
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
      
      setNotifications: (enabled) => set({ notifications: enabled }),
      setSoundEffects: (enabled) => set({ soundEffects: enabled }),
      
      // Modals & UI State
      isCartOpen: false,
      isMenuOpen: false,
      isLocationModalOpen: false,
      isAuthModalOpen: false,
      setCartOpen: (open) => set({ isCartOpen: open }),
      setMenuOpen: (open) => set({ isMenuOpen: open }),
      setLocationModalOpen: (open) => set({ isLocationModalOpen: open }),
      setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
      
      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'alma-app-storage',
      partialize: (state) => ({
        language: state.language,
        theme: state.theme,
        notifications: state.notifications,
        soundEffects: state.soundEffects,
        selectedAddress: state.selectedAddress,
        activeVertical: state.activeVertical,
      }),
    }
  )
);

// Initialize theme and language on app load
const initializeApp = () => {
  const { theme, language } = useAppStore.getState();
  
  // Set theme
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
  
  // Set language
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
};

initializeApp();

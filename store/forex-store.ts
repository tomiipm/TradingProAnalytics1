import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ForexSignal, PerformanceStats, WeeklyPerformanceData, Notification } from '@/types/forex';

interface ForexState {
  signals: ForexSignal[];
  filteredSignals: ForexSignal[];
  selectedSignal: ForexSignal | null;
  performanceStats: PerformanceStats;
  weeklyPerformance: WeeklyPerformanceData[];
  activeFilter: string;
  isRefreshing: boolean;
  isDataLoaded: boolean;
  isPremium: boolean;
  premiumExpiryDate: string | null;
  subscriptionType: 'subscription' | null;
  notifications: Notification[];
  unreadNotificationsCount: number;
  isMarketOpen: boolean;
  currentSession: string | null;
  
  // Actions
  setSignals: (signals: ForexSignal[]) => void;
  setSelectedSignal: (signal: ForexSignal) => void;
  toggleFavorite: (id: string) => void;
  setActiveFilter: (filter: string) => void;
  setIsRefreshing: (isRefreshing: boolean) => void;
  setPerformanceStats: (stats: PerformanceStats) => void;
  setWeeklyPerformance: (data: WeeklyPerformanceData[]) => void;
  setPremiumStatus: (isPremium: boolean, expiryDate?: string, subscriptionType?: 'subscription') => void;
  addNotification: (notification: Notification) => void;
  markNotificationsAsRead: () => void;
  clearNotifications: () => void;
  clearUserData: () => void;
  setMarketStatus: (isOpen: boolean, session: string | null) => void;
}

// Initial empty state - no mock data
const initialPerformanceStats: PerformanceStats = {
  totalTrades: 0,
  profitTrades: 0,
  lossTrades: 0,
  openTrades: 0,
  winRate: 0,
  accuracy: 0,
  averageTradesPerDay: '0',
  averageProfitPerDay: '0',
  averageProfitPerTrade: 0,
  averageLossPerTrade: 0,
  riskRewardRatio: 0,
  totalPips: 0,
  dailyPerformance: []
};

export const useForexStore = create<ForexState>()(
  persist(
    (set, get) => ({
      signals: [],
      filteredSignals: [],
      selectedSignal: null,
      performanceStats: initialPerformanceStats,
      weeklyPerformance: [],
      activeFilter: 'Active',
      isRefreshing: false,
      isDataLoaded: false, // Start with false to force data loading
      isPremium: false,
      premiumExpiryDate: null,
      subscriptionType: null,
      notifications: [],
      unreadNotificationsCount: 0,
      isMarketOpen: true,
      currentSession: null,
      
      setSignals: (signals: ForexSignal[]) => {
        set({ 
          signals,
          filteredSignals: filterSignals(signals, get().activeFilter),
          isDataLoaded: true
        });
      },
      
      setSelectedSignal: (signal: ForexSignal) => {
        set({ selectedSignal: signal });
      },
      
      toggleFavorite: (id: string) => {
        const updatedSignals = get().signals.map(signal => 
          signal.id === id ? { ...signal, isFavorite: !signal.isFavorite } : signal
        );
        
        const selectedSignal = get().selectedSignal;
        
        set({ 
          signals: updatedSignals,
          filteredSignals: filterSignals(updatedSignals, get().activeFilter),
          selectedSignal: selectedSignal && selectedSignal.id === id 
            ? { ...selectedSignal, isFavorite: !selectedSignal.isFavorite }
            : selectedSignal
        });
      },
      
      setActiveFilter: (filter: string) => {
        set({ 
          activeFilter: filter,
          filteredSignals: filterSignals(get().signals, filter)
        });
      },
      
      setIsRefreshing: (isRefreshing: boolean) => {
        set({ isRefreshing });
      },
      
      setPerformanceStats: (stats: PerformanceStats) => {
        set({ performanceStats: stats });
      },
      
      setWeeklyPerformance: (data: WeeklyPerformanceData[]) => {
        set({ weeklyPerformance: data });
      },
      
      setPremiumStatus: (isPremium: boolean, expiryDate?: string, subscriptionType?: 'subscription') => {
        set({ 
          isPremium,
          premiumExpiryDate: expiryDate || null,
          subscriptionType: subscriptionType || null
        });
        
        // Add notification about premium status change
        if (isPremium) {
          const notification: Notification = {
            id: Date.now().toString(),
            title: 'Premium Activated',
            message: `Your premium subscription has been activated. Enjoy all premium features!`,
            timestamp: new Date().toISOString(),
            type: 'premium',
            read: false
          };
          get().addNotification(notification);
        }
      },
      
      addNotification: (notification: Notification) => {
        set(state => ({ 
          notifications: [notification, ...state.notifications].slice(0, 50), // Keep only the latest 50 notifications
          unreadNotificationsCount: state.unreadNotificationsCount + 1
        }));
      },
      
      markNotificationsAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadNotificationsCount: 0
        }));
      },
      
      clearNotifications: () => {
        set({
          notifications: [],
          unreadNotificationsCount: 0
        });
      },
      
      clearUserData: () => {
        console.log("Clearing user data from store");
        
        // Reset user-specific data while keeping some app state
        set({
          selectedSignal: null,
          isPremium: false,
          premiumExpiryDate: null,
          subscriptionType: null,
          notifications: [],
          unreadNotificationsCount: 0
        });
      },
      
      setMarketStatus: (isOpen: boolean, session: string | null) => {
        set({
          isMarketOpen: isOpen,
          currentSession: session
        });
      }
    }),
    {
      name: 'forex-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        signals: state.signals,
        performanceStats: state.performanceStats,
        weeklyPerformance: state.weeklyPerformance,
        isDataLoaded: state.isDataLoaded,
        isPremium: state.isPremium,
        premiumExpiryDate: state.premiumExpiryDate,
        subscriptionType: state.subscriptionType,
        notifications: state.notifications.filter(n => n.read) // Only persist read notifications
      }),
    }
  )
);

// Helper function to filter signals based on active filter
const filterSignals = (signals: ForexSignal[], filter: string): ForexSignal[] => {
  switch (filter) {
    case 'Active':
      return signals.filter(signal => signal.status === 'active' || signal.status === 'pending');
    case 'Last 7 Days':
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return signals.filter(signal => {
        const signalDate = new Date(signal.timestamp.split(' ')[0]);
        return signalDate >= sevenDaysAgo;
      });
    case 'Favorites':
      return signals.filter(signal => signal.isFavorite);
    default:
      return signals;
  }
};
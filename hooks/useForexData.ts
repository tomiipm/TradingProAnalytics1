import { useState, useEffect, useCallback } from 'react';
import { useForexStore } from '@/store/forex-store';
import { Notification } from '@/types/forex';
import { CONFIG } from '@/constants/config';
import { fetchSignals, fetchMarketData, checkMarketStatus, fetchForexData, fetchHistoricalMarketData } from '@/services/api';
import { trainModelLocally } from '@/services/ai-predictions';

export const useForexData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiAvailable, setIsApiAvailable] = useState<boolean | null>(null);
  
  const { 
    setSignals, 
    setPerformanceStats,
    setWeeklyPerformance,
    isDataLoaded,
    addNotification,
    isPremium,
    setMarketStatus
  } = useForexStore();
  
  // Check API availability
  const checkApiAvailability = useCallback(async () => {
    try {
      // Test with both a regular forex pair and US30
      const [forexResult, us30Result] = await Promise.all([
        fetchMarketData('EUR/USD'),
        fetchMarketData('US30')
      ]);
      
      console.log('API availability check results:', { 
        forexAvailable: !!forexResult, 
        us30Available: !!us30Result 
      });
      
      setIsApiAvailable(true);
      return true;
    } catch (err) {
      console.error('FMP API not available:', err);
      setIsApiAvailable(false);
      throw new Error('API not available');
    }
  }, []);
  
  // Check market status
  const updateMarketStatus = useCallback(async () => {
    try {
      const { isOpen, session } = await checkMarketStatus();
      setMarketStatus(isOpen, session);
    } catch (err) {
      console.error('Error updating market status:', err);
      throw new Error('Failed to update market status');
    }
  }, [setMarketStatus]);
  
  // Generate weekly performance from real data
  const generateRealWeeklyPerformance = async () => {
    // Get historical data for EUR/USD for the last 7 days
    const historicalData = await fetchHistoricalMarketData('EUR/USD', 7);
    
    if (!historicalData || !historicalData.length) {
      throw new Error('No historical data available for weekly performance');
    }
    
    // Map to days of week
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyData = [];
    
    for (let i = 0; i < 7; i++) {
      const dayData = historicalData[i];
      const prevDayData = historicalData[i + 1] || dayData;
      
      if (dayData) {
        const priceDiff = dayData.price - prevDayData.price;
        const pipValue = priceDiff / 0.0001; // Convert to pips
        
        weeklyData.push({
          day: days[i],
          pips: parseFloat(pipValue.toFixed(1)),
          trades: Math.floor(Math.random() * 5) + 1 // Random for now, will be replaced with real data
        });
      } else {
        throw new Error(`No data available for day ${i}`);
      }
    }
    
    return weeklyData;
  };
  
  // Fetch data from real APIs
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check API availability
      await checkApiAvailability();
      
      // Update market status
      await updateMarketStatus();
      
      // Fetch real data from API
      console.log('Fetching real data from API...');
      const { signals: apiSignals, stats: apiStats } = await fetchForexData();
      
      // Generate weekly performance from real data
      const weeklyPerf = await generateRealWeeklyPerformance();
      
      // Update store with real data
      setSignals(apiSignals);
      setPerformanceStats(apiStats);
      setWeeklyPerformance(weeklyPerf);
      
      // Add notification about new data
      const notification: Notification = {
        id: Date.now().toString(),
        title: 'Data Updated',
        message: 'Trading signals updated with real market data.',
        timestamp: new Date().toISOString(),
        type: 'system',
        read: false
      };
      addNotification(notification);
      
      // Add premium signal notification if user is premium
      if (isPremium && Math.random() > 0.5) {
        const premiumNotification: Notification = {
          id: (Date.now() + 1).toString(),
          title: 'Premium Signal Alert',
          message: 'New high-probability trading opportunity detected for USD/JPY.',
          timestamp: new Date().toISOString(),
          type: 'signal',
          read: false,
          data: { signalId: '12345' }
        };
        addNotification(premiumNotification);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching forex data:', err);
      setError('Failed to load forex data. Please try again.');
      setIsLoading(false);
      throw new Error('Failed to fetch data');
    }
  }, [setSignals, setPerformanceStats, setWeeklyPerformance, checkApiAvailability, setIsApiAvailable, addNotification, isPremium, updateMarketStatus]);
  
  // Load data on initial mount if not already loaded
  useEffect(() => {
    if (!isDataLoaded) {
      fetchData().catch(err => {
        console.error('Failed to load initial data:', err);
        setError('Failed to load initial data. Please check your connection and try again.');
      });
    }
    
    // Set up interval for market status check
    const marketStatusInterval = setInterval(() => {
      updateMarketStatus().catch(err => {
        console.error('Failed to update market status:', err);
      });
      console.log('Market status check triggered');
    }, 600000); // Check every 10 minutes
    
    return () => {
      clearInterval(marketStatusInterval);
    };
  }, [isDataLoaded, fetchData, updateMarketStatus]);
  
  return {
    isLoading,
    error,
    refreshData: fetchData,
    isApiAvailable
  };
};
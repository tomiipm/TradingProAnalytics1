import { Signal } from '@/types/forex';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '@/constants/config';
import { fetchMarketData, fetchHistoricalMarketData } from './api';

// Storage key for saved signals
const SIGNALS_STORAGE_KEY = 'ai_signals';

/**
 * Save signals to AsyncStorage
 */
export const saveSignals = async (signals: Signal[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(SIGNALS_STORAGE_KEY, JSON.stringify(signals));
    console.log('Signals saved to storage');
  } catch (error) {
    console.error('Error saving signals to storage:', error);
    throw new Error('Failed to save signals');
  }
};

/**
 * Load saved signals from AsyncStorage
 */
export const loadSavedSignals = async (): Promise<Signal[] | null> => {
  try {
    const savedSignals = await AsyncStorage.getItem(SIGNALS_STORAGE_KEY);
    if (savedSignals) {
      return JSON.parse(savedSignals);
    }
    return null;
  } catch (error) {
    console.error('Error loading saved signals:', error);
    return null;
  }
};

/**
 * Clear saved signals from AsyncStorage
 */
export const clearSavedSignals = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SIGNALS_STORAGE_KEY);
    console.log('Saved signals cleared');
  } catch (error) {
    console.error('Error clearing saved signals:', error);
  }
};

/**
 * Train AI model locally (simulated)
 */
export const trainModelLocally = async (): Promise<boolean> => {
  console.log('Training AI model locally...');
  
  // Simulate training delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate successful training
  console.log('AI model training completed');
  return true;
};

/**
 * Generate AI signals using real market data
 */
export const generateAISignals = async (pairs: string[]): Promise<Signal[]> => {
  console.log('Generating AI signals using real market data...');
  
  try {
    // Fetch real market data for each pair
    const marketDataPromises = pairs.map(pair => fetchMarketData(pair));
    const marketData = await Promise.all(marketDataPromises);
    
    // Generate signals based on real market data
    const signals: Signal[] = [];
    
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const data = marketData[i];
      
      if (!data) continue;
      
      // Fetch historical data to calculate indicators
      const historicalData = await fetchHistoricalMarketData(pair, 14);
      
      // Calculate RSI
      const rsi = calculateRSI(historicalData);
      
      // Determine signal type based on RSI
      const type = rsi > 50 ? 'BUY' : 'SELL';
      
      // Calculate price levels based on real market price
      const price = data.price;
      
      // Adjust pip calculations based on instrument type
      let pipMultiplier;
      if (pair === 'US30') {
        pipMultiplier = 1; // 1 point for US30
      } else if (pair === 'XAU/USD') {
        pipMultiplier = 0.1; // 0.1 for Gold
      } else if (pair.includes('JPY')) {
        pipMultiplier = 0.01; // 0.01 for JPY pairs
      } else {
        pipMultiplier = 0.0001; // 0.0001 for standard forex pairs
      }
      
      const pips = Math.floor(Math.random() * 50) + 20;
      const pipDiff = type === 'BUY' ? pipMultiplier * pips : -pipMultiplier * pips;
      
      signals.push({
        id: `ai-signal-${i}-${Date.now()}`,
        pair,
        type,
        entryPrice: price,
        stopLoss: type === 'BUY' ? price - (pipDiff * 0.5) : price + (pipDiff * 0.5),
        takeProfit1: type === 'BUY' ? price + pipDiff : price - pipDiff,
        takeProfit2: type === 'BUY' ? price + (pipDiff * 1.5) : price - (pipDiff * 1.5),
        takeProfit3: i % 3 === 0 ? null : type === 'BUY' ? price + (pipDiff * 2) : price - (pipDiff * 2),
        timestamp: new Date().toISOString().split('T').join(' ').substring(0, 16),
        status: 'active',
        probability: Math.floor(Math.random() * 35) + 60, // Random between 60-95
        pips: pips,
        isFavorite: false,
        isPremium: i % 2 === 0,
        analysis: `AI-generated signal based on real market data for ${pair}. Technical indicators show ${type === 'BUY' ? 'bullish' : 'bearish'} momentum with RSI at ${rsi.toFixed(1)}.`
      });
    }
    
    // Save signals to storage
    await saveSignals(signals);
    
    console.log(`Generated ${signals.length} AI signals from real market data`);
    return signals;
  } catch (error) {
    console.error('Error generating AI signals with real data:', error);
    throw new Error('Failed to generate AI signals');
  }
};

/**
 * Calculate RSI from historical data
 */
const calculateRSI = (data: any[], periods = 14): number => {
  if (data.length < periods + 1) {
    return 50; // Default value if not enough data
  }
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= periods; i++) {
    const change = data[i-1].price - data[i].price;
    if (change >= 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }
  
  const avgGain = gains / periods;
  const avgLoss = losses / periods;
  
  if (avgLoss === 0) {
    return 100;
  }
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};
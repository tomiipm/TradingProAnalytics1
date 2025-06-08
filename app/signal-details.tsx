import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ArrowDown, ArrowUp, Star, ExternalLink, AlertTriangle, Info } from 'lucide-react-native';
import { useForexStore } from '@/store/forex-store';
import ChartComponent from '@/components/ChartComponent';
import ProbabilityBar from '@/components/ProbabilityBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { darkTheme } from '@/constants/colors';
import { CONFIG } from '@/constants/config';

export default function SignalDetailsScreen() {
  const router = useRouter();
  const { selectedSignal, toggleFavorite, isPremium } = useForexStore();
  const [activeTab, setActiveTab] = useState('chart');
  
  if (!selectedSignal) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <AlertTriangle size={40} color={darkTheme.danger} />
          <Text style={styles.errorTitle}>Signal Not Found</Text>
          <Text style={styles.errorText}>The selected signal could not be found. Please go back and try again.</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const handleFavoriteToggle = () => {
    toggleFavorite(selectedSignal.id);
  };
  
  const handleOpenTradingView = () => {
    const symbol = selectedSignal.pair.replace('/', '');
    const url = `https://www.tradingview.com/chart/?symbol=${symbol}`;
    Linking.openURL(url).catch(err => {
      console.error("Couldn't load page", err);
    });
  };
  
  const renderPriceValue = (value: number) => {
    if (selectedSignal.isPremium && !isPremium) {
      return "****";
    }
    
    // Format US30 without decimal places
    if (selectedSignal.pair === 'US30') {
      return Math.round(value).toLocaleString();
    }
    // Format XAU/USD with 2 decimal places
    if (selectedSignal.pair === 'XAU/USD') {
      return value.toFixed(2);
    }
    // Standard forex pairs with 4 decimal places
    return value.toFixed(4);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{selectedSignal.pair}</Text>
          <View style={[
            styles.typeBadge,
            { backgroundColor: selectedSignal.type === 'BUY' ? darkTheme.buy : darkTheme.sell }
          ]}>
            <Text style={styles.typeBadgeText}>{selectedSignal.type}</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavoriteToggle}
          >
            <Star 
              size={24} 
              color={selectedSignal.isFavorite ? darkTheme.premium : darkTheme.secondaryText} 
              fill={selectedSignal.isFavorite ? darkTheme.premium : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          {selectedSignal.isPremium && !isPremium ? (
            <View style={styles.premiumLockContainer}>
              <LinearGradient
                colors={['rgba(255, 193, 7, 0.2)', 'rgba(255, 193, 7, 0.05)']}
                style={styles.premiumLockGradient}
              >
                <Text style={styles.premiumLockTitle}>Premium Signal</Text>
                <Text style={styles.premiumLockText}>Upgrade to Premium to view this chart</Text>
                <TouchableOpacity 
                  style={styles.upgradeButton}
                  onPress={() => router.push('/premium')}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ) : (
            <ChartComponent pair={selectedSignal.pair} type={selectedSignal.type} />
          )}
          
          <TouchableOpacity 
            style={styles.tradingViewButton}
            onPress={handleOpenTradingView}
          >
            <ExternalLink size={16} color="#FFF" style={styles.tradingViewIcon} />
            <Text style={styles.tradingViewText}>Open in TradingView</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'chart' && styles.activeTab]}
            onPress={() => setActiveTab('chart')}
          >
            <Text style={[styles.tabText, activeTab === 'chart' && styles.activeTabText]}>
              Signal Details
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'analysis' && styles.activeTab]}
            onPress={() => setActiveTab('analysis')}
          >
            <Text style={[styles.tabText, activeTab === 'analysis' && styles.activeTabText]}>
              Analysis
            </Text>
          </TouchableOpacity>
        </View>
        
        {activeTab === 'chart' ? (
          <View style={styles.detailsContainer}>
            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Entry Price</Text>
                <Text style={styles.priceValue}>{renderPriceValue(selectedSignal.entryPrice)}</Text>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Stop Loss</Text>
                <Text style={[styles.priceValue, styles.stopLoss]}>{renderPriceValue(selectedSignal.stopLoss)}</Text>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Take Profit 1</Text>
                <Text style={[styles.priceValue, styles.takeProfit]}>{renderPriceValue(selectedSignal.takeProfit1)}</Text>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Take Profit 2</Text>
                <Text style={[styles.priceValue, styles.takeProfit]}>{renderPriceValue(selectedSignal.takeProfit2)}</Text>
              </View>
              
              {selectedSignal.takeProfit3 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Take Profit 3</Text>
                  <Text style={[styles.priceValue, styles.takeProfit]}>{renderPriceValue(selectedSignal.takeProfit3)}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Signal Time</Text>
                <Text style={styles.statValue}>{selectedSignal.timestamp}</Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Status</Text>
                <View style={[
                  styles.statusBadge,
                  selectedSignal.status === 'active' ? styles.activeStatus :
                  selectedSignal.status === 'pending' ? styles.pendingStatus :
                  styles.completedStatus
                ]}>
                  <Text style={styles.statusText}>
                    {selectedSignal.status.charAt(0).toUpperCase() + selectedSignal.status.slice(1)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Potential Pips</Text>
                <Text style={styles.statValue}>{selectedSignal.pips}</Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Signal Probability</Text>
                <View style={styles.probabilityContainer}>
                  <ProbabilityBar probability={selectedSignal.probability} />
                </View>
              </View>
            </View>
            
            <View style={styles.riskContainer}>
              <View style={styles.riskHeader}>
                <Info size={16} color={darkTheme.secondaryText} />
                <Text style={styles.riskTitle}>Risk Management</Text>
              </View>
              
              <Text style={styles.riskText}>
                This signal has a risk-to-reward ratio of 1:{selectedSignal.type === 'BUY' ? 
                  ((selectedSignal.takeProfit1 - selectedSignal.entryPrice) / (selectedSignal.entryPrice - selectedSignal.stopLoss)).toFixed(1) : 
                  ((selectedSignal.entryPrice - selectedSignal.takeProfit1) / (selectedSignal.stopLoss - selectedSignal.entryPrice)).toFixed(1)
                }. Always use proper risk management and never risk more than 1-2% of your account on a single trade.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.analysisContainer}>
            {selectedSignal.isPremium && !isPremium ? (
              <View style={styles.premiumAnalysisLock}>
                <LinearGradient
                  colors={['rgba(255, 193, 7, 0.2)', 'rgba(255, 193, 7, 0.05)']}
                  style={styles.premiumAnalysisGradient}
                >
                  <Text style={styles.premiumLockTitle}>Premium Analysis</Text>
                  <Text style={styles.premiumLockText}>Upgrade to Premium to view detailed market analysis</Text>
                  <TouchableOpacity 
                    style={styles.upgradeButton}
                    onPress={() => router.push('/premium')}
                  >
                    <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ) : (
              <>
                <Text style={styles.analysisTitle}>Technical Analysis</Text>
                <Text style={styles.analysisText}>
                  {selectedSignal.analysis || `This ${selectedSignal.type} signal for ${selectedSignal.pair} is based on a combination of technical indicators including RSI, moving averages, and price action analysis. The current market structure suggests a ${selectedSignal.type === 'BUY' ? 'bullish' : 'bearish'} momentum with potential for continued movement in this direction.`}
                </Text>
                
                <Text style={styles.analysisTitle}>Market Context</Text>
                <Text style={styles.analysisText}>
                  {selectedSignal.pair.includes('USD') ? 
                    `The USD has been ${Math.random() > 0.5 ? 'strengthening' : 'weakening'} against major currencies following recent economic data and Federal Reserve commentary. This creates a favorable environment for this ${selectedSignal.type} signal.` :
                    `Current market liquidity and volatility conditions are favorable for this ${selectedSignal.type} signal. Recent price action shows strong momentum that supports our analysis.`
                  }
                </Text>
                
                <Text style={styles.analysisTitle}>Key Levels</Text>
                <Text style={styles.analysisText}>
                  Watch for potential resistance at {renderPriceValue(selectedSignal.takeProfit1)} and {renderPriceValue(selectedSignal.takeProfit2)}. If the price breaks through these levels, it could continue to {selectedSignal.takeProfit3 ? renderPriceValue(selectedSignal.takeProfit3) : 'extend further'}.
                </Text>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: darkTheme.cardBorder,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    color: darkTheme.text,
    fontWeight: '500',
  },
  headerCenter: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: darkTheme.text,
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  favoriteButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  chartContainer: {
    height: 250,
    backgroundColor: darkTheme.cardBackground,
    borderRadius: 16,
    margin: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  tradingViewButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tradingViewIcon: {
    marginRight: 4,
  },
  tradingViewText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  premiumLockContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  premiumLockGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  premiumLockTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: darkTheme.premium,
    marginBottom: 8,
  },
  premiumLockText: {
    fontSize: 16,
    color: darkTheme.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: darkTheme.premium,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeTab: {
    backgroundColor: darkTheme.accent,
  },
  tabText: {
    color: darkTheme.secondaryText,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFF',
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  priceContainer: {
    backgroundColor: darkTheme.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: darkTheme.cardBorder,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  priceLabel: {
    color: darkTheme.secondaryText,
    fontSize: 14,
  },
  priceValue: {
    color: darkTheme.text,
    fontSize: 14,
    fontWeight: '500',
  },
  stopLoss: {
    color: darkTheme.danger,
  },
  takeProfit: {
    color: darkTheme.success,
  },
  statsContainer: {
    backgroundColor: darkTheme.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: darkTheme.cardBorder,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  statLabel: {
    color: darkTheme.secondaryText,
    fontSize: 14,
  },
  statValue: {
    color: darkTheme.text,
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeStatus: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  pendingStatus: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
  },
  completedStatus: {
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: darkTheme.text,
  },
  probabilityContainer: {
    width: 100,
  },
  riskContainer: {
    backgroundColor: darkTheme.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: darkTheme.cardBorder,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: darkTheme.text,
    marginLeft: 8,
  },
  riskText: {
    color: darkTheme.secondaryText,
    fontSize: 14,
    lineHeight: 20,
  },
  analysisContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: darkTheme.text,
    marginBottom: 8,
    marginTop: 16,
  },
  analysisText: {
    color: darkTheme.secondaryText,
    fontSize: 14,
    lineHeight: 22,
  },
  premiumAnalysisLock: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 300,
  },
  premiumAnalysisGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: darkTheme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: darkTheme.secondaryText,
    textAlign: 'center',
    marginBottom: 24,
  },
});
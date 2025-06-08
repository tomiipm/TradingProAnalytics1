import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { BarChart2, Filter, Star, Clock, Zap, RefreshCw, Globe, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useForexStore } from '@/store/forex-store';
import SignalCard from '@/components/SignalCard';
import { darkTheme } from '@/constants/colors';
import { Signal } from '@/types/forex';
import { useForexData } from '@/hooks/useForexData';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export default function SignalsScreen() {
  const router = useRouter();
  const { signals, setSignals, setSelectedSignal, isPremium, addNotification, isMarketOpen, currentSession } = useForexStore();
  const { isLoading, error, refreshData, isApiAvailable } = useForexData();
  const [activeTab, setActiveTab] = useState('active');
  
  // Animation values for refresh icon
  const refreshRotation = useSharedValue(0);
  
  useEffect(() => {
    // Simulate receiving a new notification after 5 seconds
    const timer = setTimeout(() => {
      addNotification({
        id: `notification-${Date.now()}`,
        title: 'New Trading Signal',
        message: 'A new EUR/USD trading opportunity is available. Check it out now!',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'signal',
      });
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleSignalPress = (signal: Signal) => {
    setSelectedSignal(signal);
    router.push('/signal-details');
  };
  
  const handlePremiumPress = () => {
    router.push('/premium');
  };
  
  const handleAccountPress = () => {
    router.push('/account');
  };
  
  const handleRefresh = () => {
    refreshData().catch(err => {
      Alert.alert(
        "Error",
        "Failed to refresh data. Please check your connection and try again.",
        [{ text: "OK" }]
      );
    });
    // Animate refresh icon
    refreshRotation.value = withSpring(refreshRotation.value + 360);
  };
  
  const filteredSignals = () => {
    switch (activeTab) {
      case 'active':
        return signals.filter(signal => signal.status === 'active');
      case 'recent':
        return signals.filter(signal => signal.status === 'completed');
      case 'favorites':
        return signals.filter(signal => signal.isFavorite);
      default:
        return signals;
    }
  };
  
  const refreshAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${refreshRotation.value}deg` }]
    };
  });
  
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <BarChart2 size={24} color={darkTheme.text} />
        <Text style={styles.title}>Trading Signals</Text>
      </View>
      
      <View style={styles.headerButtons}>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Animated.View style={refreshAnimatedStyle}>
            <RefreshCw size={20} color={darkTheme.accent} />
          </Animated.View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.accountButton}
          onPress={handleAccountPress}
        >
          <Text style={styles.accountButtonText}>Account</Text>
        </TouchableOpacity>
        
        {!isPremium && (
          <TouchableOpacity 
            style={styles.premiumButton}
            onPress={handlePremiumPress}
          >
            <Zap size={16} color="#000" />
            <Text style={styles.premiumButtonText}>Premium</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
  
  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'active' && styles.activeTab]}
        onPress={() => setActiveTab('active')}
      >
        <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
          Active
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
        onPress={() => setActiveTab('recent')}
      >
        <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>
          Last 7 Days
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
        onPress={() => setActiveTab('favorites')}
      >
        <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
          Favorites
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderPremiumBanner = () => {
    if (isPremium) return null;
    
    return (
      <TouchableOpacity onPress={handlePremiumPress}>
        <LinearGradient
          colors={['rgba(255, 193, 7, 0.2)', 'rgba(255, 193, 7, 0.05)']}
          style={styles.premiumBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.premiumBannerContent}>
            <View style={styles.premiumIconContainer}>
              <Zap size={20} color={darkTheme.premium} />
            </View>
            <View style={styles.premiumBannerTextContainer}>
              <Text style={styles.premiumBannerTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumBannerDescription}>
                Get unlimited signals and advanced analytics
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };
  
  const renderStatusBar = () => {
    if (isApiAvailable === null) return null;
    
    return (
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusBar,
          isApiAvailable ? styles.statusBarOnline : styles.statusBarOffline
        ]}>
          <Text style={styles.statusBarText}>
            {isApiAvailable ? 'Real-Time Data: Online' : 'Real-Time Data: Offline'}
          </Text>
        </View>
        <View style={[
          styles.statusBar,
          isMarketOpen ? styles.marketOpen : styles.marketClosed
        ]}>
          <Globe size={14} color={isMarketOpen ? darkTheme.success : darkTheme.danger} style={styles.marketIcon} />
          <Text style={styles.statusBarText}>
            {isMarketOpen ? `Market: Open (${currentSession} Session)` : 'Market: Closed'}
          </Text>
        </View>
      </View>
    );
  };
  
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <AlertTriangle size={40} color={darkTheme.danger} style={styles.errorIcon} />
      <Text style={styles.errorTitle}>Data Loading Error</Text>
      <Text style={styles.errorText}>
        {error || "Failed to load trading signals. Please check your connection and try again."}
      </Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={handleRefresh}
      >
        <RefreshCw size={16} color="#FFF" style={styles.retryIcon} />
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {activeTab === 'active' ? (
        <>
          <Clock size={40} color={darkTheme.secondaryText} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No Active Signals</Text>
          <Text style={styles.emptyText}>
            There are no active trading signals at the moment. Check back soon for new opportunities.
          </Text>
        </>
      ) : activeTab === 'favorites' ? (
        <>
          <Star size={40} color={darkTheme.secondaryText} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptyText}>
            You haven't added any signals to your favorites yet. Tap the star icon on any signal to add it to your favorites.
          </Text>
        </>
      ) : (
        <>
          <Filter size={40} color={darkTheme.secondaryText} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No Recent Signals</Text>
          <Text style={styles.emptyText}>
            There are no completed signals from the last 7 days. Check the active tab for current opportunities.
          </Text>
        </>
      )}
    </View>
  );
  
  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={darkTheme.accent} />
      <Text style={styles.loadingText}>Loading real-time trading signals...</Text>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      
      {error ? (
        <>
          {renderHeader()}
          {renderErrorState()}
        </>
      ) : (
        <FlatList
          data={filteredSignals()}
          renderItem={({ item }) => (
            <SignalCard 
              signal={item} 
              onPress={() => handleSignalPress(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            (isLoading && !signals.length) && styles.listContentCentered
          ]}
          ListHeaderComponent={
            <>
              {renderHeader()}
              {renderStatusBar()}
              {renderTabs()}
              {renderPremiumBanner()}
            </>
          }
          ListEmptyComponent={isLoading ? renderLoadingState() : renderEmptyState()}
          refreshing={isLoading && signals.length > 0}
          onRefresh={handleRefresh}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: darkTheme.text,
    marginLeft: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
    marginRight: 8,
  },
  accountButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    marginRight: 8,
  },
  accountButtonText: {
    color: darkTheme.accent,
    fontWeight: '500',
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: darkTheme.premium,
  },
  premiumButtonText: {
    color: '#000',
    fontWeight: '600',
    marginLeft: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  listContentCentered: {
    justifyContent: 'center',
  },
  premiumBanner: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  premiumBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  premiumIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  premiumBannerTextContainer: {
    flex: 1,
  },
  premiumBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: darkTheme.premium,
    marginBottom: 4,
  },
  premiumBannerDescription: {
    fontSize: 14,
    color: darkTheme.text,
  },
  statusContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  statusBar: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 6,
  },
  statusBarOnline: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)', // Green for online
  },
  statusBarOffline: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)', // Red for offline
  },
  marketOpen: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)', // Green for open
  },
  marketClosed: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)', // Red for closed
  },
  marketIcon: {
    marginRight: 6,
  },
  statusBarText: {
    color: darkTheme.text,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: darkTheme.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: darkTheme.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: darkTheme.text,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: darkTheme.text,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: darkTheme.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
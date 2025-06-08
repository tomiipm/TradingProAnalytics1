import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ArrowUp, ArrowDown, Star, Lock } from 'lucide-react-native';
import { ForexSignal } from '@/types/forex';
import { useForexStore } from '@/store/forex-store';
import { darkTheme } from '@/constants/colors';

interface SignalCardProps {
  signal: ForexSignal;
  onPress: () => void;
}

export default function SignalCard({ signal, onPress }: SignalCardProps) {
  const { toggleFavorite, isPremium } = useForexStore();
  
  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    toggleFavorite(signal.id);
  };
  
  const renderPriceValue = (value: number) => {
    if (signal.isPremium && !isPremium) {
      return "****";
    }
    // Format US30 without decimal places
    if (signal.pair === 'US30') {
      return Math.round(value).toLocaleString();
    }
    // Format XAU/USD with 2 decimal places
    if (signal.pair === 'XAU/USD') {
      return value.toFixed(2);
    }
    // Standard forex pairs with 4 decimal places
    return value.toFixed(4);
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        signal.isPremium && !isPremium && styles.premiumContainer
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.pairContainer}>
          <Text style={styles.pair}>{signal.pair}</Text>
          {signal.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>PREMIUM</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
        >
          <Star 
            size={20} 
            color={signal.isFavorite ? darkTheme.premium : darkTheme.secondaryText} 
            fill={signal.isFavorite ? darkTheme.premium : 'transparent'}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.typeContainer}>
          <View style={[
            styles.typeIndicator,
            { backgroundColor: signal.type === 'BUY' ? darkTheme.buy : darkTheme.sell }
          ]}>
            {signal.type === 'BUY' ? (
              <ArrowUp size={16} color="#FFF" />
            ) : (
              <ArrowDown size={16} color="#FFF" />
            )}
          </View>
          <Text style={[
            styles.type,
            { color: signal.type === 'BUY' ? darkTheme.buy : darkTheme.sell }
          ]}>
            {signal.type}
          </Text>
        </View>
        
        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Entry</Text>
            <Text style={styles.priceValue}>{renderPriceValue(signal.entryPrice)}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>TP1</Text>
            <Text style={styles.priceValue}>{renderPriceValue(signal.takeProfit1)}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>SL</Text>
            <Text style={[styles.priceValue, styles.stopLoss]}>{renderPriceValue(signal.stopLoss)}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.timestamp}>{signal.timestamp}</Text>
        
        <View style={styles.statsContainer}>
          <View style={[
            styles.statusBadge,
            signal.status === 'active' ? styles.activeStatus :
            signal.status === 'pending' ? styles.pendingStatus :
            styles.completedStatus
          ]}>
            <Text style={styles.statusText}>
              {signal.status.charAt(0).toUpperCase() + signal.status.slice(1)}
            </Text>
          </View>
          
          {signal.pips && (
            <View style={styles.pipsBadge}>
              <Text style={styles.pipsText}>{signal.pips} pips</Text>
            </View>
          )}
        </View>
      </View>
      
      {signal.isPremium && !isPremium && (
        <View style={styles.premiumOverlay}>
          <Lock size={24} color="#FFF" />
          <Text style={styles.premiumOverlayText}>Premium Signal</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: darkTheme.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: darkTheme.cardBorder,
  },
  premiumContainer: {
    borderColor: darkTheme.premium,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pairContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pair: {
    fontSize: 18,
    fontWeight: '700',
    color: darkTheme.text,
    marginRight: 8,
  },
  premiumBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumText: {
    color: darkTheme.premium,
    fontSize: 10,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 4,
  },
  content: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  typeIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  type: {
    fontSize: 16,
    fontWeight: '600',
  },
  priceContainer: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    color: darkTheme.secondaryText,
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
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
  pipsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
  },
  pipsText: {
    fontSize: 12,
    fontWeight: '500',
    color: darkTheme.accent,
  },
  premiumOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumOverlayText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
});
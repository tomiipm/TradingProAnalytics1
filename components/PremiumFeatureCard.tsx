import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Star, Zap, ShoppingCart } from 'lucide-react-native';
import { darkTheme } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { CONFIG } from '@/constants/config';

interface PremiumFeatureCardProps {
  title: string;
  onPress: () => void;
  description?: string;
  isLoading?: boolean;
}

export default function PremiumFeatureCard({ 
  title, 
  onPress, 
  description = "Unlock premium signals with higher accuracy and more detailed analysis",
  isLoading = false
}: PremiumFeatureCardProps) {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress} 
      activeOpacity={0.9}
      disabled={isLoading}
    >
      <LinearGradient
        colors={['rgba(253, 203, 110, 0.2)', 'rgba(253, 203, 110, 0.05)']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Zap size={20} color={darkTheme.premium} fill={darkTheme.premium} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            <Text style={styles.priceText}>
              ${CONFIG.SUBSCRIPTION.PRICE} for {CONFIG.SUBSCRIPTION.DAYS} days
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <ShoppingCart size={14} color="#000" />
                <Text style={styles.buttonText}>
                  {Platform.OS === 'ios' ? 'App Store' : Platform.OS === 'android' ? 'Google Play' : 'Subscribe'}
                </Text>
              </>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(253, 203, 110, 0.3)',
  },
  content: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(253, 203, 110, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: darkTheme.premium,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: darkTheme.secondaryText,
    marginBottom: 6,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: darkTheme.premium,
  },
  buttonContainer: {
    backgroundColor: darkTheme.premium,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
});
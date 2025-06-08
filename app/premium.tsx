import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Alert, Platform, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter } from 'expo-router';
import { Check, X, Zap, Clock, ShoppingCart, ExternalLink, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { darkTheme } from '@/constants/colors';
import { useForexStore } from '@/store/forex-store';
import { CONFIG } from '@/constants/config';
import { purchasePremium, restorePurchases } from '@/services/store-purchases';
import SignalCard from '@/components/SignalCard';

export default function PremiumScreen() {
  const router = useRouter();
  const { isPremium, setPremiumStatus, premiumExpiryDate, signals } = useForexStore();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  
  // Filter premium signals for display
  const premiumSignals = signals.filter(signal => signal.isPremium).slice(0, 4);
  
  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const result = await purchasePremium();
      
      if (result.success) {
        // Purchase successful
        const today = new Date();
        let expiryDate = new Date();
        expiryDate.setDate(today.getDate() + CONFIG.SUBSCRIPTION.DAYS);
        
        setPremiumStatus(true, expiryDate.toISOString(), 'subscription');
        
        Alert.alert(
          "Subscription Successful",
          `Thank you for subscribing to Trading ProAnalytics Premium!`,
          [
            {
              text: "OK",
              onPress: () => router.push('/(tabs)')
            }
          ]
        );
      } else {
        // Purchase failed or was canceled
        Alert.alert(
          "Subscription Failed",
          result.error || "There was an error processing your subscription. Please try again later."
        );
      }
    } catch (error) {
      console.error("Purchase error:", error);
      Alert.alert(
        "Subscription Error",
        "There was an error processing your subscription. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleRestorePurchase = async () => {
    try {
      setRestoring(true);
      const result = await restorePurchases();
      
      if (result.success) {
        if (result.hasPremium) {
          // Premium subscription found
          const today = new Date();
          let expiryDate = new Date();
          expiryDate.setDate(today.getDate() + CONFIG.SUBSCRIPTION.DAYS);
          
          setPremiumStatus(true, expiryDate.toISOString(), 'subscription');
          
          Alert.alert(
            "Purchase Restored",
            "Your premium subscription has been successfully restored!",
            [
              {
                text: "OK",
                onPress: () => router.push('/(tabs)')
              }
            ]
          );
        } else {
          // No premium subscription found
          Alert.alert(
            "No Purchases Found",
            "We couldn't find any active premium subscriptions associated with your account."
          );
        }
      } else {
        // Restore failed
        Alert.alert(
          "Restore Failed",
          result.error || "There was an error restoring your purchases. Please try again later."
        );
      }
    } catch (error) {
      console.error("Restore error:", error);
      Alert.alert(
        "Restore Error",
        "There was an error restoring your purchases. Please try again later."
      );
    } finally {
      setRestoring(false);
    }
  };
  
  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your premium subscription? You will lose access to premium features at the end of your current billing period.',
      [
        {
          text: 'No, Keep Subscription',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setCancelling(true);
            // Simulate API call to cancel subscription
            setTimeout(() => {
              setCancelling(false);
              // Update the store to reflect cancellation
              // Note: In a real app, the subscription would typically remain active until the end of the billing period
              Alert.alert(
                'Subscription Cancelled',
                'Your subscription has been cancelled. You will have access to premium features until the end of your current billing period.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // In a real app, you might want to update the UI to show the subscription is cancelled but still active
                      setPremiumStatus(false);
                      router.push('/(tabs)');
                    }
                  }
                ]
              );
            }, 1000);
          },
        },
      ]
    );
  };
  
  const handleManageSubscription = () => {
    if (Platform.OS === 'ios') {
      // Open App Store subscription settings
      Alert.alert(
        "Manage Subscription", 
        "To manage your subscription, please go to App Store → Your Profile → Subscriptions",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Open Settings",
            onPress: () => {
              // This would ideally open the App Store subscriptions page directly
              // For now, we'll just show instructions
              Alert.alert(
                "Open Settings",
                "Please open the App Store app, tap on your profile picture, and select 'Subscriptions'."
              );
            }
          }
        ]
      );
    } else if (Platform.OS === 'android') {
      // Open Google Play subscription settings
      Alert.alert(
        "Manage Subscription", 
        "To manage your subscription, please go to Google Play Store → Menu → Subscriptions",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Open Play Store",
            onPress: () => {
              // This would ideally open the Play Store subscriptions page directly
              // For now, we'll just show instructions
              Alert.alert(
                "Open Play Store",
                "Please open the Google Play Store app, tap on the menu icon, and select 'Subscriptions'."
              );
            }
          }
        ]
      );
    } else {
      Alert.alert(
        "Manage Subscription", 
        "To manage your subscription, please visit our website"
      );
    }
  };
  
  const formatExpiryDate = () => {
    if (!premiumExpiryDate) return '';
    const date = new Date(premiumExpiryDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const PremiumFeature = ({ text }: { text: string }) => (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <Check size={16} color={darkTheme.premium} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
  
  if (isPremium) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar style="light" />
        
        {/* We're removing the Stack.Screen options here since they're now defined in _layout.tsx */}
        
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://placehold.co/80x80?text=TPA+Logo' }}
              style={styles.logoImage}
            />
          </View>
          
          <LinearGradient
            colors={['rgba(255, 193, 7, 0.2)', 'rgba(255, 193, 7, 0.05)']}
            style={styles.premiumActiveCard}
          >
            <View style={styles.premiumActiveIconContainer}>
              <Zap size={24} color={darkTheme.premium} />
            </View>
            <Text style={styles.premiumActiveTitle}>Premium Active</Text>
            <Text style={styles.premiumActiveMessage}>
              You have access to all premium features and signals.
            </Text>
            <View style={styles.expiryContainer}>
              <Clock size={16} color={darkTheme.secondaryText} />
              <Text style={styles.expiryText}>
                Expires on {formatExpiryDate()}
              </Text>
            </View>
          </LinearGradient>
          
          <Text style={styles.sectionTitle}>Your Premium Benefits</Text>
          
          <View style={styles.benefitsContainer}>
            <PremiumFeature text="Unlimited trading signals" />
            <PremiumFeature text="Advanced technical analysis" />
            <PremiumFeature text="Real-time market alerts" />
            <PremiumFeature text="Performance analytics" />
            <PremiumFeature text="Priority customer support" />
            <PremiumFeature text="Access to 10 premium currency pairs" />
          </View>
          
          <Text style={styles.sectionTitle}>Premium Currency Pairs</Text>
          
          <View style={styles.currencyPairsContainer}>
            <View style={styles.pairRow}>
              <PairBadge pair="XAU/USD" />
              <PairBadge pair="US30" />
              <PairBadge pair="EUR/JPY" />
            </View>
            <View style={styles.pairRow}>
              <PairBadge pair="GBP/JPY" />
              <PairBadge pair="AUD/JPY" />
              <PairBadge pair="NZD/JPY" />
            </View>
            <View style={styles.pairRow}>
              <PairBadge pair="EUR/GBP" />
              <PairBadge pair="GBP/CHF" />
              <PairBadge pair="EUR/CHF" />
            </View>
            <View style={styles.pairRow}>
              <PairBadge pair="USD/SGD" />
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>Latest Premium Signals</Text>
          
          {premiumSignals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} onPress={function (): void {
              throw new Error('Function not implemented.');
            } } />
          ))}
          
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.viewAllButtonText}>View All Signals</Text>
            <ChevronRight size={16} color={darkTheme.accent} />
          </TouchableOpacity>
          
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.managePlanButton}
              onPress={handleManageSubscription}
            >
              <View style={styles.managePlanButtonContent}>
                <ExternalLink size={18} color={darkTheme.text} style={styles.managePlanButtonIcon} />
                <Text style={styles.managePlanButtonText}>
                  {Platform.OS === 'ios' ? 'Manage in App Store' : Platform.OS === 'android' ? 'Manage in Google Play' : 'Manage Subscription'}
                </Text>
              </View>
            </TouchableOpacity>
            
            {/* Improved cancel subscription button */}
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancelSubscription}
              activeOpacity={0.7}
              disabled={cancelling}
            >
              {cancelling ? (
                <ActivityIndicator size="small" color={darkTheme.danger} />
              ) : (
                <View style={styles.cancelButtonContent}>
                  <X size={18} color={darkTheme.danger} style={styles.cancelButtonIcon} />
                  <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      
      {/* We're removing the Stack.Screen options here since they're now defined in _layout.tsx */}
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Image 
            source={{ uri: 'https://placehold.co/80x80?text=TPA+Logo' }}
            style={styles.headerImage}
          />
          <Text style={styles.headerTitle}>Trading ProAnalytics Premium</Text>
          <Text style={styles.headerSubtitle}>
            Unlock advanced trading signals and features
          </Text>
        </View>
        
        <View style={styles.planContainer}>
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Premium Access</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.currency}>$</Text>
                <Text style={styles.price}>{CONFIG.SUBSCRIPTION.PRICE}</Text>
              </View>
              <View style={styles.durationContainer}>
                <Clock size={14} color={darkTheme.secondaryText} />
                <Text style={styles.durationText}>{CONFIG.SUBSCRIPTION.DAYS} days</Text>
              </View>
            </View>
            
            <View style={styles.planFeatures}>
              <PremiumFeature text="Unlimited trading signals" />
              <PremiumFeature text="Advanced technical analysis" />
              <PremiumFeature text="Real-time market alerts" />
              <PremiumFeature text="Performance analytics" />
              <PremiumFeature text="Priority customer support" />
              <PremiumFeature text="Access to 10 premium currency pairs" />
            </View>
            
            <Text style={styles.premiumPairsTitle}>Premium Currency Pairs:</Text>
            <View style={styles.premiumPairsContainer}>
              <View style={styles.premiumPairRow}>
                <PairBadge pair="XAU/USD" small />
                <PairBadge pair="US30" small />
                <PairBadge pair="EUR/JPY" small />
              </View>
              <View style={styles.premiumPairRow}>
                <PairBadge pair="GBP/JPY" small />
                <PairBadge pair="AUD/JPY" small />
                <PairBadge pair="NZD/JPY" small />
              </View>
              <View style={styles.premiumPairRow}>
                <PairBadge pair="EUR/GBP" small />
                <PairBadge pair="GBP/CHF" small />
                <PairBadge pair="EUR/CHF" small />
              </View>
              <View style={styles.premiumPairRow}>
                <PairBadge pair="USD/SGD" small />
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.subscribeButton}
              onPress={handleSubscribe}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <>
                  <ShoppingCart size={20} color="#000" />
                  <Text style={styles.subscribeButtonText}>
                    {Platform.OS === 'ios' ? 'Subscribe via App Store' : Platform.OS === 'android' ? 'Subscribe via Google Play' : 'Subscribe Now'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.restoreButton}
          onPress={handleRestorePurchase}
          disabled={restoring}
        >
          {restoring ? (
            <ActivityIndicator color={darkTheme.accent} size="small" />
          ) : (
            <Text style={styles.restoreButtonText}>
              Restore Purchase
            </Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.termsText}>
          Payment will be charged to your {Platform.OS === 'ios' ? 'iTunes Account' : 'Google Play Account'} at confirmation of purchase. 
          Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period. 
          Your account will be charged for renewal within 24 hours prior to the end of the current period. 
          You can manage and cancel your subscriptions by going to your account settings on the {Platform.OS === 'ios' ? 'App Store' : 'Google Play Store'} after purchase.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const PairBadge = ({ pair, small = false }: { pair: string; small?: boolean }) => (
  <View style={[styles.pairBadge, small && styles.smallPairBadge]}>
    <Text style={[styles.pairBadgeText, small && styles.smallPairBadgeText]}>{pair}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: darkTheme.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: darkTheme.secondaryText,
    textAlign: 'center',
    maxWidth: '80%',
  },
  planContainer: {
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: darkTheme.cardBackground,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: darkTheme.premium,
    overflow: 'hidden',
  },
  planHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: darkTheme.border,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: darkTheme.text,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currency: {
    fontSize: 20,
    fontWeight: '700',
    color: darkTheme.text,
    marginTop: 4,
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: darkTheme.text,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  durationText: {
    fontSize: 16,
    color: darkTheme.secondaryText,
    marginLeft: 6,
  },
  planFeatures: {
    padding: 20,
    paddingBottom: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: darkTheme.text,
  },
  premiumPairsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: darkTheme.text,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  premiumPairsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  premiumPairRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  subscribeButton: {
    backgroundColor: darkTheme.premium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  subscribeButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
    height: 44,
    justifyContent: 'center',
  },
  restoreButtonText: {
    color: darkTheme.accent,
    fontSize: 16,
  },
  termsText: {
    fontSize: 12,
    color: darkTheme.secondaryText,
    textAlign: 'center',
    lineHeight: 18,
  },
  premiumActiveCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  premiumActiveIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumActiveTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: darkTheme.premium,
    marginBottom: 8,
  },
  premiumActiveMessage: {
    fontSize: 16,
    color: darkTheme.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  expiryText: {
    fontSize: 14,
    color: darkTheme.text,
    marginLeft: 8,
  },
  benefitsContainer: {
    backgroundColor: darkTheme.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  actionButtonsContainer: {
    marginTop: 8,
    gap: 12,
  },
  managePlanButton: {
    borderWidth: 1,
    borderColor: darkTheme.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  managePlanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  managePlanButtonIcon: {
    marginRight: 8,
  },
  managePlanButtonText: {
    color: darkTheme.text,
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  cancelButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonIcon: {
    marginRight: 8,
  },
  cancelButtonText: {
    color: darkTheme.danger,
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: darkTheme.text,
    marginBottom: 16,
  },
  currencyPairsContainer: {
    backgroundColor: darkTheme.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  pairRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  pairBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  smallPairBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  pairBadgeText: {
    color: darkTheme.premium,
    fontWeight: '600',
    fontSize: 14,
  },
  smallPairBadgeText: {
    fontSize: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 24,
  },
  viewAllButtonText: {
    color: darkTheme.accent,
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
  },
});
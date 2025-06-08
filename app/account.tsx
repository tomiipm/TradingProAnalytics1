import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image, Platform, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter } from 'expo-router';
import { User, Mail, LogOut, ChevronRight, Zap, Clock, ExternalLink, Shield, Bell } from 'lucide-react-native';
import { darkTheme } from '@/constants/colors';
import { useForexStore } from '@/store/forex-store';
import { CONFIG } from '@/constants/config';

export default function AccountScreen() {
  const router = useRouter();
  const { isPremium, premiumExpiryDate, clearUserData } = useForexStore();
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [isSaving, setIsSaving] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const formatExpiryDate = () => {
    if (!premiumExpiryDate) return '';
    const date = new Date(premiumExpiryDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const handleSaveProfile = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Name and email cannot be empty');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
    }, 800);
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
        'Manage Subscription',
        'To manage your subscription, please visit our website or use the mobile app.'
      );
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
            setIsCancelling(true);
            // Simulate API call to cancel subscription
            setTimeout(() => {
              setIsCancelling(false);
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
  
  const handleUpgradeToPremium = () => {
    setIsUpgrading(true);
    // Add a small delay to show loading state
    setTimeout(() => {
      setIsUpgrading(false);
      router.push('/premium');
    }, 300);
  };
  
  const handleLogout = () => {
    console.log("Logout button pressed");
    
    // Directly log out without confirmation for testing
    setIsLoggingOut(true);
    
    // Clear user data from the store
    clearUserData();
    
    // Navigate to the tabs screen after a delay
    setTimeout(() => {
      setIsLoggingOut(false);
      console.log("Navigating to tabs");
      router.replace('/(tabs)');
    }, 1000);
  };
  
  const handleNotificationsToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // In a real app, this would update user preferences in the backend
  };
  
  const handleViewNotifications = () => {
    router.push('/notifications');
  };
  
  const handlePrivacyPolicy = () => {
    router.push('/privacy-policy');
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      
      {/* We're removing the Stack.Screen options here since they're now defined in _layout.tsx */}
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{name.charAt(0)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{name}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
            {isPremium && (
              <View style={styles.premiumBadgeSmall}>
                <Zap size={12} color="#000" />
                <Text style={styles.premiumBadgeTextSmall}>Premium</Text>
              </View>
            )}
          </View>
        </View>
        
        {isPremium && (
          <View style={styles.premiumInfoCard}>
            <View style={styles.premiumBadge}>
              <Zap size={16} color="#000" />
              <Text style={styles.premiumBadgeText}>Premium Active</Text>
            </View>
            
            <View style={styles.premiumInfoRow}>
              <Clock size={16} color={darkTheme.secondaryText} />
              <Text style={styles.premiumInfoText}>
                Expires on {formatExpiryDate()}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.subscriptionButton}
              onPress={handleManageSubscription}
            >
              <View style={styles.subscriptionButtonContent}>
                <Text style={styles.subscriptionButtonText}>
                  {Platform.OS === 'ios' ? 'Manage in App Store' : Platform.OS === 'android' ? 'Manage in Google Play' : 'Manage Subscription'}
                </Text>
                <ExternalLink size={16} color={darkTheme.accent} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelSubscriptionButton}
              onPress={handleCancelSubscription}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color={darkTheme.danger} />
              ) : (
                <Text style={styles.cancelSubscriptionText}>Cancel Subscription</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.inputContainer}>
            <User size={20} color={darkTheme.secondaryText} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={darkTheme.secondaryText}
              value={name}
              onChangeText={setName}
              selectionColor={darkTheme.accent}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Mail size={20} color={darkTheme.secondaryText} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={darkTheme.secondaryText}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              selectionColor={darkTheme.accent}
              autoCapitalize="none"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSaveProfile}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(108, 92, 231, 0.15)' }]}>
                <Bell size={20} color={darkTheme.accent} />
              </View>
              <Text style={styles.preferenceText}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: darkTheme.border, true: 'rgba(108, 92, 231, 0.5)' }}
              thumbColor={notificationsEnabled ? darkTheme.accent : darkTheme.secondaryText}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleViewNotifications}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(108, 92, 231, 0.15)' }]}>
                <Bell size={20} color={darkTheme.accent} />
              </View>
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <ChevronRight size={20} color={darkTheme.secondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handlePrivacyPolicy}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(108, 92, 231, 0.15)' }]}>
                <Shield size={20} color={darkTheme.accent} />
              </View>
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </View>
            <ChevronRight size={20} color={darkTheme.secondaryText} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          {!isPremium && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleUpgradeToPremium}
              disabled={isUpgrading}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(255, 193, 7, 0.15)' }]}>
                  <Zap size={20} color={darkTheme.premium} />
                </View>
                <Text style={styles.menuItemText}>
                  {Platform.OS === 'ios' ? 'Upgrade via App Store' : Platform.OS === 'android' ? 'Upgrade via Google Play' : 'Upgrade to Premium'}
                </Text>
              </View>
              {isUpgrading ? (
                <ActivityIndicator size="small" color={darkTheme.premium} />
              ) : (
                <ChevronRight size={20} color={darkTheme.secondaryText} />
              )}
            </TouchableOpacity>
          )}
          
          {/* Completely redesigned logout button for better visibility and tappability */}
          <TouchableOpacity 
            style={styles.newLogoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={styles.newLogoutButtonContent}>
                <LogOut size={20} color="#FFFFFF" />
                <Text style={styles.newLogoutButtonText}>Logout</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {CONFIG.APP.NAME} v{CONFIG.APP.VERSION}
          </Text>
          <Text style={styles.footerText}>
            Contact: {CONFIG.APP.CONTACT_EMAIL}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: darkTheme.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: darkTheme.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: darkTheme.secondaryText,
    marginBottom: 6,
  },
  premiumBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: darkTheme.premium,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadgeTextSmall: {
    color: '#000',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  premiumInfoCard: {
    backgroundColor: darkTheme.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: darkTheme.premium,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  premiumBadgeText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  premiumInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  premiumInfoText: {
    fontSize: 14,
    color: darkTheme.text,
    marginLeft: 8,
  },
  subscriptionButton: {
    backgroundColor: 'rgba(63, 81, 181, 0.15)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  subscriptionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionButtonText: {
    color: darkTheme.accent,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
  },
  cancelSubscriptionButton: {
    alignSelf: 'center',
    marginTop: 4,
    height: 30,
    justifyContent: 'center',
  },
  cancelSubscriptionText: {
    color: darkTheme.danger,
    fontSize: 14,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: darkTheme.text,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: darkTheme.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: darkTheme.text,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: darkTheme.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    height: 50,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: darkTheme.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(63, 81, 181, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: darkTheme.text,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: darkTheme.border,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceText: {
    fontSize: 16,
    color: darkTheme.text,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: darkTheme.secondaryText,
    marginBottom: 6,
  },
  // Old logout button styles (kept for reference)
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: darkTheme.border,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: darkTheme.danger,
    fontWeight: '500',
    marginLeft: 12,
  },
  
  // New logout button styles - completely redesigned for better visibility
  newLogoutButton: {
    backgroundColor: darkTheme.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    height: 50,
    justifyContent: 'center',
  },
  newLogoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newLogoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
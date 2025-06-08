import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Alert, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Bell, HelpCircle, Shield, ExternalLink, ChevronRight } from 'lucide-react-native';
import { darkTheme } from '@/constants/colors';
import { CONFIG } from '@/constants/config';
import SettingsItem from '@/components/SettingsItem';

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const handleNotificationsToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };
  
  const handleOpenUserManual = () => {
    router.push('/user-manual');
  };
  
  const handleOpenPrivacyPolicy = () => {
    router.push('/privacy-policy');
  };
  
  const handleContactSupport = () => {
    const email = CONFIG.APP.CONTACT_EMAIL;
    const subject = 'Support Request - Trading ProAnalytics';
    const body = 'Hello, I need assistance with...';
    
    let url = '';
    if (Platform.OS === 'ios') {
      url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
      url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert(
            'Email Not Available',
            `Please contact us at ${email}`,
            [{ text: 'OK' }]
          );
        }
      })
      .catch(error => {
        console.error('Error opening email:', error);
        Alert.alert(
          'Error',
          `Please contact us at ${email}`,
          [{ text: 'OK' }]
        );
      });
  };
  
  const handleOpenWebsite = () => {
    Linking.openURL(CONFIG.APP.WEBSITE)
      .catch(err => {
        console.error("Couldn't open website:", err);
        Alert.alert('Error', "Couldn't open website");
      });
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={darkTheme.secondaryText} style={styles.settingIcon} />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: darkTheme.border, true: 'rgba(108, 92, 231, 0.5)' }}
              thumbColor={notificationsEnabled ? darkTheme.accent : darkTheme.secondaryText}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleOpenUserManual}>
            <View style={styles.settingLeft}>
              <HelpCircle size={20} color={darkTheme.secondaryText} style={styles.settingIcon} />
              <Text style={styles.settingText}>User Manual</Text>
            </View>
            <ChevronRight size={20} color={darkTheme.secondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleContactSupport}>
            <View style={styles.settingLeft}>
              <ExternalLink size={20} color={darkTheme.secondaryText} style={styles.settingIcon} />
              <Text style={styles.settingText}>Contact Support</Text>
            </View>
            <ChevronRight size={20} color={darkTheme.secondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleOpenPrivacyPolicy}>
            <View style={styles.settingLeft}>
              <Shield size={20} color={darkTheme.secondaryText} style={styles.settingIcon} />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <ChevronRight size={20} color={darkTheme.secondaryText} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.appVersion}>
            {CONFIG.APP.NAME} v{CONFIG.APP.VERSION}
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: darkTheme.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: darkTheme.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: darkTheme.text,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  appVersion: {
    fontSize: 14,
    color: darkTheme.secondaryText,
  },
});
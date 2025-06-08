import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { darkTheme } from '@/constants/colors';
import { useForexStore } from '@/store/forex-store';

interface NotificationBellProps {
  size?: number;
  color?: string;
}

export default function NotificationBell({ 
  size = 24, 
  color = darkTheme.text 
}: NotificationBellProps) {
  const router = useRouter();
  const { unreadNotificationsCount } = useForexStore();
  
  const handlePress = () => {
    router.push('/notifications');
  };
  
  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Bell size={size} color={color} />
      {unreadNotificationsCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: darkTheme.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
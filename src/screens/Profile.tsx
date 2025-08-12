import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  User,
  Settings,
  LogOut,
  ChevronLeft,
  Shield,
  Bell,
  HelpCircle,
  Info,
} from 'lucide-react-native';

import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import type { RootStackParamList } from '../navigation/types';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export default function Profile() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Confirm logout',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Could not sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: Settings,
      title: 'Settings',
      subtitle: 'App preferences and settings',
      onPress: () => console.log('Configurações'),
    },
    {
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Manage your notifications',
      onPress: () => console.log('Notificações'),
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      subtitle: 'Privacy and data controls',
      onPress: () => console.log('Privacidade'),
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Help center and support',
      onPress: () => console.log('Ajuda'),
    },
    {
      icon: Info,
      title: 'About',
      subtitle: 'Information about Joyn OS',
      onPress: () => console.log('Sobre'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight} />
      </View>

      {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <User size={40} color="white" />
          </View>
        </View>
        <Text style={styles.userName}>
          {user?.name || user?.email || 'Joyn OS User'}
        </Text>
        {user?.email && (
          <Text style={styles.userEmail}>{user.email}</Text>
        )}
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIcon}>
                  <IconComponent size={20} color="#00C48C" />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <Button
          onPress={handleLogout}
          style={styles.logoutButton}
          title=""
        >
          <View style={styles.logoutButtonContent}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutButtonText}>Sign out</Text>
          </View>
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00C48C',
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  menuSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 196, 140, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  logoutSection: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
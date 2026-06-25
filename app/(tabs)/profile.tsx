import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, HelpCircle, LogOut, ChevronRight, FileText } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { useTheme, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/contexts/ThemeContext';

export default function ProfileScreen() {
  const { colors } = useTheme();

  const handleOpenResume = () => {
    const resumeUrl = 'https://drive.google.com/file/d/1_bPym8lkJZGEW9D0_MxkkfDxo5w6gstl/view?usp=sharing';
    if (Platform.OS === 'web') {
      window.open(resumeUrl, '_blank');
    } else {
      WebBrowser.openBrowserAsync(resumeUrl);
    }
  };

  const menuItems = [
    { icon: User, label: 'My Account', onPress: () => {} },
    { icon: FileText, label: "View Developer's Resume", onPress: handleOpenResume },
    { icon: Settings, label: 'Settings', onPress: () => {} },
    { icon: HelpCircle, label: 'Help & Support', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatarContainer, { borderColor: colors.primary }]}>
          <User size={32} color={colors.primary} />
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>Welcome!</Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          Sign in to access your orders
        </Text>
      </View>

      <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <item.icon size={20} color={colors.primary} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.signInButton, { backgroundColor: colors.primary }]}>
        <Text style={styles.signInButtonText}>SIGN IN</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  userName: {
    ...TYPOGRAPHY.h2,
    fontWeight: '600',
  marginBottom: SPACING.xs,
  },
  userEmail: {
    ...TYPOGRAPHY.body1,
    textAlign: 'center',
  },
  menuContainer: {
    marginTop: SPACING.xxxl,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuLabel: {
    ...TYPOGRAPHY.body1,
    flex: 1,
  },
  signInButton: {
    position: 'absolute',
    bottom: SPACING.xxxl,
    left: SPACING.lg,
    right: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  signInButtonText: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

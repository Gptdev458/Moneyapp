// src/screens/MoreScreen/MoreScreen.tsx
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAccountContext } from '../../contexts/AccountContext';
import { useBudgetContext } from '../../contexts/BudgetContext';
import { useCategoryContext } from '../../contexts/CategoryContext';
import { useAppTheme } from '../../contexts/ThemeContext';
import { useTransactionContext } from '../../contexts/TransactionContext';
import * as storageService from '../../services/storageService';
import { BottomTabParamList, RootStackParamList } from '../../types';

// Define combined navigation prop type for this screen
type MoreScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'MoreTab'>,
  StackNavigationProp<RootStackParamList>
>;

const MoreScreen = () => {
  const { theme, themeMode, setThemeMode } = useAppTheme();
  const navigation = useNavigation<MoreScreenNavigationProp>();
  const { refreshBudgets } = useBudgetContext();
  const { refreshCategories } = useCategoryContext();
  const { refreshTransactions } = useTransactionContext();
  const { refreshAccounts } = useAccountContext();

  const handleResetData = useCallback(() => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your budgets, transactions, and categories. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              // Reset all data in storage
              await storageService.resetAllData();
              
              // Refresh all contexts to update UI
              await refreshBudgets();
              await refreshCategories();
              await refreshTransactions();
              await refreshAccounts();
              
              // Show success message
              Alert.alert(
                'Data Reset Complete',
                'All app data has been successfully reset.'
              );
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert(
                'Error',
                'There was a problem resetting your data. Please try again.'
              );
            }
          }
        }
      ],
      { cancelable: true }
    );
  }, [refreshBudgets, refreshCategories, refreshTransactions, refreshAccounts]);

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          title: 'Accounts Settings',
          icon: 'wallet',
          iconColor: '#3b82f6', // blue-500
          onPress: () => navigation.navigate('AccountSettings')
        },
        {
          title: 'Category Settings',
          icon: 'shape',
          iconColor: '#a855f7', // purple-500
          onPress: () => navigation.navigate('CategorySettings')
        },
        {
          title: 'Budget Settings',
          icon: 'chart-bar',
          iconColor: '#22c55e', // green-500
          onPress: () => console.log('Budget Settings pressed')
        }
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          title: 'Currency',
          icon: 'cash',
          iconColor: '#eab308', // yellow-500
          subtitle: 'EUR',
          onPress: () => console.log('Currency pressed')
        },
        {
          title: 'Theme',
          icon: 'theme-light-dark',
          iconColor: '#6366f1', // indigo-500
          subtitle: themeMode === 'dark' ? 'Dark' : 'Light',
          onPress: () => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')
        },
        {
          title: 'Language',
          icon: 'translate',
          iconColor: '#ef4444', // red-500
          subtitle: 'English',
          onPress: () => console.log('Language pressed')
        },
        {
          title: 'Other',
          icon: 'dots-horizontal-circle',
          iconColor: '#6b7280', // gray-500
          onPress: () => console.log('Other pressed')
        }
      ]
    },
    {
      title: 'Data',
      items: [
        {
          title: 'Export Data',
          icon: 'database-export',
          onPress: () => console.log('Export Data pressed')
        },
        {
          title: 'Import Data',
          icon: 'database-import',
          onPress: () => console.log('Import Data pressed')
        },
        {
          title: 'Reset Data',
          icon: 'delete-forever',
          iconColor: theme.colors.expense,
          onPress: handleResetData
        }
      ]
    },
    {
      title: 'About',
      items: [
        {
          title: 'Help',
          icon: 'help-circle',
          onPress: () => console.log('Help pressed')
        },
        {
          title: 'Privacy Policy',
          icon: 'shield-lock',
          onPress: () => console.log('Privacy Policy pressed')
        },
        {
          title: 'Terms of Service',
          icon: 'text-box',
          onPress: () => console.log('Terms of Service pressed')
        },
        {
          title: 'Rate App',
          icon: 'star',
          onPress: () => console.log('Rate App pressed')
        },
        {
          title: 'Version',
          icon: 'information',
          subtitle: '1.0.0',
          disabled: true
        }
      ]
    }
  ];

  const renderSettingItem = (item: {
    title: string;
    icon: string;
    subtitle?: string;
    value?: boolean;
    isToggle?: boolean;
    iconColor?: string;
    disabled?: boolean;
    onPress?: () => void;
  }) => {
    return (
      <TouchableOpacity
        key={item.title}
        style={styles.settingItem}
        onPress={item.onPress}
        disabled={item.disabled}
      >
        <View style={styles.settingItemLeft}>
          <View style={[styles.iconContainer, { backgroundColor: item.iconColor || theme.colors.primary }]}>
            <MaterialCommunityIcons 
              name={item.icon} 
              size={20} 
              color="#FFFFFF"
            />
          </View>
          <View style={styles.settingItemContent}>
            <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>
        
        {item.isToggle ? (
          <View style={[
            styles.toggleTrack, 
            { backgroundColor: item.value ? theme.colors.primary : theme.colors.border }
          ]}>
            <View style={[
              styles.toggleThumb,
              { 
                backgroundColor: theme.colors.background,
                transform: [{ translateX: item.value ? 16 : 0 }] 
              }
            ]} />
          </View>
        ) : !item.disabled && (
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={theme.colors.textSecondary}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <MaterialCommunityIcons 
              name="cog-outline" 
              size={24} 
              color={theme.colors.textPrimary} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.scrollContent}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              {section.title}
            </Text>
            
            <View style={[styles.sectionContent, { backgroundColor: theme.colors.surfaceVariant }]}>
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={item.title}>
                  {renderSettingItem(item)}
                  {itemIndex < section.items.length - 1 && (
                    <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Made with ❤️ by BudgetTracker Team
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionContent: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingItemContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  toggleTrack: {
    width: 36,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  divider: {
    marginLeft: 68,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});

export default MoreScreen;
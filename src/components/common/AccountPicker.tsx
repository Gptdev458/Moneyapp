import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Account, AccountType } from '../../types';

// Helper function to get friendly display name for account types
const getAccountTypeDisplayName = (type: AccountType): string => {
  const displayNames: Record<AccountType, string> = {
    cash: 'Cash',
    bank: 'Bank',
    savings: 'Savings',
    investment: 'Investment',
    debt: 'Debt',
    other: 'Other'
  };
  return displayNames[type] || type;
};

interface AccountPickerProps {
  accounts: Account[];
  selectedAccountId: string | null;
  onSelectAccount: (accountId: string) => void;
  onDismiss: () => void;
  visible: boolean;
  onProceedToCategory?: () => void;
}

const AccountPicker: React.FC<AccountPickerProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onDismiss,
  visible,
  onProceedToCategory
}) => {
  // Track selected account type (for the left column)
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType | null>(null);
  
  // Filter out archived accounts
  const filteredAccounts = accounts.filter(account => !account.isArchived);

  // Get unique account types from the filtered accounts
  const accountTypes = Array.from(
    new Set(filteredAccounts.map(account => account.type))
  ) as AccountType[];

  // Get accounts for a specific type
  const getAccountsByType = (type: AccountType) => {
    return filteredAccounts.filter(account => account.type === type);
  };

  // Check if account type has any accounts
  const hasAccounts = (type: AccountType) => {
    return getAccountsByType(type).length > 0;
  };

  // Auto-select the first account type that has accounts
  useEffect(() => {
    if (!selectedAccountType && accountTypes.length > 0) {
      // Find first type with accounts
      const firstTypeWithAccounts = accountTypes.find(type => hasAccounts(type)) || accountTypes[0];
      setSelectedAccountType(firstTypeWithAccounts);
    }
  }, [accountTypes, selectedAccountType]);

  // Render account type item (left column)
  const renderAccountTypeItem = ({ item: type }: { item: AccountType }) => {
    const isSelected = type === selectedAccountType;
    const accountsOfType = getAccountsByType(type);
    const hasAccountsOfType = accountsOfType.length > 0;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          { borderBottomColor: '#3d4049' },
          isSelected && { backgroundColor: '#383b44' }
        ]}
        onPress={() => {
          if (hasAccountsOfType) {
            setSelectedAccountType(type);
          }
        }}
        disabled={!hasAccountsOfType}
      >
        <Text style={[
          styles.categoryName, 
          !hasAccountsOfType && { color: '#6b7280' }
        ]}>
          {getAccountTypeDisplayName(type)}
        </Text>
        {hasAccountsOfType && (
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={20} 
            color="#FFFFFF" 
          />
        )}
      </TouchableOpacity>
    );
  };

  // Render account item (right column)
  const renderAccountItem = ({ item: account }: { item: Account }) => {
    return (
      <TouchableOpacity
        style={[styles.categoryItem, { borderBottomColor: '#3d4049' }]}
        onPress={() => {
          onSelectAccount(account.id);
          if (onProceedToCategory) {
            onProceedToCategory();
          } else {
            onDismiss();
          }
        }}
      >
        <Text style={styles.categoryName}>{account.name}</Text>
        <Text style={styles.accountBalance}>€{account.initialBalance.toFixed(2)}</Text>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.panel}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: '#3d4049', borderBottomWidth: 1 }]}>
        <Text style={styles.title}>Accounts</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={onDismiss}>
            <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Two-column Content */}
      <View style={styles.content}>
        {/* Left Column: Account Types */}
        <View style={styles.leftColumn}>
          <FlatList
            data={accountTypes}
            renderItem={renderAccountTypeItem}
            keyExtractor={item => item}
          />
        </View>
        
        {/* Right Column: Accounts of selected type */}
        <View style={styles.rightColumn}>
          {selectedAccountType && (
            <FlatList
              data={getAccountsByType(selectedAccountType)}
              renderItem={renderAccountItem}
              keyExtractor={item => item.id}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#282c34',
    overflow: 'hidden',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    width: '50%',
    borderRightWidth: 1,
    borderRightColor: '#3d4049',
  },
  rightColumn: {
    width: '50%',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  categoryName: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  accountBalance: {
    fontSize: 16,
    color: '#9ca3af',
  },
});

export default AccountPicker; 
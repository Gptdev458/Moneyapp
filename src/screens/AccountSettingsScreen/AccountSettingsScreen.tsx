import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Dialog, IconButton, List, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import IconPicker from '../../components/IconPicker/IconPicker';
import { useAccountContext } from '../../contexts/AccountContext';
import { AccountType, IAccount } from '../../models/account';
import { RootStackParamList } from '../../types';

type AccountSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AccountSettings'>;

type AccountTypeItem = {
  type: AccountType;
  icon: string;
  color: string;
};

const ACCOUNT_TYPES: AccountTypeItem[] = [
  { type: 'cash', icon: 'cash', color: '#4CAF50' },
  { type: 'bank', icon: 'bank', color: '#2196F3' },
  { type: 'savings', icon: 'piggy-bank', color: '#9C27B0' },
  { type: 'investment', icon: 'chart-line', color: '#FF9800' },
  { type: 'debt', icon: 'credit-card', color: '#F44336' },
  { type: 'other', icon: 'wallet', color: '#607D8B' },
];

const AccountSettingsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<AccountSettingsScreenNavigationProp>();
  const { accounts, addAccount, updateAccount, deleteAccount } = useAccountContext();
  
  const [editAccountVisible, setEditAccountVisible] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<IAccount | null>(null);
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('cash');
  const [accountSubtype, setAccountSubtype] = useState('');
  const [initialBalance, setInitialBalance] = useState('0');
  const [accountIcon, setAccountIcon] = useState('wallet');
  const [accountColor, setAccountColor] = useState('#4CAF50');
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  
  // Group accounts by type
  const groupedAccounts = accounts.reduce<Record<string, IAccount[]>>((acc, account) => {
    if (!account.isArchived) {
      if (!acc[account.type]) {
        acc[account.type] = [];
      }
      acc[account.type].push(account);
    }
    return acc;
  }, {});

  const getAccountTypes = () => {
    return ACCOUNT_TYPES;
  };

  const handleAddAccount = () => {
    setCurrentAccount(null);
    setAccountName('');
    setAccountType('cash');
    setAccountSubtype('');
    setInitialBalance('0');
    const typeInfo = ACCOUNT_TYPES.find(t => t.type === 'cash');
    setAccountIcon(typeInfo?.icon || 'wallet');
    setAccountColor(typeInfo?.color || '#4CAF50');
    setEditAccountVisible(true);
  };

  const handleEditAccount = (account: IAccount) => {
    setCurrentAccount(account);
    setAccountName(account.name);
    setAccountType(account.type);
    setAccountSubtype(account.subtype || '');
    setInitialBalance(account.initialBalance.toString());
    setAccountIcon(account.icon || ACCOUNT_TYPES.find(t => t.type === account.type)?.icon || 'wallet');
    setAccountColor(account.color || ACCOUNT_TYPES.find(t => t.type === account.type)?.color || '#4CAF50');
    setEditAccountVisible(true);
  };

  const handleDeleteAccount = (account: IAccount) => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete the "${account.name}" account? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteAccount(account.id)
        }
      ]
    );
  };

  const handleSaveAccount = async () => {
    if (!accountName.trim()) {
      Alert.alert('Error', 'Please enter an account name');
      return;
    }

    try {
      if (currentAccount) {
        // Update existing account
        await updateAccount({
          ...currentAccount,
          name: accountName,
          type: accountType,
          subtype: accountSubtype.trim() || undefined,
          initialBalance: parseFloat(initialBalance) || 0,
          icon: accountIcon,
          color: accountColor
        });
      } else {
        // Add new account
        await addAccount({
          name: accountName,
          type: accountType,
          subtype: accountSubtype.trim() || undefined,
          initialBalance: parseFloat(initialBalance) || 0,
          currency: 'EUR', // Default currency, could be made configurable
          includeInNetWorth: true,
          icon: accountIcon,
          color: accountColor
        });
      }
      setEditAccountVisible(false);
    } catch (error) {
      console.error('Error saving account:', error);
      Alert.alert('Error', 'There was an error saving the account');
    }
  };

  const handleChangeAccountType = (type: AccountType) => {
    setAccountType(type);
    // Update icon and color based on the selected type
    const typeInfo = ACCOUNT_TYPES.find(t => t.type === type);
    if (typeInfo) {
      setAccountIcon(typeInfo.icon);
      setAccountColor(typeInfo.color);
    }
  };

  const handleIconSelected = (icon: string, color: string) => {
    setAccountIcon(icon);
    setAccountColor(color);
    setIconPickerVisible(false);
  };

  const renderAccountItem = ({ item }: { item: IAccount }) => (
    <List.Item
      key={item.id}
      title={item.name}
      description={item.subtype ? item.subtype : undefined}
      left={props => (
        <View style={[styles.iconContainer, { backgroundColor: item.color || theme.colors.primary }]}>
          <MaterialCommunityIcons 
            name={item.icon || 'wallet'} 
            size={24} 
            color="#FFFFFF"
          />
        </View>
      )}
      right={props => (
        <View style={styles.actionsContainer}>
          <Text style={{ color: theme.colors.onSurface }}>{item.initialBalance.toFixed(2)} €</Text>
          <IconButton icon="pencil" size={20} onPress={() => handleEditAccount(item)} />
          <IconButton icon="delete" size={20} onPress={() => handleDeleteAccount(item)} />
        </View>
      )}
    />
  );

  const renderAccountType = (accountType: AccountTypeItem) => {
    const accountsOfType = groupedAccounts[accountType.type] || [];
    
    return (
      <List.Section key={accountType.type}>
        <List.Subheader style={styles.typeHeader}>
          <View style={styles.typeHeaderContent}>
            <MaterialCommunityIcons 
              name={accountType.icon} 
              size={24} 
              color={accountType.color} 
              style={styles.typeIcon} 
            />
            <Text style={styles.typeTitle}>
              {accountType.type.charAt(0).toUpperCase() + accountType.type.slice(1)}
            </Text>
          </View>
        </List.Subheader>
        
        {accountsOfType.length > 0 ? (
          accountsOfType.map(account => renderAccountItem({ item: account }))
        ) : (
          <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>No {accountType.type} accounts yet</Text>
        )}
        
        <Button 
          icon="plus" 
          mode="outlined" 
          style={styles.addButton}
          onPress={() => {
            setCurrentAccount(null);
            setAccountName('');
            setAccountType(accountType.type);
            setAccountSubtype('');
            setInitialBalance('0');
            setAccountIcon(accountType.icon);
            setAccountColor(accountType.color);
            setEditAccountVisible(true);
          }}
        >
          Add {accountType.type} account
        </Button>
      </List.Section>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          size={24} 
          onPress={() => navigation.goBack()} 
        />
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Account Settings</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {getAccountTypes().map(renderAccountType)}
      </ScrollView>
      
      <Portal>
        <Dialog visible={editAccountVisible} onDismiss={() => setEditAccountVisible(false)}>
          <Dialog.Title>{currentAccount ? 'Edit Account' : 'Add Account'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Account Name"
              value={accountName}
              onChangeText={setAccountName}
              mode="outlined"
              style={styles.input}
            />
            
            <View style={styles.typeSelection}>
              <Text style={[styles.inputLabel, { color: theme.colors.onSurface }]}>Account Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                {ACCOUNT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.type}
                    style={[
                      styles.typeButton,
                      { 
                        backgroundColor: type.color, 
                        opacity: accountType === type.type ? 1 : 0.6,
                        borderWidth: theme.dark ? 1 : 0,
                        borderColor: theme.dark ? 'rgba(255,255,255,0.2)' : 'transparent'
                      }
                    ]}
                    onPress={() => handleChangeAccountType(type.type)}
                  >
                    <MaterialCommunityIcons name={type.icon} size={24} color="#FFFFFF" />
                    <Text style={styles.typeButtonText}>
                      {type.type.charAt(0).toUpperCase() + type.type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <TextInput
              label="Account Subtype (optional)"
              value={accountSubtype}
              onChangeText={setAccountSubtype}
              mode="outlined"
              style={styles.input}
              placeholder="e.g. Wallet, Zekuci Racun, etc."
            />
            
            <TextInput
              label="Initial Balance"
              value={initialBalance}
              onChangeText={setInitialBalance}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
            />

            <View style={styles.iconPickerButton}>
              <Text style={[styles.inputLabel, { color: theme.colors.onSurface }]}>Icon & Color</Text>
              <TouchableOpacity
                style={[
                  styles.iconPreview, 
                  { 
                    backgroundColor: accountColor,
                    borderWidth: theme.dark ? 1 : 0,
                    borderColor: theme.dark ? theme.colors.outline : 'transparent'
                  }
                ]}
                onPress={() => setIconPickerVisible(true)}
              >
                <MaterialCommunityIcons name={accountIcon} size={30} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditAccountVisible(false)}>Cancel</Button>
            <Button onPress={handleSaveAccount}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <IconPicker
        visible={iconPickerVisible}
        onDismiss={() => setIconPickerVisible(false)}
        onSelect={handleIconSelected}
        initialIcon={accountIcon}
        initialColor={accountColor}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  typeHeader: {
    marginVertical: 8,
  },
  typeHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    marginRight: 8,
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyStateText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
    opacity: 0.7,
  },
  addButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  typeSelection: {
    marginBottom: 16,
  },
  typeScroll: {
    flexDirection: 'row',
    marginTop: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  iconPickerButton: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  iconPreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AccountSettingsScreen; 
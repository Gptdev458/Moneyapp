// src/screens/AddTransaction/AddTransactionScreen.tsx
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import uuid from 'react-native-uuid';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import NumericKeypad from '../../components/common/NumericKeypad';
import { useAccountContext } from '../../contexts/AccountContext';
import { useCategoryContext } from '../../contexts/CategoryContext';
import { useAppTheme } from '../../contexts/ThemeContext';
import { useTransactionContext } from '../../contexts/TransactionContext';
import { Account, RootStackParamList, TransactionEnumType } from '../../types';

type TransactionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddTransaction'>;
type TransactionScreenRouteProp = RouteProp<RootStackParamList, 'AddTransaction'>;

const AddTransactionScreen = () => {
  const navigation = useNavigation<TransactionScreenNavigationProp>();
  const route = useRoute<TransactionScreenRouteProp>();
  const { accounts } = useAccountContext();
  const { categories } = useCategoryContext();
  const { addTransaction } = useTransactionContext();
  const { theme } = useAppTheme();
  
  // Set default transaction type from params or use 'expense' as default
  const [transactionType, setTransactionType] = useState<TransactionEnumType>(
    route.params?.type || 'expense'
  );
  
  // Form state
  const [amount, setAmount] = useState('0.00');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [accountId, setAccountId] = useState(route.params?.accountId || (accounts.length > 0 ? accounts[0].id : ''));
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date());
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  
  // Account selection panel animation
  const [accountPanelAnimation] = useState(new Animated.Value(0));
  const screenHeight = Dimensions.get('window').height;
  
  // Get the selected account & category
  const selectedAccount = accounts.find(acc => acc.id === accountId);
  const selectedCategory = categories.find(cat => cat.id === categoryId);
  
  // Get categories filtered by transaction type
  const filteredCategories = categories.filter(cat => cat.type === transactionType);
  
  // Animate account panel in/out
  useEffect(() => {
    if (showAccountSelector) {
      Animated.timing(accountPanelAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    } else {
      Animated.timing(accountPanelAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [showAccountSelector, accountPanelAnimation]);
  
  // Format date for display
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekday = weekdays[date.getDay()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${month}/${day}/${year.toString().slice(2)} (${weekday}) ${hours}:${minutes}`;
  };
  
  // Handle input from numeric keypad
  const handleKeypadInput = useCallback((key: string) => {
    if (key === 'backspace') {
      setAmount(prev => (prev.length > 1 ? prev.slice(0, -1) : '0.00'));
    } else if (key === '.') {
      if (!amount.includes('.')) {
        setAmount(prev => prev + '.');
      }
    } else {
      setAmount(prev => {
        if (prev === '0.00') {
          return key + '.00';
        }
        if (prev.endsWith('.00') && !prev.includes('.', 0)) {
          return prev.slice(0, -3) + key + '.00';
        }
        return prev + key;
      });
    }
  }, [amount]);
  
  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (!accountId || (transactionType !== 'transfer' && !categoryId) || parseFloat(amount) <= 0) {
      // Show validation error toast
      console.log('Validation error: missing required fields or invalid amount');
      return;
    }
    
    const newTransaction = {
      id: uuid.v4().toString(),
      type: transactionType,
      date: date.toISOString(),
      amount: parseFloat(amount),
      accountId,
      categoryId: transactionType !== 'transfer' ? categoryId : undefined,
      description: description || 'Unnamed transaction',
      note: note || undefined,
    };
    
    console.log('Saving transaction:', newTransaction);
    addTransaction(newTransaction);
    navigation.goBack();
  }, [accountId, categoryId, description, amount, transactionType, date, note, addTransaction, navigation]);
  
  // Render grid of accounts
  const renderAccountGrid = () => {
    const accountsByGroup: Record<string, Account[]> = {};
    
    accounts.forEach(acc => {
      if (!accountsByGroup[acc.type]) {
        accountsByGroup[acc.type] = [];
      }
      accountsByGroup[acc.type].push(acc);
    });
    
    const groups = Object.keys(accountsByGroup);
    
    return (
      <View style={styles.accountGrid}>
        {accounts.map((account, index) => (
          <TouchableOpacity
            key={account.id}
            style={[
              styles.accountGridItem,
              index % 3 !== 0 && styles.accountGridItemBorderLeft,
              index >= 3 && styles.accountGridItemBorderTop,
            ]}
            onPress={() => {
              setAccountId(account.id);
              setShowAccountSelector(false);
            }}
          >
            <Text style={styles.accountGridItemText}>{account.name}</Text>
          </TouchableOpacity>
        ))}
        {/* Add empty cells to complete the grid if needed */}
        {accounts.length % 3 !== 0 && (
          Array(3 - (accounts.length % 3)).fill(0).map((_, index) => (
            <View 
              key={`empty-${index}`} 
              style={[
                styles.accountGridItem, 
                styles.accountGridItemBorderLeft,
                accounts.length >= 3 && styles.accountGridItemBorderTop
              ]} 
            />
          ))
        )}
      </View>
    );
  };
  
  // Get tab style based on transaction type
  const getTabStyle = (type: TransactionEnumType) => {
    if (transactionType === type) {
      // Use theme colors for consistency
      const bgColor = type === 'expense' ? theme.colors.expense :
                      type === 'income' ? theme.colors.income :
                      theme.colors.primary; // Assuming primary is blue for transfer
      return {
        backgroundColor: bgColor,
        borderColor: bgColor,
      };
    }
    return {
      backgroundColor: theme.colors.surfaceVariant,
      borderColor: theme.colors.border, // Added border color for inactive tabs for consistency
    };
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.starButton}>
          <MaterialCommunityIcons name="star-outline" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>
      
      {/* Transaction Type Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, getTabStyle('income')]}
          onPress={() => setTransactionType('income')}
        >
          <Text style={styles.tabText}>Income</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, getTabStyle('expense')]}
          onPress={() => setTransactionType('expense')}
        >
          <Text style={styles.tabText}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, getTabStyle('transfer')]}
          onPress={() => setTransactionType('transfer')}
        >
          <Text style={styles.tabText}>Transfer</Text>
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView style={styles.scrollView}>
          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Date Field */}
            <View style={styles.dateContainer}>
              <View>
                <Text style={styles.fieldLabel}>Date</Text>
                <Text style={styles.dateText}>{formatDate(date)}</Text>
              </View>
              <TouchableOpacity>
                <MaterialCommunityIcons name="refresh" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {/* Account Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Account:</Text>
              <TouchableOpacity 
                style={[
                  styles.fieldInput, 
                  showAccountSelector && { borderBottomColor: '#F44336' }
                ]}
                onPress={() => {
                  setShowKeypad(false);
                  setShowAccountSelector(true);
                }}
              >
                <Text style={selectedAccount ? styles.fieldText : styles.fieldPlaceholder}>
                  {selectedAccount ? selectedAccount.name : 'Select account'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Category Field (not shown for transfers) */}
            {transactionType !== 'transfer' && (
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Category:</Text>
                <TouchableOpacity 
                  style={styles.fieldInput}
                  onPress={() => {
                    setShowKeypad(false);
                    setShowCategorySelector(true);
                  }}
                >
                  <Text style={selectedCategory ? styles.fieldText : styles.fieldPlaceholder}>
                    {selectedCategory ? selectedCategory.name : 'Select category'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Amount Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Amount:</Text>
              <TouchableOpacity 
                style={styles.fieldInput}
                onPress={() => setShowKeypad(true)}
              >
                <Text style={styles.fieldText}>
                  {amount}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Description Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Description:</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldText]}
                placeholder="Add description"
                placeholderTextColor={theme.colors.textSecondary}
                value={description}
                onChangeText={setDescription}
              />
            </View>
            
            {/* Note Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Note:</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldText]}
                placeholder="Add note"
                placeholderTextColor={theme.colors.textSecondary}
                value={note}
                onChangeText={setNote}
              />
            </View>
            
            {/* Save Button */}
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSubmit}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        {/* Numeric Keypad */}
        {showKeypad && (
          <NumericKeypad onKeyPress={handleKeypadInput} theme={theme} />
        )}
        
        {/* Account Selection Panel */}
        <Animated.View 
          style={[
            styles.accountPanel,
            {
              transform: [
                {
                  translateY: accountPanelAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [screenHeight, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.accountPanelHeader}>
            <Text style={styles.accountPanelTitle}>Accounts</Text>
            <View style={styles.accountPanelActions}>
              <TouchableOpacity style={styles.accountPanelAction}>
                <MaterialCommunityIcons name="format-list-bulleted" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.accountPanelAction}>
                <MaterialCommunityIcons name="pencil" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.accountPanelAction}
                onPress={() => setShowAccountSelector(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
          
          {renderAccountGrid()}
        </Animated.View>
      </KeyboardAvoidingView>
      
      {/* Overlay for account panel */}
      {showAccountSelector && (
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1}
          onPress={() => setShowAccountSelector(false)}
        />
      )}
      
      {/* Category Selection Modal */}
      {showCategorySelector && (
        <View style={[styles.modal, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategorySelector(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.categoriesList}>
              {filteredCategories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    categoryId === category.id && { backgroundColor: theme.colors.surfaceVariant }
                  ]}
                  onPress={() => {
                    setCategoryId(category.id);
                    setShowCategorySelector(false);
                  }}
                >
                  <MaterialCommunityIcons 
                    name={category.icon || "shape-outline"} 
                    size={24} 
                    color={category.color || theme.colors.primary} 
                  />
                  <Text style={[styles.categoryItemText, { color: theme.colors.textPrimary }]}>
                    {category.name}
                  </Text>
                  {categoryId === category.id && (
                    <MaterialCommunityIcons name="check" size={24} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  starButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  fieldLabel: {
    color: 'white',
    fontSize: 14,
    width: 80,
  },
  dateText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fieldInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#4a4a4a',
    paddingVertical: 8,
  },
  fieldText: {
    color: 'white',
    fontSize: 16,
  },
  fieldPlaceholder: {
    color: '#9E9E9E',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#E53935',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  accountPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2d3038',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 1000,
  },
  accountPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4a4a4a',
  },
  accountPanelTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  accountPanelActions: {
    flexDirection: 'row',
    gap: 16,
  },
  accountPanelAction: {
    padding: 4,
  },
  accountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  accountGridItem: {
    width: '33.333%',
    paddingVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountGridItemBorderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: '#4a4a4a',
  },
  accountGridItemBorderTop: {
    borderTopWidth: 1,
    borderTopColor: '#4a4a4a',
  },
  accountGridItemText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  modal: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4a4a4a',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoriesList: {
    maxHeight: 400,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4a4a4a',
  },
  categoryItemText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
});

export default AddTransactionScreen;
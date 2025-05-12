// src/screens/AddTransaction/AddTransactionScreen.tsx
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { RootStackParamList, TransactionEnumType } from '../../types';

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
  
  // Form state - start with empty account and category
  const [amount, setAmount] = useState('0.00');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [accountId, setAccountId] = useState(''); // Empty by default
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date());
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  
  // Category selection state
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<string | null>(null);
  
  // Input refs for focus management - only for TextInput elements
  const descriptionInputRef = useRef<TextInput>(null);
  const noteInputRef = useRef<TextInput>(null);
  
  // Account selection panel animation
  const [accountPanelAnimation] = useState(new Animated.Value(0));
  const screenHeight = Dimensions.get('window').height;
  
  // Get the selected account & category
  const selectedAccount = accounts.find(acc => acc.id === accountId);
  const selectedCategory = categories.find(cat => cat.id === categoryId);
  
  // Get categories filtered by transaction type
  const filteredCategories = categories.filter(cat => 
    cat.type === transactionType && !cat.isArchived
  );
  
  // Get main categories (no parentId)
  const getMainCategories = () => {
    return filteredCategories.filter(cat => !cat.parentId);
  };
  
  // Get subcategories for a parent category
  const getSubcategories = (parentId: string) => {
    return filteredCategories.filter(cat => cat.parentId === parentId);
  };
  
  // Get selected parent category
  const getSelectedParentCategory = () => {
    if (!categoryId) return null;
    
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return null;
    
    // If selected category is a main category, return it
    if (!category.parentId) return category;
    
    // If selected category is a subcategory, return its parent
    return categories.find(cat => cat.id === category.parentId) || null;
  };

  // Check if a field is valid
  const isFieldValid = (field: string) => {
    switch (field) {
      case 'account':
        return !!accountId;
      case 'category':
        return transactionType === 'transfer' || !!categoryId;
      case 'amount':
        return parseFloat(amount) > 0;
      default:
        return true;
    }
  };
  
  // Focus next field
  const focusNextField = (currentField: string) => {
    if (!isFieldValid(currentField)) return;
    
    switch (currentField) {
      case 'account':
        if (transactionType !== 'transfer') {
          setShowCategorySelector(true);
        } else {
          setShowKeypad(true);
        }
        break;
      case 'category':
        setShowKeypad(true);
        break;
      case 'amount':
        descriptionInputRef.current?.focus();
        break;
      case 'description':
        noteInputRef.current?.focus();
        break;
      default:
        break;
    }
  };
  
  // Show/hide the account selector
  useEffect(() => {
    Animated.timing(accountPanelAnimation, {
      toValue: showAccountSelector ? 1 : 0,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [showAccountSelector, accountPanelAnimation]);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle numeric keypad input for amount field
  const handleKeypadInput = (key: string) => {
    if (key === 'delete') {
      setAmount(prev => {
        if (prev === '0.00') return prev;
        const withoutLastChar = prev.slice(0, -1);
        if (withoutLastChar === '' || withoutLastChar === '0.0' || withoutLastChar === '0.') {
          return '0.00';
        }
        return withoutLastChar;
      });
      return;
    }
    
    if (key === 'done') {
      setShowKeypad(false);
      focusNextField('amount');
      return;
    }
    
    setAmount(prev => {
      if (prev === '0.00') {
        return key === '.' ? `0.` : `${key}.00`;
      }
      
      // Handle decimal places
      const [whole, decimal] = prev.split('.');
      if (decimal && decimal.length >= 2) {
        return prev;
      }
      
      return prev + key;
    });
  };

  // Render account grid
  const renderAccountGrid = () => {
    return (
      <View style={styles.accountGrid}>
        {accounts.map((account, index) => (
          <TouchableOpacity
            key={account.id}
            style={[
              styles.accountGridItem,
              index % 3 !== 0 && { borderLeftWidth: 1, borderLeftColor: theme.colors.border },
              index >= 3 && { borderTopWidth: 1, borderTopColor: theme.colors.border },
              accountId === account.id && { backgroundColor: theme.colors.surfaceVariant }
            ]}
            onPress={() => {
              setAccountId(account.id);
              setShowAccountSelector(false);
              focusNextField('account');
            }}
          >
            <Text style={[styles.accountGridItemText, { color: theme.colors.textPrimary }]}>
              {account.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
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
  
  // Get tab style based on transaction type
  const getTabStyle = (type: TransactionEnumType) => {
    if (transactionType === type) {
      // Use theme colors for active tab
      const bgColor = type === 'expense' ? theme.colors.expense :
                      type === 'income' ? theme.colors.income :
                      theme.colors.primary;
      return {
        backgroundColor: bgColor,
        borderColor: bgColor,
      };
    }
    return {
      backgroundColor: theme.colors.surfaceVariant,
      borderColor: theme.colors.border,
    };
  };
  
  // Get tab text style based on transaction type
  const getTabTextStyle = (type: TransactionEnumType) => {
    return [
      {
        color: transactionType === type ? '#FFFFFF' : theme.colors.textPrimary,
        fontWeight: '600' as const,
        fontSize: 16,
      }
    ];
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
          <Text style={getTabTextStyle('income')}>Income</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, getTabStyle('expense')]}
          onPress={() => setTransactionType('expense')}
        >
          <Text style={getTabTextStyle('expense')}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, getTabStyle('transfer')]}
          onPress={() => setTransactionType('transfer')}
        >
          <Text style={getTabTextStyle('transfer')}>Transfer</Text>
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
                <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>Date</Text>
                <Text style={[styles.dateText, { color: theme.colors.textPrimary }]}>{formatDate(date)}</Text>
              </View>
              <TouchableOpacity>
                <MaterialCommunityIcons name="refresh" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {/* Account Field */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>Account:</Text>
              <TouchableOpacity 
                style={[
                  styles.fieldInput, 
                  { borderBottomColor: theme.colors.border },
                  showAccountSelector && { borderBottomColor: theme.colors.primary }
                ]}
                onPress={() => {
                  setShowKeypad(false);
                  setShowAccountSelector(true);
                }}
              >
                <Text 
                  style={
                    selectedAccount 
                      ? [styles.fieldText, { color: theme.colors.textPrimary }] 
                      : [styles.fieldPlaceholder, { color: theme.colors.textSecondary }]
                  }
                >
                  {selectedAccount ? selectedAccount.name : 'Select account'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Category Field (not shown for transfers) */}
            {transactionType !== 'transfer' && (
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>Category:</Text>
                <TouchableOpacity 
                  style={[
                    styles.fieldInput, 
                    { borderBottomColor: theme.colors.border },
                    showCategorySelector && { borderBottomColor: theme.colors.primary }
                  ]}
                  onPress={() => {
                    setShowKeypad(false);
                    setShowCategorySelector(true);
                  }}
                >
                  <Text 
                    style={
                      selectedCategory 
                        ? [styles.fieldText, { color: theme.colors.textPrimary }] 
                        : [styles.fieldPlaceholder, { color: theme.colors.textSecondary }]
                    }
                  >
                    {selectedCategory ? selectedCategory.name : 'Select category'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Amount Field */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>Amount:</Text>
              <TouchableOpacity 
                style={[
                  styles.fieldInput, 
                  { borderBottomColor: theme.colors.border },
                  showKeypad && { borderBottomColor: theme.colors.primary }
                ]}
                onPress={() => setShowKeypad(true)}
              >
                <Text style={[styles.fieldText, { color: theme.colors.textPrimary }]}>
                  {amount}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Description Field */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>Description:</Text>
              <TextInput
                ref={descriptionInputRef}
                style={[
                  styles.fieldInput, 
                  styles.fieldText, 
                  { 
                    borderBottomColor: theme.colors.border,
                    color: theme.colors.textPrimary
                  }
                ]}
                placeholder="Add description"
                placeholderTextColor={theme.colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                onSubmitEditing={() => focusNextField('description')}
              />
            </View>
            
            {/* Note Field */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>Note:</Text>
              <TextInput
                ref={noteInputRef}
                style={[
                  styles.fieldInput, 
                  styles.fieldText, 
                  { 
                    borderBottomColor: theme.colors.border,
                    color: theme.colors.textPrimary
                  }
                ]}
                placeholder="Add note"
                placeholderTextColor={theme.colors.textSecondary}
                value={note}
                onChangeText={setNote}
              />
            </View>
            
            {/* Save Button */}
            <TouchableOpacity 
              style={[
                styles.saveButton, 
                { 
                  backgroundColor: transactionType === 'expense' 
                    ? theme.colors.expense 
                    : transactionType === 'income'
                      ? theme.colors.income
                      : theme.colors.primary
                }
              ]} 
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
              backgroundColor: theme.colors.surface,
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
          <View style={[styles.accountPanelHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.accountPanelTitle, { color: theme.colors.textPrimary }]}>Accounts</Text>
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
          style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          activeOpacity={1}
          onPress={() => setShowAccountSelector(false)}
        />
      )}
      
      {/* Category Selection Modal */}
      {showCategorySelector && (
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategorySelector(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={{ flexDirection: 'row', height: 400 }}>
              {/* Main Categories (Left Column) */}
              <View style={{ 
                flex: 1, 
                maxWidth: '50%', 
                borderRightWidth: 1, 
                borderRightColor: theme.colors.border 
              }}>
                <ScrollView>
                  {getMainCategories().map((category) => {
                    const isSelected = 
                      categoryId === category.id || 
                      selectedMainCategoryId === category.id;
                    
                    const hasSubcategories = getSubcategories(category.id).length > 0;
                    
                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={{
                          width: '100%',
                          paddingVertical: 16,
                          paddingHorizontal: 16,
                          borderBottomWidth: 1,
                          borderBottomColor: theme.colors.border,
                          backgroundColor: isSelected ? theme.colors.surfaceVariant : 'transparent'
                        }}
                        onPress={() => {
                          if (hasSubcategories) {
                            // If has subcategories, select the main category to show subcategories
                            setSelectedMainCategoryId(category.id);
                          } else {
                            // If no subcategories, select this category directly
                            setCategoryId(category.id);
                            setShowCategorySelector(false);
                            focusNextField('category');
                          }
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                          <MaterialCommunityIcons 
                            name={category.icon || "shape-outline"} 
                            size={22} 
                            color={category.color || theme.colors.primary} 
                            style={{ marginRight: 8 }}
                          />
                          <Text 
                            style={{ 
                              fontSize: 14, 
                              fontWeight: '500', 
                              color: theme.colors.textPrimary,
                              flex: 1
                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {category.name}
                          </Text>
                          {hasSubcategories && (
                            <MaterialCommunityIcons 
                              name="chevron-right" 
                              size={16} 
                              color={theme.colors.textSecondary}
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
              
              {/* Subcategories (Right Column) */}
              <View style={{ flex: 1, maxWidth: '50%' }}>
                {selectedMainCategoryId && (
                  <ScrollView>
                    {getSubcategories(selectedMainCategoryId).map((subcategory) => (
                      <TouchableOpacity
                        key={subcategory.id}
                        style={{
                          width: '100%',
                          paddingVertical: 16,
                          paddingHorizontal: 16,
                          borderBottomWidth: 1,
                          borderBottomColor: theme.colors.border,
                          backgroundColor: categoryId === subcategory.id ? theme.colors.surfaceVariant : 'transparent'
                        }}
                        onPress={() => {
                          setCategoryId(subcategory.id);
                          setShowCategorySelector(false);
                          focusNextField('category');
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                          <MaterialCommunityIcons 
                            name={subcategory.icon || "shape-outline"} 
                            size={22} 
                            color={subcategory.color || theme.colors.primary} 
                            style={{ marginRight: 8 }}
                          />
                          <Text 
                            style={{ 
                              fontSize: 14, 
                              fontWeight: '500',
                              color: theme.colors.textPrimary,
                              flex: 1
                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {subcategory.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>
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
    fontSize: 14,
    width: 80,
  },
  dateText: {
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
    paddingVertical: 8,
  },
  fieldText: {
    fontSize: 16,
  },
  fieldPlaceholder: {
    fontSize: 16,
  },
  saveButton: {
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
  },
  accountPanelTitle: {
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
  accountGridItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default AddTransactionScreen;
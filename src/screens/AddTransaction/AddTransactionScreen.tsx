// src/screens/AddTransaction/AddTransactionScreen.tsx
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
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

import AccountPicker from '../../components/common/AccountPicker';
import CategoryPicker from '../../components/common/CategoryPicker';
import NumericKeypad from '../../components/common/NumericKeypad';
import { useAccountContext } from '../../contexts/AccountContext';
import { useCategoryContext } from '../../contexts/CategoryContext';
import { useAppTheme } from '../../contexts/ThemeContext';
import { useTransactionContext } from '../../contexts/TransactionContext';
import { RootStackParamList, TransactionEnumType } from '../../types';

// Get screen dimensions
const { height: screenHeight } = Dimensions.get('window');

// Estimated height of keypad in pixels
const KEYPAD_HEIGHT = 350;

// Calculate scroll position for amount field (adjust as needed)
const SCROLL_POSITION = 200;

type TransactionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddTransaction'>;
type TransactionScreenRouteProp = RouteProp<RootStackParamList, 'AddTransaction'>;

const AddTransactionScreen = () => {
  const navigation = useNavigation<TransactionScreenNavigationProp>();
  const route = useRoute<TransactionScreenRouteProp>();
  const { accounts } = useAccountContext();
  const { categories } = useCategoryContext();
  const { addTransaction } = useTransactionContext();
  const { theme } = useAppTheme();
  
  // Add ref for ScrollView to control scrolling
  const scrollViewRef = useRef<ScrollView>(null);
  // Add ref for amount field view to measure its position
  const amountFieldRef = useRef<View>(null);
  
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
  
  // Input refs for focus management - only for TextInput elements
  const descriptionInputRef = useRef<TextInput>(null);
  const noteInputRef = useRef<TextInput>(null);
  
  // Get the selected account & category
  const selectedAccount = accounts.find(acc => acc.id === accountId);
  const selectedCategory = categories.find(cat => cat.id === categoryId);
  
  // Add these new states for calculator functionality
  const [calculatorMode, setCalculatorMode] = useState(false);
  const [expression, setExpression] = useState('');
  const [displayValue, setDisplayValue] = useState('0.00');
  
  // Effect to scroll to amount field when keypad is shown
  useEffect(() => {
    if (showKeypad && scrollViewRef.current) {
      // Use a smaller scroll position value to not scroll too far up
      scrollViewRef.current.scrollTo({ y: SCROLL_POSITION, animated: true });
    }
  }, [showKeypad]);
  
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
  
  // Focus next field - modified to not jump to notes automatically
  const focusNextField = (currentField: string) => {
    if (!isFieldValid(currentField)) return;
    
    switch (currentField) {
      case 'account':
        if (transactionType !== 'transfer' && !categoryId) {
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
        // Don't automatically jump to notes
        // noteInputRef.current?.focus();
        break;
      default:
        break;
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Add operators to the evaluateExpression function
  const evaluateExpression = (expr: string): number => {
    // Clean up the expression to ensure it's valid
    const cleanExpr = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/--/g, '+') // Handle double negatives
      .replace(/\s/g, '') // Remove any spaces
      .replace(/(\d)(\()/g, '$1*$2'); // Handle implicit multiplication like 2(3+4) => 2*(3+4)
    
    console.log(`Evaluating: ${expr} => ${cleanExpr}`); // Log for debugging
    
    try {
      // Check for balanced parentheses
      if ((cleanExpr.match(/\(/g) || []).length !== (cleanExpr.match(/\)/g) || []).length) {
        throw new Error('Unbalanced parentheses');
      }
      
      // Using Function constructor to safely evaluate the expression
      const result = new Function(`return ${cleanExpr}`)();
      
      // Ensure we have a valid number result
      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        throw new Error('Invalid result');
      }
      
      console.log(`Evaluation result: ${result}`); // Log result for debugging
      return result;
    } catch (error) {
      console.error('Invalid expression:', expr, error);
      return 0;
    }
  };

  // Format a number to currency string (2 decimal places)
  const formatCurrency = (value: number): string => {
    // Use toFixed to ensure we always have 2 decimal places
    return Math.abs(value) < 0.01 ? '0.00' : value.toFixed(2);
  };

  // Handle numeric keypad input for amount field
  const handleKeypadInput = (key: string) => {
    // Handle special calculator keys
    if (key === 'clear') {
      // Clear the expression and reset calculator
      setExpression('0');
      return;
    }
    
    if (key === '=') {
      try {
        // Evaluate expression and update the display
        const result = evaluateExpression(expression);
        setExpression(formatCurrency(result));
      } catch (error) {
        console.error('Error evaluating expression:', error);
        // Keep the current expression if there's an error
      }
      return;
    }
    
    // Handle calculator mode toggle
    if (key === 'calculator') {
      setCalculatorMode(!calculatorMode);
      if (!calculatorMode) {
        // Entering calculator mode - initialize expression with current amount
        const currentAmount = parseFloat(amount);
        setExpression(currentAmount > 0 ? currentAmount.toString() : '0');
        setDisplayValue(currentAmount > 0 ? currentAmount.toString() : '0');
      } else {
        // Exiting calculator mode - evaluate expression and set amount
        if (expression) {
          try {
            const result = evaluateExpression(expression);
            setAmount(formatCurrency(result));
            setDisplayValue(formatCurrency(result));
          } catch (error) {
            console.error('Error evaluating expression:', error);
            // Keep the current amount if there's an error
          }
        }
      }
      return;
    }

    // If in calculator mode, handle expression building
    if (calculatorMode) {
      if (key === 'backspace') {
        // Remove last character from expression
        setExpression(prev => {
          const newExpr = prev.length > 0 ? prev.slice(0, -1) : '';
          return newExpr || '0';
        });
        return;
      }
      
      if (key === 'done') {
        // Evaluate expression and set as amount
        try {
          const result = evaluateExpression(expression);
          setAmount(formatCurrency(result));
          setDisplayValue(formatCurrency(result));
          setCalculatorMode(false);
          setShowKeypad(false);
          // Focus on the description field next
          descriptionInputRef.current?.focus();
        } catch (error) {
          console.error('Error evaluating expression:', error);
          // Handle invalid expression - keep calculator open but show a clean state
          setExpression('0');
          // Don't exit calculator mode, let user try again
        }
        return;
      }
      
      // Build expression
      setExpression(prev => {
        console.log(`Key pressed: ${key}, Current expression: ${prev}`); // Add logging for debugging
        
        // Convert * and / operators back to display symbols
        const displayKey = key === '*' ? '×' : key === '/' ? '÷' : key;
        
        // Handle first digit or operator
        if (prev === '0') {
          // If the first input is an operator (except minus), keep the leading 0
          if (['+', '×', '÷', '*', '/'].includes(displayKey)) {
            return `0${displayKey}`;
          }
          // Allow negative numbers
          if (displayKey === '-') {
            return displayKey;
          }
          // Handle parentheses at the start
          if (displayKey === '(' || displayKey === ')') {
            return displayKey;
          }
          // Otherwise, replace the 0
          return displayKey;
        }
        
        // Handle operators
        if (['+', '-', '×', '÷', '*', '/'].includes(displayKey)) {
          // Don't allow multiple operators in a row (except minus for negative numbers after other operators)
          const lastChar = prev.charAt(prev.length - 1);
          if (['+', '×', '÷', '*', '/'].includes(lastChar)) {
            return prev.slice(0, -1) + displayKey;
          }
          // Special case: allow minus after another operator for negative numbers (but only once)
          if (lastChar === '-' && displayKey === '-') {
            return prev;
          }
          // Don't allow operators after open parenthesis (except minus for negative numbers)
          if (lastChar === '(' && displayKey !== '-') {
            return prev;
          }
        }
        
        // Handle decimal point
        if (displayKey === '.') {
          // Check if the current number already has a decimal point
          const parts = prev.split(/[+\-×÷*\/()]/);
          const lastPart = parts[parts.length - 1];
          if (lastPart.includes('.')) {
            return prev;
          }
        }
        
        // Handle parentheses
        if (displayKey === '(' || displayKey === ')') {
          // Basic validation for parentheses
          const openCount = (prev.match(/\(/g) || []).length;
          const closeCount = (prev.match(/\)/g) || []).length;
          
          // Don't allow close parenthesis if there are no matching open parentheses
          if (displayKey === ')' && openCount <= closeCount) {
            return prev;
          }
          
          // Don't allow open parenthesis after a number without an operator
          const lastChar = prev.charAt(prev.length - 1);
          if (displayKey === '(' && /[0-9]/.test(lastChar)) {
            return prev + '×(';
          }
        }
        
        const newExpression = prev + displayKey;
        console.log(`New expression: ${newExpression}`); // Log the new expression
        return newExpression;
      });
      
      return;
    }

    // Standard numeric input handling (non-calculator mode)
    if (key === 'backspace') {
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
      // Focus on the description field next
      descriptionInputRef.current?.focus();
      return;
    }
    
    // Handle minus sign for negative numbers
    if (key === '-') {
      setAmount(prev => {
        // Toggle negative/positive
        if (prev.startsWith('-')) {
          return prev.substring(1);
        } else {
          return `-${prev}`;
        }
      });
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
  
  // Handle account selection
  const handleAccountSelected = (selectedId: string) => {
    setAccountId(selectedId);
    // Don't close the account selector yet
    // setShowAccountSelector(false); - removed
    // focusNextField('account'); - removed
  };
  
  // Handle transition from account to category selection
  const handleProceedToCategory = () => {
    // Close account selector and open category selector
    setShowAccountSelector(false);
    setShowKeypad(false);
    setShowCategorySelector(true);
  };
  
  // Handle going back to account selection from category selection
  const handleProceedToAccount = () => {
    // Close category selector and open account selector
    setShowCategorySelector(false);
    setShowKeypad(false);
    setShowAccountSelector(true);
  };
  
  // Handle category selection
  const handleCategorySelected = (selectedId: string) => {
    setCategoryId(selectedId);
    // Close both selectors when category is selected
    setShowCategorySelector(false);
    setShowAccountSelector(false);
    // Open keypad next (per workflow)
    setShowKeypad(true);
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
      // Use appropriate colors for active tab based on type
      let bgColor;
      if (type === 'expense') {
        bgColor = '#ef4444'; // red for expense
      } else if (type === 'income') {
        bgColor = '#3b82f6'; // blue for income (changed from green)
      } else {
        bgColor = '#22c55e'; // green for transfer (changed from blue)
      }
      
      return {
        backgroundColor: bgColor,
        borderColor: bgColor,
      };
    }
    return {
      backgroundColor: '#282c34',
      borderColor: '#2d3038',
    };
  };
  
  // Get tab text style based on transaction type
  const getTabTextStyle = (type: TransactionEnumType) => {
    return {
      color: '#FFFFFF',
      fontWeight: transactionType === type ? '600' as const : '400' as const,
      fontSize: 16,
    };
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.starButton}>
          <MaterialCommunityIcons name="star-outline" size={24} color="#FFFFFF" />
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
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          bounces={false} // Prevent bouncing on iOS
          overScrollMode="never" // Prevent overscroll on Android
          contentContainerStyle={{
            // Ensure content is at least screen height to prevent excessive scrolling
            minHeight: screenHeight - 150, // Subtract header height
            paddingBottom: (showAccountSelector || showCategorySelector || showKeypad) ? 450 : 0
          }}
          scrollEnabled={true}
        >
          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Date Field */}
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Date:</Text>
              <View style={styles.dateValueContainer}>
                <Text style={styles.dateText}>{formatDate(date)}</Text>
                <TouchableOpacity>
                  <MaterialCommunityIcons name="refresh" size={24} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Account Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Account:</Text>
              <TouchableOpacity 
                style={[
                  styles.fieldInput, 
                  { borderBottomColor: '#2d3038' },
                  showAccountSelector && { borderBottomColor: '#ef4444' }
                ]}
                onPress={() => {
                  setShowKeypad(false);
                  setShowCategorySelector(false);
                  setShowAccountSelector(true);
                }}
              >
                <Text 
                  style={
                    selectedAccount 
                      ? styles.fieldText 
                      : styles.fieldPlaceholder
                  }
                >
                  {selectedAccount ? selectedAccount.name : 'Select account'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Category Field (not shown for transfers) */}
            {transactionType !== 'transfer' && (
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Category:</Text>
                <TouchableOpacity 
                  style={[
                    styles.fieldInput, 
                    { borderBottomColor: '#2d3038' },
                    showCategorySelector && { borderBottomColor: '#ef4444' }
                  ]}
                  onPress={() => {
                    setShowKeypad(false);
                    setShowAccountSelector(false);
                    setShowCategorySelector(true);
                  }}
                >
                  <Text 
                    style={
                      selectedCategory 
                        ? styles.fieldText
                        : styles.fieldPlaceholder
                    }
                  >
                    {selectedCategory ? selectedCategory.name : 'Select category'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Amount Field */}
            <View 
              style={styles.fieldContainer} 
              ref={amountFieldRef}
            >
              <Text style={styles.fieldLabel}>Amount:</Text>
              <TouchableOpacity 
                style={[
                  styles.fieldInput, 
                  { borderBottomColor: '#2d3038' },
                  showKeypad && { 
                    borderBottomColor: calculatorMode ? '#3b82f6' : '#ef4444'
                  }
                ]}
                onPress={() => {
                  setShowAccountSelector(false);
                  setShowCategorySelector(false);
                  setShowKeypad(true);
                  
                  // Set display value when focusing on amount
                  if (calculatorMode) {
                    setDisplayValue(expression);
                  } else {
                    setDisplayValue(amount);
                  }
                  
                  // Scroll to amount field
                  if (scrollViewRef.current) {
                    scrollViewRef.current.scrollTo({
                      y: SCROLL_POSITION,
                      animated: true
                    });
                  }
                }}
              >
                <View style={styles.amountContainer}>
                  {!calculatorMode && <Text style={styles.currencySymbol}>€</Text>}
                  <Text 
                    style={[
                      styles.fieldText,
                      calculatorMode && styles.calculatorText
                    ]}
                  >
                    {calculatorMode && showKeypad ? expression : amount}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            
            {/* Description Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Description:</Text>
              <TextInput
                ref={descriptionInputRef}
                style={[
                  styles.fieldInput, 
                  styles.textInput,
                  { borderBottomColor: '#2d3038' }
                ]}
                placeholder="Add description"
                placeholderTextColor="#9ca3af"
                value={description}
                onChangeText={setDescription}
                onSubmitEditing={() => focusNextField('description')}
                selectionColor="#ef4444"
              />
            </View>
            
            {/* Note Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Note:</Text>
              <TextInput
                ref={noteInputRef}
                style={[
                  styles.fieldInput, 
                  styles.textInput,
                  { borderBottomColor: '#2d3038' }
                ]}
                placeholder="Add note"
                placeholderTextColor="#9ca3af"
                value={note}
                onChangeText={setNote}
                selectionColor="#ef4444"
              />
            </View>
            
            {/* Save Button */}
            <TouchableOpacity 
              style={[
                styles.saveButton, 
                { 
                  backgroundColor:
                    transactionType === 'expense' ? '#ef4444' :
                    transactionType === 'income' ? '#3b82f6' : '#22c55e'
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
          <NumericKeypad 
            onKeyPress={handleKeypadInput} 
            theme={theme}
            onDismiss={() => setShowKeypad(false)}
            calculatorMode={calculatorMode}
            expression={expression || '0'} // Ensure expression is never undefined
          />
        )}
      </KeyboardAvoidingView>
      
      {/* Account Picker */}
      <AccountPicker
        accounts={accounts}
        selectedAccountId={accountId}
        onSelectAccount={handleAccountSelected}
        onDismiss={() => setShowAccountSelector(false)}
        visible={showAccountSelector}
        onProceedToCategory={transactionType !== 'transfer' ? handleProceedToCategory : undefined}
      />
      
      {/* Category Picker */}
      <CategoryPicker
        categories={categories}
        selectedCategoryId={categoryId}
        onSelectCategory={handleCategorySelected}
        onDismiss={() => setShowCategorySelector(false)}
        transactionType={transactionType === 'transfer' ? 'expense' : transactionType}
        visible={showCategorySelector}
        onSwitchToAccount={handleProceedToAccount}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e2126',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  starButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2d3038',
  },
  tab: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2d3038',
  },
  dateLabel: {
    color: '#9ca3af',
    width: '30%',
  },
  dateValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '70%',
  },
  fieldContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    color: '#9ca3af',
    width: '30%',
  },
  fieldInput: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    width: '70%',
  },
  textInput: {
    color: '#FFFFFF',
    fontSize: 16,
    padding: 0, // Remove default padding
    width: '100%', // Take up full width of parent
  },
  fieldText: {
    color: '#FFFFFF',
    fontSize: 16,
    width: '100%', // Take up full width of parent
  },
  fieldPlaceholder: {
    color: '#6b7280',
    fontSize: 16,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  saveButtonContainer: {
    marginTop: 32,
    paddingVertical: 16,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  calculatorText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
    fontSize: 20,  // Slightly larger for better readability of expressions
    color: '#3b82f6', // Blue color to indicate calculator mode
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 4,
  },
});

export default AddTransactionScreen;
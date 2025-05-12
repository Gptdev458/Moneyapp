import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
    Appbar,
    Button,
    Divider,
    Modal,
    Surface,
    Text,
    TextInput
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useBudgetContext } from '../../contexts/BudgetContext';
import { useCategoryContext } from '../../contexts/CategoryContext';
import { useAppTheme } from '../../contexts/ThemeContext';
import { Budget, RootStackParamList } from '../../types';

type AddBudgetScreenRouteProp = RouteProp<RootStackParamList, 'AddBudget'>;
type AddBudgetScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type PeriodType = 'monthly' | 'yearly' | 'custom';

const AddBudgetScreen = () => {
  const { theme } = useAppTheme();
  const navigation = useNavigation<AddBudgetScreenNavigationProp>();
  const route = useRoute<AddBudgetScreenRouteProp>();
  const { budgets, getBudgetById, addBudget, updateBudget, deleteBudget } = useBudgetContext();
  const { categories, getExpenseCategories } = useCategoryContext();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [periodType, setPeriodType] = useState<PeriodType>('monthly');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  
  const budgetIdToEdit = route.params?.budgetId;
  const isEditMode = !!budgetIdToEdit;
  
  // Load budget data if editing an existing budget
  useEffect(() => {
    if (budgetIdToEdit) {
      const budgetToEdit = getBudgetById(budgetIdToEdit);
      if (budgetToEdit) {
        setAmount(budgetToEdit.amount.toString());
        setPeriodType(budgetToEdit.periodType);
        setStartDate(new Date(budgetToEdit.startDate));
        setEndDate(budgetToEdit.endDate ? new Date(budgetToEdit.endDate) : undefined);
        setCategoryId(budgetToEdit.categoryId);
      }
    }
  }, [budgetIdToEdit, getBudgetById]);
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Handle save button press
  const handleSave = useCallback(async () => {
    if (!amount || !categoryId) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const budgetData: Omit<Budget, 'id'> = {
        amount: parseFloat(amount),
        periodType,
        startDate: startDate.toISOString(),
        endDate: endDate ? endDate.toISOString() : undefined,
        categoryId,
      };
      
      if (isEditMode && budgetIdToEdit) {
        await updateBudget({ ...budgetData, id: budgetIdToEdit });
      } else {
        await addBudget(budgetData);
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'There was a problem saving the budget.');
    } finally {
      setIsLoading(false);
    }
  }, [name, amount, periodType, startDate, endDate, categoryId, isEditMode, budgetIdToEdit, addBudget, updateBudget, navigation]);
  
  // Handle delete button press
  const handleDelete = useCallback(() => {
    if (!budgetIdToEdit) return;
    
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteBudget(budgetIdToEdit);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting budget:', error);
              Alert.alert('Error', 'There was a problem deleting the budget.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  }, [budgetIdToEdit, deleteBudget, navigation]);
  
  // Handle period type change
  const handlePeriodTypeChange = (newType: PeriodType) => {
    setPeriodType(newType);
    
    // Adjust end date based on period type
    if (newType === 'monthly') {
      const newEndDate = new Date(startDate);
      newEndDate.setMonth(newEndDate.getMonth() + 1);
      newEndDate.setDate(0); // Last day of the month
      setEndDate(newEndDate);
    } else if (newType === 'yearly') {
      const newEndDate = new Date(startDate);
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
      newEndDate.setDate(newEndDate.getDate() - 1);
      setEndDate(newEndDate);
    } else {
      // For custom, keep the current end date or set it to undefined if not set
      setEndDate(endDate || undefined);
    }
  };
  
  // Handle date selection
  const handleStartDateConfirm = (date: Date) => {
    setStartDatePickerVisibility(false);
    setStartDate(date);
    
    // Adjust end date based on period type
    if (periodType === 'monthly') {
      const newEndDate = new Date(date);
      newEndDate.setMonth(newEndDate.getMonth() + 1);
      newEndDate.setDate(0); // Last day of the month
      setEndDate(newEndDate);
    } else if (periodType === 'yearly') {
      const newEndDate = new Date(date);
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
      newEndDate.setDate(newEndDate.getDate() - 1);
      setEndDate(newEndDate);
    }
  };
  
  const handleEndDateConfirm = (date: Date) => {
    setEndDatePickerVisibility(false);
    setEndDate(date);
  };
  
  // Get category name by ID
  const getCategoryName = (catId?: string) => {
    if (!catId) return 'Select Category';
    const category = categories.find(cat => cat.id === catId);
    return category?.name || 'Unknown Category';
  };
  
  // Get expense categories
  const expenseCategories = getExpenseCategories();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content 
          title={isEditMode ? 'Edit Budget' : 'Add Budget'} 
          titleStyle={styles.appbarTitle}
        />
        {isEditMode && (
          <Appbar.Action icon="delete" onPress={handleDelete} />
        )}
      </Appbar.Header>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Form */}
          <Surface style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
            {/* Budget Name */}
            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                Budget Name (Optional)
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., Monthly Groceries"
                mode="outlined"
                style={styles.textInput}
              />
            </View>
            
            {/* Budget Amount */}
            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                Amount *
              </Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                mode="outlined"
                style={styles.textInput}
              />
            </View>
            
            {/* Category */}
            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                Category *
              </Text>
              <TouchableOpacity
                style={[styles.selectField, { borderColor: theme.colors.border }]}
                onPress={() => setCategoryModalVisible(true)}
              >
                <Text style={{ color: theme.colors.textPrimary }}>
                  {getCategoryName(categoryId)}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            
            {/* Period Type */}
            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                Period Type
              </Text>
              <View style={styles.periodSelector}>
                <TouchableOpacity
                  style={[
                    styles.periodOption,
                    periodType === 'monthly' && { 
                      backgroundColor: theme.colors.primary,
                      borderColor: theme.colors.primary 
                    }
                  ]}
                  onPress={() => handlePeriodTypeChange('monthly')}
                >
                  <Text style={[
                    styles.periodText,
                    { color: periodType === 'monthly' ? 
                        theme.colors.onPrimary : 
                        theme.colors.textPrimary 
                    }
                  ]}>
                    Monthly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.periodOption,
                    periodType === 'yearly' && { 
                      backgroundColor: theme.colors.primary,
                      borderColor: theme.colors.primary 
                    }
                  ]}
                  onPress={() => handlePeriodTypeChange('yearly')}
                >
                  <Text style={[
                    styles.periodText,
                    { color: periodType === 'yearly' ? 
                        theme.colors.onPrimary : 
                        theme.colors.textPrimary 
                    }
                  ]}>
                    Yearly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.periodOption,
                    periodType === 'custom' && { 
                      backgroundColor: theme.colors.primary,
                      borderColor: theme.colors.primary 
                    }
                  ]}
                  onPress={() => handlePeriodTypeChange('custom')}
                >
                  <Text style={[
                    styles.periodText,
                    { color: periodType === 'custom' ? 
                        theme.colors.onPrimary : 
                        theme.colors.textPrimary 
                    }
                  ]}>
                    Custom
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Start Date */}
            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                Start Date
              </Text>
              <TouchableOpacity
                style={[styles.selectField, { borderColor: theme.colors.border }]}
                onPress={() => setStartDatePickerVisibility(true)}
              >
                <Text style={{ color: theme.colors.textPrimary }}>
                  {formatDate(startDate)}
                </Text>
                <MaterialCommunityIcons
                  name="calendar"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            
            {/* End Date (visible only for custom period) */}
            {periodType === 'custom' && (
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                  End Date
                </Text>
                <TouchableOpacity
                  style={[styles.selectField, { borderColor: theme.colors.border }]}
                  onPress={() => setEndDatePickerVisibility(true)}
                >
                  <Text style={{ color: theme.colors.textPrimary }}>
                    {endDate ? formatDate(endDate) : 'Select End Date'}
                  </Text>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={24}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            )}
          </Surface>
          
          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
              loading={isLoading}
              disabled={isLoading}
            >
              {isEditMode ? 'Update Budget' : 'Add Budget'}
            </Button>
            
            {isEditMode && (
              <Button
                mode="outlined"
                onPress={handleDelete}
                style={styles.deleteButton}
                textColor={theme.colors.error}
                disabled={isLoading}
              >
                Delete Budget
              </Button>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Date Pickers */}
      <DateTimePickerModal
        isVisible={isStartDatePickerVisible}
        mode="date"
        onConfirm={handleStartDateConfirm}
        onCancel={() => setStartDatePickerVisibility(false)}
        date={startDate}
      />
      
      <DateTimePickerModal
        isVisible={isEndDatePickerVisible}
        mode="date"
        onConfirm={handleEndDateConfirm}
        onCancel={() => setEndDatePickerVisibility(false)}
        date={endDate || new Date()}
        minimumDate={startDate}
      />
      
      {/* Category Selection Modal */}
      <Modal
        visible={isCategoryModalVisible}
        onDismiss={() => setCategoryModalVisible(false)}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
            Select Category
          </Text>
          <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <Divider />
        <ScrollView style={styles.modalContent}>
          {expenseCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryItem}
              onPress={() => {
                setCategoryId(category.id);
                setCategoryModalVisible(false);
              }}
            >
              <View style={[styles.categoryIcon, { backgroundColor: category.color || '#333' }]}>
                <Text style={styles.categoryIconText}>
                  {category.name.substring(0, 1).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.categoryName, { color: theme.colors.textPrimary }]}>
                {category.name}
              </Text>
              {categoryId === category.id && (
                <MaterialCommunityIcons
                  name="check"
                  size={24}
                  color={theme.colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appbar: {
    elevation: 0,
  },
  appbarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  formContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  selectField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    height: 56,
  },
  periodSelector: {
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
  },
  periodOption: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 8,
  },
  saveButton: {
    marginBottom: 12,
    paddingVertical: 6,
  },
  deleteButton: {
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  modalContainer: {
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoryName: {
    fontSize: 16,
    flex: 1,
  },
});

export default AddBudgetScreen; 
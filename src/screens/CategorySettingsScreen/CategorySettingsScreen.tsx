import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Dialog, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import IconPicker from '../../components/IconPicker/IconPicker';
import { useCategoryContext } from '../../contexts/CategoryContext';
import { ICategory } from '../../models/category';
import { RootStackParamList } from '../../types';

type CategorySettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CategorySettings'>;

type CategoryTypeItem = {
  type: 'income' | 'expense';
  icon: string;
  color: string;
  title: string;
};

const CATEGORY_TYPES: CategoryTypeItem[] = [
  { type: 'income', icon: 'arrow-down', color: '#4CAF50', title: 'Income' },
  { type: 'expense', icon: 'arrow-up', color: '#F44336', title: 'Expense' },
];

// Custom accordion component to avoid the delete button and expansion area overlap
const CategoryAccordion = ({ 
  title, 
  titleStyle,
  left,
  right,
  expanded, 
  onPress, 
  children 
}: { 
  title: React.ReactNode, 
  titleStyle?: any,
  left?: React.ReactNode, 
  right?: React.ReactNode,
  expanded: boolean, 
  onPress: () => void, 
  children: React.ReactNode 
}) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.accordionContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={styles.accordionHeader}>
        <TouchableOpacity 
          style={styles.accordionTitleArea}
          onPress={onPress}
        >
          {left}
          <View style={styles.accordionTitleContent}>
            {title}
          </View>
          <MaterialCommunityIcons 
            name={expanded ? 'chevron-up' : 'chevron-down'} 
            size={24} 
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
        
        {right}
      </View>
      
      {expanded && (
        <View style={[styles.accordionContent, { 
          borderTopWidth: 1, 
          borderTopColor: theme.colors.outlineVariant 
        }]}>
          {children}
        </View>
      )}
    </View>
  );
};

const CategorySettingsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<CategorySettingsScreenNavigationProp>();
  const { categories, addCategory, updateCategory, deleteCategory, refreshCategories } = useCategoryContext();
  
  const [editCategoryVisible, setEditCategoryVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<ICategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('income');
  const [categoryParentId, setCategoryParentId] = useState<string | undefined>(undefined);
  const [categoryIcon, setCategoryIcon] = useState('shape');
  const [categoryColor, setCategoryColor] = useState('#4CAF50');
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Toggle category expansion
  const toggleCategoryExpanded = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Group categories by type and parent/child relationship
  const groupedCategories = categories.reduce<Record<string, ICategory[]>>((acc, category) => {
    if (!category.isArchived) {
      if (!acc[category.type]) {
        acc[category.type] = [];
      }
      
      if (!category.parentId) {
        acc[category.type].push(category);
      }
    }
    return acc;
  }, {});

  // Get subcategories for a parent category
  const getSubcategories = (parentId: string) => {
    return categories.filter(c => c.parentId === parentId && !c.isArchived);
  };

  const handleAddCategory = (type: 'income' | 'expense', parentId?: string) => {
    setCurrentCategory(null);
    setCategoryName('');
    setCategoryType(type);
    setCategoryParentId(parentId);
    // Set default icon and color based on category type
    const defaultColor = type === 'income' ? '#4CAF50' : '#F44336';
    setCategoryIcon(parentId ? 'tag' : 'shape');
    setCategoryColor(defaultColor);
    setEditCategoryVisible(true);
  };

  const handleEditCategory = (category: ICategory) => {
    setCurrentCategory(category);
    setCategoryName(category.name);
    setCategoryType(category.type);
    setCategoryParentId(category.parentId);
    setCategoryIcon(category.icon || 'shape');
    setCategoryColor(category.color || (category.type === 'income' ? '#4CAF50' : '#F44336'));
    setEditCategoryVisible(true);
  };

  const handleDeleteCategory = (category: ICategory) => {
    // Check if this category has subcategories
    const hasSubcategories = categories.some(c => c.parentId === category.id && !c.isArchived);
    
    if (hasSubcategories) {
      Alert.alert(
        'Cannot Delete',
        'This category has subcategories. Please delete or reassign them first.'
      );
      return;
    }
    
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete the "${category.name}" category? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              // Force refresh by calling the context method
              await refreshCategories();
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      if (currentCategory) {
        // Update existing category
        await updateCategory({
          ...currentCategory,
          name: categoryName,
          type: categoryType,
          parentId: categoryParentId,
          icon: categoryIcon,
          color: categoryColor
        });
      } else {
        // Add new category
        await addCategory({
          name: categoryName,
          type: categoryType,
          parentId: categoryParentId,
          icon: categoryIcon,
          color: categoryColor
        });
      }
      setEditCategoryVisible(false);
      await refreshCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Error', 'There was an error saving the category');
    }
  };

  const handleIconSelected = (icon: string, color: string) => {
    setCategoryIcon(icon);
    setCategoryColor(color);
    setIconPickerVisible(false);
  };

  const renderSubcategory = (item: ICategory) => (
    <View key={item.id} style={styles.subcategoryItem}>
      <View style={styles.subcategoryLeft}>
        <View style={[styles.iconContainer, { backgroundColor: item.color || theme.colors.primary }]}>
          <MaterialCommunityIcons 
            name={item.icon || 'shape'} 
            size={20} 
            color="#FFFFFF"
          />
        </View>
        <Text style={[styles.subcategoryName, { color: theme.colors.onSurface }]}>
          {item.name}
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleEditCategory(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="pencil" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleDeleteCategory(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="delete" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMainCategory = (category: ICategory) => {
    const subcategories = getSubcategories(category.id);
    const isExpanded = expandedCategories[category.id];
    
    return (
      <CategoryAccordion
        key={category.id}
        expanded={isExpanded === true}
        onPress={() => toggleCategoryExpanded(category.id)}
        left={
          <View style={[styles.iconContainer, { backgroundColor: category.color || theme.colors.primary }]}>
            <MaterialCommunityIcons 
              name={category.icon || 'shape'} 
              size={24} 
              color="#FFFFFF"
            />
          </View>
        }
        title={
          <View>
            <Text style={[styles.mainCategoryName, { color: theme.colors.onSurface }]}>
              {category.name}
            </Text>
            <Text style={[styles.subcategoriesCount, { color: theme.colors.onSurfaceVariant }]}>
              {subcategories.length} subcategories
            </Text>
          </View>
        }
        right={
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => handleEditCategory(category)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons name="pencil" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
            
            {subcategories.length === 0 && (
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => handleDeleteCategory(category)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons name="delete" size={22} color={theme.colors.error} />
              </TouchableOpacity>
            )}
          </View>
        }
      >
        {subcategories.length > 0 ? (
          subcategories.map(subcategory => renderSubcategory(subcategory))
        ) : (
          <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
            No subcategories yet
          </Text>
        )}
        
        <Button 
          icon="plus" 
          mode="outlined" 
          style={styles.addButton}
          onPress={() => handleAddCategory(category.type, category.id)}
        >
          Add subcategory
        </Button>
      </CategoryAccordion>
    );
  };

  const renderCategoryType = (categoryType: CategoryTypeItem) => {
    const mainCategories = groupedCategories[categoryType.type] || [];
    
    return (
      <View key={categoryType.type} style={styles.categoryTypeContainer}>
        <View style={styles.categoryTypeHeader}>
          <MaterialCommunityIcons 
            name={categoryType.icon} 
            size={24} 
            color={categoryType.color} 
          />
          <Text style={[styles.categoryTypeTitle, { color: theme.colors.onSurface }]}>
            {categoryType.title}
          </Text>
        </View>
        
        <View style={styles.categoryTypeContent}>
          {mainCategories.length > 0 ? (
            mainCategories.map(renderMainCategory)
          ) : (
            <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
              No {categoryType.type} categories yet
            </Text>
          )}
          
          <Button 
            icon="plus" 
            mode="outlined" 
            style={styles.addButton}
            onPress={() => handleAddCategory(categoryType.type)}
          >
            Add {categoryType.type} category
          </Button>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color={theme.colors.onSurface} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Category Settings</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {CATEGORY_TYPES.map(renderCategoryType)}
      </ScrollView>
      
      <Portal>
        <Dialog visible={editCategoryVisible} onDismiss={() => setEditCategoryVisible(false)}>
          <Dialog.Title>
            {currentCategory ? 'Edit Category' : categoryParentId ? 'Add Subcategory' : 'Add Category'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Category Name"
              value={categoryName}
              onChangeText={setCategoryName}
              mode="outlined"
              style={styles.input}
            />
            
            <View>
              <Text style={[styles.inputLabel, { color: theme.colors.onSurface }]}>Icon & Color</Text>
              <TouchableOpacity
                style={[
                  styles.iconPreview, 
                  { 
                    backgroundColor: categoryColor,
                    borderWidth: theme.dark ? 1 : 0,
                    borderColor: theme.dark ? theme.colors.outline : 'transparent'
                  }
                ]}
                onPress={() => setIconPickerVisible(true)}
              >
                <MaterialCommunityIcons name={categoryIcon} size={30} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditCategoryVisible(false)}>Cancel</Button>
            <Button onPress={handleSaveCategory}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      <IconPicker
        visible={iconPickerVisible}
        onDismiss={() => setIconPickerVisible(false)}
        onSelect={handleIconSelected}
        initialIcon={categoryIcon}
        initialColor={categoryColor}
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
  backButton: {
    padding: 8,
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
  categoryTypeContainer: {
    marginBottom: 24,
  },
  categoryTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  categoryTypeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  categoryTypeContent: {
    marginBottom: 8,
  },
  accordionContainer: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  accordionTitleArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  accordionTitleContent: {
    flex: 1,
    marginLeft: 8,
  },
  accordionContent: {
    paddingTop: 4,
    paddingBottom: 12,
  },
  mainCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainCategoryName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subcategoriesCount: {
    fontSize: 12,
    opacity: 0.7,
  },
  subcategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 16,
  },
  subcategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subcategoryName: {
    fontSize: 15,
    marginLeft: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyStateText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
    opacity: 0.7,
    marginLeft: 16,
  },
  addButton: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
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

export default CategorySettingsScreen; 
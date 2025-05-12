import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ICategory } from '../../models/category';

interface CategoryPickerProps {
  categories: ICategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  onDismiss: () => void;
  transactionType: 'income' | 'expense' | 'transfer';
  visible: boolean;
  onSwitchToAccount?: () => void;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onDismiss,
  transactionType,
  visible,
  onSwitchToAccount
}) => {
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<string | null>(null);
  
  // Filter categories by transaction type and not archived
  const filteredCategories = categories.filter(
    cat => cat.type === transactionType && !cat.isArchived
  );
  
  // Get main categories (no parentId)
  const mainCategories = filteredCategories.filter(cat => !cat.parentId);
  
  // Get subcategories for a parent category
  const getSubcategories = (parentId: string) => {
    return filteredCategories.filter(cat => cat.parentId === parentId);
  };
  
  const renderMainCategoryItem = ({ item }: { item: ICategory }) => {
    const hasSubcategories = getSubcategories(item.id).length > 0;
    const isSelected = item.id === selectedMainCategoryId;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          { borderBottomColor: '#3d4049' },
          isSelected && { backgroundColor: '#383b44' }
        ]}
        onPress={() => {
          if (hasSubcategories) {
            setSelectedMainCategoryId(item.id);
          } else {
            onSelectCategory(item.id);
            onDismiss();
          }
        }}
      >
        <Text style={styles.categoryName}>{item.name}</Text>
        {hasSubcategories && (
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={20} 
            color="#FFFFFF" 
          />
        )}
      </TouchableOpacity>
    );
  };
  
  const renderSubcategoryItem = ({ item }: { item: ICategory }) => {
    return (
      <TouchableOpacity
        style={[styles.categoryItem, { borderBottomColor: '#3d4049' }]}
        onPress={() => {
          onSelectCategory(item.id);
          onDismiss();
        }}
      >
        <Text style={styles.categoryName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };
  
  if (!visible) return null;
  
  return (
    <View style={styles.panel}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: '#3d4049', borderBottomWidth: 1 }]}>
        <Text style={styles.title}>Category</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={onDismiss}>
            <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Two-column Content */}
      <View style={styles.content}>
        {/* Left Column: Main Categories */}
        <View style={styles.leftColumn}>
          <FlatList
            data={mainCategories}
            renderItem={renderMainCategoryItem}
            keyExtractor={item => item.id}
          />
        </View>
        
        {/* Right Column: Subcategories (shown conditionally) */}
        <View style={styles.rightColumn}>
          {selectedMainCategoryId && (
            <FlatList
              data={getSubcategories(selectedMainCategoryId)}
              renderItem={renderSubcategoryItem}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 4,
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
});

export default CategoryPicker; 
// src/contexts/CategoryContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as storageService from '../services/storageService';
import { Category } from '../types';

interface CategoryContextType {
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  getCategoryById: (id: string) => Category | undefined;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (category: Category) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  refreshCategories: () => Promise<void>;
  getIncomeCategories: () => Category[];
  getExpenseCategories: () => Category[];
}

export const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load categories on mount
  useEffect(() => {
    refreshCategories();
  }, []);

  // Refresh categories from storage
  const refreshCategories = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedCategories = await storageService.getCategories();
      setCategories(loadedCategories);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load categories'));
      console.error('Error loading categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get a category by ID
  const getCategoryById = (id: string): Category | undefined => {
    return categories.find(category => category.id === id);
  };

  // Filter categories by type
  const getIncomeCategories = (): Category[] => {
    return categories.filter(cat => cat.type === 'income' && !cat.isArchived);
  };

  const getExpenseCategories = (): Category[] => {
    return categories.filter(cat => cat.type === 'expense' && !cat.isArchived);
  };

  // Add a new category
  const addCategory = async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newCategory = await storageService.addCategory(categoryData);
      
      // Update local state
      setCategories(prevCategories => [...prevCategories, newCategory]);
      
      return newCategory;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add category');
      setError(error);
      console.error('Error adding category:', err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing category
  const updateCategory = async (category: Category): Promise<Category> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedCategory = await storageService.updateCategory(category);
      
      // Update local state
      setCategories(prevCategories => 
        prevCategories.map(cat => cat.id === category.id ? updatedCategory : cat)
      );
      
      return updatedCategory;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update category');
      setError(error);
      console.error('Error updating category:', err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a category
  const deleteCategory = async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await storageService.deleteCategory(id);
      
      // Update local state
      setCategories(prevCategories => 
        prevCategories.map(cat => {
          if (cat.id === id) {
            return { ...cat, isArchived: true }; // Soft delete
          }
          return cat;
        })
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete category');
      setError(error);
      console.error('Error deleting category:', err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Provide context values
  const value = {
    categories,
    isLoading,
    error,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
    getIncomeCategories,
    getExpenseCategories
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

// Hook to use the category context
export const useCategoryContext = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategoryContext must be used within a CategoryProvider');
  }
  return context;
}; 
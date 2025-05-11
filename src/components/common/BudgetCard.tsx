import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../contexts/ThemeContext';

interface BudgetCardProps {
  name: string;
  icon: React.ReactNode;
  spent: number;
  limit: number;
  color: string;
  currency?: string;
  onPress?: () => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({
  name,
  icon,
  spent,
  limit,
  color,
  currency = '€',
  onPress,
}) => {
  const { theme } = useAppTheme();
  const percentage = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.contentRow}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          {icon}
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{name}</Text>
              <Text style={[styles.amount, { color: theme.colors.textSecondary }]}>
                {currency} {spent.toFixed(2)}/{limit.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.percentageContainer, { backgroundColor: color }]}>
              <Text style={styles.percentageText}>{percentage}%</Text>
            </View>
          </View>
          
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
            <View 
              style={[
                styles.progressBar, 
                { backgroundColor: color, width: `${percentage}%` }
              ]} 
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  amount: {
    fontSize: 12,
  },
  percentageContainer: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  percentageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    width: '100%',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
});

export default BudgetCard; 
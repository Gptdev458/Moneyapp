import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
  theme: any;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({ onKeyPress, theme }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'];

  const renderKey = (key: string) => {
    if (key === 'backspace') {
      return (
        <TouchableOpacity
          key={key}
          style={[styles.keyButton, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={() => onKeyPress(key)}
        >
          <MaterialCommunityIcons name="backspace-outline" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      );
    }
    
    return (
      <TouchableOpacity
        key={key}
        style={[styles.keyButton, { backgroundColor: theme.colors.surfaceVariant }]}
        onPress={() => onKeyPress(key)}
      >
        <Text style={[styles.keyText, { color: theme.colors.textPrimary }]}>{key}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.keysContainer}>
        {keys.map(key => renderKey(key))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  keysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
  },
  keyButton: {
    width: '32%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8,
  },
  keyText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default NumericKeypad; 
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
  theme: any;
  onDismiss?: () => void; // Optional dismiss handler
  calculatorMode?: boolean; // Indicates if calculator mode is active
  expression?: string; // Current calculator expression
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({ 
  onKeyPress, 
  theme, 
  onDismiss,
  calculatorMode = false,
  expression = '0'
}) => {
  // Track if full-screen calculator is shown
  const [showFullCalculator, setShowFullCalculator] = useState(false);
  
  // Track the last pressed key for visual feedback
  const [lastPressedKey, setLastPressedKey] = useState<string | null>(null);
  
  // Reset last pressed key after a short delay
  useEffect(() => {
    if (lastPressedKey) {
      const timer = setTimeout(() => {
        setLastPressedKey(null);
      }, 150); // 150ms flash effect
      
      return () => clearTimeout(timer);
    }
  }, [lastPressedKey]);

  // Ensure showFullCalculator is updated when calculatorMode changes
  useEffect(() => {
    if (calculatorMode && !showFullCalculator) {
      setShowFullCalculator(true);
    }
  }, [calculatorMode]);
  
  // Fixed layout for standard keypad (3 columns left, 1 column right)
  const keyRows = [
    ['1', '2', '3', 'delete'],
    ['4', '5', '6', 'minus'],
    ['7', '8', '9', 'calculator'],
    ['.', '0', ' ', 'done']
  ];
  
  // Full calculator layout
  const calculatorRows = [
    ['AC', '÷', '×', 'delete'],
    ['7', '8', '9', '-'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '='],
    ['0', '.', ' ', 'done']
  ];

  const handleKeyPress = (key: string) => {
    // Set last pressed key for visual feedback
    setLastPressedKey(key);
    
    // Special handling for calculator button
    if (key === 'calculator') {
      setShowFullCalculator(true);
      onKeyPress('calculator'); // Pass calculator key to parent handler
      return;
    }
    
    // Special handling for AC (All Clear) in calculator
    if (key === 'AC') {
      onKeyPress('clear');
      return;
    }
    
    // Handle operation keys - convert to the format expected by parent component
    if (key === '×') {
      onKeyPress('*');
      return;
    }
    
    if (key === '÷') {
      onKeyPress('/');
      return;
    }
    
    // Pass all other keys to parent handler
    onKeyPress(key);
  };

  const renderKey = (key: string, index: number, rowIndex: number, inCalculator: boolean = false) => {
    // Empty space
    if (key === ' ') {
      return <View key={`empty-${index}`} style={styles.keyButton} />;
    }
    
    // Delete button (backspace icon instead of ×)
    if (key === 'delete') {
      return (
        <TouchableOpacity
          key={`${key}-${index}`}
          style={[
            styles.keyButton, 
            styles.functionButton,
            lastPressedKey === 'delete' && styles.keyButtonPressed
          ]}
          onPress={() => handleKeyPress('backspace')}
        >
          <MaterialCommunityIcons name="backspace-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      );
    }
    
    // Minus button (-)
    if (key === 'minus') {
      return (
        <TouchableOpacity
          key={`${key}-${index}`}
          style={[
            styles.keyButton, 
            styles.functionButton,
            lastPressedKey === '-' && styles.keyButtonPressed
          ]}
          onPress={() => handleKeyPress('-')}
        >
          <Text style={styles.keyText}>-</Text>
        </TouchableOpacity>
      );
    }
    
    // Calculator button
    if (key === 'calculator') {
      return (
        <TouchableOpacity
          key={`${key}-${index}`}
          style={[
            styles.keyButton, 
            styles.functionButton, 
            calculatorMode && styles.activeCalculatorButton,
            lastPressedKey === 'calculator' && styles.keyButtonPressed
          ]}
          onPress={() => handleKeyPress('calculator')}
        >
          <MaterialCommunityIcons name="calculator" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      );
    }
    
    // Done button
    if (key === 'done') {
      return (
        <TouchableOpacity
          key={`${key}-${index}`}
          style={[
            styles.keyButton, 
            styles.doneButton,
            lastPressedKey === 'done' && styles.keyButtonPressed
          ]}
          onPress={() => {
            if (showFullCalculator) {
              setShowFullCalculator(false);
            }
            handleKeyPress('done');
          }}
        >
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      );
    }
    
    // Equals button
    if (key === '=') {
      return (
        <TouchableOpacity
          key={`${key}-${index}`}
          style={[
            styles.keyButton, 
            styles.equalsButton,
            lastPressedKey === '=' && styles.keyButtonPressed
          ]}
          onPress={() => handleKeyPress('=')}
        >
          <Text style={styles.keyText}>{key}</Text>
        </TouchableOpacity>
      );
    }
    
    // Operation keys (+ - × ÷ etc.)
    if (['+', '-', '×', '÷', 'AC'].includes(key)) {
      return (
        <TouchableOpacity
          key={`${key}-${index}`}
          style={[
            styles.keyButton, 
            styles.operationButton,
            lastPressedKey === key && styles.keyButtonPressed
          ]}
          onPress={() => handleKeyPress(key)}
        >
          <Text style={styles.keyText}>{key}</Text>
        </TouchableOpacity>
      );
    }
    
    // Number and decimal keys
    return (
      <TouchableOpacity
        key={`${key}-${index}`}
        style={[
          styles.keyButton,
          inCalculator && styles.calculatorNumberButton,
          lastPressedKey === key && styles.keyButtonPressed
        ]}
        onPress={() => handleKeyPress(key)}
      >
        <Text style={styles.keyText}>{key}</Text>
      </TouchableOpacity>
    );
  };

  // Full screen calculator view
  if (showFullCalculator) {
    return (
      <View style={styles.fullCalculatorContainer}>
        <View style={styles.calculatorHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={() => {
            setShowFullCalculator(false);
            // Notify parent component when exiting full calculator mode
            onKeyPress('calculator');
          }}>
            <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.calculatorDisplay}>
          <Text style={styles.calculatorDisplayText}>
            {expression}
          </Text>
        </View>
        
        <View style={styles.calculatorBody}>
          {calculatorRows.map((row, rowIndex) => (
            <View key={`calc-row-${rowIndex}`} style={styles.keyRow}>
              {row.map((key, keyIndex) => renderKey(key, keyIndex, rowIndex, true))}
            </View>
          ))}
        </View>
      </View>
    );
  }

  // Standard numeric keypad view
  return (
    <View style={styles.keypadPanel}>
      {/* Header with close button */}
      {onDismiss && (
        <View style={styles.header}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
            <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Regular keypad layout */}
      {keyRows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.keyRow}>
          {row.map((key, keyIndex) => renderKey(key, keyIndex, rowIndex))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  keypadPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#2d3038',
    backgroundColor: '#1e2126',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 1000, // Ensure proper stacking
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },
  fullCalculatorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1e2126',
    zIndex: 3000, // Higher than anything else
    paddingTop: 40,
    paddingBottom: 20,
    elevation: 20, // Higher elevation for Android
  },
  calculatorHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  calculatorBody: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  calculatorDisplay: {
    backgroundColor: '#282c34',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 8,
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 100, // Increased to accommodate preview
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  calculatorDisplayText: {
    color: '#FFFFFF',
    fontSize: 36, // Increased size
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  closeButton: {
    padding: 8,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  keyButton: {
    width: '23%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#282c34',
  },
  keyButtonPressed: {
    backgroundColor: '#4a5061', // Lighter color for pressed state
    transform: [{ scale: 0.95 }], // Slightly scale down when pressed
    borderWidth: 1,
    borderColor: '#6b7280', // Add border to make the pressed state more visible
    shadowColor: '#fff',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 0 },
  },
  functionButton: {
    backgroundColor: '#3a3f4b', // Slightly lighter for function buttons
  },
  operationButton: {
    backgroundColor: '#404753', // Even lighter for operation buttons
  },
  equalsButton: {
    backgroundColor: '#3b82f6', // Blue for equals
  },
  calculatorNumberButton: {
    backgroundColor: '#282c34', // Darker for calculator number buttons
  },
  keyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  doneButton: {
    backgroundColor: '#ff6b6b', // Red color for the Done button
  },
  doneText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  activeCalculatorButton: {
    backgroundColor: '#4287f5', // Highlight when calculator mode is active
  },
});

export default NumericKeypad; 
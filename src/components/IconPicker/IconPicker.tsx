import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Common icons used for financial categories and accounts
const COMMON_ICONS = [
  // Money & Finance
  'cash', 'credit-card', 'bank', 'wallet', 'currency-usd', 'piggy-bank', 'chart-line',
  'chart-bar', 'chart-pie', 'percent', 'cash-plus', 'cash-minus', 'cash-lock', 'cash-refund',
  'safe', 'calculator', 'receipt', 'handshake', 'finance', 'briefcase',
  
  // Expense Categories
  'food', 'food-apple', 'coffee', 'beer', 'glass-cocktail', 'silverware-fork-knife', 'shopping',
  'basket', 'cart', 'tshirt-crew', 'shoe-heel', 'hanger', 'lipstick', 'ring',
  'home', 'lightbulb', 'flash', 'water', 'television', 'sofa', 'washing-machine',
  'car', 'car-side', 'gas-station', 'bus', 'train', 'airplane', 'taxi', 'bicycle',
  'pill', 'medical-bag', 'hospital-box', 'clipboard-pulse', 'tooth', 'eye',
  'school', 'book', 'book-open-variant', 'pencil', 'graduation-cap', 'certificate',
  'gamepad-variant', 'controller', 'spotify', 'netflix', 'youtube', 'movie', 'music',
  'basketball', 'football', 'tennis', 'ski', 'weight-lifter', 'bike', 'swim',
  'dog', 'cat', 'paw', 'horse', 'bird', 'fish',
  'flower', 'tree', 'leaf', 'forest',
  'beach', 'island', 'palm-tree', 'umbrella-beach', 'sunglasses', 'camera',
  'gift', 'balloon', 'cake-variant', 'party-popper', 'drama-masks',
  'smoking', 'smoking-off', 'bottle-wine', 'glass-wine', 'beer-outline', 'bottle-tonic',
  'phone', 'cellphone', 'printer', 'router-wireless', 'laptop', 'desktop-tower-monitor',
  'tools', 'screwdriver', 'wrench', 'hammer', 'saw', 'nail',
  'spray', 'spray-bottle', 'water-pump', 'shower-head', 'toilet', 'trash-can',
  'baby-carriage', 'baby-bottle', 'baby-face', 'human-baby-changing-table',
  'heart', 'heart-pulse', 'charity',
  
  // Income & Savings Categories
  'briefcase', 'domain', 'badge-account', 'hammer-wrench', 'account-hard-hat',
  'crown', 'trophy', 'star', 'hand-coin', 'seed', 'tree-outline', 'sprout',
  'cookie', 'egg', 'food-apple-outline', 'fruit-cherries', 'fruit-watermelon',
  'cow', 'horse-variant', 'sheep',
  
  // Miscellaneous
  'shape', 'cog', 'apps', 'tag', 'tag-text', 'tag-heart', 'bell', 'bookmark',
  'checkbox-marked-circle', 'check-circle', 'alert-circle', 'information', 'help-circle'
];

// Colors for the icon backgrounds
const ICON_COLORS = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
  '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E',
  '#607D8B'
];

interface IconPickerProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (icon: string, color: string) => void;
  initialIcon?: string;
  initialColor?: string;
}

const IconPicker: React.FC<IconPickerProps> = ({
  visible,
  onDismiss,
  onSelect,
  initialIcon = 'shape',
  initialColor = '#2196F3'
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(initialIcon);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [allIcons, setAllIcons] = useState<string[]>([]);
  const [showMoreIcons, setShowMoreIcons] = useState(false);
  
  // Load all icons on component mount
  useEffect(() => {
    setSelectedIcon(initialIcon);
    setSelectedColor(initialColor);
    setSearchQuery('');
    
    // If we need to get all available icons, uncomment this code
    // This might be slow, so use with caution
    /*
    MaterialCommunityIcons.getImageSource('', 0).then(() => {
      // @ts-ignore: glyphMap exists but isn't in the types
      const allAvailableIcons = Object.keys(MaterialCommunityIcons.glyphMap);
      setAllIcons(allAvailableIcons);
    });
    */
  }, [visible, initialIcon, initialColor]);
  
  const filteredIcons = searchQuery.trim() === '' 
    ? COMMON_ICONS 
    : COMMON_ICONS.filter(icon => 
        icon.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon);
  };
  
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };
  
  const handleConfirm = () => {
    onSelect(selectedIcon, selectedColor);
    onDismiss();
  };
  
  const windowWidth = Dimensions.get('window').width;
  const numColumns = Math.floor(windowWidth / 80); // Assuming each item is ~80px wide
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onDismiss}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              Choose an icon
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
            />
          </View>
          
          <View style={styles.previewContainer}>
            <View style={[
              styles.iconPreview, 
              { backgroundColor: selectedColor || theme.colors.primary }
            ]}>
              <MaterialCommunityIcons
                name={selectedIcon}
                size={36}
                color="#FFFFFF"
              />
            </View>
          </View>
          
          <TextInput
            placeholder="Search icons..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { 
              backgroundColor: theme.colors.surfaceVariant,
              color: theme.colors.onSurface
            }]}
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
          
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Colors
          </Text>
          
          <ScrollView 
            horizontal 
            style={styles.colorList}
            contentContainerStyle={styles.colorListContent}
            showsHorizontalScrollIndicator={false}
          >
            {ICON_COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorItem,
                  { backgroundColor: color },
                  selectedColor === color && [
                    styles.selectedColorItem,
                    { borderColor: theme.colors.primary }
                  ]
                ]}
                onPress={() => handleColorSelect(color)}
              />
            ))}
          </ScrollView>
          
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Icons
          </Text>
          
          <FlatList
            data={filteredIcons}
            numColumns={numColumns}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.iconItem,
                  { backgroundColor: theme.colors.surfaceVariant },
                  selectedIcon === item && [styles.selectedItem, { borderColor: theme.colors.primary }]
                ]}
                onPress={() => handleIconSelect(item)}
              >
                <MaterialCommunityIcons
                  name={item}
                  size={28}
                  color={theme.colors.onSurface}
                />
              </TouchableOpacity>
            )}
            keyExtractor={item => item}
          />
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={handleConfirm}
            >
              <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    width: '95%',
    maxHeight: '85%',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconPreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  colorList: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  colorListContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconItem: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    borderRadius: 8,
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  selectedColorItem: {
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default IconPicker; 
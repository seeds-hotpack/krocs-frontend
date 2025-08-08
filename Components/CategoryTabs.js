import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';


export default function CategoryTabs({ styles, activeCategory, onCategoryChange }) {
  return (
    <View style={styles.categoryTabs}>
      <TouchableOpacity onPress={() => onCategoryChange('progress')}>
        <Text style={activeCategory === 'progress' ? styles.selectedCategory : styles.category}>
          진행중인 목표
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onCategoryChange('done')}>
        <Text style={activeCategory === 'done' ? styles.selectedCategory : styles.category}>
          완료한 목표
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onCategoryChange('template')}>
        <Text style={activeCategory === 'template' ? styles.selectedCategory : styles.category}>
          저장된 템플릿
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// const styles = StyleSheet.create({
//   categoryTabs: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   selectedCategory: {
//     fontWeight: 'bold',
//     borderBottomWidth: 4,
//     borderBottomColor: '#3B82F6',
//   },
//   category: { color: '#444' },
// });
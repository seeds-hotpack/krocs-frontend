import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Tabs({ activeTab, setActiveTab }) {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={activeTab === 'goal' ? styles.activeTab : styles.inactiveTab}
        onPress={() => setActiveTab('goal')}
      >
        <Text style={activeTab === 'goal' ? styles.activeTabText : styles.inactiveTabText}>목표</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={activeTab === 'timeline' ? styles.activeTab : styles.inactiveTab}
        onPress={() => setActiveTab('timeline')}
      >
        <Text style={activeTab === 'timeline' ? styles.activeTabText : styles.inactiveTabText}>타임라인</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: { flexDirection: 'row', justifyContent: 'center', padding: 8 },
  activeTab: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  inactiveTab: {
    borderWidth: 2,
    borderColor: '#1F2937',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTabText: { color: 'white', fontWeight: 'bold' },
  inactiveTabText: { color: '#1F2937' },
});
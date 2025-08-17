import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BottomNav({styles}) {
  return (
    <View style={styles.bottomNav}>
      <Text style={styles.navItem}>timeline</Text>
      <Text style={styles.navItem}>Community</Text>
      <Text style={styles.navItem}>Dashboard</Text>
      <Text style={styles.navItem}>Mypage</Text>
    </View>
  );
}

// const styles = StyleSheet.create({
//   bottomNav: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     padding: 14,
//     borderTopWidth: 1,
//     borderColor: '#ccc',
//   },
//   navItem: { color: '#999' },
// });
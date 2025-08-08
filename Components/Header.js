import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

function Header({styles}) {
  return (
    <View style={styles.header}>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>Krocs</Text>
  <Image
    source={require('./Krocs.png')}
    style={{ width: 24, height: 24, marginLeft: 8 }}
  />
      </View>
      <TouchableOpacity style={styles.menuIcon}>
        <Feather name="menu" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

export default Header;



// const styles = StyleSheet.create({
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 16,
//     backgroundColor: '#1F2937',
//   },
//   logoBox: {
//     backgroundColor: '#374151',
//     padding: 12,
//     borderRadius: 6,
//   },
//   logoText: { color: 'white', fontWeight: 'bold' },
//   menuIcon: { padding: 10 },
// });
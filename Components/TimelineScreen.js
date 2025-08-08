import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const TimelineScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* 배터리 아이콘 대체용 */}
      <View style={styles.batteryIcon}>
        <Feather name="battery" size={24} color="black" />
      </View>

      {/* 일정 아이템들 */}
      <View style={styles.timelineItem}>
        <View style={[styles.dot, { backgroundColor: '#FF7A7A' }]} />
        <View style={styles.timelineContent}>
          <Text style={styles.timeText}>8:00 AM</Text>
          <Text style={styles.eventText}>일정 내용</Text>
        </View>
        <Feather name="check-circle" size={20} color="black" />
      </View>

      {/* 선과 중간 메시지 */}
      <View style={styles.middleLine} />
      <Text style={styles.middleText}>14시간, 새로운 일정을 추가하세요.</Text>
      <View style={styles.middleLine} />

      {/* 마지막 일정 */}
      <View style={styles.timelineItem}>
        <View style={[styles.dot, { backgroundColor: '#D4D4D4' }]} />
        <View style={styles.timelineContent}>
          <Text style={styles.timeText}>10:00 PM</Text>
          <Text style={styles.eventText}>일정 내용</Text>
        </View>
        <Feather name="circle" size={20} color="black" />
      </View>

      {/* 추가 버튼 */}
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>＋</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default TimelineScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  batteryIcon: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
  },
  timelineContent: {
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  eventText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  middleLine: {
    height: 40,
    width: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
  },
  middleText: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 30,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'black',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 28,
  },
});
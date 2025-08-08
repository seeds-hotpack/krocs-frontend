import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const GoalCard = ({
  color,
  title,
  subGoals = [],
  completed,
  startDate,
  endDate,
  onCompleteEarly,
  onEdit,
  onToggleSubGoal,
  onDeleteSubGoal,
  styles,
}) => {
  const cardColors = {
    red: '#EF4444',
    yellow: '#FACC15',
    green: '#22C55E',
  };

  const formatMonthDay = (dateStr) => {
    const [, month, day] = dateStr.split('.');
    return `${parseInt(month)}월 ${parseInt(day)}일`;
  };

  const total = subGoals.length;
  const done = subGoals.filter(g => g.done).length;
  const progressRatio = total === 0 ? 1 : done / total;

  return (
    <View style={styles.goalCard}>
      <View style={[styles.colorStrip, { backgroundColor: cardColors[color] }]}>
        {completed ? (
          <Feather name="check" size={20} color="white" />
        ) : (
          <Feather name="chevron-up" size={20} color="white" />
        )}
      </View>
      <View style={styles.goalContent}>
        <Text style={styles.goalDate}>
          {formatMonthDay(startDate)} - {formatMonthDay(endDate)}
        </Text>
        <Text style={styles.goalTitle}>{title}</Text>

        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressRatio * 100}%`, backgroundColor: cardColors[color] },
            ]}
          />
        </View>

        {!completed &&
          subGoals.map((goal, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginVertical: 4,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => onToggleSubGoal?.(idx)}>
                  <Feather name={goal.done ? 'check-square' : 'square'} size={20} />
                </TouchableOpacity>
                <Text
                  style={{
                    marginLeft: 8,
                    textDecorationLine: goal.done ? 'line-through' : 'none',
                    color: goal.done ? '#94a3b8' : '#0f172a',
                  }}
                >
                  {goal.text}
                </Text>
              </View>
              <TouchableOpacity onPress={() => onDeleteSubGoal?.(idx)}>
                <Text style={{ fontSize: 16, color: '#999' }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
          {!completed && (
            <TouchableOpacity
              onPress={onCompleteEarly}
              style={{
                backgroundColor: 'green',
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 6,
                marginRight: 10,
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>완료</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onEdit}
            style={{
              backgroundColor: '#3B82F6',
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>수정</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default GoalCard;
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import DeleteConfirmModal from "./DeleteConfirmModal";

const GoalForm = ({
  styles,
  customDaysModalVisible,
  setCustomDaysModalVisible,
  customDaysInput,
  setCustomDaysInput,
  handleDurationSelect,
  editingGoal,
  setShowGoalForm,
  resetGoalForm,
  setEditingGoal,
  setEditingIndex,
  title,
  setTitle,
  color,
  setColor,
  startDate,
  endDate,
  setPickerMode,
  setShowPicker,
  showPicker,
  pickerMode,
  onChange,
  isStartDateTouched,
  setIsStartDateTouched,
  subGoals,
  setSubGoals,
  newSubGoalText,
  setNewSubGoalText,
  subGoalModalVisible,
  setSubGoalModalVisible,
  showDeleteModal,
  setShowDeleteModal,
  onDeleteGoal,
  saveAsTemplate,
  onUpdateGoal,
  onAddGoal,
  isTemplate,
  saveTemplate,
  formatDate,
  editingIndex,
}) => {
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.goalForm}>
       {customDaysModalVisible && (
              <View style={styles.customDaysModal}>
                <Text style={{ marginBottom: 10 }}>
                  며칠 후까지 설정할까요?
                </Text>
                <TextInput
                  value={customDaysInput}
                  onChangeText={setCustomDaysInput}
                  keyboardType="numeric"
                  placeholder="숫자만 입력"
                  style={styles.modalInput}
                />
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    onPress={() => setCustomDaysModalVisible(false)}
                    style={{ marginRight: 10 }}
                  >
                    <Text>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const days = parseInt(customDaysInput, 10);
                      if (!isNaN(days)) {
                        handleDurationSelect(days);
                        setCustomDaysInput("");
                        setCustomDaysModalVisible(false);
                      } else {
                        alert("올바른 숫자를 입력하세요.");
                      }
                    }}
                    style={styles.modalButton}
                  >
                    <Text>확인</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <View style={styles.goalFormHeader}>
              <Text style={styles.goalFormTitle}>
                {" "}
                {editingGoal ? "목표 수정" : "새로운 목표"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (editingGoal) {
                    // 수정 중이면 폼만 닫기
                    setShowGoalForm(false);
                    setEditingGoal(null);
                    setEditingIndex(null);
                  } else {
                    // 새 목표 생성 중이면 완전 초기화
                    resetGoalForm();
                  }
                }}
              >
                <Text style={{ fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="목표명"
                value={title}
                onChangeText={setTitle}
              />
              <View style={{ flexDirection: "row", marginLeft: 10 }}>
                {["red", "yellow", "green"].map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setColor(c)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor:
                        c === "red"
                          ? "#EF4444"
                          : c === "yellow"
                          ? "#FACC15"
                          : "#22C55E",
                      marginHorizontal: 4,
                      borderWidth: color === c ? 2 : 0,
                      borderColor: "black",
                    }}
                  />
                ))}
              </View>
            </View>

            {/* 날짜 선택 컴포넌트 */}
            <View
              style={[styles.row, { alignItems: "center", flexWrap: "nowrap" }]}
            >
              <Feather
                name="calendar"
                size={20}
                color="#444"
                style={{ marginRight: 8 }}
              />

              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 6,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  marginRight: 6,
                  width: 120,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => {
                  setIsStartDateTouched(true); // 👉 사용자가 직접 선택함
                  setPickerMode("start");
                  setShowPicker(true);
                }}
              >
                <Text style={{ fontSize: 14, color: "#444" }}>
                  {formatDate(startDate)}
                </Text>
              </TouchableOpacity>

              <Text style={{ marginHorizontal: 4 }}>→</Text>

              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 6,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  width: 120,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => {
                  setPickerMode("end");
                  setShowPicker(true);
                }}
              >
                <Text style={{ fontSize: 14, color: "#444" }}>
                  {formatDate(endDate)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* DateTimePicker 모달 */}
            {showPicker && (
              <DateTimePicker
                value={pickerMode === "start" ? startDate : endDate}
                mode="date"
                display="default"
                onChange={onChange}
                minimumDate={pickerMode === "end" ? startDate : undefined}
              />
            )}

            {/* 기존 UI 계속 유지 */}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => handleDurationSelect(3)}
              >
                <Text>3</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => handleDurationSelect(7)}
              >
                <Text>7</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => handleDurationSelect(30)}
              >
                <Text>30</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => setCustomDaysModalVisible(true)}
              >
                <Text>＋</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <Feather
                name="repeat"
                size={20}
                color="#888"
                style={{ marginRight: 6, alignSelf: "center" }}
              />
              <TouchableOpacity style={styles.smallButton}>
                <Text>매일</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallButton}>
                <Text>일주일</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallButton}>
                <Text>한달</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallButton}>
                <Text>＋</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <TouchableOpacity style={styles.smallButton}>
                <Text>5</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallButton, { backgroundColor: "#ccc" }]}
              >
                <Text>10</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallButton}>
                <Text>30</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallButton}>
                <Text>1h</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallButton}>
                <Text>...</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.row, { alignItems: "center", marginTop: 12 }]}>
              <Feather
                name="scissors"
                size={16}
                color="#444"
                style={{ marginRight: 8 }}
              />

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 10,
                  }}
                >
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: "#444",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 6,
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#444",
                      }}
                    />
                  </View>
                  <Text>정량 입력</Text>
                </View>

                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#444",
                    borderRadius: 6,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    backgroundColor: "#fff",
                    width: 100,
                  }}
                  placeholder="숫자만 입력"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={{ marginTop: 12, fontWeight: "bold" }}>세부 목표</Text>
            <View style={styles.subGoalList}>
              {subGoals.map((sg, idx) => {
                const text = typeof sg === "string" ? sg : sg?.text ?? ""; // 객체일 때도 안전하게 처리
                return (
                  <View key={idx} style={styles.subGoalItem}>
                    <Text>✅ {text}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        const updated = [...subGoals];
                        updated.splice(idx, 1);
                        setSubGoals(updated);
                      }}
                    >
                      <Text>✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}

              <TouchableOpacity
                style={[
                  styles.smallButton,
                  { alignSelf: "flex-start", marginTop: 10 },
                ]}
                onPress={() => setSubGoalModalVisible(true)}
              >
                <Text>＋</Text>
              </TouchableOpacity>
            </View>

            {subGoalModalVisible && (
              <View
                style={{
                  position: "absolute",
                  top: "35%",
                  left: "10%",
                  width: "80%",
                  padding: 20,
                  backgroundColor: "white",
                  borderRadius: 10,
                  elevation: 10,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                }}
              >
                <Text style={{ marginBottom: 10 }}>세부 목표를 입력하세요</Text>
                <TextInput
                  value={newSubGoalText}
                  onChangeText={setNewSubGoalText}
                  placeholder="예: API 명세서 작성"
                  style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 6,
                    padding: 10,
                    marginBottom: 12,
                  }}
                />
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <TouchableOpacity
                    onPress={() => setSubGoalModalVisible(false)}
                    style={{ marginRight: 10 }}
                  >
                    <Text>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (newSubGoalText.trim()) {
                        // setSubGoals([...subGoals, newSubGoalText.trim()]);
                        setSubGoals([
                          ...subGoals,
                          { text: newSubGoalText.trim(), done: false },
                        ]);
                        setNewSubGoalText("");
                        setSubGoalModalVisible(false);
                      } else {
                        alert("세부 목표를 입력해주세요.");
                      }
                    }}
                  >
                    <Text>확인</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 14,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#e11d48",
                  width: 48,
                  height: 48,
                  borderRadius: 6,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => {
                  if (editingGoal && editingIndex !== null) {
                    setShowDeleteModal(true); // 삭제 모달 띄우기
                  } else {
                    resetGoalForm(); // 아니면 그냥 폼 닫기 및 초기화
                    setIsStartDateTouched(false);
                  }
                }}
              >
                <Feather name="trash-2" size={20} color="white" />
              </TouchableOpacity>
              <DeleteConfirmModal
                visible={showDeleteModal}
                onDelete={() => {
                  if (editingIndex !== null) {
                    onDeleteGoal(editingIndex); // 실제 삭제 실행
                  } else {
                    alert("삭제할 목표를 찾을 수 없습니다.");
                  }
                  resetGoalForm();
                  setShowDeleteModal(false); // 모달 닫기
                }}
                onSaveTemp={() => {
                  // 필요한 경우 템플릿 저장 로직
                  saveAsTemplate(editingGoal);
                  resetGoalForm();
                  setShowDeleteModal(false);
                }}
                onCancel={() => setShowDeleteModal(false)}
              />
              <View style={{ flexDirection: "row" }}>
                {/* 템플릿으로 저장 버튼 */}
                <TouchableOpacity
                  style={{
                    backgroundColor: "white",
                    borderWidth: 1,
                    borderColor: "black",
                    width: 120,
                    height: 48,
                    borderRadius: 6,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 3,
                  }}
                  onPress={() => {
                    saveAsTemplate({
                      title,
                      subGoals,
                      startDate,
                      endDate,
                    });
                    resetGoalForm();
                  }}
                >
                  <Text style={{ color: "black", fontWeight: "bold" }}>
                    템플릿으로 저장
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: "black",
                    width: 64,
                    height: 48,
                    borderRadius: 6,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => {
                    const goal = {
                      title,
                      subGoals, // ✅ 포함되어 있음 OK!
                      startDate: formatDate(startDate),
                      endDate: formatDate(endDate),
                      color,
                      isTemplate,
                      completed: false,
                      progress: 0,
                    };

                    if (editingGoal) {
                      if (editingGoal.isTemplate) {
                        // 템플릿을 수정 중이라면 → 목표로 저장
                        onAddGoal(goal);
                      } else {
                        // ✅ 항상 onUpdateGoal 사용
                        onUpdateGoal(goal);
                      }
                    } else {
                      if (isTemplate) {
                        saveTemplate(goal);
                      } else {
                        onAddGoal(goal);
                      }
                    }

                    resetGoalForm(); // 폼 초기화
                  }}
                >
                  <Feather name="check" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default GoalForm;

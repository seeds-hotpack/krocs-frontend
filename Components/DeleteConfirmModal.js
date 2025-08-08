// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import Modal from 'react-native-modal';

// export default function DeleteConfirmModal({ visible, onDelete, onSaveTemp, onCancel }) {
//   return (
//     <Modal isVisible={visible} backdropOpacity={0.5}>
//       <View style={styles.modal}>
//         <Text style={styles.title}>목표를 삭제할까요?</Text>
//         <Text style={styles.subtitle}>
//           삭제한 목표는 복구되지 않으며, 템플릿으로 임시 저장할 수 있습니다.
//         </Text>

//         <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
//           <Text style={styles.deleteText}>삭제</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.outlineButton} onPress={onSaveTemp}>
//           <Text style={styles.outlineText}>임시저장</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.outlineButton} onPress={onCancel}>
//           <Text style={styles.outlineText}>취소</Text>
//         </TouchableOpacity>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   modal: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     paddingVertical: 32,
//     paddingHorizontal: 24,
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 12,
//     color: '#000',
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#888',
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   deleteButton: {
//     backgroundColor: '#000',
//     borderRadius: 8,
//     paddingVertical: 14,
//     paddingHorizontal: 100,
//     marginBottom: 12,
//   },
//   deleteText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   outlineButton: {
//     borderWidth: 1,
//     borderColor: '#000',
//     borderRadius: 8,
//     paddingVertical: 14,
//     paddingHorizontal: 100,
//     marginBottom: 12,
//   },
//   outlineText: {
//     color: '#000',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function DeleteConfirmModal({
  visible,
  onDelete,
  onSaveAsTemplate,
  onCancel,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>목표를 삭제할까요?</Text>
          <Text style={styles.description}>
            삭제한 목표는 복구되지 않으며, 템플릿으로 임시 저장할 수 있습니다.
          </Text>

          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteText}>삭제</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.borderButton} onPress={onSaveAsTemplate}>
            <Text style={styles.borderText}>임시저장</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.borderButton} onPress={onCancel}>
            <Text style={styles.borderText}>취소</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteButton: {
    backgroundColor: 'black',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
  borderButton: {
    width: '100%',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  borderText: {
    color: 'black',
    fontWeight: 'bold',
  },
});
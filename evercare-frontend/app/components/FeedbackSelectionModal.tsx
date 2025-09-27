import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FeedbackSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectReview: () => void;
  onSelectComplaint: () => void;
  caregiverName?: string;
}

const FeedbackSelectionModal: React.FC<FeedbackSelectionModalProps> = ({
  visible,
  onClose,
  onSelectReview,
  onSelectComplaint,
  caregiverName = 'the caregiver',
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>Write Feedback</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            How would you like to provide feedback for {caregiverName}?
          </Text>

          {/* Review Option */}
          <TouchableOpacity style={styles.optionCard} onPress={onSelectReview}>
            <View style={styles.optionIcon}>
              <Ionicons name="star" size={32} color="#FFD700" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Add Review</Text>
              <Text style={styles.optionDescription}>
                Rate and write a review about your experience with the caregiver
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          {/* Complaint Option */}
          <TouchableOpacity style={styles.optionCard} onPress={onSelectComplaint}>
            <View style={styles.optionIcon}>
              <Ionicons name="alert-circle" size={32} color="#E74C3C" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Add Complaint</Text>
              <Text style={styles.optionDescription}>
                Report an issue or concern about the caregiver's service
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default FeedbackSelectionModal;

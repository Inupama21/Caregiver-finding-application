import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import FeedbackSelectionModal from '../../components/FeedbackSelectionModal';
import ComplaintForm from '../../components/ComplaintForm';
import { useCurrentUser } from '../../hooks/useCurrentUser';

const PaymentSuccess: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user: currentUser } = useCurrentUser();
  
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  const formatAmount = (amount: string | string[] | undefined) => {
    const amountStr = Array.isArray(amount) ? amount[0] : amount;
    return `LKR ${parseFloat(amountStr || '0').toFixed(2)}`;
  };

  const handleWriteFeedback = () => {
    setShowFeedbackModal(true);
  };

  const handleSelectReview = () => {
    setShowFeedbackModal(false);
    const caregiverId = Array.isArray(params.caregiverId) ? params.caregiverId[0] : params.caregiverId;
    const caregiverName = Array.isArray(params.caregiverName) ? params.caregiverName[0] : params.caregiverName;
    
  
    console.log('All params:', params);
    console.log('Extracted caregiverId:', caregiverId);
    console.log('Extracted caregiverName:', caregiverName);
    console.log('Current user:', currentUser);

    
    if (caregiverId) {
      router.push({
        pathname: '/pages/Careseeker/ReviewPage',
        params: {
          caregiverId,
          caregiverName,
          paymentCompleted: 'true', 
        },
      });
    } else {
      Alert.alert('Error', 'Caregiver information is missing. Cannot proceed to review.');
    }
  };

  const handleSelectComplaint = () => {
    setShowFeedbackModal(false);
    console.log('PaymentSuccess params:', params);
    console.log('Current user:', currentUser);
    
    const caregiverId = Array.isArray(params.caregiverId) ? params.caregiverId[0] : params.caregiverId;
    if (!caregiverId) {
      Alert.alert('Error', 'Caregiver information is missing. Cannot submit complaint.');
      return;
    }
    
    setShowComplaintForm(true);
  };

  const handleComplaintSuccess = () => {
    setShowComplaintForm(false);
    router.push('/pages/Careseeker/MainFeed');
  };

  const handleComplaintCancel = () => {
    setShowComplaintForm(false);
  };

  // Show success toast when component mounts
  useEffect(() => {
    Toast.show({
      type: "success",
      text1: "Payment Successful!",
      text2: "Your payment has been processed successfully.",
      visibilityTime: 4000,
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#28a745" />
        </View>

      

        {/* Payment Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Payment Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Paid</Text>
            <Text style={styles.detailValue}>{formatAmount(params.amount || '0')}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Caregiver</Text>
            <Text style={styles.detailValue}>
              {Array.isArray(params.caregiverName) ? params.caregiverName[0] : params.caregiverName}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.detailValue, styles.successStatus]}>Confirmed</Text>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>What's Next?</Text>
          <View style={styles.stepItem}>
            <Ionicons name="checkmark-circle" size={16} color="#28a745" />
            <Text style={styles.stepText}>Your booking has been confirmed</Text>
          </View>
          <View style={styles.stepItem}>
            <Ionicons name="time" size={16} color="#007AFF" />
            <Text style={styles.stepText}>The caregiver will be notified</Text>
          </View>
          <View style={styles.stepItem}>
            <Ionicons name="chatbubble" size={16} color="#007AFF" />
            <Text style={styles.stepText}>You can start chatting with your caregiver</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/pages/Careseeker/MainFeed')}
          >
            <Ionicons name="home" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Go to Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleWriteFeedback}
          >
            <Ionicons name="star" size={20} color="#007AFF" />
            <Text style={styles.secondaryButtonText}>Write Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feedback Selection Modal */}
      <FeedbackSelectionModal
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSelectReview={handleSelectReview}
        onSelectComplaint={handleSelectComplaint}
        caregiverName={Array.isArray(params.caregiverName) ? params.caregiverName[0] : params.caregiverName}
      />

      {/* Complaint Form Modal */}
      {showComplaintForm && currentUser && params.caregiverId && (
        <ComplaintForm
          caregiverId={parseInt(Array.isArray(params.caregiverId) ? params.caregiverId[0] : params.caregiverId)}
          careseekerId={currentUser.id}
          caregiverName={Array.isArray(params.caregiverName) ? params.caregiverName[0] : params.caregiverName}
          onSubmitSuccess={handleComplaintSuccess}
          onCancel={handleComplaintCancel}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  successStatus: {
    color: '#28a745',
    fontWeight: '600',
  },
  nextStepsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PaymentSuccess;

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { createBookingPayment, confirmPayment } from '../../../services/paymentService';

interface PaymentScreenParams {
  caregiverId: string;
  caregiverName: string;
  serviceType: string;
  amount: string;
  startDate: string;
  endDate: string;
  description?: string;
  address?: string;
  phone?: string;
  name?: string;
}

const PaymentScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getUserId, user, loading: userLoading } = useCurrentUser();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [loading, setLoading] = useState(true); // Start in a loading state
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  
  // ✅ Ref to prevent the initialization function from running in a loop
  const initializedParamsRef = useRef<string | null>(null);

  const getStringParam = (value: string | string[] | undefined): string => {
    return Array.isArray(value) ? value[0] || '' : value || '';
  };

  useEffect(() => {
    const currentParamsString = JSON.stringify(params);

    if (!userLoading && user) {
      // ✅ This check ensures initializePayment only runs if the params have truly changed,
      // preventing infinite loops caused by unstable object references.
      if (initializedParamsRef.current !== currentParamsString) {
        initializedParamsRef.current = currentParamsString;
        initializePayment();
      }
    }
  }, [userLoading, user, params]);

  const initializePayment = async () => {
    setLoading(true);

    const careseekerId = getUserId();
    if (!careseekerId) {
      Alert.alert('Error', 'Please login to make a payment');
      setLoading(false);
      router.back();
      return;
    }
    
    const amountStr = getStringParam(params.amount);
    if (!getStringParam(params.caregiverId) || !amountStr || parseFloat(amountStr) <= 0) {
        Alert.alert('Invalid Details', 'Booking information is missing or incorrect.', [{ text: 'OK', onPress: () => router.back() }]);
        setLoading(false);
        return;
    }

    try {
      const bookingData = {
        careseekerId,
        caregiverId: parseInt(getStringParam(params.caregiverId)),
        serviceType: getStringParam(params.serviceType) || 'Care Service',
        amount: parseFloat(amountStr),
        startDate: getStringParam(params.startDate) || new Date().toISOString(),
        endDate: getStringParam(params.endDate) || new Date().toISOString(),
        description: getStringParam(params.description),
        address: getStringParam(params.address),
        phone: getStringParam(params.phone),
        name: getStringParam(params.name),
      };
      
      const response = await createBookingPayment(bookingData);
      
      if (response.success && response.data.paymentIntent.clientSecret) {
        const { clientSecret } = response.data.paymentIntent;
        setPaymentIntentClientSecret(clientSecret);
        
        // Extract payment intent ID from client secret (format: pi_xxx_secret_xxx)
        const paymentIntentId = clientSecret.split('_secret_')[0];
        setPaymentIntentId(paymentIntentId);
        
        const { error } = await initPaymentSheet({
          merchantDisplayName: "EverCare",
          paymentIntentClientSecret: clientSecret,
          allowsDelayedPaymentMethods: true,
          defaultBillingDetails: {
            name: getStringParam(params.name) || user?.name || 'Customer',
          }
        });

        if (error) {
          console.error('Payment sheet initialization error:', error);
          Alert.alert('Error', `Failed to initialize payment: ${error.message}`);
        }
      } else {
        Alert.alert('Error', 'Failed to create payment intent from server.');
      }
    } catch (error: any) {
      console.error('Error creating booking payment:', error);
      let errorMessage = 'An unexpected error occurred.';
       if (error.response) {
        console.error('Backend Error Data:', error.response.data);
        errorMessage = error.response.data.message || error.response.data.error || 'Failed to initialize payment due to a server error.';
      }
      Alert.alert('Initialization Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentIntentClientSecret) {
      Alert.alert('Error', 'Payment is not ready. Please wait or try again.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code !== 'Canceled') {
          Alert.alert('Payment Failed', error.message);
        }
      } else {
        // Payment successful, confirm payment with backend
        try {
          if (paymentIntentId) {
            await confirmPayment(paymentIntentId);
            console.log('Payment confirmed with backend');
          }
        } catch (confirmError) {
          console.error('Error confirming payment:', confirmError);
          // Don't fail the payment flow if confirmation fails
        }

        Alert.alert(
          'Payment Successful!',
          'Your payment has been processed successfully.',
          [{
            text: 'OK',
            onPress: () => router.push({
              pathname: '/pages/Careseeker/PaymentSuccess',
              params: { 
                amount: params.amount, 
                caregiverName: params.caregiverName,
                caregiverId: params.caregiverId
              }
            })
          }]
        );
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      Alert.alert('Error', 'An unexpected error occurred while processing the payment.');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string | string[] | undefined) => {
    const amountStr = getStringParam(amount);
    return `LKR ${parseFloat(amountStr || '0').toFixed(2)}`;
  };

  const formatDate = (dateString: string | string[] | undefined) => {
    const dateStr = getStringParam(dateString);
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // The rest of the component (loading states, JSX, and styles) remains the same.
  // I am including it here for completeness.

  if (userLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading user data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContainer}>
          <Ionicons name="person-circle-outline" size={64} color="#999" />
          <Text style={styles.loadingText}>Please login to make a payment</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.loginButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Initial loading state while the effect runs for the first time
  if (loading && !paymentIntentClientSecret) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Initializing payment...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service</Text>
            <Text style={styles.summaryValue}>{getStringParam(params.serviceType)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Caregiver</Text>
            <Text style={styles.summaryValue}>{getStringParam(params.caregiverName)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Start Date</Text>
            <Text style={styles.summaryValue}>{formatDate(params.startDate)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>End Date</Text>
            <Text style={styles.summaryValue}>{formatDate(params.endDate)}</Text>
          </View>
          
          {getStringParam(params.description) && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Description</Text>
              <Text style={styles.summaryValue}>{getStringParam(params.description)}</Text>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{formatAmount(params.amount)}</Text>
          </View>
        </View>

        <View style={styles.paymentMethodCard}>
          <Text style={styles.paymentMethodTitle}>Payment Method</Text>
          <View style={styles.paymentMethodRow}>
            <Ionicons name="card" size={24} color="#007AFF" />
            <Text style={styles.paymentMethodText}>Credit/Debit Card</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>
        </View>

        <View style={styles.securityCard}>
          <Ionicons name="shield-checkmark" size={20} color="#28a745" />
          <Text style={styles.securityText}>
            Your payment is secure and encrypted. We use Stripe for secure payment processing.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.paymentButtonContainer}>
        <TouchableOpacity
          style={[styles.paymentButton, (loading || !paymentIntentClientSecret) && styles.paymentButtonDisabled]}
          onPress={handlePayment}
          disabled={loading || !paymentIntentClientSecret}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="card" size={20} color="#fff" />
              <Text style={styles.paymentButtonText}>
                Pay {formatAmount(params.amount)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
    margin: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  paymentMethodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  securityText: {
    fontSize: 14,
    color: '#1c7430',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  paymentButtonContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  paymentButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentButtonDisabled: {
    backgroundColor: '#a9a9a9',
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});


export default PaymentScreen;
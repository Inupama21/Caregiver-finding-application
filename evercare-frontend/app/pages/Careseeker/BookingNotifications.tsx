// pages/Careseeker/BookingNotifications.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BookingNotificationCard from '../../components/BookingNotificationCard';
import UnifiedNotificationCard from '../../components/UnifiedNotificationCard';
import { bookingNotificationService, BookingNotification } from '../../../services/bookingNotificationService';
import { unifiedNotificationService, UnifiedNotification } from '../../../services/unifiedNotificationService';
import { useCurrentUser } from '../../hooks/useCurrentUser';

interface BookingNotificationsProps {
  navigation?: any;
}

const BookingNotifications: React.FC<BookingNotificationsProps> = ({
  navigation,
}) => {
  const router = useRouter();
  const { getUserId, loading: userLoading } = useCurrentUser();
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);


  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const currentCareseekerId = getUserId();
      
      console.log('=== Unified Notifications Debug ===');
      console.log('Current careseeker ID:', currentCareseekerId);
      
      if (!currentCareseekerId) {
        Alert.alert('Error', 'Unable to load user data. Please login again.');
        return;
      }

      console.log('Fetching unified notifications for careseeker ID:', currentCareseekerId);

      const [notificationsData, unreadCountData] = await Promise.all([
        unifiedNotificationService.getNotificationsByCareseeker(currentCareseekerId),
        unifiedNotificationService.getUnreadNotificationCount(currentCareseekerId),
      ]);
      
      console.log('Fetched unified notifications:', notificationsData);
      console.log('Total unread count:', unreadCountData);
      
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (error) {
      console.error('Error fetching unified notifications:', error);
      Alert.alert('Error', 'Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!userLoading) {
        fetchNotifications();
      }
    }, [userLoading])
  );

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // Determine notification type based on the notification object
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;
      
      const notificationType = 'booking' in notification ? 'booking' : 'interest';
      
      await unifiedNotificationService.markNotificationAsRead(notificationId, notificationType);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };



const handlePayNow = (bookingId: string) => {
  const notification = notifications.find(n => 'booking' in n && n.booking?.id === bookingId);

  if (!notification || !('booking' in notification) || !notification.booking || !notification.caregiver) {
    Alert.alert('Error', 'Booking details are missing. Cannot proceed to payment.');
    return;
  }

  const booking = notification.booking;
  const caregiver = notification.caregiver;
  const caregiverId = caregiver.id;
  

  const rateString = booking.caregiverRate;
  let amountValue: string | null = null;
  
  if (rateString) {
    const match = rateString.match(/\d+/); 
    if (match) {
      amountValue = match[0]; 
    }
  }
  
  // Now, validate using the extracted numeric string
  if (!caregiverId || !amountValue || parseFloat(amountValue) <= 0) {
    Alert.alert(
      'Payment Error',
      'Cannot proceed to payment. The booking contains an invalid caregiver or payment amount.'
    );
    return;
  }


  router.push({
    pathname: '/pages/Payment/PaymentScreen',
    params: {
      caregiverId: String(caregiverId),
      caregiverName: booking.caregiverName || caregiver.name || 'N/A',
      serviceType: 'Care Service',
      amount: amountValue, // ✅ Pass the cleaned, numeric-only string
      startDate: booking.startDate || new Date().toISOString(),
      endDate: booking.endDate || new Date().toISOString(),
      description: booking.patientDescription || '',
      address: booking.address || '',
      phone: booking.phone || '',
      name: booking.name || '',
      bookingId: bookingId,
    }
  });
};
  const handleMarkAllAsRead = async () => {
    try {
      const careseekerId = getUserId();
      if (!careseekerId) {
        Alert.alert('Error', 'User data not available');
        return;
      }
      
      await unifiedNotificationService.markAllNotificationsAsRead(careseekerId);
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const handleViewCaregiver = (caregiver: any) => {
    // Navigate to caregiver profile
    router.push({
      pathname: '/pages/Careseeker/CaregiverProfileView',
      params: { caregiverId: caregiver.id }
    });
  };

  // Test function to manually fetch notifications for debugging
  const testFetchNotifications = async () => {
    try {
      console.log('=== Manual Test Fetch ===');
      const testCareseekerId = getUserId();
      console.log('Testing with careseeker ID:', testCareseekerId);
      
      if (!testCareseekerId) {
        console.error('No user ID available for testing');
        return;
      }
      
      const response = await fetch(`http://192.168.176.11:5002/notifications/careseeker/${testCareseekerId}`);
      const data = await response.json();
      console.log('Direct fetch response:', data);
    } catch (error) {
      console.error('Direct fetch error:', error);
    }
  };

  // Filter notifications by type
  const bookingNotifications = notifications.filter(n => 'booking' in n);
  const interestNotifications = notifications.filter(n => 'caregiver' in n);
  const acceptedNotifications = bookingNotifications.filter(n => n.type === 'booking_accepted');
  const rejectedNotifications = bookingNotifications.filter(n => n.type === 'booking_rejected');

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>All Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          {notifications.length > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.markAllText}>Mark All Read</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.testButton}
            onPress={testFetchNotifications}
          >
            <Text style={styles.testButtonText}>Test Fetch</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              You'll receive notifications when caregivers show interest in your posts or respond to your booking requests.
            </Text>
          </View>
        ) : (
          <>
            {/* Interest Notifications */}
            {interestNotifications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Caregiver Interest ({interestNotifications.length})
                </Text>
                {interestNotifications.map((notification) => (
                  <UnifiedNotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onViewCaregiver={handleViewCaregiver}
                  />
                ))}
              </View>
            )}

            {/* Booking Notifications */}
            {acceptedNotifications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Accepted Bookings ({acceptedNotifications.length})
                </Text>
                {acceptedNotifications.map((notification) => (
                  <UnifiedNotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onPayNow={handlePayNow}
                  />
                ))}
              </View>
            )}

            {rejectedNotifications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Declined Bookings ({rejectedNotifications.length})
                </Text>
                {rejectedNotifications.map((notification) => (
                  <UnifiedNotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 16,
    color: '#6C757D',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
  },
  unreadBadge: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F4FD',
    borderRadius: 16,
  },
  markAllText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
  testButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginHorizontal: 16,
    marginBottom: 8,
  },
});

export default BookingNotifications;

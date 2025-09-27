// pages/Caregiver/CaregiverNotifications.tsx
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
import { caregiverNotificationService, CaregiverNotification } from '../../../services/caregiverNotificationService';
import { useCurrentUser } from '../../hooks/useCurrentUser';

interface CaregiverNotificationsProps {
  navigation?: any;
}

const CaregiverNotifications: React.FC<CaregiverNotificationsProps> = ({
  navigation,
}) => {
  const router = useRouter();
  const { getUserId, loading: userLoading } = useCurrentUser();
  const [notifications, setNotifications] = useState<CaregiverNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const currentCaregiverId = getUserId();
      
      console.log('=== Caregiver Notifications Debug ===');
      console.log('Current caregiver ID:', currentCaregiverId);
      
      if (!currentCaregiverId) {
        Alert.alert('Error', 'Unable to load user data. Please login again.');
        return;
      }

      console.log('Fetching notifications for caregiver ID:', currentCaregiverId);

      const [notificationsData, unreadCountData] = await Promise.all([
        caregiverNotificationService.getNotifications(currentCaregiverId),
        caregiverNotificationService.getUnreadCount(currentCaregiverId),
      ]);
      
      console.log('Fetched caregiver notifications:', notificationsData);
      console.log('Unread count:', unreadCountData);
      
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (error) {
      console.error('Error fetching caregiver notifications:', error);
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
      await caregiverNotificationService.markAsRead(notificationId);
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

  const handleMarkAllAsRead = async () => {
    try {
      const caregiverId = getUserId();
      if (!caregiverId) {
        Alert.alert('Error', 'User data not available');
        return;
      }
      
      await caregiverNotificationService.markAllAsRead(caregiverId);
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_accepted':
        return 'checkmark-circle';
      case 'booking_rejected':
        return 'close-circle';
      case 'payment_completed':
        return 'card';
      default:
        return 'information-circle';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking_accepted':
        return '#4CAF50';
      case 'booking_rejected':
        return '#F44336';
      case 'payment_completed':
        return '#17a2b8';
      default:
        return '#2196F3';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Filter notifications by type
  const paymentNotifications = notifications.filter(n => n.type === 'payment_completed');
  const bookingNotifications = notifications.filter(n => n.type === 'booking_accepted' || n.type === 'booking_rejected');

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
          <Text style={styles.headerTitle}>My Notifications</Text>
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
              You'll receive notifications about bookings and payments here.
            </Text>
          </View>
        ) : (
          <>
            {/* Payment Notifications */}
            {paymentNotifications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Payment Updates ({paymentNotifications.length})
                </Text>
                {paymentNotifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationCard,
                      !notification.isRead && styles.unreadNotification,
                    ]}
                    onPress={() => !notification.isRead && handleMarkAsRead(notification.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(notification.type) }]}>
                          <Ionicons
                            name={getNotificationIcon(notification.type) as any}
                            size={24}
                            color="#FFFFFF"
                          />
                        </View>
                        <View style={styles.notificationInfo}>
                          <Text style={styles.notificationMessage}>
                            {notification.message}
                          </Text>
                          <Text style={styles.notificationTime}>
                            {formatTimestamp(notification.timestamp)}
                          </Text>
                        </View>
                        {!notification.isRead && <View style={styles.unreadDot} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Booking Notifications */}
            {bookingNotifications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Booking Updates ({bookingNotifications.length})
                </Text>
                {bookingNotifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationCard,
                      !notification.isRead && styles.unreadNotification,
                    ]}
                    onPress={() => !notification.isRead && handleMarkAsRead(notification.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(notification.type) }]}>
                          <Ionicons
                            name={getNotificationIcon(notification.type) as any}
                            size={24}
                            color="#FFFFFF"
                          />
                        </View>
                        <View style={styles.notificationInfo}>
                          <Text style={styles.notificationMessage}>
                            {notification.message}
                          </Text>
                          <Text style={styles.notificationTime}>
                            {formatTimestamp(notification.timestamp)}
                          </Text>
                        </View>
                        {!notification.isRead && <View style={styles.unreadDot} />}
                      </View>
                    </View>
                  </TouchableOpacity>
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
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  unreadBadge: {
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#4A90E2',
    borderRadius: 6,
  },
  markAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  notificationCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
    marginLeft: 8,
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
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default CaregiverNotifications;


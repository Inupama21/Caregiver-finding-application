// components/BookingNotificationCard.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookingNotification } from '../../services/bookingNotificationService';

interface BookingNotificationCardProps {
  notification: BookingNotification;
  onMarkAsRead: (notificationId: string) => void;
  onPayNow?: (bookingId: string) => void;
}

const BookingNotificationCard: React.FC<BookingNotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onPayNow,
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_accepted':
        return 'checkmark-circle';
      case 'booking_rejected':
        return 'close-circle';
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

  const handlePayNow = () => {
    if (notification.booking && onPayNow) {
      Alert.alert(
        'Proceed to Payment',
        `Pay ${notification.booking.caregiverRate} to ${notification.booking.caregiverName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Pay Now', 
            onPress: () => onPayNow(notification.booking!.id),
            style: 'default'
          },
        ]
      );
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !notification.isRead && styles.unreadNotification,
      ]}
      activeOpacity={0.8}
      onPress={() => !notification.isRead && onMarkAsRead(notification.id)}
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

        {notification.booking && (
          <View style={styles.bookingDetails}>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingTitle}>Booking Details</Text>
              <Text style={styles.patientName}>👤 {notification.booking.name}</Text>
              <Text style={styles.bookingDate}>
                📅 {new Date(notification.booking.startDate).toLocaleDateString()} - {new Date(notification.booking.endDate).toLocaleDateString()}
              </Text>
              <Text style={styles.bookingAddress}>📍 {notification.booking.address}</Text>
              <Text style={styles.bookingRate}>💰 {notification.booking.caregiverRate}</Text>
            </View>

            {notification.type === 'booking_accepted' && (
              <TouchableOpacity
                style={styles.payNowButton}
                onPress={handlePayNow}
              >
                <Ionicons name="card" size={20} color="#FFFFFF" />
                <Text style={styles.payNowText}>Pay Now</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
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
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    color: '#2C3E50',
    marginBottom: 4,
    lineHeight: 22,
  },
  notificationTime: {
    fontSize: 12,
    color: '#95A5A6',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
    marginTop: 4,
  },
  bookingDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F1F2F6',
    paddingTop: 12,
  },
  bookingInfo: {
    marginBottom: 12,
  },
  bookingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 4,
  },
  bookingAddress: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 4,
  },
  bookingRate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27AE60',
  },
  payNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  payNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default BookingNotificationCard;

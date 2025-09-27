// components/UnifiedNotificationCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UnifiedNotification } from '../../services/unifiedNotificationService';

interface UnifiedNotificationCardProps {
  notification: UnifiedNotification;
  onMarkAsRead?: (notificationId: string) => void;
  onPayNow?: (bookingId: string) => void;
  onViewCaregiver?: (caregiver: any) => void;
}

const UnifiedNotificationCard: React.FC<UnifiedNotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onPayNow,
  onViewCaregiver,
}) => {
  const isBookingNotification = 'booking' in notification;
  const isInterestNotification = 'caregiver' in notification;

  const handlePress = () => {
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }

    if (isInterestNotification && onViewCaregiver) {
      onViewCaregiver(notification.caregiver);
    }
  };

  const getNotificationIcon = () => {
    if (isBookingNotification) {
      switch (notification.type) {
        case 'booking_accepted':
          return 'checkmark-circle';
        case 'booking_rejected':
          return 'close-circle';
        case 'payment_completed':
          return 'card';
        default:
          return 'calendar';
      }
    } else if (isInterestNotification) {
      return 'heart';
    }
    return 'notifications';
  };

  const getNotificationColor = () => {
    if (isBookingNotification) {
      switch (notification.type) {
        case 'booking_accepted':
          return '#28a745';
        case 'booking_rejected':
          return '#dc3545';
        case 'payment_completed':
          return '#17a2b8';
        default:
          return '#007bff';
      }
    } else if (isInterestNotification) {
      return '#e91e63';
    }
    return '#6c757d';
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

  return (
    <TouchableOpacity
      style={[
        styles.card,
        !notification.isRead && styles.unreadCard
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: getNotificationColor() + '20' }]}>
            <Ionicons 
              name={getNotificationIcon()} 
              size={24} 
              color={getNotificationColor()} 
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.message}>{notification.message}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(notification.timestamp)}</Text>
          </View>
          {!notification.isRead && <View style={styles.unreadDot} />}
        </View>

        {/* Booking-specific content */}
        {isBookingNotification && notification.booking && (
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

            {notification.type === 'booking_accepted' && onPayNow && (
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => onPayNow(notification.booking!.id)}
              >
                <Ionicons name="card" size={20} color="#FFFFFF" />
                <Text style={styles.payButtonText}>Pay Now</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Interest-specific content */}
        {isInterestNotification && (
          <View style={styles.interestDetails}>
            <View style={styles.caregiverInfo}>
              <Text style={styles.caregiverName}>{notification.caregiver.name}</Text>
              <Text style={styles.caregiverSpecialization}>{notification.caregiver.specialization}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#ffc107" />
                <Text style={styles.rating}>{notification.caregiver.rating}</Text>
                <Text style={styles.rate}>${notification.caregiver.rate}/hr</Text>
              </View>
            </View>
            {notification.post && (
              <View style={styles.postInfo}>
                <Text style={styles.postTitle}>{notification.post.title}</Text>
                <Text style={styles.postDescription}>{notification.post.description}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
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
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  content: {
    padding: 16,
  },
  header: {
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
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007bff',
    marginLeft: 8,
  },
  bookingDetails: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  bookingInfo: {
    marginBottom: 8,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
  bookingDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookingAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookingRate: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
    marginBottom: 8,
  },
  payButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  interestDetails: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  caregiverInfo: {
    marginBottom: 8,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  caregiverSpecialization: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
    marginRight: 8,
  },
  rate: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  postInfo: {
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    paddingTop: 8,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  postDescription: {
    fontSize: 12,
    color: '#666',
  },
});

export default UnifiedNotificationCard;

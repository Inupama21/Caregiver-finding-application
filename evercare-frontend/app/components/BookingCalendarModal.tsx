import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { bookingService, Booking } from "../../services/bookingService";

interface BookingCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  caregiverId: number;
}

const { width: screenWidth } = Dimensions.get("window");

const BookingCalendarModal: React.FC<BookingCalendarModalProps> = ({
  visible,
  onClose,
  caregiverId,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (visible) {
      fetchBookings();
    }
  }, [visible, caregiverId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const caregiverBookings = await bookingService.getCaregiverBookings(
        caregiverId
      );
      setBookings(caregiverBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Load Bookings",
        text2: "Unable to fetch your bookings. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    bookingId: number,
    status: "accepted" | "rejected"
  ) => {
    try {
      console.log('=== BookingCalendarModal Debug ===');
      console.log('Updating booking status:', { bookingId, status, caregiverId });
      
      //  update via API 
      await bookingService.updateBookingStatus(bookingId, status);
      Toast.show({
        type: "success",
        text1: "Booking Updated",
        text2: `Booking ${status} successfully!`,
      });
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking status:", error);
      // Update dummy data 
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.bookingId === bookingId
            ? { ...booking, status, updatedAt: new Date().toISOString() }
            : booking
        )
      );
      Toast.show({
        type: "success",
        text1: "Booking Updated",
        text2: `Booking ${status} successfully! (Demo mode)`,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#F59E0B";
      case "accepted":
        return "#10B981";
      case "rejected":
        return "#EF4444";
      case "completed":
        return "#6366F1";
      case "cancelled":
        return "#6B7280";
      default:
        return "#94A3B8";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "time-outline";
      case "accepted":
        return "checkmark-circle-outline";
      case "rejected":
        return "close-circle-outline";
      case "completed":
        return "trophy-outline";
      case "cancelled":
        return "ban-outline";
      default:
        return "help-circle-outline";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysDifference = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderBookingCard = (booking: Booking) => (
    <TouchableOpacity
      key={booking.bookingId}
      style={[
        styles.bookingCard,
        { borderLeftColor: getStatusColor(booking.status) },
      ]}
      onPress={() => setSelectedBooking(booking)}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.patientName}>{booking.name}</Text>
          <Text style={styles.bookingDate}>
            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
          </Text>
          <Text style={styles.bookingDuration}>
            {getDaysDifference(booking.startDate, booking.endDate)} days
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(booking.status) },
          ]}
        >
          <Ionicons
            name={getStatusIcon(booking.status) as any}
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.statusText}>{booking.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <Text style={styles.address}>📍 {booking.address}</Text>
        <Text style={styles.phone}>📞 {booking.phone}</Text>
        <Text style={styles.rate}>💰 {booking.caregiverRate}</Text>
      </View>

      {booking.status === "pending" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.acceptBtn]}
            onPress={() => handleStatusUpdate(booking.bookingId, "accepted")}
          >
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => handleStatusUpdate(booking.bookingId, "rejected")}
          >
            <Ionicons name="close" size={16} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderBookingDetail = () => {
    if (!selectedBooking) return null;

    return (
      <Modal
        visible={!!selectedBooking}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedBooking(null)}
      >
        <View style={styles.detailModalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Booking Details</Text>
              <TouchableOpacity onPress={() => setSelectedBooking(null)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailScrollView}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Patient Information</Text>
                <Text style={styles.detailValue}>{selectedBooking.name}</Text>
                <Text style={styles.detailSubValue}>
                  {selectedBooking.phone}
                </Text>
                <Text style={styles.detailSubValue}>
                  {selectedBooking.address}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Service Period</Text>
                <Text style={styles.detailValue}>
                  {formatDate(selectedBooking.startDate)} -{" "}
                  {formatDate(selectedBooking.endDate)}
                </Text>
                <Text style={styles.detailSubValue}>
                  Duration:{" "}
                  {getDaysDifference(
                    selectedBooking.startDate,
                    selectedBooking.endDate
                  )}{" "}
                  days
                </Text>
                <Text style={styles.detailSubValue}>
                  Expected Schedule: {selectedBooking.expectedDays}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Patient Description</Text>
                <Text style={styles.detailValue}>
                  {selectedBooking.patientDescription}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Payment Information</Text>
                <Text style={styles.detailValue}>
                  Method: {selectedBooking.paymentMethod}
                </Text>
                <Text style={styles.detailValue}>
                  Rate: {selectedBooking.caregiverRate}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Status</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(selectedBooking.status) },
                  ]}
                >
                  <Ionicons
                    name={getStatusIcon(selectedBooking.status) as any}
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.statusText}>
                    {selectedBooking.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {selectedBooking.status === "pending" && (
                <View style={styles.detailActionButtons}>
                  <TouchableOpacity
                    style={[styles.detailActionBtn, styles.acceptBtn]}
                    onPress={() => {
                      handleStatusUpdate(selectedBooking.bookingId, "accepted");
                      setSelectedBooking(null);
                    }}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.detailActionBtnText}>
                      Accept Booking
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.detailActionBtn, styles.rejectBtn]}
                    onPress={() => {
                      handleStatusUpdate(selectedBooking.bookingId, "rejected");
                      setSelectedBooking(null);
                    }}
                  >
                    <Ionicons name="close" size={20} color="#FFFFFF" />
                    <Text style={styles.detailActionBtnText}>
                      Reject Booking
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const groupBookingsByStatus = () => {
    const grouped: { [key: string]: Booking[] } = {};
    bookings.forEach((booking) => {
      if (!grouped[booking.status]) {
        grouped[booking.status] = [];
      }
      grouped[booking.status].push(booking);
    });
    return grouped;
  };

  const groupedBookings = groupBookingsByStatus();

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>My Bookings</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text style={styles.loadingText}>Loading bookings...</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
              >
                {bookings.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons
                      name="calendar-outline"
                      size={64}
                      color="#94A3B8"
                    />
                    <Text style={styles.emptyTitle}>No Bookings Yet</Text>
                    <Text style={styles.emptySubtitle}>
                      When patients book your services, they'll appear here.
                    </Text>
                  </View>
                ) : (
                  <>
                    {Object.entries(groupedBookings).map(
                      ([status, statusBookings]) => (
                        <View key={status} style={styles.statusSection}>
                          <Text style={styles.statusSectionTitle}>
                            {status.charAt(0).toUpperCase() + status.slice(1)} (
                            {statusBookings.length})
                          </Text>
                          {statusBookings.map(renderBookingCard)}
                        </View>
                      )
                    )}
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      {renderBookingDetail()}
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "85%",
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748B",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
  statusSection: {
    marginBottom: 24,
  },
  statusSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 12,
    marginTop: 8,
  },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
    marginRight: 12,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
  },
  bookingDuration: {
    fontSize: 12,
    color: "#94A3B8",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bookingDetails: {
    marginBottom: 12,
  },
  address: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  rate: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  acceptBtn: {
    backgroundColor: "#10B981",
  },
  rejectBtn: {
    backgroundColor: "#EF4444",
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  detailModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: screenWidth - 32,
    maxHeight: "80%",
    paddingTop: 20,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  detailScrollView: {
    paddingHorizontal: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 16,
    color: "#1E293B",
    marginBottom: 4,
  },
  detailSubValue: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
  },
  detailActionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  detailActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  detailActionBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default BookingCalendarModal;

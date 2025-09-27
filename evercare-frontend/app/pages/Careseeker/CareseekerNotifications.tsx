import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  RefreshControl,
  Alert,
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import BottomNavBar from "@/app/components/careseekerbottomNavBar";
import { useCurrentUser } from "../../hooks/useCurrentUser";

interface Caregiver {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  rate: number;
  location: string;
  description: string;
  skills: string[];
  availability: string;
}

interface Post {
  id: string;
  title: string;
  patientAge: number;
  careType: string;
  description: string;
  budget: number;
  location: string;
  timePosted: string;
}

interface Notification {
  id: string;
  type: "interest" | "location" | "message";
  caregiver: Caregiver;
  post: Post;
  timestamp: string;
  isRead: boolean;
  message: string;
}

interface NotificationFeedProps {
  navigation?: any;
}

const router = useRouter();

const NotificationFeed: React.FC<NotificationFeedProps> = ({ navigation }) => {
  const { getUserId, loading: userLoading } = useCurrentUser();
  // Dummy notifications data for testing
  const dummyNotifications: Notification[] = [
    {
      id: "1",
      type: "interest",
      caregiver: {
        id: "cg1",
        name: "Anne Smith",
        specialization: "Elderly Care Specialist",
        experience: "5+ years experience",
        rating: 4.8,
        rate: 1200,
        location: "Colombo 03",
        description:
          "Experienced caregiver specializing in elderly care with dementia patients. I have worked with families for over 5 years and understand the importance of patience, compassion, and professional care.",
        skills: [
          "Dementia Care",
          "Medication Management",
          "Physical Therapy",
          "Companionship",
          "Emergency Response",
        ],
        availability: "Full-time, Flexible hours",
      },
      post: {
        id: "p1",
        title: "Elderly Care for Mother with Dementia",
        patientAge: 78,
        careType: "Elderly Care",
        description:
          "Looking for a compassionate caregiver for my elderly mother who has mild dementia. She needs assistance with daily activities.",
        budget: 35000,
        location: "Colombo 03",
        timePosted: "2 hours ago",
      },
      timestamp: "5 minutes ago",
      isRead: false,
      message: "Anne Smith is interested in your elderly care post",
    },
    {
      id: "2",
      type: "interest",
      caregiver: {
        id: "cg2",
        name: "Michael Fernando",
        specialization: "Stroke Recovery Specialist",
        experience: "8+ years experience",
        rating: 4.9,
        rate: 1500,
        location: "Kandy",
        description:
          "Certified physiotherapist and caregiver with extensive experience in stroke recovery and rehabilitation. I focus on helping patients regain independence through structured therapy.",
        skills: [
          "Stroke Recovery",
          "Physical Therapy",
          "Speech Therapy",
          "Mobility Training",
          "Medical Care",
        ],
        availability: "Part-time, Weekdays",
      },
      post: {
        id: "p2",
        title: "Post-Stroke Care and Rehabilitation",
        patientAge: 65,
        careType: "Medical Care",
        description:
          "Need skilled caregiver for stroke recovery support including physical therapy and mobility assistance.",
        budget: 45000,
        location: "Kandy",
        timePosted: "4 hours ago",
      },
      timestamp: "1 hour ago",
      isRead: false,
      message: "Michael Fernando is interested in your medical care post",
    },
    {
      id: "3",
      type: "interest",
      caregiver: {
        id: "cg3",
        name: "Priya Wickramasinghe",
        specialization: "Night Care Specialist",
        experience: "4+ years experience",
        rating: 4.7,
        rate: 1100,
        location: "Galle",
        description:
          "Professional night care specialist with experience in monitoring elderly patients during overnight hours. Trained in emergency response and medication administration.",
        skills: [
          "Night Care",
          "Patient Monitoring",
          "Medication Administration",
          "Emergency Response",
          "Sleep Disorders",
        ],
        availability: "Night shifts only",
      },
      post: {
        id: "p3",
        title: "Overnight Care for Grandfather",
        patientAge: 82,
        careType: "Overnight Care",
        description:
          "Seeking reliable overnight caregiver for monitoring and assistance during night hours.",
        budget: 28000,
        location: "Galle",
        timePosted: "6 hours ago",
      },
      timestamp: "3 hours ago",
      isRead: true,
      message: "Priya Wickramasinghe is interested in your overnight care post",
    },
    {
      id: "4",
      type: "interest",
      caregiver: {
        id: "cg4",
        name: "Ravi Perera",
        specialization: "Diabetes Care Specialist",
        experience: "6+ years experience",
        rating: 4.6,
        rate: 900,
        location: "Negombo",
        description:
          "Certified diabetes educator and caregiver with expertise in blood sugar monitoring, meal planning, and medication management for diabetic patients.",
        skills: [
          "Diabetes Management",
          "Blood Sugar Monitoring",
          "Meal Planning",
          "Medication Management",
          "Health Education",
        ],
        availability: "Part-time, Flexible",
      },
      post: {
        id: "p4",
        title: "Diabetes Care and Management",
        patientAge: 65,
        careType: "Medical Care",
        description:
          "Looking for caregiver experienced in diabetes management including monitoring and meal planning.",
        budget: 25000,
        location: "Negombo",
        timePosted: "8 hours ago",
      },
      timestamp: "5 hours ago",
      isRead: true,
      message: "Ravi Perera is interested in your diabetes care post",
    },
    {
      id: "5",
      type: "interest",
      caregiver: {
        id: "cg5",
        name: "Chamari Silva",
        specialization: "Companionship Care",
        experience: "3+ years experience",
        rating: 4.5,
        rate: 800,
        location: "Colombo 07",
        description:
          "Caring companion specializing in social interaction and emotional support for elderly patients. Fluent in Sinhala, Tamil, and English.",
        skills: [
          "Companionship",
          "Social Activities",
          "Light Housekeeping",
          "Emotional Support",
          "Multilingual",
        ],
        availability: "Part-time, Daytime",
      },
      post: {
        id: "p5",
        title: "Companion Care for Mother",
        patientAge: 72,
        careType: "Companionship",
        description:
          "Need caring companion for social interaction and light assistance for independent elderly mother.",
        budget: 20000,
        location: "Colombo 07",
        timePosted: "12 hours ago",
      },
      timestamp: "8 hours ago",
      isRead: true,
      message: "Chamari Silva is interested in your companionship post",
    },
    {
      id: "6",
      type: "interest",
      caregiver: {
        id: "cg6",
        name: "Sunil Rajapaksa",
        specialization: "Post-Surgery Care",
        experience: "7+ years experience",
        rating: 4.8,
        rate: 1300,
        location: "Matara",
        description:
          "Experienced in post-operative care with specialization in orthopedic recovery. Trained in wound care, mobility assistance, and pain management.",
        skills: [
          "Post-Surgery Care",
          "Wound Care",
          "Mobility Assistance",
          "Pain Management",
          "Physical Therapy",
        ],
        availability: "Temporary assignments",
      },
      post: {
        id: "p6",
        title: "Post-Surgery Hip Replacement Care",
        patientAge: 55,
        careType: "Post-Surgery Care",
        description:
          "Urgent need for experienced caregiver for post hip replacement surgery care and recovery.",
        budget: 40000,
        location: "Matara",
        timePosted: "1 day ago",
      },
      timestamp: "1 day ago",
      isRead: true,
      message: "Sunil Rajapaksa is interested in your post-surgery care post",
    },
  ];

  const [notifications, setNotifications] =
    useState<Notification[]>(dummyNotifications);
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(
    null
  );
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCaregiverModal, setShowCaregiverModal] = useState<boolean>(false);
  const [showPostModal, setShowPostModal] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchNotifications = async () => {
    try {
      const careseekerId = getUserId();
      if (!careseekerId) {
        console.error('No user ID available for fetching notifications');
        Alert.alert("Error", "Please login to view notifications");
        return;
      }
      
      const response = await axios.get(
        `http://192.168.176.11:5003/notifications/careseeker/${careseekerId}`
      );
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      Alert.alert("Error", "Failed to load notifications");
      // Fall back to dummy data if API fails
      setNotifications(dummyNotifications);
    }
  };

  useEffect(() => {
    if (!userLoading) {
      fetchNotifications();
    }
  }, [userLoading]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications().finally(() => setRefreshing(false));
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const viewCaregiverProfile = (
    caregiver: Caregiver,
    notificationId: string
  ) => {
    setSelectedCaregiver(caregiver);
    setShowCaregiverModal(true);
    markAsRead(notificationId);
  };

  const viewPost = (post: Post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleContactCaregiver = (caregiver: Caregiver) => {
    Alert.alert(
      "Contact Caregiver",
      `Would you like to send a message to ${caregiver.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Message",
          onPress: () => {
            setShowCaregiverModal(false);
            // Commented out real API call for now
            // In real implementation, this would send a message via your chat system
            Alert.alert("Success", "Message sent successfully!");
          },
        },
      ]
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Text key={i} style={styles.starFilled}>
          ★
        </Text>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Text key="half" style={styles.starHalf}>
          ★
        </Text>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Text key={`empty-${i}`} style={styles.starEmpty}>
          ☆
        </Text>
      );
    }

    return stars;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "interest":
        return "👤";
      case "location":
        return "📍";
      case "message":
        return "💬";
      default:
        return "🔔";
    }
  };

  const renderNotification = (notification: Notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationCard,
        !notification.isRead && styles.unreadNotification,
      ]}
      activeOpacity={0.8}
      onPress={() => {
        if (notification.type === "interest") {
          viewCaregiverProfile(notification.caregiver, notification.id);
        }
      }}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.notificationIcon}>
              {getNotificationIcon(notification.type)}
            </Text>
          </View>
          <View style={styles.notificationInfo}>
            <Text style={styles.notificationMessage}>
              {notification.message}
            </Text>
            <Text style={styles.notificationTime}>
              {notification.timestamp}
            </Text>
          </View>
          {!notification.isRead && <View style={styles.unreadDot} />}
        </View>

        {notification.type === "interest" && (
          <View style={styles.caregiverPreview}>
            <View style={styles.caregiverInfo}>
              <View style={styles.caregiverAvatar}>
                <Text style={styles.avatarText}>
                  {notification.caregiver.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.caregiverDetails}>
                <Text style={styles.caregiverName}>
                  {notification.caregiver.name}
                </Text>
                <Text style={styles.caregiverSpec}>
                  {notification.caregiver.specialization}
                </Text>
                <View style={styles.ratingContainer}>
                  {renderStars(notification.caregiver.rating)}
                  <Text style={styles.ratingText}>
                    {notification.caregiver.rating}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewPostButton}
              onPress={() => viewPost(notification.post)}
            >
              <Text style={styles.viewPostText}>View Post</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Text style={styles.headerSubtitle}>Stay updated with your posts</Text>
      </View>

      <ScrollView
        style={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.notificationsContainer}>
          {notifications.length > 0 ? (
            notifications.map((notification) =>
              renderNotification(notification)
            )
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyMessage}>
                When caregivers show interest in your posts, you'll see them
                here!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Caregiver Profile Modal */}
      <Modal
        visible={showCaregiverModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCaregiverModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedCaregiver && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Caregiver Profile</Text>
                  <TouchableOpacity
                    onPress={() => setShowCaregiverModal(false)}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                  <View style={styles.profileHeader}>
                    <View style={styles.profileAvatar}>
                      <Text style={styles.profileAvatarText}>
                        {selectedCaregiver.name.charAt(0)}
                      </Text>
                    </View>
                    <Text style={styles.profileName}>
                      {selectedCaregiver.name}
                    </Text>
                    <Text style={styles.profileSpec}>
                      {selectedCaregiver.specialization}
                    </Text>
                    <View style={styles.profileRating}>
                      {renderStars(selectedCaregiver.rating)}
                      <Text style={styles.profileRatingText}>
                        {selectedCaregiver.rating} (
                        {selectedCaregiver.experience})
                      </Text>
                    </View>
                  </View>

                  <View style={styles.profileDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Rate:</Text>
                      <Text style={styles.detailValue}>
                        LKR {selectedCaregiver.rate}/hr
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Availability:</Text>
                      <Text style={styles.detailValue}>
                        {selectedCaregiver.availability}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.profileSection}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.sectionContent}>
                      {selectedCaregiver.description}
                    </Text>
                  </View>

                  <View style={styles.profileSection}>
                    <Text style={styles.sectionTitle}>Skills</Text>
                    <View style={styles.skillsContainer}>
                      {selectedCaregiver.skills.map((skill, index) => (
                        <View key={index} style={styles.skillTag}>
                          <Text style={styles.skillText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => handleContactCaregiver(selectedCaregiver)}
                >
                  <Text style={styles.contactButtonText}>
                    Contact Caregiver
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Post Details Modal */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPostModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedPost && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Your Post</Text>
                  <TouchableOpacity
                    onPress={() => setShowPostModal(false)}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                  <View style={styles.postDetails}>
                    <Text style={styles.postTitle}>{selectedPost.title}</Text>

                    <View style={styles.postInfo}>
                      <View style={styles.postInfoRow}>
                        <Text style={styles.postLabel}>Patient Age:</Text>
                        <Text style={styles.postValue}>
                          {selectedPost.patientAge} years
                        </Text>
                      </View>
                      <View style={styles.postInfoRow}>
                        <Text style={styles.postLabel}>Care Type:</Text>
                        <Text style={styles.postValue}>
                          {selectedPost.careType}
                        </Text>
                      </View>
                      <View style={styles.postInfoRow}>
                        <Text style={styles.postLabel}>Budget:</Text>
                        <Text style={styles.postBudget}>
                          LKR {selectedPost.budget.toLocaleString()}/month
                        </Text>
                      </View>
                      <View style={styles.postInfoRow}>
                        <Text style={styles.postLabel}>Location:</Text>
                        <Text style={styles.postValue}>
                          📍 {selectedPost.location}
                        </Text>
                      </View>
                      <View style={styles.postInfoRow}>
                        <Text style={styles.postLabel}>Posted:</Text>
                        <Text style={styles.postValue}>
                          {selectedPost.timePosted}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.postDescription}>
                      <Text style={styles.sectionTitle}>Description</Text>
                      <Text style={styles.sectionContent}>
                        {selectedPost.description}
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab="notifications" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#E8F4FD",
    textAlign: "center",
    marginTop: 4,
  },
  feedContainer: {
    flex: 1,
  },
  notificationsContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    lineHeight: 24,
  },
  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
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
    borderLeftColor: "#4A90E2",
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F2F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: "#95A5A6",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4A90E2",
  },
  caregiverPreview: {
    borderTopWidth: 1,
    borderTopColor: "#F1F2F6",
    paddingTop: 12,
  },
  caregiverInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  caregiverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  caregiverDetails: {
    flex: 1,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 2,
  },
  caregiverSpec: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starFilled: {
    fontSize: 14,
    color: "#FFD700",
  },
  starHalf: {
    fontSize: 14,
    color: "#FFD700",
    opacity: 0.5,
  },
  starEmpty: {
    fontSize: 14,
    color: "#E0E0E0",
  },
  ratingText: {
    fontSize: 12,
    color: "#7F8C8D",
    marginLeft: 4,
  },
  viewPostButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#E8F4FD",
    borderRadius: 20,
  },
  viewPostText: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F2F6",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F1F2F6",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#7F8C8D",
    fontWeight: "bold",
  },
  modalContent: {
    padding: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  profileAvatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  profileSpec: {
    fontSize: 16,
    color: "#7F8C8D",
    marginBottom: 8,
  },
  profileRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileRatingText: {
    fontSize: 14,
    color: "#7F8C8D",
    marginLeft: 8,
  },
  profileDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F2F6",
  },
  detailLabel: {
    fontSize: 16,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "600",
  },
  profileSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    color: "#2C3E50",
    lineHeight: 24,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillTag: {
    backgroundColor: "#E8F4FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "500",
  },
  contactButton: {
    backgroundColor: "#4A90E2",
    margin: 20,
    marginTop: 0,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  postDetails: {
    flex: 1,
  },
  postTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 16,
    textAlign: "center",
  },
  postInfo: {
    marginBottom: 20,
  },
  postInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F2F6",
  },
  postLabel: {
    fontSize: 16,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  postValue: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "600",
  },
  postBudget: {
    fontSize: 16,
    color: "#27AE60",
    fontWeight: "700",
  },
  postDescription: {
    marginTop: 10,
  },
  bottomNavigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#E1E8ED",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navIconActive: {
    fontSize: 20,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: "#A0A0A0",
    marginTop: 4,
    fontWeight: "500",
  },
});

export default NotificationFeed;

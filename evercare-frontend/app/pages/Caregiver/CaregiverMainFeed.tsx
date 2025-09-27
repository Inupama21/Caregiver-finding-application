import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Modal } from "react-native";
import BottomNavBar from "../../components/caregiverBottomNavbar";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import Toast from "react-native-toast-message";

interface Post {
  id: string;
  careseekerId?: number;
  careseeker: {
    name: string;
    profileImage?: string;
    location: string;
  };
  patientAge: number;
  description: string;
  timePosted: string;
  urgency: "low" | "medium" | "high";
  careType: string;
  duration?: string;
  isAvailable: boolean;
}

type BackendPost = {
  postId: string;
  careseekerId?: number;
  caregiverName: string;
  age: number;
  careType: string;
  duration?: string;
  district?: string;
  urgency: "low" | "medium" | "high";
  description: string;
  createdAt: string;
  updatedAt: string;
};
interface CaregiverFeedProps {
  navigation?: any;
}

const router = useRouter();

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const postDate = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
};

const CaregiverMainFeed: React.FC<CaregiverFeedProps> = ({ navigation }) => {
  const { getUserId, loading: userLoading } = useCurrentUser();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Commented out real API call for now
  // const fetchPosts = async () => {
  //   try {
  //     const response = await axios.get("http://localhost:5003/jobposting");
  //     // Map backend data to frontend structure
  //     const mappedPosts = (response.data as BackendPost[]).map((post) => ({
  //       id: post.postId,
  //       careseekerId: post.careseekerId,
  //       careseeker: {
  //         name: post.caregiverName || "Unknown",
  //         location: post.district || "Unknown",
  //         // profileImage: undefined, // You can add this if you have it
  //       },
  //       patientAge: post.age,
  //       description: post.description,
  //       timePosted: "Just now", // You can update this if you have a timestamp
  //       urgency: post.urgency,
  //       careType: post.careType,
  //       duration: post.duration,
  //       isAvailable: true,
  //     }));
  //     setPosts(mappedPosts);
  //   } catch (error) {
  //     console.error("Failed to fetch posts:", error);
  //   }
  // };

  const fetchPosts = async () => {
    try {
      const response = await axios.get("http://192.168.176.11:5003/jobposting");
      console.log("Raw API response:", response.data);
      
      // Map backend data to frontend structure
      const mappedPosts = (response.data as BackendPost[]).map((post) => {
        console.log("Mapping post:", post);
        return {
          id: post.postId,
          careseekerId: post.careseekerId,
          careseeker: {
            name: post.caregiverName || "Unknown",
            location: post.district || "Unknown",
            // profileImage: undefined, // You can add this if you have it
          },
          patientAge: post.age,
          description: post.description,
          timePosted: formatTimeAgo(post.createdAt),
          urgency: post.urgency,
          careType: post.careType,
          duration: post.duration,
          isAvailable: true,
        };
      });
      console.log("Mapped posts:", mappedPosts);
      setPosts(mappedPosts);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts().finally(() => setRefreshing(false));
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "#E74C3C";
      case "medium":
        return "#F39C12";
      case "low":
        return "#27AE60";
      default:
        return "#95A5A6";
    }
  };

  const handleAvailablePress = (postId: string) => {
    setSelectedPostId(postId);
    setIsModalVisible(true);
  };

  const handleConfirmAvailability = async () => {
    try {
      const selectedPost = posts.find((post) => post.id === selectedPostId);
      if (!selectedPost) {
        Alert.alert("Error", "Post not found");
        return;
      }

      const caregiverId = getUserId();
      if (!caregiverId) {
        Alert.alert("Error", "Please login to send notifications");
        return;
      }
      
      await axios.post("http://192.168.176.11:5003/notifications", {
        postId: selectedPostId,
        caregiverId: caregiverId,
        careseekerId: selectedPost.careseekerId,
      });

      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Your profile has been saved.",
      });
      setIsModalVisible(false);

      // Update the post to show as applied (optional visual feedback)
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === selectedPostId ? { ...post, isAvailable: false } : post
        )
      );
    } catch (error) {
      Alert.alert("Error", "Could not send notification");
      console.error(error);
    }
  };

  const renderPost = (post: Post) => (
    <View key={post.id} style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity 
          style={styles.profileSection}
          onPress={() => {
            console.log("Clicked on profile for careseekerId:", post.careseekerId);
            if (post.careseekerId) {
              router.push({
                pathname: "/pages/Caregiver/CareseekerProfileView",
                params: { careseekerId: post.careseekerId.toString() }
              });
            } else {
              console.log("No careseekerId found for this post");
            }
          }}
        >
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {post.careseeker.name.charAt(0)}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{post.careseeker.name}</Text>
            <Text style={styles.location}>📍 {post.careseeker.location}</Text>
            <Text style={styles.timePosted}>{post.timePosted}</Text>
          </View>
        </TouchableOpacity>
        <View
          style={[
            styles.urgencyBadge,
            { backgroundColor: getUrgencyColor(post.urgency) },
          ]}
        >
          <Text style={styles.urgencyText}>{post.urgency.toUpperCase()}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.postContent}>
        <View style={styles.patientInfo}>
          <Text style={styles.infoLabel}>Patient Age: </Text>
          <Text style={styles.infoValue}>{post.patientAge} years</Text>
        </View>

        <View style={styles.patientInfo}>
          <Text style={styles.infoLabel}>Care Type: </Text>
          <Text style={styles.infoValue}>{post.careType}</Text>
        </View>

        {post.duration && (
          <View style={styles.patientInfo}>
            <Text style={styles.infoLabel}>Duration: </Text>
            <Text style={styles.infoValue}>{post.duration}</Text>
          </View>
        )}

        <Text style={styles.description}>{post.description}</Text>
      </View>

      {/* Action Button */}
      {post.isAvailable ? (
        <TouchableOpacity
          style={styles.availableButton}
          onPress={() => handleAvailablePress(post.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.availableButtonText}>I'm Available</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.appliedButton}>
          <Text style={styles.appliedButtonText}>Applied ✓</Text>
        </View>
      )}
    </View>
  );

  return (
    <>
      {/* modal for confirm availability */}
      <Modal
        transparent
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Availability</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to apply this job?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#4A90E2" }]}
                onPress={handleConfirmAvailability}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                  Yes, I'm Available
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Care Opportunities</Text>
          <Text style={styles.headerSubtitle}>
            Find your next caregiving role
          </Text>
        </View>

        <ScrollView
          style={styles.feedContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.postsContainer}>
            {posts.map((post) => renderPost(post))}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        {/* <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconActive}>🏠</Text>
          <Text style={[styles.navText, { color: "#4A90E2" }]}>Feed</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>💬</Text>
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navText}>Stats</Text>
        </TouchableOpacity>
      </View> */}
        <View style={styles.bottomNavigation}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/pages/Caregiver/CaregiverMainFeed")}
          >
            <Icon name="home" size={24} color="#4A90E2" />
            <Text style={[styles.navText, { color: "#4A90E2" }]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/pages/Caregiver/CaregiverProfile")}
          >
            <Icon name="user" size={24} color="#A0A0A0" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/pages/ChatFunction/ChatMessageScreen")}
          >
            <Icon name="message" size={24} color="#A0A0A0" />
            <Text style={styles.navText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push("/pages/Caregiver/CaregiverNotifications")}
          >
            <Icon name="notifications" size={24} color="#A0A0A0" />
            <Text style={styles.navText}>Notifications</Text>
          </TouchableOpacity>
        </View>
        <BottomNavBar activeTab="home" />
      </SafeAreaView>
    </>
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
  postsContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F2F6",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 2,
  },
  timePosted: {
    fontSize: 12,
    color: "#95A5A6",
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  postContent: {
    padding: 16,
  },
  patientInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#2C3E50",
    fontWeight: "600",
  },
  budgetValue: {
    fontSize: 14,
    color: "#27AE60",
    fontWeight: "700",
  },
  description: {
    fontSize: 15,
    color: "#2C3E50",
    lineHeight: 22,
    marginTop: 12,
  },
  availableButton: {
    backgroundColor: "#4A90E2",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  availableButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  appliedButton: {
    backgroundColor: "#27AE60",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  appliedButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  modalCard: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#2C3E50",
  },

  modalMessage: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CaregiverMainFeed;

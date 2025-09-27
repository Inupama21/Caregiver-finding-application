import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { useSafeAreaHeader } from "../../../utils/safeAreaUtils";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { chatService } from "../../../services/chatService";

// Import shared components
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileStats from "../../components/profile/ProfileStats";
import PostCard from "../../components/profile/PostCard";
import ActionButtons from "../../components/profile/ActionButtons";
import ReviewsList from "../../components/reviews/ReviewsList";

// Import services
import {
  caregiverService,
  CaregiverPost,
} from "../../../services/caregiverService";

const CaregiverProfileView = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { headerPadding } = useSafeAreaHeader();

  console.log("=== CaregiverProfileView Debug ===");
  console.log("All params received:", params);
  console.log("caregiverId param:", params.caregiverId);
  console.log("caregiverData param:", params.caregiverData);

  // Get the passed caregiver data
  const [caregiverData, setCaregiverData] = useState(() => {
    if (params.caregiverData) {
      try {
        const passedData = JSON.parse(params.caregiverData as string);
        return {
          name: passedData.name || "Unknown Caregiver",
          specialty: passedData.specialization || "General Care",
          experience: passedData.experience || "Experienced professional",
          bio:
            passedData.bio ||
            "Professional caregiver dedicated to providing quality care.",
          profileImage: passedData.image || null,
          rating: passedData.rating || 4.5,
          reviews: passedData.reviews || 0,
          clients: passedData.clients || 0,
          completedJobs: passedData.completedJobs || 0,
          hourlyRate: `${passedData.currency || "LKR"} ${
            passedData.rate || 1000
          }/hr`,
          availability: "Available",
          location: "Sri Lanka",
        };
      } catch (error) {
        console.error("Error parsing caregiver data:", error);
      }
    }

    // Fallback to dummy data if no data passed
    return {
      name: "Anne Smith",
      specialty: "Child care",
      experience: "5+ years experience",
      bio: "Certified Level 3 Caregiver specializing in child care and companionship. I love working with children and helping families.",
      profileImage: null,
      rating: 4.9,
      reviews: 0,
      clients: 0,
      completedJobs: 0,
      hourlyRate: "$25/hr",
      availability: "Available",
      location: "New York, NY",
    };
  });

  const [posts, setPosts] = useState<CaregiverPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [activeTab, setActiveTab] = useState("about");
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  // Tab definitions
  const tabs = [
    { id: "about", label: "About" },
    { id: "reviews", label: "Reviews" },
    { id: "posts", label: "Posts" },
  ];

  // Function to fetch updated caregiver data
  const fetchUpdatedCaregiverData = async () => {
    // Prevent multiple simultaneous refreshes
    if (refreshing) {
      return;
    }
    
    // Debounce: prevent refreshes more frequent than every 2 seconds
    const now = Date.now();
    if (now - lastRefreshTime < 2000) {
      return;
    }
    
    try {
      setRefreshing(true);
      setLastRefreshTime(now);
      const caregiverId = Number(params.caregiverId);
      
      // Fetch updated caregiver data from the backend
      const updatedData = await caregiverService.getProfile(caregiverId);
      
      if (updatedData) {
        setCaregiverData(prevData => ({
          ...prevData,
          reviews: updatedData.reviewsCount || prevData.reviews,
          clients: updatedData.clientsCount || prevData.clients,
          completedJobs: updatedData.completedJobs || prevData.completedJobs,
          rating: updatedData.averageRating || prevData.rating,
        }));
      }
    } catch (error) {
      console.error('Error fetching updated caregiver data:', error);
    } finally {
      setRefreshing(false);
    }
  };

 
  useEffect(() => {
    

    if (params.showReviews === 'true') {
      setShowReviews(true);
      setActiveTab('reviews'); // Switch to reviews tab when coming from review submission
    }
    
    if (params.reviewSubmitted === 'true' || params.paymentCompleted === 'true') {
      // Fetch updated data when coming from review submission or payment completion
      fetchUpdatedCaregiverData();
    }
    
    if (params.refreshReviews) {
      setRefreshReviews(Number(params.refreshReviews));
    }
  }, [params.showReviews, params.refreshReviews, params.reviewSubmitted, params.paymentCompleted]);

  // Fetch posts for the specific caregiver
  useEffect(() => {
    const fetchCaregiverPosts = async () => {
      if (params.caregiverId) {
        try {
          setLoadingPosts(true);
          console.log(`Fetching posts for caregiver ID: ${params.caregiverId}`);
          const caregiverPosts = await caregiverService.getCaregiverPosts(
            Number(params.caregiverId)
          );
          console.log("Fetched posts:", caregiverPosts);
          setPosts(caregiverPosts);
        } catch (error) {
          console.error("Error fetching caregiver posts:", error);
          // Set fallback dummy posts if API fails
          setPosts([
            {
              postId: 1,
              caregiverId: Number(params.caregiverId) || 1,
              text: "I am excited to share my latest certificate of the level 3 caregiver focusing course.",
              image:
                "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Certificate",
              timestamp: new Date(
                Date.now() - 2 * 60 * 60 * 1000
              ).toISOString(), // 2 hours ago
              likesCount: 12,
              commentsCount: 0,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              postId: 2,
              caregiverId: Number(params.caregiverId) || 1,
              text: "Just completed a wonderful session with child care. Feeling grateful for this opportunity to help families! 💙",
              timestamp: new Date(
                Date.now() - 24 * 60 * 60 * 1000
              ).toISOString(), // 1 day ago
              image: null,
              likesCount: 8,
              commentsCount: 0,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]);
        } finally {
          setLoadingPosts(false);
        }
      } else {
        // No caregiver ID, use fallback posts
        setPosts([
          {
            postId: 1,
            caregiverId: 1,
            text: "Looking forward to connecting with more families in need of reliable childcare services.",
            timestamp: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(), 
            image: null,
            likesCount: 15,
            commentsCount: 0,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }
    };

    fetchCaregiverPosts();
  }, [params.caregiverId]);

 
  const handleMessage = async () => {
    try {
      // Get current user data - try multiple possible keys and structures
      let currentUser: any = null;

      // First try the standard currentUser key
      const userDataString = await AsyncStorage.getItem("currentUser");
      console.log("Raw user data from AsyncStorage:", userDataString);

      if (userDataString) {
        currentUser = JSON.parse(userDataString);
        console.log("Parsed current user:", currentUser);
      }

      // If no currentUser, try to get from route params (passed during login)
      if (!currentUser && params.careseekerId) {
        currentUser = {
          id: Number(params.careseekerId),
          careseekerId: Number(params.careseekerId),
          name: params.careseekerName,
          email: params.email,
          userType: "careseeker",
        };
        console.log("Using user data from route params:", currentUser);
      }

      // If still no user, create a fallback (for testing - remove in production)
      if (!currentUser) {
        Alert.alert(
          "Login Required",
          "Please login to start a chat. No user data found.",
          [
            {
              text: "Login",
              onPress: () => router.push("../../pages/Careseeker/CareseekerLogin"),
            },
            {
              text: "Continue as Guest",
              onPress: () => {
                // Create a temporary user for testing
                currentUser = {
                  id: 999, // temp ID
                  careseekerId: 999,
                  name: "Guest User",
                  userType: "careseeker",
                };
                proceedWithChat();
              },
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
        return;
      }

      proceedWithChat();

      function proceedWithChat() {
        const userId = currentUser.id || currentUser.careseekerId;
        console.log("Using user ID:", userId);
        console.log("Available route params:", params);
        console.log("Raw caregiverId param:", params.caregiverId);

        let caregiverId = params.caregiverId
          ? Number(params.caregiverId)
          : null;

        // If caregiverId is not available, try to get it from caregiverData
        if (!caregiverId && params.caregiverData) {
          try {
            const parsedData = JSON.parse(params.caregiverData as string);
            caregiverId = parsedData.id || parsedData.caregiverId;
            console.log(
              "Extracted caregiverId from caregiverData:",
              caregiverId
            );
          } catch (error) {
            console.error("Error parsing caregiverData:", error);
          }
        }

        console.log("Final caregiver ID:", caregiverId);


        if (!caregiverId) {
          Alert.alert(
            "Missing Caregiver ID",
            "Caregiver ID not found in navigation parameters. This is likely a navigation issue.",
            [
              { text: "OK", style: "cancel" },
              {
                text: "Test Chat",
                onPress: () => {
                
                  caregiverId = 1; 
                  console.log("Using test caregiver ID:", caregiverId);
                },
              },
            ]
          );
          return;
        }

        if (userId === caregiverId) {
          Alert.alert("Notice", "You cannot chat with yourself");
          return;
        }

        // Generate chat ID
        const chatId = chatService.generateChatId(userId, caregiverId);

        console.log("Starting chat:", {
          currentUserId: userId,
          caregiverId,
          chatId,
          caregiverName: caregiverData.name,
        });

        // Navigate to chat screen with required parameters
        router.push({
          pathname: "/pages/ChatFunction/ChatMessageScreen",
          params: {
            chatId,
            participantId: caregiverId.toString(),
            participantName: caregiverData.name,
            participantAvatar: caregiverData.profileImage || "",
            participantType: "caregiver",
            isNewChat: "false", // Don't send auto messages
          },
        });
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      Alert.alert("Error", "Failed to start conversation. Please try again.");
    }
  };

  const handleBookNow = () => {
    // Extract the actual rate from the hourlyRate string (e.g., "LKR 1000/hr" -> "LKR 1000/hr")
    const actualRate = caregiverData.hourlyRate;
    
    router.push({
      pathname: "/pages/Careseeker/BooknowForm",
      params: {
        caregiverName: caregiverData.name,
        caregiverRate: actualRate,
        caregiverId: params.caregiverId?.toString() || "1",
      },
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLikePost = (postId: number) => {
    console.log("Liked post:", postId);
    // Implement like functionality
  };

  const handleReportProfile = () => {
    Alert.alert("Report", "Report functionality will be implemented here.");
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={20}
          color="#FFD700"
        />
      );
    }
    return stars;
  };

  // Tab renderer functions
  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      {/* About Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bioText}>{caregiverData.bio}</Text>
      </View>

      {/* Experience Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Experience</Text>
        <Text style={styles.experienceText}>{caregiverData.experience}</Text>
      </View>

      {/* Specialization Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Specialization</Text>
        <Text style={styles.specialtyText}>{caregiverData.specialty}</Text>
      </View>

      {/* Location Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.locationText}>{caregiverData.location}</Text>
      </View>

      {/* Hourly Rate Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Hourly Rate</Text>
        <Text style={styles.rateText}>{caregiverData.hourlyRate}</Text>
      </View>
    </View>
  );

  const renderReviewsTab = () => (
    <ReviewsList
      caregiverId={Number(params.caregiverId)}
      showAddReviewButton={false}
      refreshTrigger={refreshReviews}
      useFlatList={false}
    />
  );

  const renderPostsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Recent Posts</Text>
      {loadingPosts ? (
        <Text style={styles.loadingText}>Loading posts...</Text>
      ) : posts.length > 0 ? (
        posts.map((post) => (
          <View key={post.postId} style={styles.postContainer}>
            <View style={styles.postHeader}>
              <Text style={styles.postTimestamp}>
                {new Date(post.timestamp).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.postText}>{post.text}</Text>
            {post.image && (
              <Image source={{ uri: post.image }} style={styles.postImage} />
            )}
            <View style={styles.postStats}>
              <TouchableOpacity
                style={styles.postStat}
                onPress={() => handleLikePost(post.postId)}
              >
                <Ionicons name="heart-outline" size={16} color="#666" />
                <Text style={styles.postStatText}>{post.likesCount}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noPostsText}>No posts available</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - Using safe area insets to prevent title cutoff */}
      <View style={[styles.header, headerPadding]}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Caregiver Profile</Text>
        <TouchableOpacity onPress={handleReportProfile}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#1E3A8A" />
        </TouchableOpacity>
      </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchUpdatedCaregiverData}
              colors={["#4A90E2"]}
              tintColor="#4A90E2"
            />
          }
        >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
      {/* Profile Picture */}
      <View style={styles.profilePictureContainer}>
        {caregiverData.profileImage ? (
          <Image
            source={{ uri: caregiverData.profileImage }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="person" size={50} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Profile Info */}
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{caregiverData.name}</Text>
        <Text style={styles.profileSpecialty}>{caregiverData.specialty}</Text>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          {renderStars(caregiverData.rating)}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{caregiverData.reviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
            {refreshing && <Text style={styles.refreshingText}>Updating...</Text>}
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{caregiverData.clients}</Text>
            <Text style={styles.statLabel}>Clients</Text>
            {refreshing && <Text style={styles.refreshingText}>Updating...</Text>}
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{caregiverData.completedJobs}</Text>
            <Text style={styles.statLabel}>Completed</Text>
            {refreshing && <Text style={styles.refreshingText}>Updating...</Text>}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={handleMessage}
          >
                <Ionicons name="chatbubble-outline" size={16} color="#FFFFFF" />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
                <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
                <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.contentContainer}>
          {activeTab === "about" && renderAboutTab()}
          {activeTab === "reviews" && renderReviewsTab()}
          {activeTab === "posts" && renderPostsTab()}
      </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  profileHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
  },
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  tabNavigation: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingHorizontal: 20,
    marginTop: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#1E3A8A",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666666",
  },
  activeTabText: {
    color: "#1E3A8A",
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  tabContent: {
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E3A8A",
    marginBottom: 12,
  },
  bottomSpacer: {
    height: 20,
  },
  bioText: {
    fontSize: 16,
    color: "#333333",
    lineHeight: 24,
  },
  experienceText: {
    fontSize: 16,
    color: "#333333",
    lineHeight: 24,
  },
  specialtyText: {
    fontSize: 16,
    color: "#333333",
    lineHeight: 24,
  },
  locationText: {
    fontSize: 16,
    color: "#333333",
    lineHeight: 24,
  },
  rateText: {
    fontSize: 18,
    color: "#1E3A8A",
    fontWeight: "600",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#4A90E2",
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#B0B0B0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#4A90E2",
  },
  profileInfo: {
    paddingHorizontal: 20,
    alignItems: "center",
    width: "100%",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 4,
    textAlign: "center",
  },
  profileSpecialty: {
    fontSize: 16,
    color: "#4A90E2",
    marginBottom: 8,
    textAlign: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
  },
  refreshingText: {
    fontSize: 10,
    color: "#4A90E2",
    fontStyle: "italic",
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 12,
    paddingHorizontal: 10,
    gap: 12,
  },
  messageButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderColor: "#4A90E2",
    borderWidth: 2,
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  messageButtonText: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  bookButton: {
    flex: 1,
    backgroundColor: "#4A90E2",
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  bioContainer: {
    width: "100%",
    marginBottom: 30,
  },
  bioTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 10,
    textAlign: "left",
  },
  postsSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  postsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 15,
  },
  postContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  postTimestamp: {
    fontSize: 12,
    color: "#999999",
  },
  postText: {
    fontSize: 16,
    color: "#333333",
    lineHeight: 22,
    marginBottom: 10,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: "cover",
  },
  postStats: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  postStat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    padding: 5,
  },
  postStatText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 5,
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    paddingVertical: 20,
    fontStyle: "italic",
  },
  noPostsText: {
    fontSize: 16,
    color: "#999999",
    textAlign: "center",
    paddingVertical: 30,
    fontStyle: "italic",
  },
  reviewsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#F8F9FA",
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  reviewsSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  newReviewBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  newReviewText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 4,
  },
  debugContainer: {
    backgroundColor: "#FFF3CD",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#FFEAA7",
  },
  debugText: {
    fontSize: 12,
    color: "#856404",
    fontFamily: "monospace",
  },
  testButton: {
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
    alignItems: "center",
  },
  testButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default CaregiverProfileView;
10
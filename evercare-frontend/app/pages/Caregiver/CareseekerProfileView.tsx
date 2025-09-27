import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useRouter, useLocalSearchParams } from "expo-router";
import BottomNavBar from "../../components/caregiverBottomNavbar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { chatService } from "../../../services/chatService";

interface CareseekerData {
  profileId?: number;
  careseekerId: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  careType: string;
  profileImage: string | null;
  about: string;
  careExperience: string;
  budgetRange: string;
  location: string;
  urgency: "high" | "medium" | "low" | "";
  healthConditions: string[];
  careRequirements: string[];
  careTasksNeeded: string[];
  preferredGender: "male" | "female" | "any" | "";
  languages: string[];
  overallRating: number;
  totalReviews: number;
  completedCare: number;
  activeRequests: number;
  availability: string;
}

const CareseekerProfileView = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("about");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profileNotFound, setProfileNotFound] = useState(false);

  const [profileData, setProfileData] = useState<CareseekerData>({
    careseekerId: 0,
    name: "",
    email: "",
    phone: "",
    address: "",
    careType: "",
    profileImage: null,
    about: "",
    careExperience: "",
    budgetRange: "",
    location: "",
    urgency: "",
    healthConditions: [],
    careRequirements: [],
    careTasksNeeded: [],
    preferredGender: "",
    languages: [],
    overallRating: 0,
    totalReviews: 0,
    completedCare: 0,
    activeRequests: 0,
    availability: "",
  });

  // Load profile data when component mounts
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const careseekerId = params.careseekerId as string;

      console.log("Loading careseeker profile for ID:", careseekerId);

      if (!careseekerId) {
        Alert.alert("Error", "Careseeker ID not provided");
        return;
      }

      // Load careseeker profile data
      const response = await fetch(
        `http://192.168.176.11:5001/careseeker-profile/${careseekerId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response status:", response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log("API Response data:", responseData);
        
        const data: CareseekerData = responseData.profile || responseData;
        console.log("Parsed profile data:", data);
        setProfileData(data);
        setProfileNotFound(false);
      } else if (response.status === 404) {
        setProfileNotFound(true);
        console.log("Profile not found for careseeker ID:", careseekerId);
      } else {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        Alert.alert("Error", `Failed to load careseeker profile: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", `Failed to load profile data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < Math.floor(rating) ? "star" : "star-outline"}
        size={16}
        color={i < Math.floor(rating) ? "#FCD34D" : "#D1D5DB"}
      />
    ));
  };

  const handleMessage = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("currentUser");
      if (!userDataString) {
        Alert.alert("Login required", "Please login first");
        return;
      }
      const currentUser = JSON.parse(userDataString);
      
      // Navigate to chat with the careseeker
      router.push("/pages/ChatFunction");
    } catch (e) {
      console.error("Open chat error", e);
      Alert.alert("Error", "Unable to open messages");
    }
  };

  const renderAboutTab = () => (
    <View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          {profileData.about || "No description provided"}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={20} color="#3B82F6" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Care Experience</Text>
            <Text style={styles.infoValue}>
              {profileData.careExperience || "Not specified"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.infoItem}>
          <Ionicons name="cash-outline" size={20} color="#10B981" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Budget Range</Text>
            <Text style={styles.infoValue}>
              {profileData.budgetRange || "Not specified"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={20} color="#EF4444" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>
              {profileData.location || "Not specified"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderMedicalTab = () => (
    <View>
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="heart-outline" size={20} color="#EF4444" />
          <Text style={styles.sectionTitle}>Health Conditions</Text>
        </View>
        {profileData.healthConditions.map((condition: string, index: number) => (
          <View key={index} style={styles.conditionItem}>
            <View style={styles.conditionDot}></View>
            <Text style={styles.conditionText}>{condition}</Text>
          </View>
        ))}
        {profileData.healthConditions.length === 0 && (
          <Text style={styles.emptyText}>No conditions specified</Text>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="pulse-outline" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Care Requirements</Text>
        </View>
        <View style={styles.requirementItem}>
          <Text style={styles.requirementLabel}>Care Requirements</Text>
          <View style={[styles.badge, styles.mobilityBadge]}>
            <Text style={styles.badgeText}>
              {profileData.careRequirements.length > 0
                ? profileData.careRequirements.join(", ")
                : "Not specified"}
            </Text>
          </View>
        </View>
        <View style={styles.requirementItem}>
          <Text style={styles.requirementLabel}>Care Tasks Needed</Text>
          <View style={[styles.badge, styles.careLevelBadge]}>
            <Text style={styles.badgeText}>
              {profileData.careTasksNeeded.length > 0
                ? profileData.careTasksNeeded.join(", ")
                : "Not specified"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPreferencesTab = () => (
    <View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Caregiver Preferences</Text>
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Preferred Gender</Text>
          <View style={styles.genderBadge}>
            <Text style={styles.genderBadgeText}>
              {profileData.preferredGender || "Not specified"}
            </Text>
          </View>
        </View>
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Languages</Text>
          <View style={styles.languagesContainer}>
            {profileData.languages.map((lang, index) => (
              <View key={index} style={styles.languageBadge}>
                <Text style={styles.languageBadgeText}>{lang}</Text>
              </View>
            ))}
          </View>
          {profileData.languages.length === 0 && (
            <Text style={styles.emptyText}>No languages specified</Text>
          )}
        </View>
      </View>
    </View>
  );

  const tabs = [
    { id: "about", label: "About" },
    { id: "medical", label: "Medical" },
    { id: "preferences", label: "Preferences" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Careseeker Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleMessage} style={styles.messageButton}>
            <Ionicons name="chatbubble-outline" size={24} color="#1E3A8A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        )}

        {/* Profile Not Found State */}
        {!isLoading && profileNotFound && (
          <View style={styles.notFoundContainer}>
            <Ionicons name="person-outline" size={80} color="#9CA3AF" />
            <Text style={styles.notFoundTitle}>Profile Not Found</Text>
            <Text style={styles.notFoundText}>
              This careseeker hasn't created their profile yet.
            </Text>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Profile Header - Only show if not loading and profile found */}
        {!isLoading && !profileNotFound && (
          <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {profileData.profileImage ? (
              <Image source={{ uri: profileData.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color="#FFFFFF" />
              </View>
            )}
          </View>

          <Text style={styles.profileName}>
            {profileData.name || "Unknown Careseeker"}
          </Text>
          <Text style={styles.profileCareType}>
            {profileData.careType || "Care Type Not Specified"}
          </Text>

          <View style={styles.ratingContainer}>
            {renderStars(profileData.overallRating)}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileData.totalReviews}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileData.completedCare}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profileData.activeRequests}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
              <Ionicons name="chatbubble-outline" size={16} color="#FFFFFF" />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>
        )}

        {/* Tab Navigation - Only show if not loading and profile found */}
        {!isLoading && !profileNotFound && (
          <>
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
              {activeTab === "medical" && renderMedicalTab()}
              {activeTab === "preferences" && renderPreferencesTab()}
            </View>
          </>
        )}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <BottomNavBar activeTab="feed" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    fontStyle: "italic",
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#FFFFFF",
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 20,
    marginBottom: 12,
  },
  notFoundText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E3A8A",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  messageButton: {
    padding: 4,
  },
  profileHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  profileImageContainer: {
    marginBottom: 16,
    position: "relative",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  profileCareType: {
    fontSize: 16,
    fontWeight: "500",
    color: "#3B82F6",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#F8FBFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3B82F6",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E3F2FD",
    marginHorizontal: 20,
  },
  actionButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },

  messageButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  tabNavigation: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#3B82F6",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#3B82F6",
  },
  contentContainer: {
    padding: 16,
  },
  bottomSpacer: {
    height: 100,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#6B7280",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: "#6B7280",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  conditionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 8,
  },
  conditionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginRight: 12,
  },
  conditionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#991B1B",
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  requirementLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  mobilityBadge: {
    backgroundColor: "#DBEAFE",
  },
  careLevelBadge: {
    backgroundColor: "#D1FAE5",
  },
  preferenceItem: {
    marginBottom: 16,
  },
  preferenceLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  genderBadge: {
    backgroundColor: "#FCE7F3",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  genderBadgeText: {
    color: "#BE185D",
    fontSize: 14,
    fontWeight: "500",
  },
  languagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  languageBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  languageBadgeText: {
    color: "#1D4ED8",
    fontSize: 12,
  },
});

export default CareseekerProfileView;

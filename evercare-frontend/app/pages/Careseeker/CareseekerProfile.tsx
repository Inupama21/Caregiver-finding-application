import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Modal,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import BottomNavBar from "@/app/components/careseekerbottomNavBar";
import MessageButton from "../../components/MessageButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { chatService } from "../../../services/chatService";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

const router = useRouter();

const CARESEEKER_ID = 1;

interface CareseekerData {
  profileId?: number;
  careseekerId: number;
  name: string;
  email?: string; // Add email from user data
  phone?: string; // Add phone from user data
  address?: string; // Add address from user data
  careType: string;
  profileImage: string | null;

  // About section (maps to backend)
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

const CareseekerProfile = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("about");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [newLanguage, setNewLanguage] = useState("");
  const [newCondition, setNewCondition] = useState("");

  const [profileData, setProfileData] = useState<CareseekerData>({
    careseekerId: CARESEEKER_ID,
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

      // Load careseeker profile data
      const response = await fetch(
        `http://192.168.176.11:5001/careseeker-profile/${CARESEEKER_ID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        const data: CareseekerData = responseData.profile || responseData;
        setProfileData(data);
      } else {
        // no profile yet, show edit mode
        setIsEditing(true);
        Alert.alert("No Profile Found", "Please create your profile.");
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      setIsEditing(true);
      Alert.alert("Error", "Failed to load profile data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfileData = async () => {
    try {
      setIsLoading(true);

      // Validation
      if (!profileData.name.trim()) {
        Alert.alert("Error", "Please enter your name");
        setIsLoading(false);
        return;
      }
      if (!profileData.careType.trim()) {
        Alert.alert("Error", "Please select a care type");
        setIsLoading(false);
        return;
      }
      if (!profileData.about.trim()) {
        Alert.alert("Error", "Please provide an about description");
        setIsLoading(false);
        return;
      }

      // Prepare profile data for backend
      const backendData = {
        careseekerId: CARESEEKER_ID,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        careType: profileData.careType,
        profileImage: profileData.profileImage,
        about: profileData.about,
        careExperience: profileData.careExperience,
        budgetRange: profileData.budgetRange,
        location: profileData.location,
        urgency: profileData.urgency || undefined,
        healthConditions: profileData.healthConditions,
        careRequirements: profileData.careRequirements,
        careTasksNeeded: profileData.careTasksNeeded,
        preferredGender: profileData.preferredGender || undefined,
        languages: profileData.languages,
        overallRating: profileData.overallRating || 0,
        totalReviews: profileData.totalReviews || 0,
        completedCare: profileData.completedCare || 0,
        activeRequests: profileData.activeRequests || 0,
        availability: profileData.availability,
      };

      console.log("Profile data to save:", backendData);

      const method = profileData.profileId ? "PUT" : "POST";
      const url = profileData.profileId
        ? `http://192.168.176.11:5001/careseeker-profile/${CARESEEKER_ID}`
        : "http://192.168.176.11:5001/careseeker-profile";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendData),
      });

      if (response.ok) {
        const responseData = await response.json();
        const savedData = responseData.profile || responseData;
        setProfileData((prev) => ({
          ...prev,
          profileId: savedData.profileId || prev.profileId,
        }));

        Alert.alert("Success", "Profile updated successfully!");
        setIsEditing(false);
        loadProfileData(); // Refresh the profile data
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "Failed to save profile");
      }
    } catch (error: any) {
      console.error("Save profile error:", error);
      Alert.alert("Error", error.message || "Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePicker = async () => {
    Alert.alert("Change Profile Picture", "Choose an option", [
      { text: "Camera", onPress: openCamera },
      { text: "Gallery", onPress: openGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Camera permission is required");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileData((prev) => ({
          ...prev,
          profileImage: result.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileData((prev) => ({
          ...prev,
          profileImage: result.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const addLanguage = () => {
    if (
      newLanguage.trim() &&
      !profileData.languages.includes(newLanguage.trim())
    ) {
      setProfileData((prev) => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()],
      }));
      setNewLanguage("");
      setShowLanguageModal(false);
    }
  };

  const removeLanguage = (language: string) => {
    setProfileData((prev) => ({
      ...prev,
      languages: prev.languages.filter((lang) => lang !== language),
    }));
  };

  const addCondition = () => {
    if (
      newCondition.trim() &&
      !profileData.healthConditions.includes(newCondition.trim())
    ) {
      setProfileData((prev) => ({
        ...prev,
        healthConditions: [...prev.healthConditions, newCondition.trim()],
      }));
      setNewCondition("");
      setShowConditionModal(false);
    }
  };

  const removeCondition = (condition: string) => {
    setProfileData((prev) => ({
      ...prev,
      healthConditions: prev.healthConditions.filter(
        (cond: string) => cond !== condition
      ),
    }));
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

  const renderAboutTab = () => (
    <View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About</Text>
        {isEditing ? (
          <TextInput
            style={styles.textInput}
            value={profileData.about}
            onChangeText={(text) =>
              setProfileData((prev) => ({ ...prev, about: text }))
            }
            placeholder="Tell us about your care needs..."
            multiline
            numberOfLines={4}
          />
        ) : (
          <Text style={styles.aboutText}>
            {profileData.about || "No description provided"}
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={20} color="#3B82F6" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Care Experience</Text>
            {isEditing ? (
              <TextInput
                style={styles.smallTextInput}
                value={profileData.careExperience}
                onChangeText={(text) =>
                  setProfileData((prev) => ({ ...prev, careExperience: text }))
                }
                placeholder="e.g., 2+ years seeking care"
              />
            ) : (
              <Text style={styles.infoValue}>
                {profileData.careExperience || "Not specified"}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.infoItem}>
          <Ionicons name="cash-outline" size={20} color="#10B981" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Budget Range</Text>
            {isEditing ? (
              <TextInput
                style={styles.smallTextInput}
                value={profileData.budgetRange}
                onChangeText={(text) =>
                  setProfileData((prev) => ({ ...prev, budgetRange: text }))
                }
                placeholder="e.g., $20-30/hr"
              />
            ) : (
              <Text style={styles.infoValue}>
                {profileData.budgetRange || "Not specified"}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={20} color="#EF4444" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Location</Text>
            {isEditing ? (
              <TextInput
                style={styles.smallTextInput}
                value={profileData.location}
                onChangeText={(text) =>
                  setProfileData((prev) => ({ ...prev, location: text }))
                }
                placeholder="e.g., Colombo 07, Western Province"
              />
            ) : (
              <Text style={styles.infoValue}>
                {profileData.location || "Not specified"}
              </Text>
            )}
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
          {isEditing && (
            <TouchableOpacity onPress={() => setShowConditionModal(true)}>
              <Ionicons name="add-circle" size={20} color="#3B82F6" />
            </TouchableOpacity>
          )}
        </View>
        {profileData.healthConditions.map(
          (condition: string, index: number) => (
            <View key={index} style={styles.conditionItem}>
              <View style={styles.conditionDot}></View>
              <Text style={styles.conditionText}>{condition}</Text>
              {isEditing && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeCondition(condition)}
                >
                  <Ionicons name="close-circle" size={16} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          )
        )}
        {profileData.healthConditions.length === 0 && (
          <Text style={styles.emptyText}>No conditions added</Text>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="pulse-outline" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Care Requirements</Text>
        </View>
        <View style={styles.requirementItem}>
          <Text style={styles.requirementLabel}>Care Requirements</Text>
          {isEditing ? (
            <TextInput
              style={styles.smallTextInput}
              value={profileData.careRequirements.join(", ")}
              onChangeText={(text) =>
                setProfileData((prev) => ({
                  ...prev,
                  careRequirements: text
                    .split(",")
                    .map((item) => item.trim())
                    .filter((item) => item),
                }))
              }
              placeholder="e.g., Medication assistance, Mobility support"
            />
          ) : (
            <View style={[styles.badge, styles.mobilityBadge]}>
              <Text style={styles.badgeText}>
                {profileData.careRequirements.length > 0
                  ? profileData.careRequirements.join(", ")
                  : "Not specified"}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.requirementItem}>
          <Text style={styles.requirementLabel}>Care Tasks Needed</Text>
          {isEditing ? (
            <TextInput
              style={styles.smallTextInput}
              value={profileData.careTasksNeeded.join(", ")}
              onChangeText={(text) =>
                setProfileData((prev) => ({
                  ...prev,
                  careTasksNeeded: text
                    .split(",")
                    .map((item) => item.trim())
                    .filter((item) => item),
                }))
              }
              placeholder="e.g., Bathing, Meal preparation"
            />
          ) : (
            <View style={[styles.badge, styles.careLevelBadge]}>
              <Text style={styles.badgeText}>
                {profileData.careTasksNeeded.length > 0
                  ? profileData.careTasksNeeded.join(", ")
                  : "Not specified"}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="medical-outline" size={20} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Care Tasks Needed</Text>
        </View>
        {profileData.careTasksNeeded.length > 0 ? (
          profileData.careTasksNeeded.map((task: string, index: number) => (
            <View key={index} style={styles.taskItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.taskText}>{task}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No care tasks specified</Text>
        )}
      </View>
    </View>
  );

  const renderPreferencesTab = () => (
    <View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Caregiver Preferences</Text>
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Preferred Gender</Text>
          {isEditing ? (
            <TextInput
              style={styles.smallTextInput}
              value={profileData.preferredGender}
              onChangeText={(text) =>
                setProfileData((prev) => ({
                  ...prev,
                  preferredGender: text as "male" | "female" | "any" | "",
                }))
              }
              placeholder="e.g., male, female, any"
            />
          ) : (
            <View style={styles.genderBadge}>
              <Text style={styles.genderBadgeText}>
                {profileData.preferredGender || "Not specified"}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Languages</Text>
          <View style={styles.languagesContainer}>
            {profileData.languages.map((lang, index) => (
              <View key={index} style={styles.languageBadge}>
                <Text style={styles.languageBadgeText}>{lang}</Text>
                {isEditing && (
                  <TouchableOpacity
                    style={styles.removeButtonSmall}
                    onPress={() => removeLanguage(lang)}
                  >
                    <Ionicons name="close" size={12} color="#1D4ED8" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {isEditing && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowLanguageModal(true)}
              >
                <Ionicons name="add" size={16} color="#3B82F6" />
                <Text style={styles.addButtonText}>Add Language</Text>
              </TouchableOpacity>
            )}
          </View>
          {profileData.languages.length === 0 && (
            <Text style={styles.emptyText}>No languages added</Text>
          )}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Schedule Preferences</Text>
        <View style={styles.scheduleItem}>
          <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
          <View style={styles.scheduleContent}>
            <Text style={styles.scheduleLabel}>Preferred Schedule</Text>
            <Text style={styles.scheduleValue}>Monday, Wednesday, Friday</Text>
          </View>
        </View>
        <View style={styles.scheduleItem}>
          <Ionicons name="time-outline" size={20} color="#10B981" />
          <View style={styles.scheduleContent}>
            <Text style={styles.scheduleLabel}>Preferred Times</Text>
            <Text style={styles.scheduleValue}>Morning & Evening</Text>
          </View>
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
          <TouchableOpacity
            onPress={() => {
              if (isEditing) {
                saveProfileData();
              } else {
                setIsEditing(true);
              }
            }}
            style={styles.headerButton}
          >
            <Ionicons
              name={isEditing ? "checkmark" : "create-outline"}
              size={24}
              color="#1E3A8A"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        )}

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={isEditing ? handleImagePicker : undefined}
          >
            {profileData.profileImage ? (
              <Image source={{ uri: profileData.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color="#FFFFFF" />
              </View>
            )}
            {isEditing && (
              <View style={styles.editImageOverlay}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          {isEditing ? (
            <View style={styles.editNameContainer}>
              <TextInput
                style={styles.nameInput}
                value={profileData.name}
                onChangeText={(text) =>
                  setProfileData((prev) => ({ ...prev, name: text }))
                }
                placeholder="Enter your name"
                textAlign="center"
              />
              <TextInput
                style={styles.careTypeInput}
                value={profileData.careType}
                onChangeText={(text) =>
                  setProfileData((prev) => ({ ...prev, careType: text }))
                }
                placeholder="e.g., Elder care, Child care"
                textAlign="center"
              />
            </View>
          ) : (
            <>
              <Text style={styles.profileName}>
                {profileData.name || "Enter your name"}
              </Text>
              <Text style={styles.profileCareType}>
                {profileData.careType || "Select care type"}
              </Text>
            </>
          )}

          <View style={styles.ratingContainer}>
            {renderStars(profileData.overallRating)}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              {/* <Text style={styles.statValue}>{profileData.totalReviews}</Text> */}
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              {/* <Text style={styles.statValue}>{profileData.completedCare}</Text> */}
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              {/* <Text style={styles.statValue}>{profileData.activeRequests}</Text> */}
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>

          {!isEditing && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={async () => {
                  try {
                    const userDataString = await AsyncStorage.getItem(
                      "currentUser"
                    );
                    if (!userDataString) {
                      Alert.alert("Login required", "Please login first");
                      router.push("../../pages/Careseeker/CareseekerLogin");
                      return;
                    }
                    const currentUser = JSON.parse(userDataString);
                    // For a careseeker viewing own profile, just go to chat list
                    router.push("/pages/ChatFunction");
                  } catch (e) {
                    console.error("Open chat list error", e);
                    Alert.alert("Error", "Unable to open messages");
                  }
                }}
              >
                <Ionicons name="chatbubble-outline" size={16} color="#FFFFFF" />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/pages/Careseeker/CreatePost",
                    params: {
                      careseekerId: CARESEEKER_ID.toString(),
                      careseekerName: profileData.name || "User",
                      email: profileData.email || "",
                    },
                  })
                }
                style={styles.applyButton}
              >
                <Ionicons name="heart-outline" size={16} color="#FFFFFF" />
                <Text style={styles.applyButtonText}>Create Post</Text>
              </TouchableOpacity>
            </View>
          )}
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
          {activeTab === "medical" && renderMedicalTab()}
          {activeTab === "preferences" && renderPreferencesTab()}
        </View>

        {/* Bottom Spacer to ensure content is not cut off */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Language</Text>
            <TextInput
              style={styles.modalInput}
              value={newLanguage}
              onChangeText={setNewLanguage}
              placeholder="Enter language"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowLanguageModal(false);
                  setNewLanguage("");
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={addLanguage}
              >
                <Text style={styles.modalAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Condition Modal */}
      <Modal
        visible={showConditionModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Health Condition</Text>
            <TextInput
              style={styles.modalInput}
              value={newCondition}
              onChangeText={setNewCondition}
              placeholder="Enter health condition"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowConditionModal(false);
                  setNewCondition("");
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={addCondition}
              >
                <Text style={styles.modalAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavBar activeTab="profile" />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBFF",
    paddingBottom: 0, // Remove any bottom padding that might conflict
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100, // Extra padding at bottom to account for BottomNavBar
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
  headerButton: {
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
  editImageOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  editNameContainer: {
    width: "100%",
    alignItems: "center",
  },
  nameInput: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 8,
    minWidth: 200,
  },
  careTypeInput: {
    fontSize: 16,
    fontWeight: "500",
    color: "#3B82F6",
    marginBottom: 12,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 8,
    minWidth: 200,
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
  messageButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  messageButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#EC4899",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  applyButtonText: {
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
    height: 100, // Extra space to ensure content is not cut off by bottom navigation
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
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#374151",
    backgroundColor: "#F9FAFB",
    textAlignVertical: "top",
  },
  smallTextInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    color: "#374151",
    backgroundColor: "#F9FAFB",
    flex: 1,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactItem: {
    marginBottom: 12, // Add spacing between contact items
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
  removeButton: {
    marginLeft: 8,
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
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  taskText: {
    fontSize: 14,
    color: "#374151",
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
  removeButtonSmall: {
    marginLeft: 4,
  },
  addButton: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderStyle: "dashed",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addButtonText: {
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "500",
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E40AF",
    marginBottom: 2,
  },
  scheduleValue: {
    fontSize: 12,
    color: "#1D4ED8",
  },
  ratingsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  ratingItem: {
    flex: 1,
    alignItems: "center",
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F59E0B",
    marginBottom: 8,
  },
  ratingStars: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 2,
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  reviewItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    paddingLeft: 12,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  reviewText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#374151",
    marginBottom: 4,
    lineHeight: 20,
  },
  reviewAuthor: {
    fontSize: 12,
    color: "#6B7280",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#374151",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },
  modalAddButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalAddText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CareseekerProfile;

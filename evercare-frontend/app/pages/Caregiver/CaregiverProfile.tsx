import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
  FlatList,
  Modal,
  Dimensions,
  RefreshControl,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../../components/caregiverBottomNavbar";
import { useRouter } from "expo-router";
import MessageButton from "../../components/MessageButton";
import BookingCalendarModal from "../../components/BookingCalendarModal";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import ProfileDebugger from "../../components/ProfileDebugger";
import ReviewsList from "../../components/reviews/ReviewsList";
import { caregiverService } from "../../../services/caregiverService";

const { width: screenWidth } = Dimensions.get("window");

const router = useRouter();

type CaregiverProfile = {
  profileId?: number;
  caregiverId: number;
  displayName?: string | null;
  age?: number | null;
  experienceYears?: number | null;
  specialization?: string | null;
  description?: string | null;
  profilePhoto?: string | null;
  averageRating?: number | null;
  reviewsCount?: number | null;
  clientsCount?: number | null;
  completedJobs?: number | null;
};

type CaregiverPost = {
  postId: number;
  caregiverId: number;
  text: string;
  image?: string | null;
  timestamp: string;
  likesCount: number;
  commentsCount: number;
};

const StarRating: React.FC<{ rating?: number | null }> = ({ rating = 0 }) => {
  const fullStars = Math.floor(rating ?? 0);
  const hasHalf = (rating ?? 0) - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Ionicons key={`f-${i}`} name="star" size={18} color="#F59E0B" />
      ))}
      {hasHalf ? <Ionicons name="star-half" size={18} color="#F59E0B" /> : null}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Ionicons
          key={`e-${i}`}
          name="star-outline"
          size={18}
          color="#F59E0B"
        />
      ))}
      <Text style={{ marginLeft: 6, color: "#64748B", fontSize: 13 }}>
        {Number(rating || 0).toFixed(1)}
      </Text>
    </View>
  );
};

const Stat: React.FC<{ label: string; value?: number | null }> = ({
  label,
  value = 0,
}) => (
  <View style={styles.statItem}>
    <Text style={styles.statNumber}>{value ?? 0}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/**
 * A simple post card
 */
const PostCard: React.FC<{ post: CaregiverPost }> = ({ post }) => {
  const date = useMemo(() => new Date(post.timestamp), [post.timestamp]);
  return (
    <View style={styles.postCard}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.postDate}>{date.toDateString()}</Text>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <View style={styles.iconRow}>
            <Ionicons name="heart-outline" size={16} color="#64748B" />
            <Text style={styles.postMeta}>{post.likesCount}</Text>
          </View>
          <View style={styles.iconRow}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={16}
              color="#64748B"
            />
            <Text style={styles.postMeta}>{post.commentsCount}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.postText}>{post.text}</Text>
      {post.image ? (
        <Image source={{ uri: post.image }} style={styles.postImage} />
      ) : null}
    </View>
  );
};

const CaregiverProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, getUserId, loading: userLoading } = useCurrentUser();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CaregiverProfile | null>(null);
  const [posts, setPosts] = useState<CaregiverPost[]>([]);
  const [editing, setEditing] = useState(false);

  // Post creation modal state
  const [showPostModal, setShowPostModal] = useState(false);
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState<string | null>(null);
  const [creatingPost, setCreatingPost] = useState(false);

  // Booking calendar modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState("about");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  // form state
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [description, setDescription] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Tab definitions
  const tabs = [
    { id: "about", label: "About" },
    { id: "reviews", label: "Reviews" },
    { id: "posts", label: "Posts" },
  ];

  // Function to fetch updated profile data
  const fetchUpdatedProfileData = async () => {
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
      const caregiverId = user?.id;
      
      if (caregiverId) {
        // Fetch updated profile data from the backend
        const updatedData = await caregiverService.getProfile(caregiverId);
        
        if (updatedData && profile) {
          setProfile(prevProfile => ({
            ...prevProfile!,
            reviewsCount: updatedData.reviewsCount || prevProfile?.reviewsCount || 0,
            clientsCount: updatedData.clientsCount || prevProfile?.clientsCount || 0,
            completedJobs: updatedData.completedJobs || prevProfile?.completedJobs || 0,
            averageRating: updatedData.averageRating || prevProfile?.averageRating || 0,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching updated profile data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Note: Auto-refresh removed to prevent infinite loop
  // Profile data will be refreshed via pull-to-refresh or when triggered from other pages

  /**
   * Fetch profile & posts
   */
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      if (!userId) {
        console.error('No user ID available');
        setLoading(false);
        return;
      }
      

      const res = await fetch(
        `http://192.168.176.11:5001/caregiverProfile/${userId}`,
        {
          method: "GET", 
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const data: CaregiverProfile = await res.json();
        setProfile(data);
        // seed form
        setDisplayName(data.displayName || "");
        setAge(data.age?.toString() || "");
        setExperienceYears(data.experienceYears?.toString() || "");
        setSpecialization(data.specialization || "");
        setDescription(data.description || "");
        setProfilePhoto(data.profilePhoto || null);
      } else {
        // no profile yet
        setProfile(null);
        setEditing(true); // show the form first time
        Toast.show({
          type: "info",
          text1: "No Profile Found",
          text2: "Please create your profile.",
        });
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      setProfile(null);
      setEditing(true);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        console.error('No user ID available for fetching posts');
        return;
      }
      
      const res = await fetch(
        `http://192.168.176.11:5001/caregiverPosts/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const data: CaregiverPost[] = await res.json();
        setPosts(data || []);
      } else {
        setPosts([]);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load posts.",
        });
      }
    } catch (err) {
      console.error("Fetch posts error:", err);
      setPosts([]);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to connect to server.",
      });
    }
  };

  useEffect(() => {
    if (!userLoading && user) {
      fetchProfile();
      fetchPosts();
    }
  }, [userLoading, user]);


  /**
   * Pick/Change profile picture
   */
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8, // Reduced quality for smaller file size
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true, // Enable base64 conversion
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          // Convert to base64 format for database storage
          const base64Image = `data:image/jpeg;base64,${asset.base64}`;
          setProfilePhoto(base64Image);
        } else {
          // Fallback to URI if base64 is not available
          setProfilePhoto(asset.uri);
        }
      }
    } catch (error) {
      console.error("Error picking profile image:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to select image. Please try again.",
      });
    }
  };

  /**
   * Save (create or update) profile
   */
  const onSave = async () => {
    // Validation similar to your CreatePost
    if (!displayName.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter your display name.",
      });
      return;
    }

    if (age && (isNaN(Number(age)) || Number(age) < 18 || Number(age) > 100)) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter a valid age between 18-100.",
      });
      return;
    }

    try {
      const userId = getUserId();
      if (!userId) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No user ID available. Please login again.",
        });
        return;
      }

      
      const payload: CaregiverProfile = {
        caregiverId: userId,
        displayName: displayName?.trim() || null,
        age: age ? Number(age) : null,
        experienceYears: experienceYears ? Number(experienceYears) : null,
        specialization: specialization?.trim() || null,
        description: description?.trim() || null,
        profilePhoto: profilePhoto || null,
        averageRating: profile?.averageRating ?? 0,
        reviewsCount: profile?.reviewsCount ?? 0,
        clientsCount: profile?.clientsCount ?? 0,
        completedJobs: profile?.completedJobs ?? 0,
      };

      const method = profile ? "PUT" : "POST";
      const url = profile
        ? `http://192.168.176.11:5001/caregiverProfile/${userId}`
        : "http://192.168.176.11:5001/caregiverProfile";

      console.log("Sending profile data:", {
        ...payload,
        profilePhoto: payload.profilePhoto
          ? "base64 image data (length: " + payload.profilePhoto.length + ")"
          : null,
      });

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Toast.show({
          type: "success",
          text1: "Success!",
          text2: "Your profile has been saved.",
        });
        setEditing(false);
        fetchProfile();
      } else {
        const errorData = await res.json();
        Toast.show({
          type: "error",
          text1: "Save Failed",
          text2: errorData.error || "Failed to save profile.",
        });
      }
    } catch (err) {
      console.error("Save error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not save profile. Please try again.",
      });
    }
  };

  /**
   * Pick image for new post
   */
  const pickPostImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const base64Image = `data:image/jpeg;base64,${asset.base64}`;
          setPostImage(base64Image);
        } else {
          // Fallback to URI if base64 is not available
          setPostImage(asset.uri);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to pick image. Please try again.",
      });
    }
  };

  /**
   * Remove selected post image
   */
  const removePostImage = () => {
    setPostImage(null);
  };

  /**
   * Reset post creation modal
   */
  const resetPostModal = () => {
    setPostText("");
    setPostImage(null);
    setShowPostModal(false);
  };

  /**
   * Create a new post (updated for modal usage)
   */
  const handleCreatePost = async () => {
    if (!postText.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter post content.",
      });
      return;
    }

    try {
      setCreatingPost(true);
      const postData = {
        text: postText.trim(),
        image: postImage || null,
      };

      console.log("Creating post:", postData);

      const userId = getUserId();
      if (!userId) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No user ID available. Please login again.",
        });
        return;
      }
      
      const response = await fetch(
        `http://192.168.176.11:5001/caregiverPosts/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );

      if (response.status === 201) {
        Toast.show({
          type: "success",
          text1: "Post Created!",
          text2: "Your post has been created successfully.",
        });
        resetPostModal();
        fetchPosts(); // Refresh posts list
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to create post",
          text2: "Please try again.",
        });
      }
    } catch (error) {
      console.error("Create post error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to connect to server.",
      });
    } finally {
      setCreatingPost(false);
    }
  };

  // Tab renderer functions
  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About</Text>
        <ProfileRow
          label="Age"
          value={profile?.age != null ? String(profile?.age) : "-"}
        />
        <ProfileRow
          label="Experience"
          value={
            profile?.experienceYears != null
              ? `${profile?.experienceYears} years`
              : "-"
          }
        />
        <ProfileRow
          label="Specialization"
          value={profile?.specialization || "-"}
        />
        <ProfileRow
          label="About Me"
          value={profile?.description || "-"}
          multiline
        />
      </View>
    </View>
  );

  const renderReviewsTab = () => (
    <ReviewsList
      caregiverId={user?.id || 0}
      showAddReviewButton={false}
      refreshTrigger={refreshReviews}
      useFlatList={false}
    />
  );

  const renderPostsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.sharePostBtn}
          onPress={() => setShowPostModal(true)}
        >
          <Ionicons name="add-circle-outline" size={18} color="#1E3A8A" />
          <Text style={styles.sharePostText}>Share a post</Text>
        </TouchableOpacity>

        {posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={28}
              color="#94A3B8"
            />
            <Text style={styles.emptyStateText}>No posts yet</Text>
            <Text style={styles.emptyStateSub}>
              Start building your activity by sharing updates, certificates,
              or tips.
            </Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.postId.toString()}
            renderItem={({ item }) => <PostCard post={item} />}
            scrollEnabled={false}
          />
        )}
      </View>
    </View>
  );

  /**
   * UI
   */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const nameForDisplay = editing
    ? displayName || ""
    : profile?.displayName || "Your Name";

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchUpdatedProfileData}
            colors={["#4A90E2"]}
            tintColor="#4A90E2"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {profile && !editing ? (
              <TouchableOpacity
                onPress={() => setEditing(true)}
                style={styles.headerBtn}
              >
                <Ionicons name="settings-outline" size={20} color="#1E3A8A" />
                <Text style={styles.headerBtnText}>Edit</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Profile Header */}
        <View style={styles.card}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={56} color="#FFFFFF" />
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            {/* Name */}
            {editing ? (
              <TextInput
                style={styles.nameInput}
                placeholder="Your Name"
                value={displayName}
                onChangeText={setDisplayName}
              />
            ) : (
              <Text style={styles.nameText}>{nameForDisplay}</Text>
            )}

            {/* Rating row (display-only; defaults to 0) */}
            <View style={{ marginTop: 6 }}>
              <StarRating rating={profile?.averageRating ?? 0} />
            </View>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <Stat label="Reviews" value={profile?.reviewsCount ?? 0} />
            <View style={styles.statDivider} />
            <Stat label="Clients" value={profile?.clientsCount ?? 0} />
            <View style={styles.statDivider} />
            <Stat label="Completed" value={profile?.completedJobs ?? 0} />
            {refreshing && <Text style={styles.refreshingText}>Updating...</Text>}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={() => {
                console.log("Navigating to My Messages...");
                router.push("/pages/ChatFunction");
              }}
              style={[styles.actionBtn, { backgroundColor: "#1E3A8A" }]}
            >
              <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>My Messages</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#0EA5E9" }]}
              onPress={() => setShowBookingModal(true)}
            >
              <Ionicons name="calendar" size={18} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>My Bookings</Text>
            </TouchableOpacity>
          </View>

          {/* Edit Form */}
          {editing && (
            <View style={styles.details}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Age"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />

              <Text style={styles.label}>Years of Experience</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 3"
                keyboardType="numeric"
                value={experienceYears}
                onChangeText={setExperienceYears}
              />

              <Text style={styles.label}>Specialization</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Elderly Care, Childcare"
                value={specialization}
                onChangeText={setSpecialization}
              />

              <Text style={styles.label}>About Me</Text>
              <TextInput
                style={[
                  styles.input,
                  { height: 100, textAlignVertical: "top" },
                ]}
                placeholder="Short description"
                value={description}
                onChangeText={setDescription}
                multiline
              />

              <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
                <Text style={styles.saveBtnText}>
                  {profile ? "Update Profile" : "Create Profile"}
                </Text>
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
          {activeTab === "reviews" && renderReviewsTab()}
          {activeTab === "posts" && renderPostsTab()}
        </View>
      </ScrollView>
      <BottomNavBar activeTab="profile" />

      {/* Booking Calendar Modal */}
      <BookingCalendarModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        caregiverId={getUserId() || 1}
      />

      {/* Post Creation Modal */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={resetPostModal}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={resetPostModal}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseBtnText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity
              onPress={handleCreatePost}
              style={[
                styles.modalShareBtn,
                (!postText.trim() || creatingPost) &&
                  styles.modalShareBtnDisabled,
              ]}
              disabled={!postText.trim() || creatingPost}
            >
              {creatingPost ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalShareBtnText}>Share</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* User Info */}
            <View style={styles.modalUserInfo}>
              {profilePhoto ? (
                <Image
                  source={{ uri: profilePhoto }}
                  style={styles.modalAvatar}
                />
              ) : (
                <View style={[styles.modalAvatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={20} color="#FFFFFF" />
                </View>
              )}
              <Text style={styles.modalUserName}>
                {profile?.displayName || "Your Name"}
              </Text>
            </View>

            {/* Post Text Input */}
            <TextInput
              style={styles.postTextInput}
              placeholder="What's on your mind? Share your caregiving experience, tips, or updates..."
              placeholderTextColor="#94A3B8"
              value={postText}
              onChangeText={setPostText}
              multiline
              textAlignVertical="top"
              autoFocus
            />

            {/* Selected Image Preview */}
            {postImage && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: postImage }}
                  style={styles.imagePreview}
                />
                <TouchableOpacity
                  onPress={removePostImage}
                  style={styles.removeImageBtn}
                >
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={pickPostImage}
                style={styles.addImageBtn}
              >
                <Ionicons name="image-outline" size={20} color="#1E3A8A" />
                <Text style={styles.addImageBtnText}>
                  {postImage ? "Change Photo" : "Add Photo"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Post Guidelines */}
            <View style={styles.guidelinesContainer}>
              <Text style={styles.guidelinesTitle}>💡 Post Tips:</Text>
              <Text style={styles.guidelinesText}>
                • Share your caregiving experiences and insights{"\n"}• Include
                achievements, certifications, or milestones{"\n"}• Offer helpful
                tips to fellow caregivers{"\n"}• Keep it professional and
                positive
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

/**
 * Small helper for profile rows
 */
const ProfileRow: React.FC<{
  label: string;
  value: string;
  multiline?: boolean;
}> = ({ label, value, multiline }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, multiline && { lineHeight: 20 }]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FBFF" },
  scrollContent: { flex: 1 },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: "#E2E8F0",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    alignItems: "center",
  },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  headerBtnText: { color: "#1E3A8A", fontWeight: "600", fontSize: 12 },

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  avatarContainer: {
    alignItems: "center",
    position: "relative",
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#E2E8F0",
  },
  avatarPlaceholder: {
    backgroundColor: "#4A90E2",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    backgroundColor: "#1E3A8A",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  nameText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 12,
  },
  nameInput: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 4,
    minWidth: 220,
    textAlign: "center",
  },

  details: { marginTop: 16 },
  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#F8FAFC",
    marginBottom: 10,
    fontSize: 15,
    color: "#0F172A",
  },
  saveBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },

  detailLabel: { color: "#64748B", fontSize: 12, marginBottom: 2 },
  detailValue: { color: "#0F172A", fontSize: 15, fontWeight: "500" },

  stats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FBFF",
    borderRadius: 14,
    padding: 12,
    marginTop: 16,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  statLabel: { fontSize: 12, color: "#64748B" },
  statDivider: {
    width: 1,
    height: "70%",
    backgroundColor: "#E2E8F0",
  },

  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  sectionTitle: {
    marginTop: 18,
    marginLeft: 18,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  sharePostBtn: {
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  sharePostText: { color: "#1E3A8A", fontWeight: "700" },

  emptyState: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 6,
  },
  emptyStateText: { color: "#0F172A", fontWeight: "700" },
  emptyStateSub: {
    color: "#64748B",
    textAlign: "center",
    paddingHorizontal: 8,
  },

  postCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  postDate: { color: "#64748B", fontSize: 12 },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  postMeta: { color: "#64748B", fontSize: 12 },
  postText: { color: "#0F172A", marginTop: 8, fontSize: 14 },
  postImage: {
    marginTop: 10,
    width: "100%",
    height: 180,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  modalCloseBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  modalCloseBtnText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalShareBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 60,
    alignItems: "center",
  },
  modalShareBtnDisabled: {
    backgroundColor: "#94A3B8",
  },
  modalShareBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
    marginBottom: 16,
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  postTextInput: {
    fontSize: 16,
    color: "#0F172A",
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 20,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  modalActions: {
    paddingVertical: 16,
  },
  addImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    backgroundColor: "#F8FBFF",
    alignSelf: "flex-start",
  },
  addImageBtnText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
    color: "#1E3A8A",
  },
  guidelinesContainer: {
    backgroundColor: "#F8FBFF",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 8,
  },
  guidelinesText: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  // Tab styles
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
  refreshingText: {
    fontSize: 10,
    color: "#4A90E2",
    fontStyle: "italic",
    marginTop: 2,
    textAlign: "center",
  },
});

export default CaregiverProfileScreen;

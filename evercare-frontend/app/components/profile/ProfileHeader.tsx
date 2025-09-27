import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ProfileHeaderProps {
  name: string;
  specialty: string;
  experience: string;
  bio: string;
  profileImage?: string | null;
  location?: string;
  isOwnProfile?: boolean;
  onEditPress?: () => void;
  onBackPress?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  specialty,
  experience,
  bio,
  profileImage,
  location,
  isOwnProfile = false,
  onEditPress,
  onBackPress,
}) => {
  return (
    <View style={styles.header}>
      {/* Header with back button */}
      <View style={styles.headerTop}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        {isOwnProfile && (
          <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
            <Ionicons name="create-outline" size={24} color="#4A90E2" />
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Image */}
      <View style={styles.profileImageContainer}>
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : require("../../../assets/images/icon.png")
          }
          style={styles.profileImage}
        />
      </View>

      {/* Profile Info */}
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.specialty}>{specialty}</Text>
      <Text style={styles.experience}>{experience}</Text>
      {location && <Text style={styles.location}>{location}</Text>}

      {/* Bio */}
      <View style={styles.bioSection}>
        <Text style={styles.bioTitle}>About</Text>
        <Text style={styles.bio}>{bio}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  editButton: {
    padding: 5,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#4A90E2",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 5,
  },
  specialty: {
    fontSize: 18,
    color: "#4A90E2",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 5,
  },
  experience: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 15,
  },
  bioSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    textAlign: "justify",
  },
});

export default ProfileHeader;

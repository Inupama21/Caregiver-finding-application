import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ActionButtonsProps {
  isOwnProfile: boolean;
  // For viewing other profiles (careseeker actions)
  onMessage?: () => void;
  onBookNow?: () => void;
  // For own profile (caregiver actions)
  onCreatePost?: () => void;
  onSettings?: () => void;
  onEditProfile?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isOwnProfile,
  onMessage,
  onBookNow,
  onCreatePost,
  onSettings,
  onEditProfile,
}) => {
  if (isOwnProfile) {
    // Caregiver's own profile actions
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.primaryButton} onPress={onCreatePost}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Create Post</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onEditProfile}
          >
            <Ionicons name="create-outline" size={18} color="#4A90E2" />
            <Text style={styles.secondaryButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onSettings}>
            <Ionicons name="settings-outline" size={18} color="#4A90E2" />
            <Text style={styles.secondaryButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Viewing other caregiver's profile (careseeker actions)
  return (
    <View style={styles.container}>
      <View style={styles.viewerActions}>
        <TouchableOpacity style={styles.messageButton} onPress={onMessage}>
          <Ionicons name="chatbubble-outline" size={20} color="#4A90E2" />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bookButton} onPress={onBookNow}>
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  // Own profile actions
  primaryButton: {
    backgroundColor: "#4A90E2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#4A90E2",
    borderRadius: 10,
    marginHorizontal: 5,
  },
  secondaryButtonText: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
  },
  // Viewer actions
  viewerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  messageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderWidth: 2,
    borderColor: "#4A90E2",
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: "#fff",
  },
  messageButtonText: {
    color: "#4A90E2",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  bookButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    marginLeft: 10,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default ActionButtons;

import React from "react";
import { TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { chatService } from "../../services/chatService";

interface MessageButtonProps {
  caregiverId: number;
  caregiverName: string;
  caregiverAvatar?: string;
  style?: any;
  size?: "small" | "medium" | "large";
  variant?: "primary" | "secondary" | "outline";
}

const MessageButton: React.FC<MessageButtonProps> = ({
  caregiverId,
  caregiverName,
  caregiverAvatar,
  style,
  size = "medium",
  variant = "primary",
}) => {
  const router = useRouter();

  const handlePress = async () => {
    try {
      // Get current user data
      const userDataString = await AsyncStorage.getItem("currentUser");
      if (!userDataString) {
        Alert.alert("Error", "Please login to send messages");
        return;
      }

      const currentUser = JSON.parse(userDataString);

      if (currentUser.id === caregiverId) {
        Alert.alert("Error", "You cannot send a message to yourself");
        return;
      }

      // Generate chat ID
      const chatId = chatService.generateChatId(currentUser.id, caregiverId);

      console.log("Starting chat:", {
        currentUserId: currentUser.id,
        caregiverId,
        chatId,
        caregiverName,
      });

      // Navigate to chat screen
      router.push({
        pathname: "/pages/ChatFunction/ChatMessageScreen",
        params: {
          chatId,
          participantId: caregiverId,
          participantName: caregiverName,
          participantAvatar: caregiverAvatar || "",
          participantType: "caregiver",
        },
      });
    } catch (error) {
      console.error("Error starting chat:", error);
      Alert.alert("Error", "Failed to start conversation. Please try again.");
    }
  };

  const getButtonStyles = () => {
    const baseStyle = [styles.button, styles[size]];

    switch (variant) {
      case "primary":
        return [...baseStyle, styles.primary];
      case "secondary":
        return [...baseStyle, styles.secondary];
      case "outline":
        return [...baseStyle, styles.outline];
      default:
        return [...baseStyle, styles.primary];
    }
  };

  const getTextStyles = () => {
    const baseStyle = [styles.buttonText, styles[`${size}Text`]];

    switch (variant) {
      case "primary":
        return [...baseStyle, styles.primaryText];
      case "secondary":
        return [...baseStyle, styles.secondaryText];
      case "outline":
        return [...baseStyle, styles.outlineText];
      default:
        return [...baseStyle, styles.primaryText];
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "small":
        return 16;
      case "medium":
        return 20;
      case "large":
        return 24;
      default:
        return 20;
    }
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyles(), style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons
        name="chatbubble"
        size={getIconSize()}
        color={variant === "outline" ? "#67B3FF" : "#fff"}
        style={styles.icon}
      />
      <Text style={getTextStyles()}>Message</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  // Sizes
  small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  // Variants
  primary: {
    backgroundColor: "#67B3FF",
  },
  secondary: {
    backgroundColor: "#f0f0f0",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#67B3FF",
  },
  // Text styles
  buttonText: {
    fontWeight: "600",
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  primaryText: {
    color: "#fff",
  },
  secondaryText: {
    color: "#333",
  },
  outlineText: {
    color: "#67B3FF",
  },
  icon: {
    marginRight: 6,
  },
});

export default MessageButton;

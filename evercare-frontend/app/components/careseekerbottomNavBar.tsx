import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface BottomNavBarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const router = useRouter();
  // const { totalUnreadCount } = useChatContext(); // Temporarily disabled

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() =>
          setActiveTab
            ? setActiveTab("home")
            : router.push("/pages/Careseeker/MainFeed")
        }
      >
        <Ionicons
          name={activeTab === "home" ? "home" : "home-outline"}
          size={24}
          color={activeTab === "home" ? "#67B3FF" : "#666"}
        />
        <Text
          style={[styles.navText, activeTab === "home" && styles.activeNavText]}
        >
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/pages/Careseeker/CareseekerProfile")}
      >
        <Ionicons
          name={activeTab === "profile" ? "person" : "person-outline"}
          size={24}
          color={activeTab === "profile" ? "#67B3FF" : "#666"}
        />
        <Text
          style={[
            styles.navText,
            activeTab === "profile" && styles.activeNavText,
          ]}
        >
          Profile
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/pages/ChatFunction/ChatList")}
      >
        <View style={styles.messageIconContainer}>
          <Ionicons
            name={activeTab === "message" ? "chatbubble" : "chatbubble-outline"}
            size={24}
            color={activeTab === "message" ? "#67B3FF" : "#666"}
          />
          {/* Temporarily disabled unread count */}
          {false && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{0 > 99 ? "99+" : 0}</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.navText,
            activeTab === "message" && styles.activeNavText,
          ]}
        >
          Message
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/pages/Careseeker/BookingNotifications")}
      >
        <View style={styles.notificationIconContainer}>
          <Ionicons
            name={
              activeTab === "notification"
                ? "notifications"
                : "notifications-outline"
            }
            size={24}
            color={activeTab === "notification" ? "#67B3FF" : "#666"}
          />
          {/* TODO: Add unread count badge here when notification context is implemented */}
        </View>
        <Text
          style={[
            styles.navText,
            activeTab === "notification" && styles.activeNavText,
          ]}
        >
          Notifications
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingBottom: 5,
  },
  navItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageIconContainer: {
    position: "relative",
  },
  notificationIconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ff6b6b",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  navText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  activeNavText: {
    color: "#67B3FF",
  },
});

export default BottomNavBar;

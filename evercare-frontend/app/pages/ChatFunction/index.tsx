import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import ChatList from "../ChatFunction/ChatList";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CaregiverBottomNavBar from "../../components/caregiverBottomNavbar";
import CareseekerbottomNavBar from "../../components/careseekerbottomNavBar";
import { socketService } from "../../../services/socketService";

const ChatListPage = () => {
  useEffect(() => {
    // Initialize socket connection when chat page loads
    const initializeChat = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("currentUser");
        const userData = userDataString ? JSON.parse(userDataString) : null;

        if (userData) {
          const userType = (
            userData.userType === "caregiver" ? "caregiver" : "careseeker"
          ) as "caregiver" | "careseeker";
          socketService.connect(userData.id, userType);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    initializeChat();
  }, []);

  const getUserType = async (): Promise<"caregiver" | "careseeker"> => {
    try {
      const userDataString = await AsyncStorage.getItem("currentUser");
      const userData = userDataString ? JSON.parse(userDataString) : null;
      return userData?.userType || "careseeker";
    } catch (error) {
      console.error("Error getting user type:", error);
      return "careseeker";
    }
  };

  const [userType, setUserType] = React.useState<"caregiver" | "careseeker">(
    "careseeker"
  );

  React.useEffect(() => {
    getUserType().then(setUserType);
  }, []);

  return (
    <View style={styles.container}>
      <ChatList userType={userType} />
      {userType === "caregiver" ? (
        <CaregiverBottomNavBar activeTab="message" />
      ) : (
        <CareseekerbottomNavBar activeTab="message" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default ChatListPage;

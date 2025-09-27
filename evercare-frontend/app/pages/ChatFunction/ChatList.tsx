import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { chatService, ChatConversation } from "../../../services/chatService";
import { userService } from "../../../services/userService";

interface ChatListProps {
  userType: "caregiver" | "careseeker";
}

// Temporary mock data for testing
const mockChatList = [
  {
    id: "1_2",
    participant: {
      id: 2,
      name: "John Doe",
      userType: "caregiver" as const,
      avatar: "https://via.placeholder.com/50x50?text=JD",
      isOnline: true,
    },
    lastMessage: {
      id: "1",
      senderId: 2,
      receiverId: 1,
      content: "Hello, how can I help you?",
      timestamp: new Date(),
    },
    unreadCount: 2,
    updatedAt: new Date(),
  },
  {
    id: "1_3",
    participant: {
      id: 3,
      name: "Sarah Wilson",
      userType: "careseeker" as const,
      avatar: "https://via.placeholder.com/50x50?text=SW",
      isOnline: false,
    },
    lastMessage: {
      id: "2",
      senderId: 3,
      receiverId: 1,
      content: "Thank you for your help!",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 86400000),
  },
];

const ChatList: React.FC<ChatListProps> = ({ userType }) => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [chatList, setChatList] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load current user and fetch conversations
  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("currentUser");
      console.log("Raw user data from AsyncStorage:", userDataString);
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        console.log("Parsed user data:", userData);
        setCurrentUser(userData);
        
        const userId = userData.id || userData.careseekerId || userData.caregiverId;
        console.log("Using user ID for conversations:", userId);
        
        if (userId) {
          await fetchConversations(userId);
        } else {
          console.error("No valid user ID found in user data");
          setLoading(false);
        }
      } else {
        console.log("No user data found in AsyncStorage");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error loading current user:", error);
      setLoading(false);
    }
  };

  const fetchUserData = async (userId: number, userType: string) => {
    try {
      if (userType === 'caregiver') {
        return await userService.getCaregiverProfile(userId);
      } else {
        return await userService.getCareseekerProfile(userId);
      }
    } catch (error) {
      console.error(`Error fetching ${userType} data for user ${userId}:`, error);
      return null;
    }
  };

  const fetchConversations = async (userId: number) => {
    try {
      setLoading(true);
      console.log("Fetching conversations for user:", userId);
      const conversations = await chatService.getConversations(userId);
      console.log("Fetched conversations:", conversations);
      
      // Process conversations to ensure they have proper participant data
      const processedConversations = conversations.map((conv, index) => {
        console.log(`Processing conversation ${index}:`, conv);
        
        // If participant data is missing or invalid, create proper fallback
        if (!conv.participant || !conv.participant.id || conv.participant.id === 0 || 
            !conv.participant.name || conv.participant.name.includes('undefined')) {
          
          // Try to extract participant ID from chatId (format: "userId1_userId2")
          const chatIdParts = conv.id ? conv.id.split('_') : [];
          const otherUserId = chatIdParts.find(id => id !== userId.toString() && id !== '');
          
          console.log(`Fixing participant data for chat ${conv.id}:`, {
            originalParticipant: conv.participant,
            chatIdParts,
            otherUserId,
            currentUserId: userId
          });
          
          // If we can't extract a valid user ID, skip this conversation
          if (!otherUserId || isNaN(Number(otherUserId))) {
            console.log(`Skipping conversation ${conv.id} - no valid participant ID`);
            return null; // This will filter out invalid conversations
          }
          
          // Determine user type based on current user type
          const currentUserType = currentUser?.userType || 'careseeker';
          const otherUserType = currentUserType === 'caregiver' ? 'careseeker' : 'caregiver';
          
          // Try to fetch user data for better participant information
          fetchUserData(Number(otherUserId), otherUserType).then(userData => {
            if (userData) {
              conv.participant = {
                id: Number(otherUserId),
                name: userData.name || `User ${otherUserId}`,
                userType: otherUserType,
                avatar: (userData as any).avatar || (userData as any).profileImage || (userData as any).profilePhoto || '',
                isOnline: false,
              };
            } else {
              conv.participant = {
                id: Number(otherUserId),
                name: `User ${otherUserId}`,
                userType: otherUserType,
                avatar: '',
                isOnline: false,
              };
            }
          }).catch(() => {
            // Fallback if user data fetch fails
            conv.participant = {
              id: Number(otherUserId),
              name: `User ${otherUserId}`,
              userType: otherUserType,
              avatar: '',
              isOnline: false,
            };
          });
        }
        
        console.log(`Processed conversation ${index}:`, conv);
        return conv;
      }).filter(conv => conv !== null); // Filter out invalid conversations
      
      console.log("Final processed conversations:", processedConversations);
      setChatList(processedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      console.log("ChatService unavailable, showing empty state");
      setChatList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!currentUser) return;

    setRefreshing(true);
    try {
      await fetchConversations(currentUser.id || currentUser.careseekerId);
    } finally {
      setRefreshing(false);
    }
  };

  const handleChatPress = (chatId: string, participant: any) => {
    console.log("Opening chat with participant:", participant);
    console.log("Chat ID:", chatId);
    
    // Validate participant data
    if (!participant || !participant.id) {
      console.error("Invalid participant data:", participant);
      Alert.alert(
        "Chat Error", 
        "Unable to open this chat. The participant information is missing.",
        [{ text: "OK" }]
      );
      return;
    }

    // Additional validation
    if (!chatId) {
      console.error("Missing chat ID");
      Alert.alert(
        "Chat Error", 
        "Unable to open this chat. Chat ID is missing.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      router.push({
        pathname: "/pages/ChatFunction/ChatMessageScreen",
        params: {
          chatId,
          participantId: participant.id.toString(),
          participantName: participant.name || "Unknown User",
          participantAvatar: participant.avatar || "",
          participantType: participant.userType || "caregiver",
        },
      });
    } catch (error) {
      console.error("Error navigating to chat:", error);
      Alert.alert(
        "Navigation Error", 
        "Unable to open the chat. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const renderChatItem = ({ item }: { item: any }) => {
    console.log("Rendering chat item:", item);
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(item.id, item.participant)}
      >
        <View style={styles.avatarContainer}>
          {item.participant.avatar ? (
            <Image
              source={{
                uri: item.participant.avatar,
              }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.defaultAvatarText}>
                {item.participant.name ? item.participant.name.charAt(0).toUpperCase() : "?"}
              </Text>
            </View>
          )}
          {item.participant.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.name}>
              {item.participant?.name || "Unknown User"}
            </Text>
            <Text style={styles.timestamp}>
              {item.lastMessage
                ? new Date(item.lastMessage.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </Text>
          </View>

          <View style={styles.messageContainer}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage?.content || "No messages yet"}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {item.unreadCount > 99 ? "99+" : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>

        <TouchableOpacity
          style={styles.newChatButton}
          onPress={() => {
            console.log("=== DEBUG INFO ===");
            console.log("Current user:", currentUser);
            console.log("Chat list:", chatList);
            console.log("Loading:", loading);
            Alert.alert(
              "Debug Info",
              `Current User: ${JSON.stringify(currentUser, null, 2)}\n\nChat List: ${JSON.stringify(chatList, null, 2)}`,
              [{ text: "OK" }]
            );
          }}
        >
          <Ionicons name="bug-outline" size={24} color="#67B3FF" />
        </TouchableOpacity>
      </View>

      {chatList.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>
            {loading ? "Loading conversations..." : "No conversations yet"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {loading
              ? "Please wait..."
              : "Start a conversation by tapping the + button above"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={chatList}
          renderItem={renderChatItem}
          keyExtractor={(item, index) => item.id || `chat_${index}`}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#67B3FF"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    minHeight: 50,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  connectionText: {
    fontSize: 10,
    color: "#ff6b6b",
    marginLeft: 2,
  },
  newChatButton: {
    padding: 4,
  },
  chatItem: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    minHeight: 60,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#67B3FF",
    justifyContent: "center",
    alignItems: "center",
  },
  defaultAvatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    borderWidth: 1,
    borderColor: "#fff",
  },
  chatInfo: {
    flex: 1,
    justifyContent: "center",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 10,
    color: "#666",
  },
  messageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    flex: 1,
    fontSize: 12,
    color: "#666",
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: "#67B3FF",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  unreadCount: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cancelButton: {
    color: "#67B3FF",
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchResults: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  searchInfo: {
    flex: 1,
  },
  searchName: {
    fontSize: 16,
    fontWeight: "500",
  },
  searchUserType: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptySearchResults: {
    padding: 40,
    alignItems: "center",
  },
  emptySearchText: {
    fontSize: 16,
    color: "#666",
  },
});

export default ChatList;

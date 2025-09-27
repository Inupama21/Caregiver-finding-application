import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { chatService } from "../../../services/chatService"; // Still needed for history
import { socketService, ChatMessage, SendMessagePayload } from "../../../services/socketService";

const ChatMessageScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const flatListRef = useRef<FlatList>(null);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const chatId = params.chatId as string;
    const participantId = Number(params.participantId);
    const participantName = params.participantName as string;
    // ... other params

    // Load user, connect socket, and fetch initial message history
    useEffect(() => {
        const initialize = async () => {
            try {
                const userDataString = await AsyncStorage.getItem("currentUser");
                if (!userDataString) throw new Error("User not logged in");
                const userData = JSON.parse(userDataString);
                const currentUserId = userData.id || userData.careseekerId || userData.caregiverId;
                setCurrentUser({ ...userData, id: currentUserId });

                // Connect to socket
                socketService.connect(currentUserId, userData.userType || 'careseeker');
                socketService.joinChat(chatId);

                // Fetch initial message history via HTTP
                const history = await chatService.getMessages({ user1: currentUserId, user2: participantId });
                setMessages(history);
                
                // Mark messages as read
                await chatService.markMessagesAsRead({ readerId: currentUserId, senderId: participantId });

            } catch (error) {
                console.error("Initialization error:", error);
                Alert.alert("Error", "Could not load chat.");
            } finally {
                setLoading(false);
            }
        };

        initialize();

        return () => {
            socketService.leaveChat(chatId);
            // Consider if you want to call socketService.disconnect() here or manage it globally
        };
    }, [chatId, participantId]);
    
    // Listen for incoming messages
    useEffect(() => {
        const handleNewMessage = (message: ChatMessage) => {
            // Check if the message belongs to this chat
            const messageChatId = socketService.generateChatId(message.senderId, message.receiverId);
            if (messageChatId === chatId) {
                setMessages(prev => [...prev, message]);
                // If the current user is the receiver, mark it as read immediately
                if (currentUser?.id === message.receiverId) {
                    chatService.markMessagesAsRead({ readerId: currentUser.id, senderId: message.senderId });
                }
            }
        };
        
        const unsubscribe = socketService.onNewMessage(handleNewMessage);
        return unsubscribe; // Cleanup listener on unmount
    }, [chatId, currentUser]);


    const handleSendMessage = () => {
        if (!newMessage.trim() || !currentUser) return;

        const payload: SendMessagePayload = {
            senderId: currentUser.id,
            receiverId: participantId,
            content: newMessage.trim(),
        };

        // --- SIMPLIFIED SENDING LOGIC ---
        // Only emit the event. The server will handle saving and broadcasting.
        socketService.sendMessage(payload);
        
        setNewMessage(""); // Clear input immediately
    };

    const isCurrentUserMessage = (message: ChatMessage): boolean => {
        return message.senderId === currentUser?.id;
    };
    
    // Your renderMessage, styles, and other UI logic can remain largely the same.
    // Just ensure you handle `item.id` which is now a number.
    
    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} /></TouchableOpacity>
                <Text style={styles.headerTitle}>{participantName}</Text>
            </View>

            {/* Message List */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={isCurrentUserMessage(item) ? styles.currentUserMessage : styles.otherUserMessage}>
                        <Text style={{color: isCurrentUserMessage(item) ? 'white' : 'black'}}>{item.content}</Text>
                    </View>
                )}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />

            {/* Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message..."
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                    <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

// Add your full StyleSheet here...
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
    inputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#eee' },
    input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10 },
    sendButton: { backgroundColor: '#007AFF', borderRadius: 20, padding: 12, marginLeft: 10 },
    currentUserMessage: { alignSelf: 'flex-end', backgroundColor: '#007AFF', borderRadius: 15, padding: 10, marginVertical: 5, maxWidth: '80%' },
    otherUserMessage: { alignSelf: 'flex-start', backgroundColor: '#E5E5EA', borderRadius: 15, padding: 10, marginVertical: 5, maxWidth: '80%' }
});

export default ChatMessageScreen;

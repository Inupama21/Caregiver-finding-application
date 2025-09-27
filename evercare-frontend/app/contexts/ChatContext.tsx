import React, { createContext, useContext } from "react";

// Define ChatParticipant interface
interface ChatParticipant {
  id: number;
  name: string;
  userType: string;
  avatar?: string;
}

// Minimal ChatContext interface for backwards compatibility
interface ChatContextType {
  isConnected: boolean;
  currentUser: ChatParticipant | null;
  chatList: any[];
  refreshChatList: () => Promise<void>;
  activeChat: string | null;
  activeChatMessages: any[];
  setActiveChat: (chatId: string | null) => void;
  sendMessage: (receiverId: number, content: string) => Promise<void>;
  markAsRead: (chatId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<ChatParticipant[]>;
  startChat: (participant: ChatParticipant) => Promise<string>;
  typingUsers: { [chatId: string]: number[] };
  sendTyping: (receiverId: number, isTyping: boolean) => void;
  totalUnreadCount: number;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

// Minimal stub implementation - not used in our current chat implementation
export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const value: ChatContextType = {
    isConnected: false,
    currentUser: null,
    chatList: [],
    refreshChatList: async () => {},
    activeChat: null,
    activeChatMessages: [],
    setActiveChat: () => {},
    sendMessage: async () => {},
    markAsRead: async () => {},
    searchUsers: async () => [],
    startChat: async () => "",
    typingUsers: {},
    sendTyping: () => {},
    totalUnreadCount: 0,
    connect: async () => {},
    disconnect: () => {},
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

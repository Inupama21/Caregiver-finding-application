import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PostCardProps {
  id: number;
  text: string;
  image?: string | null;
  timestamp: string;
  likes: number;
  isOwnProfile?: boolean;
  onLike?: (postId: number) => void;
  onEdit?: (postId: number) => void;
  onDelete?: (postId: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  id,
  text,
  image,
  timestamp,
  likes,
  isOwnProfile = false,
  onLike,
  onEdit,
  onDelete,
}) => {
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toDateString();
    } catch {
      return timestamp;
    }
  };

  return (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <Text style={styles.postDate}>{formatTimestamp(timestamp)}</Text>
        {isOwnProfile && (
          <View style={styles.postActions}>
            <TouchableOpacity
              onPress={() => onEdit?.(id)}
              style={styles.actionButton}
            >
              <Ionicons name="create-outline" size={18} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete?.(id)}
              style={styles.actionButton}
            >
              <Ionicons name="trash-outline" size={18} color="#ff4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Post Content */}
      <Text style={styles.postText}>{text}</Text>

      {/* Post Image */}
      {image && <Image source={{ uri: image }} style={styles.postImage} />}

      {/* Post Stats and Actions */}
      <View style={styles.postFooter}>
        <View style={styles.postStats}>
          <TouchableOpacity
            style={styles.statButton}
            onPress={() => onLike?.(id)}
          >
            <Ionicons name="heart-outline" size={20} color="#666" />
            <Text style={styles.statText}>{likes}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  postDate: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  postActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 5,
    marginLeft: 5,
  },
  postText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 12,
    resizeMode: "cover",
  },
  postFooter: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  postStats: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  statButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    padding: 5,
  },
  statText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
    fontWeight: "500",
  },
});

export default PostCard;

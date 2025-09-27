import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StarRating from "./StarRating";
import { Review } from "../../../services/reviewService";

interface ReviewCardProps {
  review: Review;
  showCareseeker?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  showCareseeker = true,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {/* Review Header */}
      <View style={styles.header}>
        <View style={styles.reviewerInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#666" />
          </View>
          <View style={styles.reviewerDetails}>
            {showCareseeker && (
              <Text style={styles.reviewerName}>
                Careseeker #{review.careseekerId}
              </Text>
            )}
            <Text style={styles.reviewDate}>
              {formatDate(review.createdAt)}
            </Text>
          </View>
        </View>
        <StarRating rating={review.rating} size={16} />
      </View>

      {/* Review Comment */}
      {review.comment && <Text style={styles.comment}>{review.comment}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: "#666",
  },
  comment: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});

export default ReviewCard;

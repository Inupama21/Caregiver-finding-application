import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ProfileStatsProps {
  rating: number;
  reviews: number;
  clients: number;
  completedJobs: number;
  hourlyRate?: string;
  availability?: string;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  rating,
  reviews,
  clients,
  completedJobs,
  hourlyRate,
  availability,
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={16}
          color="#E0E0E0"
        />
      );
    }

    return stars;
  };

  return (
    <View style={styles.container}>
      {/* Rating Section */}
      <View style={styles.ratingSection}>
        <View style={styles.starsContainer}>{renderStars(rating)}</View>
        <Text style={styles.ratingText}>
          {rating} ({reviews} reviews)
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{clients}</Text>
          <Text style={styles.statLabel}>Clients</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completedJobs}</Text>
          <Text style={styles.statLabel}>Jobs Done</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{reviews}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
      </View>

      {/* Additional Info */}
      {(hourlyRate || availability) && (
        <View style={styles.additionalInfo}>
          {hourlyRate && (
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={20} color="#4A90E2" />
              <Text style={styles.infoText}>{hourlyRate}</Text>
            </View>
          )}
          {availability && (
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#4A90E2" />
              <Text style={styles.infoText}>{availability}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ratingSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A90E2",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  additionalInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 15,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
    fontWeight: "500",
  },
});

export default ProfileStats;

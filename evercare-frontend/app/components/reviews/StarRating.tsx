import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StarRatingProps {
  rating: number;
  size?: number;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
  color?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 20,
  editable = false,
  onRatingChange,
  color = "#FFD700",
}) => {
  const renderStar = (index: number) => {
    const filled = index <= rating;

    if (editable) {
      return (
        <TouchableOpacity
          key={index}
          onPress={() => onRatingChange?.(index)}
          style={styles.starButton}
        >
          <Ionicons
            name={filled ? "star" : "star-outline"}
            size={size}
            color={color}
          />
        </TouchableOpacity>
      );
    }

    return (
      <Ionicons
        key={index}
        name={filled ? "star" : "star-outline"}
        size={size}
        color={color}
      />
    );
  };

  return (
    <View style={styles.container}>{[1, 2, 3, 4, 5].map(renderStar)}</View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  starButton: {
    padding: 2,
  },
});

export default StarRating;

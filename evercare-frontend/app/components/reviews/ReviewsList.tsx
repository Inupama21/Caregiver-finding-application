import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReviewCard from "./ReviewCard";
import {
  reviewService,
  Review,
  CaregiverRating,
  ReviewsResponse,
} from "../../../services/reviewService";
import StarRating from "./StarRating";

interface ReviewsListProps {
  caregiverId: number;
  showAddReviewButton?: boolean;
  onAddReviewPress?: () => void;
  refreshTrigger?: number; 
  useFlatList?: boolean;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  caregiverId,
  showAddReviewButton = false,
  onAddReviewPress,
  refreshTrigger,
  useFlatList = true,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<CaregiverRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 10;

  const fetchRating = async () => {
    try {
      console.log('Fetching rating for caregiverId:', caregiverId);
      const ratingData = await reviewService.getCaregiverRating(caregiverId);
      console.log('Rating data received:', ratingData);
      setRating(ratingData);
    } catch (error) {
      console.error("Error fetching rating:", error);
      setError(`Failed to load rating: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const fetchReviews = async (pageNum: number = 1, append: boolean = false) => {
    try {
      console.log('Fetching reviews for caregiverId:', caregiverId, 'page:', pageNum);
      
      if (!append) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const reviewsData: ReviewsResponse =
        await reviewService.getCaregiverReviews(caregiverId, pageNum, limit);

      console.log('Reviews data received:', reviewsData);

      if (append) {
        setReviews((prev) => [...prev, ...reviewsData.reviews]);
      } else {
        setReviews(reviewsData.reviews);
      }

      setHasMore(pageNum < reviewsData.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError(`Failed to load reviews: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchRating();
    fetchReviews(1, false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchReviews(page + 1, true);
    }
  };

  // Initial load
  useEffect(() => {
   
    console.log('caregiverId:', caregiverId);
    console.log('showAddReviewButton:', showAddReviewButton);
    console.log('refreshTrigger:', refreshTrigger);
  
    
    fetchRating();
    fetchReviews();
  }, [caregiverId]);

  // Refresh when refreshTrigger changes 
  useEffect(() => {
    if (refreshTrigger) {
      handleRefresh();
    }
  }, [refreshTrigger]);

  const renderReviewItem = ({ item }: { item: Review }) => (
    <ReviewCard review={item} />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Rating Summary */}
      {rating && (
        <View style={styles.ratingSummary}>
          <View style={styles.ratingDisplay}>
            <Text style={styles.averageRating}>
              {rating.averageRating.toFixed(1)}
            </Text>
            <StarRating rating={Math.round(rating.averageRating)} size={20} />
          </View>
          <Text style={styles.totalReviews}>
            Based on {rating.totalReviews} review
            {rating.totalReviews !== 1 ? "s" : ""}
          </Text>
        </View>
      )}

      {/* Add Review Button */}
      {showAddReviewButton && onAddReviewPress && (
        <TouchableOpacity
          style={styles.addReviewButton}
          onPress={onAddReviewPress}
        >
          <Ionicons name="add-circle-outline" size={20} color="#4A90E2" />
          <Text style={styles.addReviewText}>Add Review</Text>
        </TouchableOpacity>
      )}

      {/* Reviews Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Reviews ({rating?.totalReviews || 0})
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#4A90E2" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#E74C3C" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.centered}>
        <Ionicons name="chatbubble-outline" size={48} color="#B0B0B0" />
        <Text style={styles.emptyText}>No reviews yet</Text>
        <Text style={styles.emptySubtext}>
          Be the first to review this caregiver!
        </Text>
      </View>
    );
  };

  if (useFlatList) {
    return (
      <View style={styles.container}>
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.reviewId.toString()}
          renderItem={renderReviewItem}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#4A90E2"]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            reviews.length === 0 ? styles.emptyContainer : undefined
          }
        />
      </View>
    );
  }

  // For use inside ScrollView
  return (
    <View style={styles.container}>
      {renderHeader()}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.scrollViewLoadingText}>Loading reviews...</Text>
        </View>
      ) : error ? (
        <View style={styles.scrollViewErrorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.scrollViewErrorText}>{error}</Text>
          <TouchableOpacity style={styles.scrollViewRetryButton} onPress={handleRefresh}>
            <Text style={styles.scrollViewRetryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : reviews.length === 0 ? (
        renderEmpty()
      ) : (
        <View style={styles.reviewsContainer}>
          {reviews.map((review) => (
            <View key={review.reviewId}>
              {renderReviewItem({ item: review })}
            </View>
          ))}
          {loadingMore && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color="#4A90E2" />
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            </View>
          )}
          {hasMore && !loadingMore && (
            <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
              <Text style={styles.loadMoreButtonText}>Load More</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {renderFooter()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 15,
  },
  ratingSummary: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
  },
  ratingDisplay: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  averageRating: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginRight: 10,
  },
  totalReviews: {
    fontSize: 14,
    color: "#666",
  },
  addReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#4A90E2",
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    alignSelf: "flex-start",
  },
  addReviewText: {
    color: "#4A90E2",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: "#E74C3C",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  reviewsContainer: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  scrollViewLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666666",
  },
  scrollViewErrorContainer: {
    padding: 20,
    alignItems: "center",
  },
  scrollViewErrorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#FF6B6B",
    textAlign: "center",
  },
  scrollViewRetryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#4A90E2",
    borderRadius: 8,
  },
  scrollViewRetryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingMoreContainer: {
    padding: 15,
    alignItems: "center",
  },
  loadingMoreText: {
    marginTop: 5,
    fontSize: 14,
    color: "#666666",
  },
  loadMoreButton: {
    margin: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    alignItems: "center",
  },
  loadMoreButtonText: {
    fontSize: 16,
    color: "#4A90E2",
    fontWeight: "600",
  },
});

export default ReviewsList;

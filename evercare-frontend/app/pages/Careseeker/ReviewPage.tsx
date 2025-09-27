import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { reviewService, CreateReviewRequest } from '../../../services/reviewService';
import StarRating from '../../components/reviews/StarRating';

const ReviewPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { user: currentUser, loading: userLoading } = useCurrentUser();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Extract caregiver information from params
  const caregiverId = params.caregiverId ? parseInt(params.caregiverId as string) : null;
  const caregiverName = params.caregiverName as string || 'the caregiver';

  useEffect(() => {
    console.log('=== ReviewPage Debug ===');
    console.log('Params:', params);
    console.log('CaregiverId:', caregiverId);
    console.log('CurrentUser:', currentUser);
    console.log('UserLoading:', userLoading);
    console.log('========================');
    
    
    if (!userLoading && (!caregiverId || !currentUser)) {
      console.log('Missing required information - caregiverId:', caregiverId, 'currentUser:', currentUser);
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Required information is missing. Redirecting back...',
        visibilityTime: 3000,
      });
      router.back();
      return;
    }
  }, [caregiverId, currentUser, userLoading, router]);

  const handleSubmit = async () => {
    if (rating === 0) {
      Toast.show({
        type: 'error',
        text1: 'Rating Required',
        text2: 'Please select a rating before submitting.',
        visibilityTime: 3000,
      });
      return;
    }

    if (!caregiverId || !currentUser) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Required information is missing. Please try again.',
        visibilityTime: 3000,
      });
      return;
    }

    setSubmitting(true);

    try {
      const reviewData: CreateReviewRequest = {
        caregiverId,
        careseekerId: currentUser.id,
        rating,
        comment: comment.trim(),
      };

      await reviewService.createReview(reviewData);

      Toast.show({
        type: 'success',
        text1: 'Review Submitted!',
        text2: 'Thank you for your review. Redirecting to caregiver profile...',
        visibilityTime: 3000,
      });

      
      setTimeout(() => {
        router.push({
          pathname: '/pages/Careseeker/CaregiverProfileView',
          params: {
            caregiverId: caregiverId.toString(),
            caregiverName: caregiverName,
            showReviews: 'true', 
            refreshReviews: Date.now().toString(), 
            reviewSubmitted: 'true', 
            paymentCompleted: params.paymentCompleted || 'false', 
          },
        });
      }, 2000);
    } catch (error) {
      console.error('Error submitting review:', error);
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: 'Failed to submit review. Please try again later.',
        visibilityTime: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading while user data is being fetched
  if (userLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading user information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!caregiverId || !currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {!caregiverId ? 'Loading caregiver information...' : 
             !currentUser ? 'Loading user information...' : 'Loading...'}
          </Text>
          <Text style={[styles.loadingText, { fontSize: 12, marginTop: 8, color: '#999' }]}>
            CaregiverId: {caregiverId || 'null'} | User: {currentUser ? 'loaded' : 'null'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Write a Review</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          How was your experience with {caregiverName}?
        </Text>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>Rating *</Text>
          <View style={styles.starContainer}>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size={40}
              editable={true}
            />
          </View>
          <Text style={styles.ratingText}>
            {rating === 0 ? 'Tap to rate' : 
             rating === 1 ? 'Poor' :
             rating === 2 ? 'Fair' :
             rating === 3 ? 'Good' :
             rating === 4 ? 'Very Good' : 'Excellent'}
          </Text>
        </View>

        {/* Comment Section */}
        <View style={styles.commentSection}>
          <Text style={styles.commentLabel}>Comment (Optional)</Text>
          <View style={styles.commentContainer}>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Share your experience with this caregiver..."
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.characterCount}>{comment.length}/500</Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="star" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  ratingSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  starContainer: {
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  commentSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  commentContainer: {
    position: 'relative',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ReviewPage;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Star, X, Check } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import type { RootStackParamList } from '../navigation/types';
import { reviewService } from '../services/review';
import { eventsService } from '../services/events';
import type { EventParticipant, CreateReviewRequest } from '../types/api';

type RouteParams = RouteProp<RootStackParamList, 'EventReview'>;

export default function EventReview() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { eventId, eventTitle } = route.params;

  const [placeRating, setPlaceRating] = useState(0);
  const [planRating, setPlanRating] = useState(0);
  const [comment, setComment] = useState('');
  const [members, setMembers] = useState<EventParticipant[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    loadEventMembers();
  }, [eventId]);

  const loadEventMembers = async () => {
    try {
      setLoading(true);
      const event = await eventsService.getById(eventId);
      setMembers(event.participants || []);
    } catch (error) {
      console.error('Failed to load event members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const renderStarRating = (rating: number, onRatingChange: (rating: number) => void) => {
    return (
      <View className="flex-row gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingChange(star)}
            className="p-1"
          >
            <Star
              size={32}
              color={star <= rating ? '#FFD700' : '#666'}
              fill={star <= rating ? '#FFD700' : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSubmit = async () => {
    if (placeRating === 0 || planRating === 0) {
      Alert.alert('Required', 'Please rate both the place and plan');
      return;
    }

    try {
      setSubmitLoading(true);
      
      const reviewData: CreateReviewRequest = {
        placeRating,
        planRating,
        comment: comment.trim() || undefined,
        connectedUserIds: selectedUserIds
      };

      const response = await reviewService.submitReview(eventId, reviewData);
      
      if (response.circleAdded > 0) {
        Alert.alert(
          'Success!', 
          `Review submitted! Connected with ${response.circleAdded} people.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Success!', 
          'Review submitted!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <BlurView intensity={95} tint="dark" className="absolute inset-0" />
      
      <View 
        className="flex-1"
        style={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }}
      >
        <View className="flex-row justify-between items-center px-6 mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white/10 justify-center items-center"
          >
            <X size={24} color="white" />
          </TouchableOpacity>
          
          <Text className="text-white text-lg font-semibold flex-1 text-center mx-4" numberOfLines={1}>
            Review Event
          </Text>
          
          <View className="w-10" />
        </View>

        <ScrollView 
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-white text-xl font-bold mb-2 text-center">
            {eventTitle}
          </Text>
          <Text className="text-white/60 text-base text-center mb-8">
            How was your experience?
          </Text>

          <View className="bg-white/5 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-semibold mb-4">Rate the Place</Text>
            <View className="items-center">
              {renderStarRating(placeRating, setPlaceRating)}
            </View>
          </View>

          <View className="bg-white/5 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-semibold mb-4">Rate the Plan</Text>
            <View className="items-center">
              {renderStarRating(planRating, setPlanRating)}
            </View>
          </View>

          <View className="bg-white/5 rounded-2xl p-6 mb-6">
            <Text className="text-white text-lg font-semibold mb-4">
              Add a Comment (Optional)
            </Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Share your thoughts about the event..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              className="bg-white/5 rounded-xl p-4 text-white text-base"
              style={{ textAlignVertical: 'top' }}
            />
          </View>

          {members.length > 0 && (
            <View className="bg-white/5 rounded-2xl p-6 mb-6">
              <Text className="text-white text-lg font-semibold mb-4">
                People You Connected With
              </Text>
              <Text className="text-white/60 text-sm mb-4">
                Select people you made meaningful connections with at this event
              </Text>
              
              {loading ? (
                <Text className="text-white/60 text-center py-4">Loading members...</Text>
              ) : (
                <View className="flex-row flex-wrap gap-3">
                  {members.map((member) => {
                    const isSelected = selectedUserIds.includes(member.id);
                    return (
                      <TouchableOpacity
                        key={member.id}
                        onPress={() => handleUserToggle(member.id)}
                        className={`flex-row items-center p-3 rounded-xl border-2 ${
                          isSelected 
                            ? 'bg-[#cc5c24]/20 border-[#cc5c24]' 
                            : 'bg-white/5 border-white/20'
                        }`}
                      >
                        {member.avatar ? (
                          <Image
                            source={{ uri: member.avatar }}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        ) : (
                          <View className="w-8 h-8 rounded-full bg-[#cc5c24] justify-center items-center mr-3">
                            <Text className="text-white text-sm font-semibold">
                              {member.name?.charAt(0)?.toUpperCase() || '?'}
                            </Text>
                          </View>
                        )}
                        
                        <Text className="text-white text-sm font-medium flex-1">
                          {member.name}
                        </Text>
                        
                        {isSelected && (
                          <Check size={16} color="#cc5c24" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View className="px-6 pt-4">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitLoading || placeRating === 0 || planRating === 0}
            className={`h-14 rounded-2xl justify-center items-center ${
              submitLoading || placeRating === 0 || planRating === 0
                ? 'bg-white/20'
                : 'bg-[#cc5c24]'
            }`}
          >
            <Text className="text-white text-lg font-semibold">
              {submitLoading ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
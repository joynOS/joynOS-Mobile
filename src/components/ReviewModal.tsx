import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StatusBar,
  Alert,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Star } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "./Button";
import { reviewService } from "../services/review";
import type { EventDetail, EventParticipant } from "../types/api";

interface ReviewModalProps {
  visible: boolean;
  event: EventDetail;
  onClose: (reviewSubmitted: boolean) => void;
}

const { height: screenHeight } = Dimensions.get("window");

export default function ReviewModal({
  visible,
  event,
  onClose,
}: ReviewModalProps) {
  const insets = useSafeAreaInsets();
  const [placeRating, setPlaceRating] = useState(0);
  const [eventRating, setEventRating] = useState(0);
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  const [userRatings, setUserRatings] = useState<{[userId: string]: number}>({});
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const mockAttendees: EventParticipant[] = event.participants || [];

  const handlePlaceRating = (rating: number) => {
    setPlaceRating(rating);
  };

  const handleEventRating = (rating: number) => {
    setEventRating(rating);
  };

  const handleUserLike = (userId: string) => {
    setLikedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleUserRating = (userId: string, rating: number) => {
    setUserRatings((prev) => ({
      ...prev,
      [userId]: rating
    }));
    
    if (!likedUsers.includes(userId)) {
      setLikedUsers((prev) => [...prev, userId]);
    }
  };

  const handleSubmitReview = async () => {
    if (placeRating === 0 && eventRating === 0) {
      Alert.alert(
        "Rating Required",
        "Please rate at least the place or the plan."
      );
      return;
    }

    setIsSubmittingReview(true);
    try {
      await reviewService.submitReview(event.id, {
        placeRating: placeRating || 0,
        planRating: eventRating || 0,
        connectedUserIds: likedUsers,
      });

      Alert.alert("Review Submitted", "Thank you for your feedback!", [
        { text: "OK", onPress: () => onClose(true) },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const resetForm = () => {
    setPlaceRating(0);
    setEventRating(0);
    setLikedUsers([]);
    setUserRatings({});
    setIsSubmittingReview(false);
  };

  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {}}
    >
      <View className="flex-1 bg-black/70">
        <StatusBar backgroundColor="rgba(0,0,0,0.7)" barStyle="light-content" />

        <View className="flex-1" style={{ paddingTop: insets.top }}>
          <View
            // colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.9)", "#000000"]}
            // locations={[0, 0.5, 1]}
            className="flex-1"
          >
            <View className="flex-1 justify-end">
              <View
                className="px-4 pb-4 pt-2"
                style={{
                  paddingBottom: insets.bottom + 16,
                }}
              >
                <View className="rounded-2xl overflow-hidden border border-white/20">
                  <BlurView
                    intensity={30}
                    tint="dark"
                    className="absolute inset-0"
                  />
                  {/* <View className="absolute inset-0 bg-purple-500/15" /> */}

                  <ScrollView
                    className="p-5 mb-4"
                    style={{ maxHeight: screenHeight * 0.7 }}
                    showsVerticalScrollIndicator={false}
                  >
                    <View
                      className="flex-row items-center mb-5"
                      style={{ gap: 12 }}
                    >
                      <LinearGradient
                        colors={["#f59e0b", "#8b5cf6"]}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Star size={20} color="white" />
                      </LinearGradient>
                      <View className="flex-1">
                        <Text className="font-bold text-white text-base">
                          How was your experience?
                        </Text>
                        <Text className="text-white/70 text-xs">
                          Help others discover great events
                        </Text>
                      </View>
                    </View>

                    <View className="mb-5">
                      <Text className="text-white font-medium text-sm mb-3">
                        Rate the Place
                      </Text>
                      <View
                        className="flex-row items-center"
                        style={{ gap: 8 }}
                      >
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <TouchableOpacity
                            key={rating}
                            onPress={() => handlePlaceRating(rating)}
                            className="w-10 h-10 rounded-xl items-center justify-center"
                            style={{
                              backgroundColor:
                                rating <= placeRating
                                  ? "#eab308"
                                  : "rgba(255,255,255,0.1)",
                            }}
                          >
                            <Star
                              size={20}
                              color="white"
                              fill={
                                rating <= placeRating ? "white" : "transparent"
                              }
                            />
                          </TouchableOpacity>
                        ))}
                        <Text
                          className="text-white/70 text-sm"
                          style={{ marginLeft: 12 }}
                        >
                          {placeRating > 0 ? `${placeRating}/5` : "Tap to rate"}
                        </Text>
                      </View>
                    </View>

                    <View className="mb-5">
                      <Text className="text-white font-medium text-sm mb-3">
                        Rate the Plan
                      </Text>
                      <View
                        className="flex-row items-center"
                        style={{ gap: 8 }}
                      >
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <TouchableOpacity
                            key={rating}
                            onPress={() => handleEventRating(rating)}
                            className="w-10 h-10 rounded-xl items-center justify-center"
                            style={{
                              backgroundColor:
                                rating <= eventRating
                                  ? "#cc5c24"
                                  : "rgba(255,255,255,0.1)",
                            }}
                          >
                            <Star
                              size={20}
                              color="white"
                              fill={
                                rating <= eventRating ? "white" : "transparent"
                              }
                            />
                          </TouchableOpacity>
                        ))}
                        <Text
                          className="text-white/70 text-sm"
                          style={{ marginLeft: 12 }}
                        >
                          {eventRating > 0 ? `${eventRating}/5` : "Tap to rate"}
                        </Text>
                      </View>
                    </View>

                    {mockAttendees.length > 0 && (
                      <View className="mb-6">
                        <Text className="text-white font-medium text-sm mb-3">
                          People You Connected With
                        </Text>
                        <View style={{ gap: 12 }}>
                          {mockAttendees.slice(0, 6).map((attendee) => (
                            <TouchableOpacity
                              key={attendee.id}
                              onPress={() => handleUserLike(attendee.id)}
                              className="p-3 rounded-xl"
                              style={{
                                backgroundColor: likedUsers.includes(attendee.id)
                                  ? "rgba(168, 85, 247, 0.2)"
                                  : "rgba(255, 255, 255, 0.05)",
                                borderWidth: 1,
                                borderColor: likedUsers.includes(attendee.id)
                                  ? "rgba(168, 85, 247, 0.3)"
                                  : "rgba(255, 255, 255, 0.1)",
                              }}
                            >
                              <View className="flex-row items-center mb-2" style={{ gap: 12 }}>
                                {attendee.avatar ? (
                                  <Image
                                    source={{ uri: attendee.avatar }}
                                    style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: 16,
                                      borderWidth: 1,
                                      borderColor: "rgba(255,255,255,0.2)",
                                    }}
                                  />
                                ) : (
                                  <View className="w-8 h-8 rounded-full border border-white/20 bg-orange-500 items-center justify-center">
                                    <Text className="text-white text-xs font-semibold">
                                      {attendee.name?.[0]?.toUpperCase() ?? "?"}
                                    </Text>
                                  </View>
                                )}
                                <View className="flex-1">
                                  <Text
                                    className="text-sm font-medium"
                                    style={{
                                      color: likedUsers.includes(attendee.id)
                                        ? "#a855f7"
                                        : "white",
                                    }}
                                    numberOfLines={1}
                                  >
                                    {attendee.name}
                                  </Text>
                                </View>
                                <View
                                  className="px-3 py-1 rounded-lg"
                                  style={{
                                    backgroundColor: likedUsers.includes(attendee.id)
                                      ? "#a855f7"
                                      : "rgba(255, 255, 255, 0.1)",
                                  }}
                                >
                                  <Text
                                    className="text-xs font-medium"
                                    style={{
                                      color: likedUsers.includes(attendee.id)
                                        ? "white"
                                        : "rgba(255, 255, 255, 0.7)",
                                    }}
                                  >
                                    {likedUsers.includes(attendee.id) ? "Added" : "Add"}
                                  </Text>
                                </View>
                              </View>
                              
                              {likedUsers.includes(attendee.id) && (
                                <View>
                                  <Text className="text-white/70 text-xs mb-2">
                                    Rate this person (optional):
                                  </Text>
                                  <View className="flex-row items-center" style={{ gap: 6 }}>
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                      <TouchableOpacity
                                        key={rating}
                                        onPress={(e) => {
                                          e.stopPropagation();
                                          handleUserRating(attendee.id, rating);
                                        }}
                                        className="w-6 h-6 rounded items-center justify-center"
                                        style={{
                                          backgroundColor: rating <= (userRatings[attendee.id] || 0)
                                            ? "#a855f7"
                                            : "rgba(255,255,255,0.1)"
                                        }}
                                      >
                                        <Star
                                          size={12}
                                          color="white"
                                          fill={rating <= (userRatings[attendee.id] || 0) ? "white" : "transparent"}
                                        />
                                      </TouchableOpacity>
                                    ))}
                                    <Text className="text-white/60 text-xs ml-2">
                                      {userRatings[attendee.id] ? `${userRatings[attendee.id]}/5` : "Tap to rate"}
                                    </Text>
                                  </View>
                                </View>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}

                    <View className="flex-row" style={{ gap: 12 }}>
                      <TouchableOpacity
                        onPress={handleSubmitReview}
                        disabled={
                          isSubmittingReview ||
                          (placeRating === 0 && eventRating === 0)
                        }
                        className="flex-1 rounded-xl py-3 items-center justify-center"
                        style={{
                          backgroundColor:
                            isSubmittingReview ||
                            (placeRating === 0 && eventRating === 0)
                              ? "rgba(245, 158, 11, 0.5)"
                              : "#f59e0b",
                        }}
                      >
                        {isSubmittingReview ? (
                          <View
                            className="flex-row items-center"
                            style={{ gap: 8 }}
                          >
                            <Text className="text-black text-sm font-semibold">
                              Submitting...
                            </Text>
                          </View>
                        ) : (
                          <Text className="text-black text-sm font-semibold">
                            Submit Review
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

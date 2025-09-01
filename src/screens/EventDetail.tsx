import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  FlatList,
  Linking,
  Modal,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import {
  Bookmark,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  HelpCircle,
  Heart,
} from "lucide-react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import type { RootStackParamList } from "../navigation/types";
import { eventsService } from "../services/events";
import { reviewService } from "../services/review";
import type { EventDetail as EventDetailType, EventReview } from "../types/api";
import { StyleSheet } from "react-native";
import Button from "../components/Button";
import ReviewModal from "../components/ReviewModal";

type EventState = "PRE_JOIN" | "MEMBER";

const HEADER_H = 160;
const { width: screenWidth, height: screenHeight } = Dimensions.get("window"); // h-40 (igual ao web)

export default function EventDetail() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "EventDetail">>();
  const { id } = route.params;

  const [event, setEvent] = useState<EventDetailType | null>(null);
  const [plans, setPlans] = useState<EventDetailType["plans"]>([]);
  const [currentState, setCurrentState] = useState<EventState>("PRE_JOIN");
  const [existingReview, setExistingReview] = useState<EventReview | null>(
    null
  );
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCommitButtons, setShowCommitButtons] = useState(false);
  const [commitStatus, setCommitStatus] = useState<
    "committed" | "not_committed" | null
  >(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [allPhotos, setAllPhotos] = useState<string[]>([]);
  const [showWhyMatchModal, setShowWhyMatchModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const data = await eventsService.getById(id);
      setEvent(data);
      setPlans(data.plans || []);
      setCurrentState(!data.isMember ? "PRE_JOIN" : "MEMBER");
      setIsSaved(data.isSaved ?? false);
      setIsLiked(data.isLiked ?? false);

      await checkReviewEligibility(data);
      checkCommitEligibility(data);

      const photos = [...(data.gallery || [])];
      data.plans?.forEach((plan) => {
        if (plan.photoUrl) {
          photos.push(plan.photoUrl);
        }
      });
      setAllPhotos(photos);
    } catch (error) {
      Alert.alert("Error", "Failed to load event details");
    }
  };

  const checkReviewEligibility = async (eventData: EventDetailType) => {
    const now = new Date();
    const eventEnded = eventData.endTime && new Date(eventData.endTime) < now;

    if (eventEnded && eventData.isMember) {
      try {
        const review = await reviewService.getEventReview(id);
        setExistingReview(review);
        setShowReviewModal(false);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setShowReviewModal(true);
        }
      }
    } else {
      setShowReviewModal(false);
    }
  };

  const checkCommitEligibility = (eventData: EventDetailType) => {
    const now = new Date();
    const eventStart = new Date(eventData.startTime);
    const threeHoursBefore = new Date(
      eventStart.getTime() - 3 * 60 * 60 * 1000
    );

    const shouldShowCommit =
      eventData.isMember && now >= threeHoursBefore && now < eventStart;

    setShowCommitButtons(shouldShowCommit ?? false);

    // Assume que o usuário ainda não commitou (pode vir do backend)
    if (shouldShowCommit) {
      setCommitStatus(eventData.isCommitted ? "committed" : "not_committed");
    }
  };

  const handleJoin = async () => {
    try {
      await eventsService.join(id);
      setCurrentState("MEMBER");
      loadEvent();
      (navigation as any).navigate("EventLobby", { id });
    } catch {
      Alert.alert("Error", "Failed to join event");
    }
  };

  const handleCommit = async () => {
    try {
      await eventsService.commit(id, "IN");
      setCommitStatus("committed");
      Alert.alert("Success", "You're committed to attend!");
    } catch {
      Alert.alert("Error", "Failed to commit to event");
    }
  };

  const handleUncommit = async () => {
    try {
      await eventsService.commit(id, "OUT");
      setCommitStatus("not_committed");
      Alert.alert("Success", "Commitment removed");
    } catch {
      Alert.alert("Error", "Failed to remove commitment");
    }
  };

  if (!event) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  const vibeScore = event.vibeMatchScoreEvent ?? 0;
  const selectedPlan =
    event.plans?.find((p) => p.isSelected) || event.plans?.[0];
  const gallery = event.gallery || [];

  const handleExternalLink = async () => {
    if (selectedPlan?.externalBookingUrl) {
      await Linking.openURL(selectedPlan.externalBookingUrl);
    }
  };

  const openPhotoModal = (photoUrl: string) => {
    const photoIndex = allPhotos.findIndex((url) => url === photoUrl);
    setSelectedPhotoIndex(photoIndex >= 0 ? photoIndex : 0);
    setShowPhotoModal(true);
  };

  const handleToggleFavorite = async () => {
    const previousState = isSaved;
    // Optimistic update - change immediately
    setIsSaved(!isSaved);
    
    try {
      const response = await eventsService.toggleFavorite(id);
      // Confirm the state based on server response
      setIsSaved(response.saved);
    } catch (error) {
      // Revert to previous state on error
      setIsSaved(previousState);
      Alert.alert("Error", "Failed to update favorite status");
    }
  };

  const handleToggleLike = async () => {
    const previousState = isLiked;
    // Optimistic update - change immediately
    setIsLiked(!isLiked);
    
    try {
      const response = await eventsService.toggleLike(id);
      // Confirm the state based on server response
      setIsLiked(response.liked);
    } catch (error) {
      // Revert to previous state on error
      setIsLiked(previousState);
      Alert.alert("Error", "Failed to update like status");
    }
  };

  const handleReviewModalClose = (reviewSubmitted: boolean) => {
    setShowReviewModal(false);
    if (reviewSubmitted) {
      loadEvent();
    }
  };

  const renderGalleryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      className="w-32 h-32 rounded-xl overflow-hidden mr-3"
      onPress={() => openPhotoModal(item)}
    >
      <Image
        source={{ uri: item }}
        className="w-full h-full"
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
  const formatEventTime = (start: string, end?: string) => {
    const s = new Date(start);
    const e = end ? new Date(end) : undefined;
    const startStr = s.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const startTime = s.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const endTime = e
      ? e.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : undefined;
    return endTime
      ? `${startStr} at ${startTime} - ${endTime}`
      : `${startStr} at ${startTime}`;
  };

  const getVibeScoreColor = (score: number) => {
    if (score >= 85) return "#cc5c24";
    if (score >= 50) return "hsl(258, 100%, 67%)";
    return "#cc5c24";
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 280,
          zIndex: 0,
        }}
        pointerEvents="none"
      >
        <Image
          source={{
            uri: event.imageUrl || "",
          }}
          resizeMode="cover"
          style={StyleSheet.absoluteFillObject}
        />

        {/* Gradiente escurecendo a imagem */}
        <LinearGradient
          colors={[
            "rgba(0,0,0,0)",
            "rgba(0,0,0,0.3)",
            "rgba(0,0,0,0.7)",
            "rgba(0,0,0,0.95)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      <BlurView
        intensity={10}
        tint="dark"
        className="absolute inset-x-0 top-0"
        style={{ height: 10 }}
      />

      <View
        className="absolute left-0 right-0 z-10"
        style={{ top: 0, height: 56 + insets.top, paddingTop: insets.top }}
      >
        <View className="flex-1 flex-row items-center justify-between px-4">
          <View className="flex-1 mx-3 rounded-xl overflow-hidden border border-white/20">
            <BlurView intensity={30} tint="dark" className="absolute inset-0" />
            <View className="absolute inset-0 bg-white/5" />
            <View className="flex-row items-center justify-between px-3 py-2">
              <View className="flex-1 mr-2">
                <Text
                  numberOfLines={1}
                  className="text-white text-sm font-bold"
                >
                  {event.title}
                </Text>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <Clock size={12} color="rgba(255,255,255,0.7)" />
                  <Text numberOfLines={1} className="text-white/70 text-[12px]">
                    {formatEventTime(
                      event.startTime,
                      event?.endTime ?? undefined
                    )}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <LinearGradient
                  colors={["#cc5c24", "hsl(258, 100%, 67%)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    borderRadius: 8,
                  }}
                >
                  <Text className="text-white text-[11px] font-bold">
                    {vibeScore}%
                  </Text>
                </LinearGradient>
                
                <TouchableOpacity
                  onPress={() => setShowWhyMatchModal(true)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.2)'
                  }}
                >
                  <HelpCircle size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="flex-row items-center" style={{ gap: 8 }}>
            <TouchableOpacity 
              onPress={handleToggleFavorite}
              className="w-10 h-10 rounded-xl overflow-hidden"
            >
              <BlurView
                intensity={30}
                tint="dark"
                className="absolute inset-0 rounded-xl"
              />
              <View className="absolute inset-0 bg-white/10 rounded-xl" />
              <View className="flex-1 items-center justify-center">
                <Bookmark 
                  size={20} 
                  color={isSaved ? "#ff6b35" : "white"} 
                  fill={isSaved ? "#ff6b35" : "none"}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleToggleLike}
              className="w-10 h-10 rounded-xl overflow-hidden"
            >
              <BlurView
                intensity={30}
                tint="dark"
                className="absolute inset-0 rounded-xl"
              />
              <View className="absolute inset-0 bg-white/10 rounded-xl" />
              <View className="flex-1 items-center justify-center">
                <Heart 
                  size={20} 
                  color={isLiked ? "#ff4757" : "white"} 
                  fill={isLiked ? "#ff4757" : "none"}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: HEADER_H - 64,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom,
          rowGap: 16,
        }}
      >
        <View className="rounded-2xl overflow-hidden border border-white/20 mt-8">
          <BlurView intensity={15} tint="dark" className="absolute inset-0" />
          <View className="absolute inset-0 bg-white/5" />
          <View className="p-4">
            <View className="flex-row items-center mb-3">
              <LinearGradient
                colors={["hsl(258, 100%, 67%)", "#000"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 30,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text className="text-white text-[10px] font-extrabold">
                  AI
                </Text>
              </LinearGradient>
              <Text className="text-white font-semibold text-base ml-2">
                Vibe Analysis
              </Text>
            </View>

            <Text className="text-white/80 text-sm leading-relaxed mb-4">
              {event.aiNormalized?.vibeAnalysis ||
                event.description ||
                `This ${
                  event.regionName?.toLowerCase() || "venue"
                } attracts creative professionals and music lovers. High energy atmosphere with great networking opportunities.`}
            </Text>

            {event.vibeKey && (
              <View className="flex-row flex-wrap gap-2">
                <View className="px-3 py-2 rounded-lg bg-[#cc5c24]/20 border border-[#cc5c24]/30">
                  <Text className="text-[#cc5c24] text-xs font-bold">
                    {event.vibeKey}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {gallery.length > 0 && (
          <View className="rounded-2xl overflow-hidden border border-white/20">
            <BlurView intensity={15} tint="dark" className="absolute inset-0" />
            <View className="absolute inset-0 bg-white/5" />
            <View className="p-4">
              <Text className="text-white font-bold text-base mb-3">
                Gallery ({gallery.length} photos)
              </Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={gallery}
                keyExtractor={(_, index) => `gallery-${index}`}
                renderItem={renderGalleryItem}
                contentContainerStyle={{ paddingRight: 16 }}
              />
            </View>
          </View>
        )}

        <View className="rounded-2xl overflow-hidden border border-white/20">
          <BlurView intensity={15} tint="dark" className="absolute inset-0" />
          <View className="absolute inset-0 bg-white/5" />
          <View className="p-4">
            <View className="flex-row items-center mb-4">
              <Users size={18} color="white" />
              <Text className="text-white font-bold text-base ml-2">
                Who's Going (
                {event.interestedCount || event.participants.length} people)
              </Text>
            </View>

            <View className="flex-row flex-wrap items-center ">
              {event.participants.slice(0, 8).map((p) => {
                const score = event.vibeMatchScoreWithOtherUsers ?? 0;
                return (
                  <View key={p.id} className="w-[22%] items-center mb-4">
                    {p.avatar ? (
                      <Image
                        source={{ uri: p.avatar }}
                        className="w-12 h-12 rounded-full border-2 border-white/20 mb-1"
                      />
                    ) : (
                      <View className="w-12 h-12 rounded-full border-2 border-white/20 bg-[#cc5c24] items-center justify-center mb-1">
                        <Text className="text-white text-lg font-semibold">
                          {p.name?.[0]?.toUpperCase() ?? "?"}
                        </Text>
                      </View>
                    )}
                    <Text
                      numberOfLines={1}
                      className="text-white text-xs font-medium"
                    >
                      {p.name}
                    </Text>
                    <Text
                      className="text-xs font-semibold mt-1"
                      style={{ color: getVibeScoreColor(score) }}
                    >
                      {score}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {!!plans.length && (
          <View className="rounded-2xl overflow-hidden border border-white/20">
            <BlurView intensity={15} tint="dark" className="absolute inset-0" />
            <View className="absolute inset-0 bg-white/5" />
            <View className="p-4">
              <Text className="text-white font-bold text-base mb-3">
                Plan Options
              </Text>

              {plans.map((plan) => (
                <View
                  key={plan.id}
                  className={`rounded-xl p-3 mb-2 border ${
                    plan.isSelected ? "border-[#cc5c24]" : "border-gray-700/50"
                  }`}
                  style={{
                    backgroundColor: plan.isSelected
                      ? "rgba(204,92,36,0.2)"
                      : "rgba(31,31,31,0.6)",
                  }}
                >
                  <View className="flex-row items-start">
                    <View
                      className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                      style={{
                        backgroundColor: plan.isSelected
                          ? "#cc5c24"
                          : "rgba(55,65,81,0.7)",
                      }}
                    >
                      <Text className="text-lg">{plan.emoji ?? "✨"}</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text
                          className={`text-sm font-medium flex-1 ${
                            plan.isSelected ? "text-[#cc5c24]" : "text-white"
                          }`}
                        >
                          {plan.title} {plan.isSelected && "✓"}
                        </Text>
                        <Text className="text-white/60 text-xs">
                          {plan.votes ?? 0} votes
                        </Text>
                      </View>
                      <Text className="text-gray-300 text-xs leading-relaxed mb-2">
                        {plan.description}
                      </Text>
                      {plan.venue && (
                        <Text className="text-white/70 text-xs mb-2">
                          📍 {plan.venue}
                        </Text>
                      )}
                      {plan.photoUrl && (
                        <TouchableOpacity
                          onPress={() => openPhotoModal(plan.photoUrl!)}
                          className="w-full h-24 rounded-lg overflow-hidden mb-2"
                        >
                          <Image
                            source={{ uri: plan.photoUrl }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      )}
                      {plan.isSelected && plan.externalBookingUrl && (
                        <TouchableOpacity
                          onPress={handleExternalLink}
                          className="flex-row items-center bg-[#cc5c24] px-3 py-2 rounded-lg mt-2"
                        >
                          <ExternalLink size={14} color="white" />
                          <Text className="text-white text-xs font-medium ml-2">
                            View on Maps
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {!!event.regionName && (
          <View className="flex-row items-center px-1">
            <MapPin size={16} color="rgba(255,255,255,0.85)" />
            <Text className="text-white/85 ml-2">
              {event.regionName} {event.address && `• ${event.address}`}
            </Text>
          </View>
        )}
      </ScrollView>

      <LinearGradient
        colors={["#000000", "rgba(0,0,0,0.9)", "transparent"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        className="absolute left-0 right-0 bottom-0"
        style={{
          paddingBottom: insets.bottom ? insets.bottom : 16,
          paddingTop: 8,
          paddingHorizontal: 24,
        }}
      >
        {currentState === "PRE_JOIN" ? (
          <View className="flex-row items-center">
            <View className="flex-1 mr-3">
              <Button type="gradient" onPress={handleJoin} title="Join Now" />
            </View>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="flex-1 py-[16px] rounded-lg border border-white/20 items-center justify-center bg-black/30"
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        ) : existingReview ? (
          <View className="flex-row items-center">
            <View className="flex-1 mr-3 p-4 rounded-lg bg-green-500/20 border border-green-500/30">
              <Text className="text-green-400 text-sm font-medium text-center">
                ✓ Review Submitted
              </Text>
              <Text className="text-white/60 text-xs text-center mt-1">
                Thank you for your feedback!
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="px-6 py-6 rounded-lg border border-white/20 items-center justify-center bg-black/30"
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        ) : showCommitButtons ? (
          <View style={{ gap: 12 }}>
            <View className="flex-row items-center" style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={() =>
                  (navigation as any).navigate("EventLobby", { id })
                }
                className="flex-1 py-[16px] rounded-lg border border-white/20 items-center justify-center bg-black/30"
              >
                <Text
                  style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}
                >
                  Lobby
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mensagem informativa */}
            <View className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3">
              <Text className="text-amber-400 text-sm font-medium text-center">
                ⏰ Event starts in less than 3 hours
              </Text>
              <Text className="text-white/70 text-xs text-center mt-1">
                Please confirm your attendance
              </Text>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center">
            <View className="flex-1 mr-3">
              <TouchableOpacity
                onPress={() =>
                  (navigation as any).navigate("EventLobby", { id })
                }
                className="py-[16px] rounded-lg border border-white/20 items-center justify-center bg-black/30"
              >
                <Text
                  style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}
                >
                  Go to Lobby
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="flex-1 py-[16px] rounded-lg border border-white/20 items-center justify-center bg-black/30"
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      <Modal
        visible={showWhyMatchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWhyMatchModal(false)}
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowWhyMatchModal(false)}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              intensity={35}
              tint="dark"
            />
          </TouchableOpacity>

          <View style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderTopWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
            padding: 24,
            maxHeight: '70%'
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                Why this match?
              </Text>
              <TouchableOpacity
                onPress={() => setShowWhyMatchModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }}
              >
                <Text style={{ color: '#fff', fontSize: 18 }}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {event?.whyThisMatch && (
                <>
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                      Event Match ({event.whyThisMatch.eventMatch.score}%)
                    </Text>
                    {event.whyThisMatch.eventMatch.reasons.map((reason, index) => (
                      <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                        <Text style={{ color: '#cc5c24', fontSize: 16, marginRight: 8 }}>•</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, flex: 1 }}>
                          {reason}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {event.whyThisMatch.participantMatches && event.whyThisMatch.participantMatches.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                        People Matches
                      </Text>
                      {event.whyThisMatch.participantMatches.map((participant, index) => (
                        <View key={index} style={{ 
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          borderRadius: 12,
                          padding: 16,
                          marginBottom: 12,
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.1)'
                        }}>
                          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 8 }}>
                            {participant.name} ({participant.score}% match)
                          </Text>
                          {participant.reasons.map((reason, reasonIndex) => (
                            <View key={reasonIndex} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                              <Text style={{ color: '#cc5c24', fontSize: 14, marginRight: 8 }}>•</Text>
                              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, flex: 1 }}>
                                {reason}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ))}
                    </View>
                  )}

                  {event.whyThisMatch.overallExplanation && (
                    <View style={{
                      backgroundColor: 'rgba(204, 92, 36, 0.1)',
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: 'rgba(204, 92, 36, 0.3)'
                    }}>
                      <Text style={{ color: '#fff', fontSize: 14, lineHeight: 20 }}>
                        {event.whyThisMatch.overallExplanation}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPhotoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View className="flex-1 bg-black">
          <StatusBar hidden />

          <TouchableOpacity
            onPress={() => setShowPhotoModal(false)}
            className="absolute top-12 right-4 z-10 w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <Text className="text-white text-lg font-bold">×</Text>
          </TouchableOpacity>

          <FlatList
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            data={allPhotos}
            keyExtractor={(_, index) => `photo-${index}`}
            initialScrollIndex={selectedPhotoIndex}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            renderItem={({ item }) => (
              <View style={{ width: screenWidth, height: screenHeight }}>
                <View className="flex-1 justify-center items-center">
                  <Image
                    source={{ uri: item }}
                    style={{
                      width: screenWidth,
                      height: screenHeight,
                      resizeMode: "contain",
                    }}
                  />
                </View>
              </View>
            )}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / screenWidth
              );
              setSelectedPhotoIndex(index);
            }}
          />

          <View className="absolute bottom-8 left-0 right-0 items-center">
            <View className="bg-black/50 px-4 py-2 rounded-full">
              <Text className="text-white text-sm">
                {selectedPhotoIndex + 1} of {allPhotos.length}
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <ReviewModal
        visible={showReviewModal && !existingReview}
        event={event}
        onClose={handleReviewModalClose}
      />
    </View>
  );
}

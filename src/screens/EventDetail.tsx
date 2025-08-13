import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { ArrowLeft, Clock, Bookmark, MessageCircle } from "lucide-react-native";
import type { RootStackParamList } from "../navigation/types";
import { eventsService } from "../services/events";
import type { EventDetail as EventDetailType } from "../types/api";

type EventState =
  | "PRE_JOIN"
  | "VOTING_OPEN"
  | "VOTING_CLOSED"
  | "BOOKED"
  | "COMMITTED"
  | "CANT_MAKE_IT";

export default function EventDetail() {
  const route = useRoute<RouteProp<RootStackParamList, "EventDetail">>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { id } = route.params;

  const [event, setEvent] = useState<EventDetailType | null>(null);
  const [plans, setPlans] = useState<EventDetailType["plans"]>([]);
  const [currentState, setCurrentState] = useState<EventState>("PRE_JOIN");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [voteCountdown, setVoteCountdown] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    loadEventData();
  }, [id]);

  const loadEventData = async () => {
    try {
      const data = await eventsService.getById(id);
      setEvent(data);
      setPlans(data.plans || []);
      setSelectedPlanId(data.selectedPlanId);

      if (!data.isMember) {
        setCurrentState("PRE_JOIN");
      } else if (data.votingState === "OPEN") {
        setCurrentState("VOTING_OPEN");
        loadChat();
      } else if (data.votingState === "CLOSED") {
        loadChat();
        try {
          const bookingInfo = await eventsService.bookingInfo(id);
          setBooking(bookingInfo);
          if (bookingInfo && bookingInfo.isBooked) {
            setCurrentState("BOOKED");
          } else {
            setCurrentState("VOTING_CLOSED");
          }
        } catch {
          setCurrentState("VOTING_CLOSED");
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load event details");
    }
  };

  const loadChat = async () => {
    try {
      const chatData = await eventsService.chatList(id, { limit: 50 });
      setMessages(chatData.items || []);
    } catch (error) {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (currentState !== "VOTING_OPEN" || !event?.votingEndsAt) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const end = new Date(event.votingEndsAt!).getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));

      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setVoteCountdown(
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );

      if (diff <= 0) {
        clearInterval(timer);
        loadEventData(); // Refresh to get new state
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentState, event?.votingEndsAt]);

  // Poll for updates when voting is open
  useEffect(() => {
    if (currentState !== "VOTING_OPEN") return;

    const pollTimer = setInterval(() => {
      loadEventData();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollTimer);
  }, [currentState]);

  const handleJoin = async () => {
    try {
      await eventsService.join(id);
      setCurrentState("VOTING_OPEN");
      loadEventData();
    } catch (error) {
      Alert.alert("Error", "Failed to join event");
    }
  };

  const handleVote = async (planId: string) => {
    if (selectedPlanId) return;

    try {
      await eventsService.votePlan(id, planId);
      setSelectedPlanId(planId);
      const updatedPlans = await eventsService.getPlans(id);
      setPlans(updatedPlans);
    } catch (error) {
      Alert.alert("Error", "Failed to vote");
    }
  };

  const handleBooking = async () => {
    if (booking?.externalBookingUrl) {
      await WebBrowser.openBrowserAsync(booking.externalBookingUrl);
    }
  };

  const handleBookingConfirm = async () => {
    try {
      await eventsService.bookingConfirm(id, "user-booking-ref-123");
      setCurrentState("BOOKED");
      loadEventData();
    } catch (error) {
      Alert.alert("Error", "Failed to confirm booking");
    }
  };

  const handleCommit = async (decision: "IN" | "OUT") => {
    try {
      await eventsService.commit(id, decision);
      setCurrentState(decision === "IN" ? "COMMITTED" : "CANT_MAKE_IT");
      loadEventData();
    } catch (error) {
      Alert.alert("Error", "Failed to commit");
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    try {
      await eventsService.chatSend(id, chatInput.trim());
      setChatInput("");
      loadChat(); // Refresh chat
    } catch (error) {
      Alert.alert("Error", "Failed to send message");
    }
  };

  if (!event) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <StatusBar barStyle="light-content" />
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
  const vibeScore = event.vibeMatchScoreEvent || 0;
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="relative">
        <Image
          source={{
            uri: event.imageUrl || "",
          }}
          className="w-full h-64"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/40" />

        {/* Header Content */}
        <View className="absolute top-4 left-4 right-4 flex-row items-start justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>

          <View className="flex-row gap-2">
            <View className="bg-green-500 py-2 rounded-full w-[45px] h-[45px] items-center justify-center">
              <Text className="text-white font-semibold text-xs">
                {vibeScore}%
              </Text>
            </View>
            <TouchableOpacity className="w-[45px] h-[45px] bg-black/50 rounded-full items-center justify-center border border-white/20">
              <Bookmark size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Event Info */}
        <View className="absolute bottom-4 left-4 right-4">
          <Text className="text-white text-2xl font-bold mb-1">
            {event.title}
          </Text>
          <Text className="text-white/80 text-base mb-2">
            {formatTime(event.startTime)}
          </Text>
          <Text className="text-white/80 text-base">
            {event.venue} • {event.address}
          </Text>

          {/* Status Chips */}
          <View className="flex-row gap-2 mt-3">
            {currentState === "VOTING_OPEN" && (
              <View className="bg-blue-500 px-3 py-1 rounded-full">
                <Text className="text-white text-sm font-medium">• Voting</Text>
              </View>
            )}
            {currentState === "VOTING_CLOSED" && (
              <View className="bg-gray-500 px-3 py-1 rounded-full">
                <Text className="text-white text-sm font-medium">
                  Voting complete
                </Text>
              </View>
            )}
            {currentState === "BOOKED" && (
              <View className="bg-green-500 px-3 py-1 rounded-full">
                <Text className="text-white text-sm font-medium">
                  ✓ Reservation
                </Text>
              </View>
            )}
            {currentState === "COMMITTED" && (
              <View className="bg-green-500 px-3 py-1 rounded-full">
                <Text className="text-white text-sm font-medium">
                  Committed
                </Text>
              </View>
            )}
            {currentState === "CANT_MAKE_IT" && (
              <View className="bg-red-500 px-3 py-1 rounded-full">
                <Text className="text-white text-sm font-medium">
                  Can't make it
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{
          paddingBottom:
            insets.bottom + (currentState !== "PRE_JOIN" ? 160 : 100),
        }}
      >
        {/* Vibe Analysis */}
        <View className="bg-white/5 rounded-xl p-4 mb-4">
          <Text className="text-white text-lg font-semibold mb-2">
            Vibe Analysis (AI)
          </Text>
          <Text className="text-white/80 text-base mb-3">
            This {event.venue?.toLowerCase() || "venue"} attracts creative
            professionals and music lovers. High energy atmosphere with great
            networking opportunities.
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {event.tags?.map((tag, index) => (
              <View key={index} className="bg-white/10 px-3 py-1 rounded-full">
                <Text className="text-white/90 text-sm">#{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Who's Going */}
        {event.participants && event.participants.length > 0 && (
          <View className="bg-white/5 rounded-xl p-4 mb-4">
            <Text className="text-white text-lg font-semibold mb-3">
              Who's Going ({event.interestedCount || event.participants.length}{" "}
              people)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {event.participants.map((participant) => (
                  <View key={participant.id} className="items-center">
                    {participant.avatar ? (
                      <Image
                        source={{ uri: participant.avatar }}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <View className="w-12 h-12 bg-green-500 rounded-full items-center justify-center">
                        <Text className="text-white font-semibold">
                          {participant.name?.charAt(0)?.toUpperCase() || "?"}
                        </Text>
                      </View>
                    )}
                    <Text
                      className="text-white/80 text-xs mt-1"
                      numberOfLines={1}
                    >
                      {participant.name}
                    </Text>
                    <Text className="text-green-400 text-xs">
                      {event.vibeMatchScoreWithOtherUsers || 90}%
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Plan Options - Pre-Join */}
        {currentState === "PRE_JOIN" && plans.length > 0 && (
          <View className="bg-white/5 rounded-xl p-4 mb-4">
            <Text className="text-white text-lg font-semibold mb-3">
              Plan Options
            </Text>
            {plans.map((plan) => (
              <View key={plan.id} className="bg-white/5 rounded-lg p-3 mb-3">
                <View className="flex-row items-start gap-3">
                  <Text className="text-2xl">{plan.emoji || "⛅"}</Text>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-white font-semibold text-base">
                        {plan.title}
                      </Text>
                      <Text className="text-white/60 text-sm">
                        {plan.votes || 0} votes
                      </Text>
                    </View>
                    <Text className="text-white/80 text-sm">
                      {plan.description}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Voting Section - Voting Open */}
        {currentState === "VOTING_OPEN" && (
          <View className="bg-white/5 rounded-xl p-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white text-lg font-semibold">
                Vote on Plans
              </Text>
              <View className="flex-row items-center gap-2">
                <Clock size={16} color="white" />
                <Text className="text-white font-mono">{voteCountdown}</Text>
              </View>
            </View>

            {plans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                onPress={() => handleVote(plan.id)}
                disabled={!!selectedPlanId}
                className={`bg-white/5 rounded-lg p-3 mb-3 border ${
                  selectedPlanId === plan.id
                    ? "border-green-500"
                    : "border-white/10"
                }`}
              >
                <View className="flex-row items-start gap-3">
                  <View
                    className={`w-5 h-5 rounded-full border-2 mt-1 items-center justify-center ${
                      selectedPlanId === plan.id
                        ? "border-green-500 bg-green-500"
                        : "border-white/40"
                    }`}
                  >
                    {selectedPlanId === plan.id && (
                      <View className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </View>
                  <Text className="text-2xl">{plan.emoji || "⛅"}</Text>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-white font-semibold text-base">
                        {plan.title}
                      </Text>
                      <View className="flex-row items-center gap-2">
                        <Text className="text-white/60 text-sm">
                          {plan.votes || 0} votes
                        </Text>
                        <Text className="text-green-400 text-sm">
                          {Math.round(
                            ((plan.votes || 0) /
                              Math.max(
                                1,
                                plans.reduce(
                                  (sum, p) => sum + (p.votes || 0),
                                  0
                                )
                              )) *
                              100
                          )}
                          %
                        </Text>
                      </View>
                    </View>
                    <Text className="text-white/80 text-sm">
                      {plan.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Selected Plan - Voting Closed */}
        {(currentState === "VOTING_CLOSED" || currentState === "BOOKED") &&
          selectedPlan && (
            <View className="bg-white/5 rounded-xl p-4 mb-4">
              <Text className="text-green-400 text-base font-semibold mb-2">
                ✓ Selected Plan: {selectedPlan.emoji} {selectedPlan.title}
              </Text>
              <Text className="text-white/60 text-sm">
                Status: Voting complete
              </Text>
            </View>
          )}

        {/* Booking Section - Voting Closed */}
        {currentState === "VOTING_CLOSED" && (
          <View className="bg-white/5 rounded-xl p-4 mb-4">
            <Text className="text-white text-lg font-semibold mb-3">
              Book Your Spot
            </Text>
            <View className="bg-white/5 rounded-lg p-4 mb-4">
              <Text className="text-white font-semibold mb-2">
                Reserve Your Table at {event.venue}
              </Text>
              <Text className="text-white/80 text-sm mb-3">
                Ensures a table ready for our group.
              </Text>
              <Text className="text-white/60 text-sm">
                Party size: {event.interestedCount} • Time:{" "}
                {formatTime(event.startTime)} • Date: Tonight
              </Text>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleBooking}
                className="flex-1 bg-green-500 py-3 rounded-lg"
              >
                <Text className="text-white text-center font-semibold">
                  Book Now
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleBookingConfirm}
                className="flex-1 bg-white/10 py-3 rounded-lg border border-white/20"
              >
                <Text className="text-white text-center font-semibold">
                  Already Booked
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Reservation Status - Booked */}
        {currentState === "BOOKED" && (
          <View className="bg-white/5 rounded-xl p-4 mb-4">
            <Text className="text-green-400 text-base font-semibold mb-1">
              ✓ Reservation: All set for tonight
            </Text>
            <Text className="text-white/60 text-sm">
              Your booking has been confirmed
            </Text>
          </View>
        )}

        {/* Chat Section - After Joining */}
        {(currentState === "VOTING_OPEN" ||
          currentState === "VOTING_CLOSED" ||
          currentState === "BOOKED" ||
          currentState === "COMMITTED" ||
          currentState === "CANT_MAKE_IT") && (
          <View className="bg-white/5 rounded-xl p-4 mb-4">
            <Text className="text-white text-lg font-semibold mb-3">Chat</Text>
            <View className="max-h-64">
              <ScrollView showsVerticalScrollIndicator={false}>
                {messages.length === 0 ? (
                  <Text className="text-white/60 text-center py-4">
                    No messages yet
                  </Text>
                ) : (
                  messages.map((message, index) => (
                    <View key={message.id || index} className="mb-2">
                      <Text className="text-white/80 text-sm">
                        <Text className="font-semibold">
                          {message.isMe
                            ? "You"
                            : message.user?.name || "System"}
                        </Text>
                        {": "}
                        {message.text}
                      </Text>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      {currentState === "PRE_JOIN" && (
        <View
          className="p-4 bg-black border-t border-white/10"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleJoin}
              className="flex-1 bg-green-500 py-4 rounded-lg"
            >
              <Text className="text-white text-center font-semibold text-base">
                Join Now
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="flex-1 bg-white/10 py-4 rounded-lg border border-white/20"
            >
              <Text className="text-white text-center font-semibold text-base">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Chat Input - After Joining */}
      {(currentState === "VOTING_OPEN" ||
        currentState === "VOTING_CLOSED" ||
        currentState === "BOOKED" ||
        currentState === "COMMITTED" ||
        currentState === "CANT_MAKE_IT") && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="bg-black border-t border-white/10"
        >
          {/* Quick Replies */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 py-2"
            contentContainerStyle={{ gap: 8 }}
          >
            {["I'm so excited! 🎉", "Count me in!", "Ready to dance! 💃"].map(
              (quickReply) => (
                <TouchableOpacity
                  key={quickReply}
                  onPress={() => setChatInput(quickReply)}
                  className="bg-white/10 px-3 py-2 rounded-full"
                >
                  <Text className="text-white/90 text-sm">{quickReply}</Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>

          <View
            className="flex-row items-center p-4 gap-3"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <TextInput
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Share your thoughts..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              className="flex-1 bg-white/10 rounded-full px-4 py-3 text-white"
              multiline
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              className="bg-green-500 w-12 h-12 rounded-full items-center justify-center"
            >
              <MessageCircle size={20} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Commit Actions - Booked State */}
      {currentState === "BOOKED" && (
        <View
          className="absolute bottom-0 left-0 right-0 bg-black border-t border-white/10 p-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <Text className="text-white text-center mb-3">
            Commit to Attend? {event.venue} • Tonight
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => handleCommit("IN")}
              className="flex-1 bg-green-500 py-3 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">
                I'm In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleCommit("OUT")}
              className="flex-1 bg-red-500 py-3 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">
                Can't Make It
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

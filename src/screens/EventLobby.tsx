import React, { useEffect, useState } from "react";
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
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import {
  Clock,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  MoreHorizontal,
  ChevronDown,
  Users,
  Send,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { RootStackParamList } from "../navigation/types";
import { eventsService } from "../services/events";
import { reviewService } from "../services/review";
import { matchService } from "../services/match";
import type { EventDetail as EventDetailType, EventReview } from "../types/api";

type EventState =
  | "PRE_JOIN"
  | "VOTING_OPEN"
  | "VOTING_CLOSED"
  | "BOOKED"
  | "COMMITTED"
  | "CANT_MAKE_IT";

export default function EventLobby() {
  const route = useRoute<RouteProp<RootStackParamList, "EventLobby">>();
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
  const [isPlanExpanded, setIsPlanExpanded] = useState<boolean>(false);
  const [isBookingExpanded, setIsBookingExpanded] = useState<boolean>(false);
  const [isBookingMinimized, setIsBookingMinimized] = useState<boolean>(false);
  const [hasReview, setHasReview] = useState<boolean>(false);
  const [isEventEnded, setIsEventEnded] = useState<boolean>(false);
  const [chatSuggestions, setChatSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isVotingOpen = currentState === "VOTING_OPEN";
  const isChatDisabled = isEventEnded && hasReview;
  
  const isWithinCommitWindow = () => {
    if (!event?.startTime) return false;
    const now = new Date().getTime();
    const eventStart = new Date(event.startTime).getTime();
    const threeHoursInMs = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
    return (eventStart - now) <= threeHoursInMs && eventStart > now;
  };
  

  const canShowCommitButton = currentState === "BOOKED" && !booking?.isCommitted && isWithinCommitWindow();

  useEffect(() => {
    loadEventData();
  }, [id]);

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
        loadEventData();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentState, event?.votingEndsAt]);

  useEffect(() => {
    if (currentState !== "VOTING_OPEN") return;
    const pollTimer = setInterval(() => {
      loadEventData();
    }, 10000);
    return () => clearInterval(pollTimer);
  }, [currentState]);

  const loadEventData = async () => {
    try {
      const data = await eventsService.getById(id);
      setEvent(data);
      setPlans(data.plans || []);

      const now = new Date();
      const eventEnded = data.endTime && new Date(data.endTime) < now;
      setIsEventEnded(!!eventEnded);
      if (eventEnded && data.isMember) {
        try {
          await reviewService.getEventReview(id);
          setHasReview(true);
        } catch (error: any) {
          if (error.response?.status === 404) {
            setHasReview(false);
          }
        }
      }

      const votedKey = `event:${id}:votedPlanId`;
      let nextSelected: string | null = data.selectedPlanId;
      if (!nextSelected && data.votingState === "OPEN") {
        try {
          const local = await AsyncStorage.getItem(votedKey);
          if (local) nextSelected = local;
        } catch {}
      }
      setSelectedPlanId(nextSelected);

      if (!data.isMember) {
        setCurrentState("PRE_JOIN");
      } else {
        loadChat();
        if (data.votingState === "OPEN") {
          setCurrentState("VOTING_OPEN");
        } else if (data.votingState === "CLOSED") {
          try {
            const bookingInfo = await eventsService.bookingInfo(id);
            setBooking(bookingInfo);
            if (!data.selectedPlanId && bookingInfo?.selectedPlan?.id) {
              setSelectedPlanId(bookingInfo.selectedPlan.id);
            }
            if (bookingInfo?.isCommitted) {
              setCurrentState("COMMITTED");
            } else if (bookingInfo?.isBooked) {
              setCurrentState("BOOKED");
            } else {
              setCurrentState("VOTING_CLOSED");
            }
            try {
              await AsyncStorage.removeItem(votedKey);
            } catch {}
          } catch {
            setCurrentState("VOTING_CLOSED");
          }
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load lobby");
    }
  };

  const loadChat = async () => {
    try {
      const chatData = await eventsService.chatList(id, { limit: 50 });
      setMessages(chatData.items || []);

      // if ((chatData.items?.length || 0) <= 2) {
        loadChatSuggestions();
      // }
    } catch (error) {
      setMessages([]);
      loadChatSuggestions();
    }
  };

  const loadChatSuggestions = async () => {
    try {
      const response = await matchService.getChatSuggestions(id);
      const suggestions = response.suggestions || [];
      setChatSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error("Failed to load chat suggestions:", error);
      setChatSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleVote = async (planId: string) => {
    if (selectedPlanId) return;
    try {
      await eventsService.votePlan(id, planId);
      setSelectedPlanId(planId);
      try {
        await AsyncStorage.setItem(`event:${id}:votedPlanId`, planId);
      } catch {}
      const updatedPlans = await eventsService.getPlans(id);
      setPlans(updatedPlans);
    } catch (error) {
      Alert.alert("Error", "Failed to vote");
    }
  };

  const handleBooking = async () => {
    const bookingUrl =
      booking?.selectedPlan?.externalBookingUrl || booking?.externalBookingUrl;
    if (bookingUrl) {
      await WebBrowser.openBrowserAsync(bookingUrl);
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
    if (isChatDisabled) {
      Alert.alert("Chat Unavailable", "Event has ended");
      return;
    }
    try {
      await eventsService.chatSend(id, chatInput.trim());
      setChatInput("");
      setShowSuggestions(false);
      loadChat();
    } catch (error) {
      Alert.alert("Error", "Failed to send message");
    }
  };

  const handleUseSuggestion = (suggestion: string) => {
    setChatInput(suggestion);
    setShowSuggestions(false);
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

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const participantsById: Record<string, any> = Object.fromEntries(
    (event.participants || []).map((p) => [p.id, p])
  );
  const timeAgo = (iso?: string) => {
    if (!iso) return "";
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.max(0, Math.floor(diffMs / 60000));
    if (mins < 1) return "just now";
    if (mins === 1) return "1 min ago";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    return hours === 1 ? "1 hr ago" : `${hours} hrs ago`;
  };
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
  const totalVotes = Math.max(
    1,
    plans.reduce((acc, p) => acc + (p.votes || 0), 0)
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="px-4 pt-3 pb-2">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-9 h-9 rounded-full items-center justify-center mr-2"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <Text
            className="text-white text-2xl font-bold flex-1"
            numberOfLines={1}
          >
            {event.title}
          </Text>
          <TouchableOpacity className="w-9 h-9 rounded-full items-center justify-center ml-2">
            <MoreHorizontal size={20} color="white" />
          </TouchableOpacity>
        </View>
        <View className="mt-1 flex-row items-center">
          <Users size={16} color="rgba(255,255,255,0.6)" />
          <Text className="text-white/60 ml-1">
            {event.interestedCount ?? 0}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 0 }}
      >
        {/* ===== Selected Plan / Voting ===== */}
        <View className="mb-5">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setIsPlanExpanded((s) => !s)}
            className="rounded-3xl overflow-hidden mb-3"
          >
            <LinearGradient
              colors={["#2a1a12", "#6b3b18"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 16, borderRadius: 24 }}
            >
              {/* Header */}
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-black/30 items-center justify-center mr-3">
                  <CheckCircle2 size={20} color="#ffb05a" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-base">
                    Selected Plan
                  </Text>
                  <Text className="text-amber-400 text-sm">
                    {isVotingOpen ? "Voting in progress" : "Voting complete"}
                  </Text>
                </View>
                <ChevronDown
                  size={18}
                  color="white"
                  style={{
                    transform: [{ rotate: isPlanExpanded ? "180deg" : "0deg" }],
                  }}
                />
              </View>

              {/* Body */}
              {isPlanExpanded && (
                <View className="mt-4">
                  {isVotingOpen ? (
                    <View>
                      <View className="flex-row items-center gap-2 mb-3">
                        <Clock size={16} color="white" />
                        <Text className="text-white font-mono">
                          {voteCountdown}
                        </Text>
                      </View>

                      {plans.map((plan) => {
                        const pct = Math.round(
                          ((plan.votes || 0) / totalVotes) * 100
                        );
                        const isChosen = selectedPlanId === plan.id;
                        const canVote = !selectedPlanId;

                        return (
                          <TouchableOpacity
                            key={plan.id}
                            onPress={() => handleVote(plan.id)}
                            disabled={!canVote}
                            className="bg-white/5 rounded-2xl p-3 mb-3 border border-white/10"
                            activeOpacity={0.9}
                          >
                            <View className="flex-row items-start gap-3">
                              <View
                                className={`w-5 h-5 rounded-full border-2 mt-1 items-center justify-center ${
                                  isChosen
                                    ? "bg-primary border-primary"
                                    : "border-white/40"
                                }`}
                              >
                                {isChosen && (
                                  <View className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </View>

                              <Text className="text-2xl">
                                {plan.emoji || "⛅"}
                              </Text>

                              <View className="flex-1">
                                <View className="flex-row items-center justify-between">
                                  <Text className="text-white font-semibold text-base flex-1">
                                    {plan.title}
                                  </Text>
                                  <Text className="text-white/70 text-xs">
                                    {plan.votes ?? 0} votes
                                  </Text>
                                </View>
                                <Text className="text-white/80 text-sm mt-1">
                                  {plan.description}
                                </Text>

                                {/* Barra de progresso */}
                                <View className="h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
                                  <View
                                    style={{ width: `${pct}%` }}
                                    className="h-2 rounded-full"
                                  >
                                    <LinearGradient
                                      colors={[
                                        "hsl(20,70%,47%)",
                                        "hsl(258,100%,67%)",
                                      ]}
                                      start={{ x: 0, y: 0 }}
                                      end={{ x: 1, y: 0 }}
                                      style={{
                                        height: "100%",
                                        borderRadius: 999,
                                      }}
                                    />
                                  </View>
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : selectedPlan ? (
                    <View className="flex-row items-start">
                      <Text className="text-2xl mr-3">
                        {selectedPlan.emoji || "✨"}
                      </Text>
                      <View className="flex-1">
                        <Text className="text-white font-semibold mb-1">
                          {selectedPlan.title}
                        </Text>
                        <Text className="text-white/80 text-sm">
                          {selectedPlan.description}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              if (isVotingOpen) return;
              setIsBookingMinimized((s) => !s);
              setIsBookingExpanded(true);
            }}
            className="rounded-3xl overflow-hidden"
            style={{
              backgroundColor: "rgba(0,0,0,0.4)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.15)",
            }}
          >
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <View className="relative mr-3">
                  <View
                    className="w-8 h-8 rounded-xl items-center justify-center"
                    style={{
                      backgroundColor: booking?.isBooked
                        ? "hsla(20,70%,47%,0.8)" // joyn-green aprox
                        : "rgba(255,204,102,0.9)", // amarelo
                    }}
                  >
                    {booking?.isBooked ? (
                      <CheckCircle2 size={16} color="#fff" />
                    ) : (
                      <Calendar size={16} color="#fff" />
                    )}
                  </View>
                  {!booking?.isBooked && (
                    <View
                      style={{
                        position: "absolute",
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        right: -6,
                        top: -6,
                        backgroundColor: "rgba(255,204,102,1)",
                      }}
                      className="animate-pulse"
                    />
                  )}
                </View>

                <View>
                  <Text className="text-white font-semibold text-sm">
                    {booking?.isBooked
                      ? "Reservation Confirmed"
                      : "Book Your Spot"}
                  </Text>
                  <Text
                    className={`text-xs ${
                      isVotingOpen
                        ? "text-white/40"
                        : booking?.isBooked
                        ? "text-green-400"
                        : "text-amber-400"
                    }`}
                  >
                    {isVotingOpen
                      ? "Available after voting"
                      : booking?.isBooked
                      ? "All set for tonight!"
                      : "Reservation required"}
                  </Text>
                </View>
              </View>

              <View
                className="w-8 h-8 items-center justify-center rounded-xl"
                style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
              >
                <ChevronDown
                  size={16}
                  color={isVotingOpen ? "#666" : "#fff"}
                  style={{
                    transform: [
                      { rotate: isBookingMinimized ? "0deg" : "180deg" },
                    ],
                  }}
                />
              </View>
            </View>

            {/* Content */}
            {!isBookingMinimized && !isVotingOpen && (
              <View className="px-4 pb-4">
                {booking?.isBooked ? (
                  <View
                    className="p-3 rounded-xl border"
                    style={{
                      backgroundColor: "rgba(34,197,94,0.10)",
                      borderColor: "rgba(34,197,94,0.20)",
                    }}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-8 h-8 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: "rgba(34,197,94,0.20)" }}
                      >
                        <CheckCircle2 size={16} color="#22c55e" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-green-400 font-semibold text-sm">
                          Reservation Confirmed!
                        </Text>
                        <Text className="text-white/80 text-xs">
                          Your table is secured for tonight. See you there!
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View className="gap-4">
                    <View
                      className="p-4 rounded-2xl border"
                      style={{
                        backgroundColor: "rgba(255,204,102,0.10)",
                        borderColor: "rgba(255,204,102,0.20)",
                      }}
                    >
                      <View className="flex-row items-start">
                        <View
                          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                          style={{ backgroundColor: "rgba(255,204,102,0.20)" }}
                        >
                          <Calendar size={20} color="#ffcc66" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-white font-semibold text-sm mb-2">
                            Reserve Your Table at{" "}
                            {booking?.selectedPlan?.venue ||
                              selectedPlan?.venue ||
                              event.venue}
                          </Text>
                          <Text className="text-white/80 text-xs mb-3">
                            To secure your spot for "
                            {selectedPlan?.title || "Plan"}", please make a
                            reservation. This ensures we have a table ready for
                            our group tonight.
                          </Text>

                          {/* Detalhes */}
                          <View className="gap-2">
                            <View className="flex-row items-center justify-between">
                              <Text className="text-white/60 text-xs">
                                Party size:
                              </Text>
                              <Text className="text-white text-xs font-medium">
                                {event.interestedCount ?? 0} people
                              </Text>
                            </View>
                            <View className="flex-row items-center justify-between">
                              <Text className="text-white/60 text-xs">
                                Time:
                              </Text>
                              <Text className="text-white text-xs font-medium">
                                {formatTime(event.startTime)}
                              </Text>
                            </View>
                            <View className="flex-row items-center justify-between">
                              <Text className="text-white/60 text-xs">
                                Date:
                              </Text>
                              <Text className="text-white text-xs font-medium">
                                Tonight
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Botões */}
                    <View className="flex-row gap-3">
                      {booking?.selectedPlan?.externalBookingUrl ||
                      booking?.externalBookingUrl ? (
                        <TouchableOpacity
                          onPress={handleBooking}
                          className="flex-1 rounded-xl"
                          style={{ backgroundColor: "rgba(255,204,102,1)" }}
                          activeOpacity={0.9}
                        >
                          <Text className="text-black text-center font-semibold px-4 py-3">
                            Book Now
                          </Text>
                        </TouchableOpacity>
                      ) : null}

                      <TouchableOpacity
                        onPress={handleBookingConfirm}
                        className="flex-1 rounded-xl border"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.10)",
                          borderColor: "rgba(255,255,255,0.20)",
                        }}
                        activeOpacity={0.9}
                      >
                        <Text className="text-white text-center font-semibold px-4 py-3">
                          Already Booked
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ===== Chat messages ===== */}
        <View className="mb-4">
          {messages.length === 0 ? (
            <View className="bg-white/5 rounded-xl p-4">
              {showSuggestions && chatSuggestions.length > 0 ? (
                <View>
                  <Text className="text-white/60 text-center text-sm mb-3">
                    AI suggestions to break the ice:
                  </Text>
                  {chatSuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleUseSuggestion(suggestion)}
                      className="bg-white/10 rounded-lg p-3 mb-2"
                      activeOpacity={0.8}
                    >
                      <Text className="text-white text-sm">{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    onPress={() => setShowSuggestions(false)}
                    className="mt-2"
                  >
                    <Text className="text-white/40 text-center text-xs">
                      Hide suggestions
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text className="text-white/60 text-center py-4">
                  No messages yet
                </Text>
              )}
            </View>
          ) : (
            messages.map((m, idx) => {
              const participant = m.userId
                ? participantsById[m.userId]
                : undefined;
              const displayName = m.isMe
                ? "You"
                : participant?.name || m.user?.name || "Guest";
              const status = participant?.status;
              const isCantMakeIt = status === "CANT_MAKE_IT";
              return (
                <View key={m.id || idx} className="flex-row mb-5 items-start">
                  {participant?.avatar ? (
                    <Image
                      source={{ uri: participant.avatar }}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  ) : (
                    <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-3">
                      <Text className="text-white font-semibold">
                        {String(displayName).charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <Text className="text-white font-semibold mr-2">
                        {displayName}
                      </Text>
                      {status === "COMMITTED" && (
                        <View className="flex-row items-center mr-2">
                          <View className="w-2 h-2 rounded-full bg-orange-400 mr-1" />
                          <Text className="text-orange-300 text-xs">
                            Committed
                          </Text>
                        </View>
                      )}
                      {status === "CANT_MAKE_IT" && (
                        <View className="flex-row items-center mr-2">
                          <View className="w-2 h-2 rounded-full bg-red-500 mr-1" />
                          <Text className="text-red-400 text-xs">
                            Can't make it
                          </Text>
                        </View>
                      )}
                      <Text className="text-white/40 text-xs">
                        {timeAgo(m.createdAt)}
                      </Text>
                    </View>
                    <View
                      className={`rounded-2xl p-4 ${
                        isCantMakeIt
                          ? "bg-red-500/10 border border-red-500/40"
                          : "bg-transparent border border-white/30"
                      }`}
                    >
                      <Text className="text-white/90 text-base">{m.text}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="bg-black border-t border-white/10"
      >
        {!isChatDisabled &&
          messages.length <= 2 &&
          chatSuggestions.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-4 py-2"
              contentContainerStyle={{ gap: 8 }}
            >
              {chatSuggestions.slice(0, 3).map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setChatInput(suggestion)}
                  className="bg-white/10 px-3 py-2 rounded-full"
                >
                  <Text className="text-white/90 text-sm">{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

        {/* Composer (glass) */}
        <View
          style={{
            backgroundColor: "black",
            paddingHorizontal: 16,
            paddingTop: 8,
          }}
        >
          {isChatDisabled && (
            <View
              style={{
                backgroundColor: "rgba(255, 193, 7, 0.1)",
                borderWidth: 1,
                borderColor: "rgba(255, 193, 7, 0.3)",
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <Text
                style={{ color: "#ffc107", fontSize: 14, textAlign: "center" }}
              >
                📝 Event has ended!
              </Text>
            </View>
          )}

          <View
            style={{
              position: "relative",
              borderRadius: 24,
              borderWidth: 1,
              borderColor: isChatDisabled
                ? "rgba(255,255,255,0.1)"
                : "rgba(255,255,255,0.2)",
              padding: 16,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOpacity: 0.4,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 14,
              opacity: isChatDisabled ? 0.5 : 1,
            }}
          >
            <View style={{ position: "relative", justifyContent: "center" }}>
              <TextInput
                value={chatInput}
                onChangeText={isChatDisabled ? undefined : setChatInput}
                placeholder={
                  isChatDisabled ? "Event has ended" : "Share your thoughts..."
                }
                placeholderTextColor="rgba(255,255,255,0.5)"
                multiline
                editable={!isChatDisabled}
                style={{
                  width: "100%",
                  color: isChatDisabled ? "rgba(255,255,255,0.3)" : "white",
                  backgroundColor: "rgba(255,255,255,0.10)",
                  borderWidth: 1,
                  borderColor:
                    !isChatDisabled && chatInput.trim()
                      ? "hsla(20, 70%, 47%, 0.5)"
                      : "rgba(255,255,255,0.20)",
                  borderRadius: 18,
                  paddingVertical: 14,
                  paddingLeft: 16,
                  paddingRight: 56,
                  fontSize: 16,
                }}
              />

              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={!chatInput.trim() || isChatDisabled}
                activeOpacity={0.9}
                style={{
                  position: "absolute",
                  right: 6,
                  top: "50%",
                  transform: [{ translateY: -20 }],
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  backgroundColor:
                    !isChatDisabled && chatInput.trim()
                      ? "hsla(20, 70%, 47%, 0.10)"
                      : "transparent",
                  borderColor:
                    !isChatDisabled && chatInput.trim()
                      ? "hsla(20, 70%, 47%, 0.20)"
                      : "transparent",
                  opacity: isChatDisabled ? 0.3 : 1,
                }}
              >
                <Send
                  size={18}
                  color={
                    !isChatDisabled && chatInput.trim()
                      ? "hsl(20, 70%, 47%)"
                      : "rgba(255,255,255,0.4)"
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Commit actions when booked */}
      {canShowCommitButton && (
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

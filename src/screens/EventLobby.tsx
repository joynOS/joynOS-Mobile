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
  MessageCircle,
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
import type { EventDetail as EventDetailType } from "../types/api";
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
  const isVotingOpen = currentState === "VOTING_OPEN";

  useEffect(() => {
    loadEventData();
  }, [id]);

  const loadEventData = async () => {
    try {
      const data = await eventsService.getById(id);
      setEvent(data);
      setPlans(data.plans || []);

      // Persist + restore voted plan while voting is open
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
      } else if (data.votingState === "OPEN") {
        setCurrentState("VOTING_OPEN");
        loadChat();
      } else if (data.votingState === "CLOSED") {
        loadChat();
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
    } catch (error) {
      Alert.alert("Error", "Failed to load lobby");
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
      loadChat();
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

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Header as per design: back, title, more; with attendee count below */}
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
                            <Text className="text-2xl">
                              {plan.emoji || "⛅"}
                            </Text>
                            <View className="flex-1">
                              <Text className="text-white font-semibold text-base">
                                {plan.title}
                              </Text>
                              <Text className="text-white/80 text-sm">
                                {plan.description}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
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

          {/* Book Your Spot */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              if (isVotingOpen) return; // disabled until voting is done
              setIsBookingExpanded((s) => !s);
            }}
            className="rounded-3xl overflow-hidden"
            style={{
              backgroundColor: "#121212",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            <View className="p-4">
              <View className="flex-row items-center">
                {booking?.isBooked ? (
                  <View className="w-10 h-10 rounded-full bg-green-500/20 items-center justify-center mr-3">
                    <CheckCircle2 size={20} color="#22c55e" />
                  </View>
                ) : (
                  <View className="w-10 h-10 rounded-full bg-amber-500/20 items-center justify-center mr-3">
                    <Calendar size={20} color="#ffcc66" />
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-white font-semibold text-base">
                    Book Your Spot
                  </Text>
                  <Text
                    className={`${
                      isVotingOpen
                        ? "text-white/40"
                        : booking?.isBooked
                        ? "text-green-400"
                        : "text-amber-400"
                    } text-sm`}
                  >
                    {isVotingOpen
                      ? "Available after voting"
                      : booking?.isBooked
                      ? "Reservation confirmed"
                      : "Reservation required"}
                  </Text>
                </View>
                <ChevronDown
                  size={18}
                  color={isVotingOpen ? "#666" : "#fff"}
                  style={{
                    transform: [
                      { rotate: isBookingExpanded ? "180deg" : "0deg" },
                    ],
                  }}
                />
              </View>

              {isBookingExpanded && !isVotingOpen && (
                <View className="mt-4">
                  <View className="bg-white/5 rounded-xl p-4 mb-3">
                    <Text className="text-white font-semibold mb-2">
                      Reserve Your Table at {event.venue}
                    </Text>
                    <Text className="text-white/70 text-sm">
                      Party size: {event.interestedCount} • Time:{" "}
                      {formatTime(event.startTime)}
                    </Text>
                  </View>
                  {booking?.isBooked ? (
                    <View className="flex-row gap-3">
                      {booking?.externalBookingUrl ? (
                        <TouchableOpacity
                          onPress={handleBooking}
                          className="flex-1 bg-white/10 py-3 rounded-xl border border-white/20"
                        >
                          <Text className="text-white text-center font-semibold">
                            Open Ticket
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                      <View
                        className="flex-1 py-3 rounded-xl items-center justify-center"
                        style={{
                          borderWidth: 1,
                          borderColor: "rgba(34,197,94,0.5)",
                          backgroundColor: "rgba(34,197,94,0.08)",
                        }}
                      >
                        <Text className="text-green-400 font-semibold">
                          All set
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        onPress={handleBooking}
                        className="flex-1 bg-amber-500 py-3 rounded-xl"
                      >
                        <Text className="text-black text-center font-semibold">
                          Book Now
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleBookingConfirm}
                        className="flex-1 bg-white/10 py-3 rounded-xl border border-white/20"
                      >
                        <Text className="text-white text-center font-semibold">
                          Already Booked
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          {messages.length === 0 ? (
            <View className="bg-white/5 rounded-xl p-4">
              <Text className="text-white/60 text-center py-4">
                No messages yet
              </Text>
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
          style={{
            backgroundColor: "black",
            paddingHorizontal: 16,
            paddingTop: 8,
          }}
        >
          <View
            style={{
              position: "relative",
              borderRadius: 24,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
              padding: 16,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOpacity: 0.4,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 14,
            }}
          >
            <View style={{ position: "relative", justifyContent: "center" }}>
              <TextInput
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Share your thoughts..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                multiline
                style={{
                  width: "100%",
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.10)",
                  borderWidth: 1,
                  borderColor: chatInput.trim()
                    ? "hsla(20, 70%, 47%, 0.5)"
                    : "rgba(255,255,255,0.20)",
                  borderRadius: 18,
                  paddingVertical: 14,
                  paddingLeft: 42,
                  paddingRight: 56,
                  fontSize: 16,
                }}
              />

              {/* Botão Send à direita dentro do input */}
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={!chatInput.trim()}
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
                  backgroundColor: chatInput.trim()
                    ? "hsla(20, 70%, 47%, 0.10)"
                    : "transparent",
                  borderColor: chatInput.trim()
                    ? "hsla(20, 70%, 47%, 0.20)"
                    : "transparent",
                }}
              >
                <Send
                  size={18}
                  color={
                    chatInput.trim()
                      ? "hsl(20, 70%, 47%)" // joyn-green ativo
                      : "rgba(255,255,255,0.4)"
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Commit actions when booked */}
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

import React, { useEffect, useState } from "react";
import { View, Text, Image, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Clock, MessageCircle, CheckCircle2, Calendar } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { RootStackParamList } from "../navigation/types";
import { eventsService } from "../services/events";
import type { EventDetail as EventDetailType } from "../types/api";

// Lobby is the interactive room: steps + chat

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

      {/* Top chips row like the design (no big header image) */}
      <View className="px-4 pt-3 pb-2 flex-row items-center justify-between">
        <Text className="text-white/80">👥 {event.interestedCount ?? 0}</Text>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: insets.bottom + 160 }}>
        {/* Chips */}
        <View className="flex-row gap-3 mb-5">
          {/* Selected Plan chip */}
          <View className="flex-1 rounded-3xl border border-white/10 bg-[#1a1410] p-4">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-full bg-black/30 items-center justify-center mr-3">
                <CheckCircle2 size={18} color="#ffb05a" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold" numberOfLines={1}>{selectedPlan?.title || "Selected Plan"}</Text>
                <Text className="text-amber-400 text-xs">{currentState === "VOTING_OPEN" ? "Voting in progress" : "Voting complete"}</Text>
              </View>
            </View>
          </View>

          {/* Reservation chip */}
          <View className="flex-1 rounded-3xl border border-white/10 bg-[#1a1410] p-4">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-full bg-black/30 items-center justify-center mr-3">
                <Calendar size={18} color="#ffb05a" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold" numberOfLines={1}>Reservation</Text>
                <Text className={`${booking?.isBooked ? "text-green-400" : "text-amber-400"} text-xs`}>
                  {booking?.isBooked ? "All set for tonight" : "Reservation required"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Voting Section when open */}
        {currentState === "VOTING_OPEN" && (
          <View className="bg-white/5 rounded-xl p-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white text-lg font-semibold">Vote on Plans</Text>
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
                className={`bg-white/5 rounded-lg p-3 mb-3 border ${selectedPlanId === plan.id ? "border-green-500" : "border-white/10"}`}
              >
                <View className="flex-row items-start gap-3">
                  <View className={`w-5 h-5 rounded-full border-2 mt-1 items-center justify-center ${selectedPlanId === plan.id ? "border-green-500 bg-green-500" : "border-white/40"}`}>
                    {selectedPlanId === plan.id && <View className="w-2 h-2 bg-white rounded-full" />}
                  </View>
                  <Text className="text-2xl">{plan.emoji || "⛅"}</Text>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-white font-semibold text-base">{plan.title}</Text>
                    </View>
                    <Text className="text-white/80 text-sm">{plan.description}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Chat */}
        <View className="mb-4">
          {messages.length === 0 ? (
            <View className="bg-white/5 rounded-xl p-4">
              <Text className="text-white/60 text-center py-4">No messages yet</Text>
            </View>
          ) : (
            messages.map((m, idx) => {
              const participant = m.userId ? participantsById[m.userId] : undefined;
              const displayName = m.isMe ? "You" : participant?.name || m.user?.name || "Guest";
              const status = participant?.status;
              const isCantMakeIt = status === "CANT_MAKE_IT";
              return (
                <View key={m.id || idx} className="flex-row mb-5 items-start">
                  {participant?.avatar ? (
                    <Image source={{ uri: participant.avatar }} className="w-10 h-10 rounded-full mr-3" />
                  ) : (
                    <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-3">
                      <Text className="text-white font-semibold">{String(displayName).charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <Text className="text-white font-semibold mr-2">{displayName}</Text>
                      {status === "COMMITTED" && (
                        <View className="flex-row items-center mr-2">
                          <View className="w-2 h-2 rounded-full bg-orange-400 mr-1" />
                          <Text className="text-orange-300 text-xs">Committed</Text>
                        </View>
                      )}
                      {status === "CANT_MAKE_IT" && (
                        <View className="flex-row items-center mr-2">
                          <View className="w-2 h-2 rounded-full bg-red-500 mr-1" />
                          <Text className="text-red-400 text-xs">Can't make it</Text>
                        </View>
                      )}
                      <Text className="text-white/40 text-xs">{timeAgo(m.createdAt)}</Text>
                    </View>
                    <View className={`rounded-2xl p-4 ${isCantMakeIt ? "bg-red-500/10 border border-red-500/40" : "bg-transparent border border-white/30"}`}>
                      <Text className="text-white/90 text-base">{m.text}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Chat input */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="bg-black border-t border-white/10">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-2" contentContainerStyle={{ gap: 8 }}>
          {["I'm so excited! 🎉", "Count me in!", "Ready to dance! 💃"].map((quickReply) => (
            <TouchableOpacity key={quickReply} onPress={() => setChatInput(quickReply)} className="bg-white/10 px-3 py-2 rounded-full">
              <Text className="text-white/90 text-sm">{quickReply}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View className="flex-row items-center p-4 gap-3" style={{ paddingBottom: insets.bottom + 16 }}>
          <TextInput
            value={chatInput}
            onChangeText={setChatInput}
            placeholder="Share your thoughts..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            className="flex-1 bg-white/10 rounded-full px-4 py-3 text-white"
            multiline
          />
          <TouchableOpacity onPress={handleSendMessage} className="bg-green-500 w-12 h-12 rounded-full items-center justify-center">
            <MessageCircle size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Commit actions when booked */}
      {currentState === "BOOKED" && (
        <View className="absolute bottom-0 left-0 right-0 bg-black border-t border-white/10 p-4" style={{ paddingBottom: insets.bottom + 16 }}>
          <Text className="text-white text-center mb-3">Commit to Attend? {event.venue} • Tonight</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={() => handleCommit("IN")} className="flex-1 bg-green-500 py-3 rounded-lg">
              <Text className="text-white text-center font-semibold">I'm In</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleCommit("OUT")} className="flex-1 bg-red-500 py-3 rounded-lg">
              <Text className="text-white text-center font-semibold">Can't Make It</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

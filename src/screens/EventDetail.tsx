import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { ArrowLeft, Bookmark } from "lucide-react-native";
import type { RootStackParamList } from "../navigation/types";
import { eventsService } from "../services/events";
import type { EventDetail as EventDetailType } from "../types/api";

type EventState = "PRE_JOIN" | "MEMBER";

export default function EventDetail() {
  const route = useRoute<RouteProp<RootStackParamList, "EventDetail">>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { id } = route.params;

  const [event, setEvent] = useState<EventDetailType | null>(null);
  const [plans, setPlans] = useState<EventDetailType["plans"]>([]);
  const [currentState, setCurrentState] = useState<EventState>("PRE_JOIN");

  useEffect(() => {
    loadEventData();
  }, [id]);

  const loadEventData = async () => {
    try {
      const data = await eventsService.getById(id);
      setEvent(data);
      setPlans(data.plans || []);
      setCurrentState(!data.isMember ? "PRE_JOIN" : "MEMBER");
    } catch (error) {
      Alert.alert("Error", "Failed to load event details");
    }
  };

  // No timers/polling required on details page

  const handleJoin = async () => {
    try {
      await eventsService.join(id);
      setCurrentState("MEMBER");
      loadEventData();
    } catch (error) {
      Alert.alert("Error", "Failed to join event");
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

  // No local helpers needed beyond formatting time

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

          {/* No status chips on details */}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* No steps or actions on details; moved to Lobby */}
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

        {/* Plan Options - visible only when not joined yet */}
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

        {/* Voting is only in the Lobby */}

        {/* All action sections removed */}
      </ScrollView>

      {/* Bottom Actions */}
      <View
        className="p-4 bg-black border-t border-white/10"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        {currentState === "PRE_JOIN" ? (
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
        ) : (
          <TouchableOpacity
            onPress={() => (navigation as any).navigate("EventLobby", { id })}
            className="bg-white/10 py-4 rounded-lg border border-white/20"
          >
            <Text className="text-white text-center font-semibold text-base">
              Go to Lobby
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

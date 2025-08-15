import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import {
  ArrowLeft,
  Bookmark,
  Clock,
  MapPin,
  Users,
  Sparkles,
} from "lucide-react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import type { RootStackParamList } from "../navigation/types";
import { eventsService } from "../services/events";
import type { EventDetail as EventDetailType } from "../types/api";
import { StyleSheet } from "react-native";
import Button from "../components/Button";

type EventState = "PRE_JOIN" | "MEMBER";

const HEADER_H = 160; // h-40 (igual ao web)

export default function EventDetail() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "EventDetail">>();
  const { id } = route.params;

  const [event, setEvent] = useState<EventDetailType | null>(null);
  const [plans, setPlans] = useState<EventDetailType["plans"]>([]);
  const [currentState, setCurrentState] = useState<EventState>("PRE_JOIN");

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const data = await eventsService.getById(id);
      setEvent(data);
      setPlans(data.plans || []);
      setCurrentState(!data.isMember ? "PRE_JOIN" : "MEMBER");
    } catch (e) {
      Alert.alert("Error", "Failed to load event details");
    }
  };

  const handleJoin = async () => {
    try {
      await eventsService.join(id);
      setCurrentState("MEMBER");
      loadEvent();
    } catch {
      Alert.alert("Error", "Failed to join event");
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

  // Igual ao web: "Thu, Aug 21 8:15 PM - 9:45 PM"
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
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.75)"]}
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
            </View>
          </View>

          <TouchableOpacity className="w-10 h-10 rounded-xl overflow-hidden">
            <BlurView
              intensity={30}
              tint="dark"
              className="absolute inset-0 rounded-xl"
            />
            <View className="absolute inset-0 bg-white/10 rounded-xl" />
            <View className="flex-1 items-center justify-center">
              <Bookmark size={20} color="white" />
            </View>
          </TouchableOpacity>
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
              {event.aiVibeAnalysis ??
                `This ${
                  event.venue?.toLowerCase() || "venue"
                } attracts creative professionals and music lovers. High energy atmosphere with great networking opportunities.`}
            </Text>

            {!!event.tags?.length && (
              <View className="flex-row flex-wrap gap-2">
                {event.tags.map((tag, i) => (
                  <View
                    key={`${tag}-${i}`}
                    className="px-2 py-1 rounded-lg bg-white/10"
                  >
                    <Text className="text-white/70 text-xs font-medium">
                      #{tag}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

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
                <TouchableOpacity
                  key={plan.id}
                  className="rounded-xl p-3 mb-2 border border-gray-700/50"
                  style={{ backgroundColor: "rgba(31,31,31,0.6)" }}
                >
                  <View className="flex-row items-start">
                    <View
                      className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                      style={{ backgroundColor: "rgba(55,65,81,0.7)" }}
                    >
                      <Text className="text-lg">{plan.emoji ?? "✨"}</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-white text-sm font-medium">
                          {plan.title}
                        </Text>
                        <Text className="text-white/60 text-xs">
                          {plan.votes ?? 0} votes
                        </Text>
                      </View>
                      <Text className="text-gray-300 text-xs leading-relaxed">
                        {plan.description}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Local/Endereço (opcional — se quiser embaixo do Analysis, como chips) */}
        {!!event.venue && (
          <View className="flex-row items-center px-1">
            <MapPin size={16} color="rgba(255,255,255,0.85)" />
            <Text className="text-white/85 ml-2">
              {event.venue} • {event.address}
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
    </View>
  );
}

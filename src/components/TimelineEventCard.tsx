import React, { memo, useMemo } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

type TimelineEvent = {
  id: string | number;
  title?: string;
  imageUrl?: string | null;
  venue?: string | null;
  startTime?: string | Date;
  status?: "Attending" | "Interested" | "Attended" | "Joined";
  vibeScore?: number;
  vibeMatchScoreWithOtherUsers?: number;
  userRating?: number;
  attendees?: number;
  maxAttendees?: number;
  lastMessage?: string;
  unreadCount?: number;
};

type Props = {
  event: TimelineEvent;
  onPress: () => void;
  className?: string;
};

const formatDateTime = (dt?: string | Date) => {
  if (!dt) return "";
  const d = typeof dt === "string" ? new Date(dt) : dt;
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getTimeUntilEvent = (startTime?: string | Date) => {
  if (!startTime) return "";
  const startDate = new Date(startTime);
  if (isNaN(startDate.getTime())) return "";

  const now = new Date();
  const diff = startDate.getTime() - now.getTime();

  if (diff < 0) return "Past";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h`;
  return `${Math.floor(diff / (1000 * 60))}m`;
};

const getEventStatus = (startTime?: string | Date, endTime?: string | Date) => {
  if (!startTime) return { label: "Upcoming", color: "text-green-400" };

  const now = new Date();
  const eventStart = new Date(startTime);
  const eventEnd = endTime ? new Date(endTime) : null;

  if (now < eventStart) {
    const hoursUntil =
      (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntil <= 2)
      return { label: "Starting soon", color: "text-yellow-400" };
    return { label: "Upcoming", color: "text-green-400" };
  } else if (eventEnd && now >= eventStart && now <= eventEnd) {
    return { label: "Live now", color: "text-red-400" };
  } else {
    return { label: "Completed", color: "text-white/60" };
  }
};

const TimelineEventCard: React.FC<Props> = ({
  event,
  onPress,
  className = "",
}) => {
  const title = event.title || "Untitled Event";
  const venue = event.venue || "Location TBD";
  const dateLine = useMemo(
    () => formatDateTime(event.startTime),
    [event.startTime]
  );
  const timeUntil = useMemo(
    () => getTimeUntilEvent(event.startTime),
    [event.startTime]
  );
  const status = useMemo(
    () => getEventStatus(event.startTime),
    [event.startTime]
  );
  const statusLabel = event?.status || "Joined";
  const statusColor =
    event?.status === "Attending" || event?.status === "Joined"
      ? "text-joyn-orange"
      : event?.status === "Interested"
      ? "text-joyn-purple"
      : "text-white";
  const vibe = event?.vibeScore || 0;
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`relative h-56 rounded-2xl overflow-hidden bg-gray-800 mb-3 ${className}`}
      activeOpacity={0.88}
    >
      <Image
        source={{
          uri:
            event.imageUrl ||
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
        }}
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />

      <View className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/90" />

      <View className="absolute top-3 left-3 right-3 flex-row justify-between items-start">
        <View className="bg-black/40 px-3 py-2 rounded-xl max-w-[60%]">
          <Text className="text-white font-bold text-base" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-white/80 text-xs mt-0.5" numberOfLines={1}>
            {venue}
          </Text>
        </View>

        <View className="items-end gap-2">
          <View className="bg-white/10 px-3 py-1.5 rounded-full">
            <Text className={`text-white font-bold text-xs ${statusColor}`}>
              {statusLabel}
            </Text>
          </View>
          <View className="bg-black/60 px-2.5 py-1.5 rounded-xl">
            <Text className="text-white font-bold text-xs">{vibe}%</Text>
          </View>
        </View>
      </View>

      <View className="absolute left-4 right-4 top-24">
        <Text className="text-white text-lg font-bold">{dateLine}</Text>
      </View>

      <View className="absolute left-4 right-4 bottom-2">
        <Text className="text-white text-lg">{event?.attendees} people</Text>
      </View>

      <View className="absolute left-4 right-4 bottom-3.5 flex-row justify-between items-center">
        <View>
          {event.status === "Attended" &&
          typeof event.userRating === "number" ? (
            <View className="flex-row items-center gap-2">
              <View className="flex-row gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <View
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full ${
                      i < (event.userRating || 0)
                        ? "bg-yellow-400"
                        : "bg-white/50"
                    }`}
                  />
                ))}
              </View>
              <Text className="text-white font-semibold text-sm">Rated</Text>
            </View>
          ) : event.lastMessage ? (
            <View className="flex-row items-center">
              <Text
                className="text-white/90 text-sm font-medium flex-1 mr-3"
                numberOfLines={1}
              >
                {event.lastMessage}
              </Text>
              {(event.unreadCount || 0) > 0 && (
                <View className="bg-green-500 px-2 py-1 rounded-full min-w-5 h-5 items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {event.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View className="flex-row items-center">
              {typeof event.attendees === "number" &&
                typeof event.maxAttendees === "number" && (
                  <Text className="text-white/80 text-sm font-medium">
                    {event.attendees}/{event.maxAttendees} people
                  </Text>
                )}
            </View>
          )}
        </View>

        <Text className={`text-sm font-semibold ${status.color}`}>
          {timeUntil && status.label !== "Completed" ? timeUntil : status.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default memo(TimelineEventCard);

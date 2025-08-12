import React, { memo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type EventLike = {
  id?: string | number;
  title?: string | null;
  imageUrl?: string | null;
  startTime?: string | null;
  venue?: string | null;
  aiNormalized?: { categories?: string[]; tags?: string[] } | null;
  tags?: string[] | null;
};

type Props = {
  event: EventLike;
  onPress: () => void;
  style?: ViewStyle;
};

const getDateStr = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

const getCategory = (
  ev: EventLike
): { label: string; emoji: string } | null => {
  const raw =
    Array.isArray(ev.aiNormalized?.categories) &&
    ev.aiNormalized?.categories?.length
      ? String(ev.aiNormalized?.categories?.[0]).toLowerCase()
      : Array.isArray(ev.tags) && ev.tags.length
      ? String(ev.tags[0]).toLowerCase()
      : undefined;
  if (!raw) return null;
  if (raw.includes("night") || raw.includes("bar") || raw.includes("club"))
    return { label: "Nightlife", emoji: "🌙" };
  if (raw.includes("music") || raw.includes("concert"))
    return { label: "Music", emoji: "🎵" };
  if (raw.includes("fitness") || raw.includes("yoga") || raw.includes("sport"))
    return { label: "Fitness", emoji: "🏃" };
  if (raw.includes("art")) return { label: "Arts", emoji: "🎨" };
  if (raw.includes("game")) return { label: "Games", emoji: "🎮" };
  return { label: ev.aiNormalized?.categories?.[0] ?? raw, emoji: "✨" } as any;
};

const getVibeScore = (ev: any) => {
  if (ev.vibeMatchScoreEvent) return ev.vibeMatchScoreEvent;
  const base = (ev.tags?.length ?? 0) + (ev.aiNormalized?.tags?.length ?? 0);
  const raw = 80 + base * 3;
  return Math.max(85, Math.min(95, Math.floor(raw)));
};

const EventDiscoverCard: React.FC<Props> = ({ event, onPress, style }) => {
  console.log("event: ", JSON.stringify(event, null, 2));
  const dateStr = getDateStr(event.startTime ?? undefined);
  const cat = getCategory(event);
  const vibe = getVibeScore(event);
  const title = event.title || "Untitled Event";
  const venue = event.venue || "";
  const image =
    event.imageUrl ||
    `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=1200&fit=crop&crop=center`;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, style]}
      activeOpacity={0.88}
    >
      <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      <LinearGradient
        colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.85)"]}
        style={styles.overlay}
      />

      <View style={styles.topRow}>
        {!!dateStr && (
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>
        )}
        <View style={styles.vibeBadge}>
          <View style={styles.vibeDot} />
          <Text style={styles.vibeText}>{vibe}%</Text>
        </View>
      </View>

      <View style={styles.bottomInfo}>
        {!!cat && (
          <View style={styles.catBadge}>
            <Text style={styles.catEmoji}>{cat.emoji}</Text>
            <Text style={styles.catText}>{cat.label}</Text>
          </View>
        )}
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        {!!venue && (
          <Text numberOfLines={1} style={styles.venue}>
            {venue}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default memo(EventDiscoverCard);

const styles = StyleSheet.create({
  card: {
    aspectRatio: 4 / 5,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "rgba(40,40,40,1)",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: "rgba(40,40,40,1)",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  topRow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateBadge: {
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  dateText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  vibeBadge: {
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  vibeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F2C94C",
    marginRight: 6,
  },
  vibeText: { color: "#F2C94C", fontSize: 12, fontWeight: "700" },
  bottomInfo: { position: "absolute", left: 8, right: 8, bottom: 8 },
  catBadge: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  catEmoji: { fontSize: 14, marginRight: 6 },
  catText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  title: { color: "#fff", fontWeight: "700", fontSize: 16, marginTop: 8 },
  venue: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 4 },
});

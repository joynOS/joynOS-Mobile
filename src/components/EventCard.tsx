import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Share,
} from "react-native";
import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import type { NavigationProp } from "@react-navigation/native";
import Button from "../components/Button";
import type { EventDetail as ApiEvent } from "../types/api";
import type { RootState } from "../shared/store";
import type { RootStackParamList } from "../navigation/types";
import { eventsService } from "../services/events";
import { addJoinedId } from "../shared/eventSlice";
import { Clock, MapPin } from "lucide-react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import type { Event } from "../shared/shared";

interface EventCardProps {
  event: any | ApiEvent | Event;
  isActive?: boolean;
  onTap?: () => void;
  variant?: "card" | "full";
}

export default function EventCard({
  event,
  onTap,
  variant = "card",
}: EventCardProps) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const joinedIds = useSelector((state: RootState) => state.events.joinedIds);
  const isParticipating =
    (event as ApiEvent).isMember ||
    joinedIds.includes(event.id || (event as any).id);
  const tagCount = Array.isArray((event as any).tags)
    ? (event as any).tags.length
    : 0;
  const compatibilityScore = (event as any).vibeMatchScoreEvent || 0;
  const memberCount =
    (event as any).interestedCount || Math.floor(Math.random() * 20) + 5;

  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const handleJoinEvent = async () => {
    try {
      const eventId = event.id || (event as any).id;
      await eventsService.join(eventId);
      navigation.navigate("EventLobby", { id: eventId });
    } catch (error) {
      console.error("Failed to join event:", error);
    }
  };

  const handleGoToLobby = () => {
    navigation.navigate("EventLobby", {
      id: event.id || (event as any).id,
    });
  };

  const formatEventTime = (input: any) => {
    const d = new Date(input);
    return d.toLocaleString("en-US", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 67) return "#cc5c24";
    if (score >= 33) return "#22c55e";
    return "#3b82f6";
  };

  const imageUri =
    (event as any).imageUrl ||
    `https://source.unsplash.com/collection/190727/800x1200?sig=${
      (event as any).id
    }`;

  return (
    <View
      style={[
        styles.cardContainer,
        variant === "full" && styles.cardContainerFull,
      ]}
    >
      <ImageBackground
        source={{ uri: imageUri }}
        style={styles.imageBackground}
        imageStyle={[styles.image, variant === "full" && styles.imageFull]}
      >
        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />

        {/* Content Overlay */}
        <View
          style={[
            styles.contentOverlay,
            variant === "full" && styles.contentOverlayFull,
          ]}
        >
          <View style={styles.headerRow}>
            <View
              style={[
                styles.compatibilityBadge,
                { backgroundColor: getCompatibilityColor(compatibilityScore) },
              ]}
            >
              <Text style={styles.compatibilityBadgeText}>
                {compatibilityScore}%
              </Text>
            </View>
            <Text style={styles.title}>{event.title}</Text>
          </View>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Clock size={16} color="white" />
              <Text style={styles.metaText}>
                {formatEventTime((event as any).startTime)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MapPin size={16} color="white" />
              <Text style={styles.metaText}>
                {(event as any).venue ||
                  (event as any).location?.venue ||
                  "TBD"}
              </Text>
            </View>
          </View>

          <Text numberOfLines={2} style={styles.description}>
            {(event as any).description || ""}
          </Text>

          {/* Members */}
          <View style={styles.membersRow}>
            <View style={styles.avatars}>
              {((event as any).participants || [])
                .slice(0, 3)
                .map((participant: any) =>
                  participant.avatar ? (
                    <Image
                      key={participant.id}
                      source={{ uri: participant.avatar }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View
                      key={participant.id}
                      style={[styles.avatar, styles.avatarInitial]}
                    >
                      <Text style={styles.avatarInitialText}>
                        {participant.name?.charAt(0)?.toUpperCase() || "?"}
                      </Text>
                    </View>
                  )
                )}
              {memberCount > 3 && (
                <View style={styles.avatarMore}>
                  <Text style={styles.avatarMoreText}>
                    +{Math.max(0, memberCount - 3)}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.memberText}>{memberCount} interested</Text>
          </View>

          <View style={styles.actionButtonsRow}>
            {isParticipating ? (
              <TouchableOpacity
                onPress={handleGoToLobby}
                style={[styles.actionButton, styles.actionButtonPrimary]}
                activeOpacity={0.8}
              >
                <BlurView
                  intensity={15}
                  tint="dark"
                  style={StyleSheet.absoluteFillObject}
                />
                <Text style={styles.actionButtonText}>Go to Lobby</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  onPress={handleJoinEvent}
                  style={[styles.actionButton, styles.actionButtonPrimary]}
                  activeOpacity={0.8}
                >
                  <BlurView
                    intensity={15}
                    tint="dark"
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Text style={styles.actionButtonText}>Join Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onTap}
                  style={[styles.actionButton, styles.actionButtonSecondary]}
                  activeOpacity={0.8}
                >
                  <BlurView
                    intensity={15}
                    tint="dark"
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Text style={styles.actionButtonText}>Learn More</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Side Actions */}
        <View
          style={[
            styles.sideActions,
            variant === "full" && styles.sideActionsFull,
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setLiked((v) => !v)}
            style={[styles.iconButton, liked && styles.iconButtonActive]}
          >
            <BlurView
              intensity={20}
              tint="dark"
              style={StyleSheet.absoluteFillObject}
            />
            <AntDesign
              name={liked ? "heart" : "hearto"}
              size={20}
              color={liked ? "#EF4444" : "#FFFFFF"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={async () => {
              try {
                await Share.share({
                  message: `${event.title} — ${
                    event.location?.venue ?? ""
                  }`.trim(),
                });
              } catch {}
            }}
            style={styles.iconButton}
          >
            <BlurView
              intensity={20}
              tint="dark"
              style={StyleSheet.absoluteFillObject}
            />
            <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setFavorited((v) => !v)}
            style={[styles.iconButton, favorited && styles.iconButtonActive]}
          >
            <BlurView
              intensity={20}
              tint="dark"
              style={StyleSheet.absoluteFillObject}
            />
            <Ionicons
              name={favorited ? "bookmark" : "bookmark-outline"}
              size={20}
              color={favorited ? "#F2C94C" : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    height: 400,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  cardContainerFull: {
    height: "100%",
    borderRadius: 0,
  },
  imageBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#000",
  },
  image: {
    resizeMode: "cover",
    backgroundColor: "#111",
  },
  imageFull: {
    // Ensures full-bleed coverage in full variant
    resizeMode: "cover",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  contentOverlay: {
    padding: 20,
    zIndex: 2,
  },
  contentOverlayFull: {
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 12,
    flexShrink: 1,
  },
  compatibilityBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  compatibilityBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 20,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: 16,
  },
  metaText: {
    color: "white",
    fontSize: 13,
    opacity: 0.9,
  },
  description: {
    color: "white",
    fontSize: 13,
    opacity: 0.8,
    marginBottom: 16,
  },
  membersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatars: {
    flexDirection: "row",
    marginRight: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "white",
    marginRight: -8,
  },
  avatarMore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#7e22ce",
    borderWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -8,
  },
  avatarMoreText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  avatarInitial: {
    backgroundColor: "#7e22ce",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitialText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  memberText: {
    color: "white",
    opacity: 0.8,
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButtonsRow: {
    flexDirection: "row", // flex
    alignItems: "center", // items-center
    columnGap: 12, // space-x-3
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  actionButtonPrimary: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  actionButtonSecondary: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    zIndex: 1,
  },
  sideActions: {
    position: "absolute",
    right: 16, // ~ right-4
    top: "50%", // top-1/2
    transform: [{ translateY: -60 }], // -translate-y-1/2 of stack (~3 * 48 / 2)
    zIndex: 3,
    alignItems: "center", // items-center
    gap: 16, // space-y-4
  },
  sideActionsFull: {
    top: "45%",
  },
  iconButton: {
    width: 50, // w-10
    height: 50, // h-10
    backgroundColor: "rgba(255,255,255,0.08)", // hover:bg-white/20 equivalent not available; static
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12, // rounded-lg
    borderWidth: 1, // border
    borderColor: "rgba(255,255,255,0.1)", // border-white/10
    overflow: "hidden", // for BlurView clip
    shadowColor: "#000", // shadow-sm
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  iconButtonActive: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.2)",
  },
});

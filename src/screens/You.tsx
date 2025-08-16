import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Platform,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { User } from "lucide-react-native";

import LoadingSpinner from "../components/LoadSpinner";
import TimelineEventCard from "../components/TimelineEventCard";
import FloatingFilters from "../components/FloatingFilters";
import SearchInput from "../components/SearchInput";
import { Button } from "../components/Button";

import { eventsService } from "../services/events";
import { RootStackParamList } from "../navigation/types";
import { useAssets } from "expo-asset";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FeedScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function You() {
  const navigation = useNavigation<FeedScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "thisweek" | "saved" | "liked"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "activity">("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [assets] = useAssets([require("../../assets/JoynOS_Logo.png")]);
  const [joinedEvents, setJoinedEvents] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      try {
        const mine: any = await eventsService.myEvents();
        const items: any[] = Array.isArray(mine)
          ? mine
          : Array.isArray(mine?.items)
          ? mine.items
          : [];
        const normalized = items.map((it: any) => {
          const ev = it.event ?? it;
          const member = it.member ?? ev.member ?? null;
          const tags =
            Array.isArray(ev.tags) && ev.tags.length > 0
              ? ev.tags
              : ev.aiNormalized?.tags ?? [];
          const vibeBase = Array.isArray(tags) ? tags.length : 0;
          const statusRaw = member?.status ?? null;
          const status =
            statusRaw === "JOINED"
              ? "Attending"
              : statusRaw === "COMMITTED"
              ? "Attending"
              : statusRaw === "ATTENDED"
              ? "Attended"
              : "Interested";
          return {
            id: ev.id,
            title: ev.title,
            imageUrl: ev.imageUrl,
            startTime: ev.startTime,
            endTime: ev.endTime,
            venue: ev.venue ?? ev.address ?? "",
            attendees:
              typeof ev.attendeesCount === "number"
                ? ev.attendeesCount
                : ev.interestedCount,
            maxAttendees:
              typeof ev.maxAttendees === "number" ? ev.maxAttendees : undefined,
            status,
            vibeScore:
              ev.vibeMatchScoreEvent ||
              Math.min(95, Math.max(75, 80 + vibeBase * 2)),
            vibeMatchScoreWithOtherUsers: ev.vibeMatchScoreWithOtherUsers,
            lastMessage: undefined,
            unreadCount: 0,
            category: tags?.[0] ?? "Event",
          };
        });
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const sortedByDate = normalized.sort(
          (a: any, b: any) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        const thisWeekEvents = sortedByDate.filter((event: any) => {
          const eventDate = new Date(event.startTime);
          return eventDate >= startOfWeek && eventDate <= endOfWeek;
        });

        const pastEvents = sortedByDate
          .filter((event: any) => {
            const eventDate = new Date(event.startTime);
            return eventDate < startOfWeek;
          })
          .reverse();

        const futureEvents = sortedByDate.filter((event: any) => {
          const eventDate = new Date(event.startTime);
          return eventDate > endOfWeek;
        });

        setJoinedEvents([...pastEvents, ...thisWeekEvents, ...futureEvents]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const handleSearchClose = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <LoadingSpinner size="lg" />
      </View>
    );
  }

  const loadMoreEvents = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error loading more events:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const getFilteredEvents = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    let events: any[];
    switch (activeFilter) {
      case "all":
        events = [...joinedEvents];
        break;
      case "thisweek":
        events = joinedEvents.filter((event: any) => {
          const eventDate = new Date(event.startTime);
          return eventDate >= startOfWeek && eventDate <= endOfWeek;
        });
        break;
      case "saved":
        events = [];
        break;
      case "liked":
        events = [];
        break;
      default:
        events = joinedEvents;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      events = events.filter(
        (event: any) =>
          (event.title || "").toLowerCase().includes(query) ||
          (event.venue || "").toLowerCase().includes(query) ||
          (event.category || "").toLowerCase().includes(query) ||
          (event.lastMessage && event.lastMessage.toLowerCase().includes(query))
      );
    }

    if (sortBy === "activity") {
      return events.sort((a: any, b: any) => {
        const aActivity = a.lastMessageTime || a.startTime;
        const bActivity = b.lastMessageTime || b.startTime;
        return new Date(bActivity).getTime() - new Date(aActivity).getTime();
      });
    }

    return events;
  };

  const filteredEvents = getFilteredEvents();

  return (
    <View style={styles.container}>
      {/* Dynamic gradient background */}
      <View style={styles.dynamicGradient1} />
      <View style={styles.dynamicGradient2} />

      {/* Gradient Overlay for Header Readability */}
      <View style={styles.headerGradientOverlay} />

      {/* Floating Header */}
      <View style={[styles.header, { top: insets.top + 12 }]}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../assets/JoynOS_Logo.png")}
            style={styles.logo}
          />
          <View style={styles.filterPills}>
            {[
              { id: "you", label: "Timeline" },
              { id: "feed", label: "Feed" },
              { id: "discovery", label: "Discovery" },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => {
                  if (tab.id === "feed") navigation.navigate("Feed");
                  else if (tab.id === "discovery")
                    navigation.navigate("Discovery" as never);
                }}
                style={[
                  styles.filterPill,
                  tab.id === "you" ? styles.filterPillActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    tab.id === "you" ? styles.filterPillTextActive : null,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.headerRight}>
          <Button
            onPress={() => navigation.navigate("Profile" as never)}
            style={styles.iconButton}
            title=""
          >
            <User size={20} color="white" />
          </Button>
        </View>
      </View>
      {filteredEvents.length === 0 && (
        <View className="flex-1 justify-center items-center px-3 h-64">
          <Text className="text-white font-bold text-lg mb-2">
            {searchQuery ? "No events found" : "No events found"}
          </Text>
          <Text className="text-white/60 text-sm text-center mb-4">
            {searchQuery
              ? `No events match "${searchQuery}". Try a different search term.`
              : "You haven't joined any events yet"}
          </Text>
        </View>
      )}
      <FlatList
        ref={flatListRef}
        data={filteredEvents}
        keyExtractor={(item: any) => String(item.id)}
        contentContainerStyle={{
          paddingTop: Platform.OS === "ios" ? 0 : 20,
          paddingBottom: insets.top + 90,
          paddingHorizontal: 16,
        }}
        renderItem={({ item: event }) => {
          const now = new Date();
          const eventDate = new Date(event.startTime);
          const isPastEvent = eventDate < now;

          return (
            <View style={{ marginBottom: 12, opacity: isPastEvent ? 0.6 : 1 }}>
              <TimelineEventCard
                event={event}
                onPress={() =>
                  navigation.navigate("EventDetail", {
                    id: String(event.id),
                  })
                }
              />
            </View>
          );
        }}
        ListHeaderComponent={() => (
          <View className="mb-6">
            {joinedEvents.length > 0 && (
              <View className="px-4 mb-4">
                <Text className="text-white text-lg font-semibold">Your Events Timeline</Text>
                <Text className="text-white/60 text-sm mt-1">Events you've joined or attended</Text>
              </View>
            )}
            
            {isLoadingMore ? (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            ) : null}
          </View>
        )}
        onScrollBeginDrag={(event) => {
          const { velocity } = event.nativeEvent;
          if (velocity && velocity.y < -2) {
            loadMoreEvents();
          }
        }}
        onLayout={() => {
          setTimeout(() => {
            if (activeFilter === "thisweek") {
              const thisWeekIndex = filteredEvents.findIndex((event: any) => {
                const now = new Date();
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                const eventDate = new Date(event.startTime);
                return eventDate >= startOfWeek;
              });
              if (thisWeekIndex > 0) {
                flatListRef.current?.scrollToIndex({
                  index: thisWeekIndex,
                  animated: false,
                  viewPosition: 0.3,
                });
              }
            }
          }, 100);
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        inverted
      />

      <FloatingFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onSearchToggle={handleSearchToggle}
        isSearchOpen={isSearchOpen}
        searchQuery={searchQuery}
      />

      {isSearchOpen && (
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClose={handleSearchClose}
          placeholder="Search events by title, venue, or category..."
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  dynamicGradient1: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 1,
  },
  dynamicGradient2: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 196, 140, 0.1)",
    opacity: 0.1,
  },
  headerGradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 128,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  header: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 12,
  },
  navigationPills: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    overflow: "hidden",
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  navButtonActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
  },
  navButtonTextActive: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "transparent",
  },
  sortButtonContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
  },
  filterPills: {
    flexDirection: "row",
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  filterPillActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
  },
  filterPillTextActive: {
    color: "#fff",
  },
});

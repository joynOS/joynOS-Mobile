import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Platform, StyleSheet, Image, TouchableOpacity } from "react-native";
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

type FeedScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function You() {
  const navigation = useNavigation<FeedScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "joined" | "saved" | "liked">("all");
  const [sortBy, setSortBy] = useState<"date" | "activity">("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [assets] = useAssets([require("../../assets/JoynOS_Logo.png")]);
  const [joinedEvents, setJoinedEvents] = useState<any[]>([]);

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
            statusRaw === "JOINED" || statusRaw === "COMMITTED"
              ? "attending"
              : statusRaw === "ATTENDED"
              ? "attended"
              : "interested";
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
        const sorted = normalized.sort(
          (a: any, b: any) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        setJoinedEvents(sorted);
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

  const getFilteredEvents = () => {
    let events: any[];
    switch (activeFilter) {
      case "all":
        events = [...joinedEvents];
        break;
      case "joined":
        events = joinedEvents;
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
          (event.lastMessage &&
            event.lastMessage.toLowerCase().includes(query))
      );
    }

    if (sortBy === "activity") {
      return events.sort((a: any, b: any) => {
        const aActivity =
          a.lastMessageTime ||
          a.startTime;
        const bActivity =
          b.lastMessageTime ||
          b.startTime;
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
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {assets ? (
              <Image
                source={{ uri: assets[0].localUri || assets[0].uri }}
                style={styles.logo}
              />
            ) : (
              <LoadingSpinner size="sm" />
            )}

            <View style={styles.navigationPills}>
              <TouchableOpacity style={styles.navButtonActive}>
                <Text style={styles.navButtonTextActive}>Timeline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("Feed")}
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>Feed</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("Discovery" as never)}
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>Discovery</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Button
              onPress={() => navigation.navigate("Profile")}
              style={styles.iconButton}
              title=""
            >
              <User size={20} color="white" />
            </Button>
          </View>
        </View>

        {/* Sort Toggle Button */}
        <View style={styles.sortButtonContainer}>
          <Button
            onPress={() => setSortBy(sortBy === "date" ? "activity" : "date")}
            style={styles.sortButton}
            title=""
          >
            <Text style={styles.sortButtonText}>
              {sortBy === "date" ? "Sort by Date" : "Sort by Activity"}
            </Text>
          </Button>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingTop: Platform.OS === 'ios' ? 200 : 180, paddingBottom: 24 }}
      >
        <View className="px-4">
          {filteredEvents.length > 0 ? (
            <View className="space-y-3">
              {filteredEvents.map((event: any) => (
                <TimelineEventCard
                  key={event.id}
                  event={event}
                  onPress={() =>
                    navigation.navigate("EventDetail", {
                      id: String(event.id),
                    })
                  }
                />
              ))}
            </View>
          ) : (
            <View className="flex-1 justify-center items-center px-3 h-64">
              <View className="w-16 h-16 rounded-full bg-joyn-green/20 justify-center items-center mb-4">
                <Text className="text-joyn-green text-2xl">📅</Text>
              </View>
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
        </View>
      </ScrollView>

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
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 48 : 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
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
});


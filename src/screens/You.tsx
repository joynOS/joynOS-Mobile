import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Platform,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Button } from "../components/Button";
import LoadingSpinner from "../components/LoadSpinner";

import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  Bookmark,
  MessageCircle,
  MoreHorizontal,
  ChevronRight,
  Star,
  User,
  Filter,
  CheckCircle,
  AlertCircle,
  Timer,
  Grid3X3,
  UserCheck,
  ArrowUpDown,
  CalendarDays,
  Activity,
  Search,
  X,
} from "lucide-react-native";

import { eventsService } from "../services/events";
import { RootStackParamList } from "../navigation/types";
import { useAssets } from "expo-asset";
import EventImage from "../components/EventImage";
import TimelineEventCard from "../components/TimelineEventCard";

type FeedScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function You() {
  const navigation = useNavigation<FeedScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const user = { name: "Joyn User" };
  const [activeFilter, setActiveFilter] = useState<
    "all" | "joined" | "saved" | "liked"
  >("all");
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
            vibeScore: ev.vibeMatchScoreEvent || Math.min(95, Math.max(75, 80 + vibeBase * 2)),
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

  const getTimeUntilEvent = (startTime: Date) => {
    const now = new Date();
    const diff = startTime.getTime() - now.getTime();

    if (diff < 0) return "Past event";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0)
      return `${hours}h ${Math.floor(
        (diff % (1000 * 60 * 60)) / (1000 * 60)
      )}m`;
    return `${Math.floor(diff / (1000 * 60))}m`;
  };

  const getEventStatus = (event: any) => {
    const now = new Date();
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);

    if (now < eventStart) {
      const hoursUntil =
        (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursUntil <= 2)
        return {
          label: "Starting soon",
          color: styles.textJoynYellow,
          icon: Timer,
        };
      return { label: "Upcoming", color: styles.textJoynGreen, icon: Calendar };
    } else if (now >= eventStart && now <= eventEnd) {
      return { label: "Live now", color: styles.textRed400, icon: AlertCircle };
    } else {
      return {
        label: "Completed",
        color: styles.textWhite60,
        icon: CheckCircle,
      };
    }
  };

  const formatEventTime = (startTime: any) => {
    return new Date(startTime).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatSavedTime = (savedAt: Date) => {
    const now = new Date();
    const diff = now.getTime() - savedAt.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "Just saved";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const sortedUpcoming: any[] = useMemo(() => joinedEvents, [joinedEvents]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="lg" />
      </View>
    );
  }

  // Helper function to get time category for section headers
  const getTimeCategory = (eventTime: Date) => {
    const now = new Date();
    const timeDiff = eventTime.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (timeDiff < 0) {
      return "past";
    } else if (daysDiff === 0) {
      return "today";
    } else if (daysDiff <= 7) {
      return "thisWeek";
    } else if (daysDiff <= 30) {
      return "thisMonth";
    } else {
      return "later";
    }
  };

  const groupedEvents = sortedUpcoming.reduce(
    (groups: Record<string, any[]>, event: any) => {
      const category = getTimeCategory(new Date(event.startTime));
      if (!groups[category]) groups[category] = [];
      groups[category].push(event);
      return groups;
    },
    {} as Record<string, any[]>
  );

  const getFilteredEvents = () => {
    let events;
    switch (activeFilter) {
      case "all":
        events = [...sortedUpcoming];
        break;
      case "joined":
        events = sortedUpcoming;
        break;
      case "saved":
        events = [];
        break;
      case "liked":
        events = [];
        break;
      default:
        events = sortedUpcoming;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      events = events.filter(
        (event) =>
          (event.title || "").toLowerCase().includes(query) ||
          (event.venue || "").toLowerCase().includes(query) ||
          (event.category || "").toLowerCase().includes(query) ||
          ((event as any).lastMessage &&
            (event as any).lastMessage.toLowerCase().includes(query))
      );
    }

    if (sortBy === "activity") {
      return events.sort((a, b) => {
        const aActivity =
          (a as any).lastMessageTime ||
          (activeFilter === "saved" && (a as any).savedAt) ||
          (activeFilter === "liked" && (a as any).likedAt) ||
          a.startTime;
        const bActivity =
          (b as any).lastMessageTime ||
          (activeFilter === "saved" && (b as any).savedAt) ||
          (activeFilter === "liked" && (b as any).likedAt) ||
          b.startTime;
        return new Date(bActivity).getTime() - new Date(aActivity).getTime(); // Most recent first
      });
    }

    return events; // Default date sorting already applied
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

      <ScrollView contentContainerStyle={styles.mainContent}>
        <View style={styles.contentPadding}>
          {activeFilter === "all" || activeFilter === "joined" ? (
            <>
              {filteredEvents.length > 0 ? (
                <View style={styles.eventList}>
                  {Object.entries(groupedEvents).map(
                    ([timeCategory, events]) => {
                      if (events.length === 0) return null;

                      const getSectionTitle = (category: string) => {
                        switch (category) {
                          case "past":
                            return "Past Events";
                          case "today":
                            return "Today";
                          case "thisWeek":
                            return "This Week";
                          case "thisMonth":
                            return "This Month";
                          case "later":
                            return "Later";
                          default:
                            return category;
                        }
                      };

                      return (
                        <View key={timeCategory}>
                          <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                              {getSectionTitle(timeCategory)}
                            </Text>
                          </View>

                          <View style={styles.sectionEvents}>
                            {events.map((event) => {
                              const status = getEventStatus(event);
                              const StatusIcon = status.icon;

                              return (
                                <TouchableOpacity
                                  key={event.id}
                                  onPress={() =>
                                    navigation.navigate("EventDetail", {
                                      id: String(event.id),
                                    })
                                  }
                                  style={styles.eventCard}
                                  activeOpacity={0.8}
                                >
                                  <View className="relative h-40 w-full">
                                    <EventImage imageUrl={event.imageUrl} />

                                    <View style={styles.imageGradientOverlay} />

                                    <View
                                      style={styles.statusIndicatorContainer}
                                    >
                                      <View
                                        style={[
                                          styles.statusDot,
                                          status.label === "Live now"
                                            ? styles.bgRed400
                                            : status.label === "Starting soon"
                                            ? styles.bgJoynYellow
                                            : status.label === "Upcoming"
                                            ? styles.bgJoynGreen
                                            : styles.bgWhite60,
                                        ]}
                                      ></View>
                                    </View>

                                    {/* Title and Status Badge Row */}
                                    <View style={styles.titleStatusRow}>
                                      {/* Event Title */}
                                      <View style={styles.eventTitleBadge}>
                                        <Text
                                          style={styles.eventTitleText}
                                          numberOfLines={1}
                                        >
                                          {event.title || 'Untitled Event'}
                                        </Text>
                                        <Text
                                          style={styles.eventVenueText}
                                          numberOfLines={1}
                                        >
                                          {event.venue || 'Location TBD'}
                                        </Text>
                                      </View>

                                      {/* Status Badge Stack */}
                                      <View style={styles.statusBadgeStack}>
                                        <View style={styles.statusBadge}>
                                          <Text
                                            style={[
                                              styles.statusBadgeText,
                                              event.status === "attending"
                                                ? styles.textJoynGreen
                                                : event.status === "interested"
                                                ? styles.textJoynPurple
                                                : styles.textWhite60,
                                            ]}
                                          >
                                            {event.status === "attending"
                                              ? "Joined"
                                              : event.status === "interested"
                                              ? "Interested"
                                              : "Attended"}
                                          </Text>
                                        </View>

                                        {/* Vibe Score */}
                                        <View style={styles.vibeScoreBadge}>
                                          <Text
                                            style={styles.vibeScoreBadgeText}
                                          >
                                            {event.vibeScore}%
                                          </Text>
                                        </View>
                                        
                                        {/* Vibe Match with Others */}
                                        {event.vibeMatchScoreWithOtherUsers && (
                                          <View style={styles.vibeMatchBadge}>
                                            <Text style={styles.vibeMatchBadgeText}>
                                              {event.vibeMatchScoreWithOtherUsers}% match
                                            </Text>
                                          </View>
                                        )}
                                      </View>
                                    </View>
                                  </View>

                                  {/* Content Overlay */}
                                  <View style={styles.contentOverlay}>
                                    <View style={styles.contentOverlayInner}>
                                      {/* Time Only */}
                                      <View>
                                        <Text style={styles.timeText}>
                                          <Text style={styles.timeTextBold}>
                                            {formatEventTime(event.startTime)}
                                          </Text>
                                        </Text>
                                      </View>

                                      {/* Last Message or Rating */}
                                      {event.status === "attended" &&
                                      event.userRating ? (
                                        <View style={styles.ratingContainer}>
                                          <View style={styles.starRating}>
                                            {[...Array(5)].map((_, i) => (
                                              <View
                                                key={i}
                                                style={[
                                                  styles.starDot,
                                                  i < event.userRating!
                                                    ? styles.bgJoynYellow
                                                    : styles.bgWhite40,
                                                ]}
                                              />
                                            ))}
                                          </View>
                                          <Text style={styles.ratingText}>
                                            Rated
                                          </Text>
                                        </View>
                                      ) : (
                                        event.lastMessage && (
                                          <View
                                            style={styles.lastMessageContainer}
                                          >
                                            <Text
                                              style={styles.lastMessageText}
                                              numberOfLines={1}
                                            >
                                              {event.lastMessage || 'No messages yet'}
                                            </Text>
                                            {(event.unreadCount ?? 0) > 0 && (
                                              <View
                                                style={styles.unreadCountBadge}
                                              >
                                                <Text
                                                  style={styles.unreadCountText}
                                                >
                                                  {event.unreadCount}
                                                </Text>
                                              </View>
                                            )}
                                          </View>
                                        )
                                      )}

                                      <View style={styles.attendeesContainer}>
                                        {typeof event.attendees === "number" &&
                                        typeof event.maxAttendees ===
                                          "number" ? (
                                          <Text style={styles.attendeesText}>
                                            {event.attendees}/
                                            {event.maxAttendees} people
                                          </Text>
                                        ) : (
                                          <View />
                                        )}
                                        <Text
                                          style={[
                                            styles.eventTimeRemaining,
                                            status.color,
                                          ]}
                                        >
                                          {status.label !== "Completed" &&
                                            getTimeUntilEvent(event.startTime)}
                                        </Text>
                                      </View>
                                    </View>
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      );
                    }
                  )}
                </View>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <View style={styles.emptyStateCircle}>
                    {searchQuery ? (
                      <Search size={32} color={styles.textBlue400.color} />
                    ) : (
                      <Calendar size={32} color={styles.textJoynGreen.color} />
                    )}
                  </View>
                  <Text style={styles.emptyStateTitle}>
                    {searchQuery ? "No events found" : "No events found"}
                  </Text>
                  <Text style={styles.emptyStateSubtitle}>
                    {searchQuery
                      ? `No events match "${searchQuery}". Try a different search term.`
                      : "You haven't joined any events yet"}
                  </Text>
                  {searchQuery ? (
                    <Button
                      onPress={() => setSearchQuery("")}
                      style={styles.clearSearchButton}
                      title="Clear Search"
                    />
                  ) : (
                    <Button
                      onPress={() => navigation.navigate("Feed")}
                      style={styles.discoverEventsButton}
                      title="Discover Events"
                    />
                  )}
                </View>
              )}
            </>
          ) : (
            /* Saved and Liked Events */
            <>
              {filteredEvents.length > 0 ? (
                <View style={styles.eventList}>
                  {filteredEvents.map((event) => (
                    <TouchableOpacity
                      key={event.id}
                      onPress={() =>
                        navigation.navigate("EventDetail", {
                          id: String(event.id),
                        })
                      }
                      style={styles.eventCard}
                      activeOpacity={0.8}
                    >
                      <View className="relative w-10  h-40 ">
                        <EventImage imageUrl={event.imageUrl} />

                        <View style={styles.imageGradientOverlay} />

                        {/* Title and Category Badge Row */}
                        <View style={styles.titleCategoryRow}>
                          {/* Event Title */}
                          <View style={styles.eventTitleBadge}>
                            <Text
                              style={styles.eventTitleText}
                              numberOfLines={1}
                            >
                              {event.title || 'Untitled Event'}
                            </Text>
                            <Text
                              style={styles.eventVenueText}
                              numberOfLines={1}
                            >
                              {event.venue || 'Location TBD'}
                            </Text>
                          </View>

                          {/* Category Badge Stack */}
                          <View style={styles.categoryBadgeStack}>
                            <View
                              style={[
                                styles.categoryBadge,
                                activeFilter === "saved"
                                  ? styles.bgJoynYellow90
                                  : activeFilter === "liked"
                                  ? styles.bgJoynPurple90
                                  : styles.bgBlack60,
                              ]}
                            >
                              <Text style={styles.categoryBadgeText}>
                                {activeFilter === "saved"
                                  ? "Saved"
                                  : activeFilter === "liked"
                                  ? "Liked"
                                  : "Event"}
                              </Text>
                            </View>

                            {/* Vibe Score */}
                            <View style={styles.vibeScoreBadge}>
                              <Text style={styles.vibeScoreBadgeText}>
                                {event.vibeScore}%
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Action Date */}
                        <View style={styles.actionDateContainer}>
                          <View style={styles.actionDateBadge}>
                            <Text style={styles.actionDateText}>
                              {activeFilter === "saved" &&
                              (event as any).savedAt
                                ? formatSavedTime((event as any).savedAt)
                                : activeFilter === "liked" &&
                                  (event as any).likedAt
                                ? formatSavedTime((event as any).likedAt)
                                : formatEventTime(event.startTime)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Content Overlay */}
                      <View style={styles.contentOverlay}>
                        <View style={styles.contentOverlayInner}>
                          {/* Time Only */}
                          <View>
                            <Text style={styles.timeText}>
                              <Text style={styles.timeTextBold}>
                                {formatEventTime(event.startTime)}
                              </Text>
                            </Text>
                          </View>

                          {/* Attendees and Join Button */}
                          <View style={styles.attendeesJoinContainer}>
                            {typeof event.attendees === "number" &&
                            typeof event.maxAttendees === "number" ? (
                              <Text style={styles.attendeesText}>
                                {event.attendees}/{event.maxAttendees} people
                              </Text>
                            ) : (
                              <View />
                            )}

                            <Button
                              onPress={() =>
                                console.log("Join event:", event.id)
                              } // Your join logic here
                              style={styles.joinButton}
                              title="Join"
                            />
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <View style={styles.emptyStateCircleSavedLiked}>
                    {searchQuery ? (
                      <Search size={32} color={styles.textBlue400.color} />
                    ) : activeFilter === "saved" ? (
                      <Bookmark size={32} color={styles.textJoynYellow.color} />
                    ) : activeFilter === "liked" ? (
                      <Heart size={32} color={styles.textJoynPurple.color} />
                    ) : (
                      <Calendar size={32} color={styles.textJoynGreen.color} />
                    )}
                  </View>
                  <Text style={styles.emptyStateTitle}>
                    {searchQuery
                      ? "No events found"
                      : activeFilter === "saved"
                      ? "No saved events"
                      : activeFilter === "liked"
                      ? "No liked events"
                      : "No events found"}
                  </Text>
                  <Text style={styles.emptyStateSubtitle}>
                    {searchQuery
                      ? `No events match "${searchQuery}". Try a different search term.`
                      : activeFilter === "saved"
                      ? "Save events you're interested in to view them later"
                      : activeFilter === "liked"
                      ? "Like events to keep track of ones you enjoyed"
                      : "Browse events to discover new experiences"}
                  </Text>
                  {searchQuery ? (
                    <Button
                      onPress={() => setSearchQuery("")}
                      style={styles.clearSearchButton}
                      title="Clear Search"
                    />
                  ) : (
                    <Button
                      onPress={() => navigation.navigate("Feed")}
                      style={styles.browseEventsButton}
                      title="Browse Events"
                    />
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.floatingFilterButtons}>
        <Button
          onPress={() => setActiveFilter("all")}
          style={[
            styles.floatingIconButton,
            activeFilter === "all" && styles.floatingButtonActive,
          ]}
          title=""
        >
          <Grid3X3 size={20} color="white" />
        </Button>

        <Button
          onPress={() => setActiveFilter("joined")}
          style={[
            styles.floatingIconButton,
            activeFilter === "joined" && styles.floatingButtonJoinedActive,
          ]}
          title=""
        >
          <UserCheck size={20} color="white" />
        </Button>

        <Button
          onPress={() => setActiveFilter("saved")}
          style={[
            styles.floatingIconButton,
            activeFilter === "saved" && styles.floatingButtonSavedActive,
          ]}
          title=""
        >
          <Bookmark size={20} color="white" />
        </Button>

        <Button
          onPress={() => setActiveFilter("liked")}
          style={[
            styles.floatingIconButton,
            activeFilter === "liked" && styles.floatingButtonLikedActive,
          ]}
          title=""
        >
          <Heart size={20} color="white" />
        </Button>

        <Button
          onPress={() => setIsSearchOpen(!isSearchOpen)}
          style={[
            styles.floatingIconButton,
            (isSearchOpen || searchQuery) && styles.floatingButtonSearchActive,
          ]}
          title=""
        >
          <Search size={20} color="white" />
        </Button>
      </View>

      {isSearchOpen && (
        <View style={styles.searchInputOverlay}>
          <View style={styles.searchInputContainer}>
            <TextInput
              placeholder="Search events by title, venue, or category..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              autoFocus
            />
            <Search
              style={styles.searchInputIcon}
              size={20}
              color="rgba(255,255,255,0.6)"
            />
            <Button
              onPress={() => {
                setSearchQuery("");
                setIsSearchOpen(false);
              }}
              style={styles.clearSearchButtonIcon}
              title=""
            >
              <X size={16} color="rgba(255,255,255,0.6)" />
            </Button>
          </View>

          {searchQuery.length > 0 && (
            <View style={styles.searchResultsCount}>
              <Text style={styles.searchResultsText}>
                {filteredEvents.length} event
                {filteredEvents.length !== 1 ? "s" : ""} found
                {searchQuery ? ` for "${searchQuery}"` : ""}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "rgba(0, 196, 140, 0.1)", // Corresponds to --joyn-green 0%, transparent 50%
    opacity: 0.1,
  },
  headerGradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 128,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.4)", // Simplified gradient from black/40 to transparent
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 48 : 20, // Adjust for status bar
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
    borderRadius: 20, // More rounded corners
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
  mainContent: {
    paddingTop: Platform.OS === "ios" ? 180 : 150,
    paddingBottom: 24,
  },
  contentPadding: {
    paddingHorizontal: 16,
  },
  eventList: {
    // space-y-4 translates to marginBottom on each item or gap on container
    // For ScrollView contentContainerStyle, spacing is usually applied within the items
  },
  sectionHeader: {
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionEvents: {
    // space-y-3
  },
  eventCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  eventCardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  imageGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)", // Simplified gradient from black/80 via black/20 to transparent
  },
  statusIndicatorContainer: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  titleStatusRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  eventTitleBadge: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    maxWidth: "60%",
  },
  eventTitleText: {
    color: "white",
    fontWeight: "500",
    fontSize: 12,
  },
  eventVenueText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 2,
  },
  statusBadgeStack: {
    flexDirection: "column",
    alignItems: "flex-end",
    // space-y-1 equivalent: margin for each item
  },
  statusBadge: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 999, // full rounded
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4, // space-y-1
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  vibeScoreBadge: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4, // space-y-1
  },
  vibeScoreBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  contentOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)", // Simplified gradient from black/90 to black/60
    padding: 16,
  },
  contentOverlayInner: {
    // space-y-2.5
  },
  timeText: {
    fontSize: 14,
    marginBottom: 10, // space-y-2.5
  },
  timeTextBold: {
    color: "white",
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10, // space-y-2.5
  },
  starRating: {
    flexDirection: "row",
    marginRight: 8, // space-x-2
  },
  starDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4, // space-x-1
  },
  ratingText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  lastMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10, // space-y-2.5
  },
  lastMessageText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    flex: 1,
    marginRight: 12, // mr-3
    fontWeight: "500",
  },
  unreadCountBadge: {
    backgroundColor: "#00C48C",
    color: "white",
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
  },
  unreadCountText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  attendeesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  attendeesText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  eventTimeRemaining: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 256, // h-64
  },
  emptyStateCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,196,140,0.2)", // from-joyn-green/20 to-joyn-purple/20 (simplified)
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateCircleSavedLiked: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(242, 201, 76, 0.2)", // from-joyn-yellow/20 to-joyn-purple/20 (simplified)
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  clearSearchButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 20,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  discoverEventsButton: {
    backgroundColor: "#00C48C", // bg-joyn-green
    borderRadius: 20, // rounded-xl
    paddingHorizontal: 12, // px-6 // h-10
    justifyContent: "center",
    alignItems: "center",
  },
  browseEventsButton: {
    backgroundColor: "#00C48C", // bg-joyn-green
    borderRadius: 20, // rounded-xl
    paddingHorizontal: 12, // px-6 // h-10
    justifyContent: "center",
    alignItems: "center",
  },
  // Saved and Liked Event Specific Styles
  titleCategoryRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  categoryBadgeStack: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  categoryBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "white",
  },
  actionDateContainer: {
    position: "absolute",
    top: 12,
    left: "50%",
    transform: [{ translateX: -70 }], // Approx half of max-width of title+padding
  },
  actionDateBadge: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionDateText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
  },
  attendeesJoinContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  joinButton: {
    backgroundColor: "#00C48C", // bg-joyn-green
    borderRadius: 8, // rounded-lg
    paddingHorizontal: 16, // px-4
    paddingVertical: 8, // py-2
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Floating Filter Buttons
  floatingFilterButtons: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -Dimensions.get("window").height * 0.25 }], // Adjust translateY for vertical centering
    flexDirection: "column",
    alignItems: "center",
    // space-y-3
  },
  floatingIconButton: {
    width: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.05)", // base for backdrop-blur-md
    marginBottom: 12, // space-y-3, adjust as needed
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  floatingButtonActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  floatingButtonJoinedActive: {
    backgroundColor: "rgba(0,196,140,0.2)",
    borderColor: "rgba(0,196,140,0.3)",
  },
  floatingButtonSavedActive: {
    backgroundColor: "rgba(242, 201, 76, 0.2)",
    borderColor: "rgba(242, 201, 76, 0.3)",
  },
  floatingButtonLikedActive: {
    backgroundColor: "rgba(155, 81, 224, 0.2)",
    borderColor: "rgba(155, 81, 224, 0.3)",
  },
  floatingButtonSearchActive: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderColor: "rgba(59, 130, 246, 0.3)",
  },

  // Search Input Overlay
  searchInputOverlay: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 24,
    left: 16,
    right: 16,
    zIndex: 30,
  },
  searchInputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    paddingLeft: 48, // pl-12
    paddingRight: 48, // pr-12
    paddingVertical: 12, // py-3
    backgroundColor: "rgba(0,0,0,0.8)",
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderRadius: 16, // rounded-2xl
    color: "white",
    fontSize: 16,
  },
  searchInputIcon: {
    position: "absolute",
    left: 16, // left-4
  },
  clearSearchButtonIcon: {
    position: "absolute",
    right: 8, // right-2
    width: 32, // w-8
    height: 32, // h-8
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  searchResultsCount: {
    marginTop: 8, // mt-2
    paddingHorizontal: 16, // px-4
    paddingVertical: 8, // py-2
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 8, // rounded-lg
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  searchResultsText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },

  textJoynYellow: { color: "#F2C94C" },
  textJoynGreen: { color: "#00C48C" },
  textJoynPurple: { color: "#9B51E0" },
  textRed400: { color: "#EF4444" }, // Approximated
  textWhite60: { color: "rgba(255,255,255,0.6)" },
  textBlue400: { color: "#60A5FA" }, // Approximated

  bgJoynYellow: { backgroundColor: "#F2C94C" },
  bgJoynGreen: { backgroundColor: "#00C48C" },
  bgJoynPurple: { backgroundColor: "#9B51E0" },
  bgRed400: { backgroundColor: "#EF4444" }, // Approximated
  bgWhite60: { backgroundColor: "rgba(255,255,255,0.6)" },
  bgWhite40: { backgroundColor: "rgba(255,255,255,0.4)" },
  bgBlack60: { backgroundColor: "rgba(0,0,0,0.6)" },
  bgJoynYellow90: { backgroundColor: "rgba(242, 201, 76, 0.9)" },
  bgJoynPurple90: { backgroundColor: "rgba(155, 81, 224, 0.9)" },
  
  vibeMatchBadge: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  vibeMatchBadgeText: {
    color: "#00C48C",
    fontSize: 10,
    fontWeight: "600",
  },
});

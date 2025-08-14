import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Button from "../components/Button";
import EventCard from "../components/EventCard";
import LoadingSpinner from "../components/LoadSpinner";
import LiveIntentCapture from "../components/LiveIntentCapture";
import Spinner from "../components/Spinner";
import { Filter, Plus, Search, User } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { eventsService } from "../services/events";
import { RootStackParamList } from "../navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type YouScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "You"
>;

type IntentData = {
  id?: string;
  description?: string;
};

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const GRID_ITEM_WIDTH = (windowWidth - 24) / 2;

export default function Feed() {
  const navigation = useNavigation<any>();

  const [activeFilter, setActiveFilter] = useState("feed");
  const [showIntentCapture, setShowIntentCapture] = useState(false);
  const [currentIntent, setCurrentIntent] = useState(null);
  const insets = useSafeAreaInsets();

  const [feedEvents, setFeedEvents] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [discovery, setDiscovery] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMoreRec, setHasMoreRec] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const rec = await eventsService.recommendations();
        setCursor(rec.nextCursor);
        setHasMoreRec(!!rec.nextCursor && (rec.items?.length ?? 0) > 0);
        const browse = await eventsService.browse();
        const list = Array.isArray(browse) ? browse : (browse && (browse as any).items ? (browse as any).items : []);
        setDiscovery(list);
        const detailCards = await Promise.all(
          (rec.items || []).slice(0, 6).map(async (it) => {
            const d = await eventsService.getById(it.eventId);
            return d;
          })
        );
        setFeedEvents(detailCards);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filterTabs = [
    { id: "you", label: "Timeline" },
    { id: "feed", label: "Feed" },
    { id: "discovery", label: "Discovery" },
  ];

  // Calculate viewport height for snap pagination (full screen height)
  const VIEWPORT_HEIGHT = windowHeight;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="lg" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient Overlay */}
      <LinearGradient
        colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.2)", "transparent"]}
        style={[styles.gradientOverlay, { paddingTop: insets.top }]}
      />

      {/* Floating Header */}
      <View style={[styles.header, { top: insets.top + 12 }]}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../assets/JoynOS_Logo.png")}
            style={styles.logo}
          />
          <View style={styles.filterPills}>
            {filterTabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => {
                  if (tab.id === "you") navigation.navigate("You");
                  else if (tab.id === "discovery") navigation.navigate("Discovery" as never);
                  else setActiveFilter(tab.id);
                }}
                style={[
                  styles.filterPill,
                  activeFilter === tab.id ? styles.filterPillActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === tab.id
                      ? styles.filterPillTextActive
                      : null,
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
          <Button
            onPress={() => setShowIntentCapture(!showIntentCapture)}
            style={[
              styles.iconButton,
              currentIntent
                ? { backgroundColor: "rgba(0, 196, 140, 0.125)" }
                : null,
            ]}
            title=""
          >
            <Search size={20} color="white" />
          </Button>
        </View>
      </View>

      {/* Live Intent Capture */}
      {showIntentCapture && (
        <View style={[styles.intentCapture, { top: insets.top + 60 }]}>
          <LiveIntentCapture
            onIntentUpdate={(intent) => {
              //setCurrentIntent(intent);
              console.log("Intent updated:", intent);
            }}
          />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {activeFilter === "feed" ? (
          <FlatList
            data={feedEvents}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TouchableWithoutFeedback
                onPress={() =>
                  navigation.navigate(
                    "EventDetail" as never,
                    { id: String(item.id) } as never
                  )
                }
              >
                <View
                  style={{ height: VIEWPORT_HEIGHT, backgroundColor: "#000" }}
                >
                  <EventCard event={item} variant="full" />
                </View>
              </TouchableWithoutFeedback>
            )}
            snapToInterval={VIEWPORT_HEIGHT}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            initialNumToRender={3}
            windowSize={5}
            removeClippedSubviews
            getItemLayout={(_, index) => ({
              length: VIEWPORT_HEIGHT,
              offset: VIEWPORT_HEIGHT * index,
              index,
            })}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.6}
            onEndReached={async () => {
              if (feedEvents.length === 0) return;
              if (isLoadingMore || !hasMoreRec) return;
              setIsLoadingMore(true);
              try {
                const rec = await eventsService.recommendations(
                  cursor ? { cursor } : undefined
                );
                setCursor(rec.nextCursor);
                setHasMoreRec(!!rec.nextCursor && (rec.items?.length ?? 0) > 0);
                const detailCards = await Promise.all(
                  rec.items
                    .slice(0, 5)
                    .map(async (it) => eventsService.getById(it.eventId))
                );
                if (detailCards.length > 0) {
                  setFeedEvents((prev) => [...prev, ...detailCards]);
                }
              } finally {
                setIsLoadingMore(false);
              }
            }}
            refreshControl={
              <RefreshControl
                tintColor="#cc5c24"
                refreshing={isRefreshing}
                onRefresh={async () => {
                  setIsRefreshing(true);
                  try {
                    const rec = await eventsService.recommendations();
                    setCursor(rec.nextCursor);
                    setHasMoreRec(
                      !!rec.nextCursor && (rec.items?.length ?? 0) > 0
                    );
                    const browse = await eventsService.browse();
                    const list = Array.isArray(browse) ? browse : (browse && (browse as any).items ? (browse as any).items : []);
                    setDiscovery(list);
                    const detailCards = await Promise.all(
                      (rec.items || [])
                        .slice(0, 6)
                        .map(async (it) => eventsService.getById(it.eventId))
                    );
                    setFeedEvents(detailCards);
                  } finally {
                    setIsRefreshing(false);
                  }
                }}
              />
            }
            ListFooterComponent={
              isLoadingMore ? (
                <View style={{ padding: 16 }}>
                  <ActivityIndicator color="#cc5c24" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyCircle} />
                <Text style={styles.emptyTitle}>No content found</Text>
                <Text style={styles.emptySubtitle}>
                  Try refreshing or adjust your discovery radius and interests
                </Text>
              </View>
            }
          />
        ) : (
          /* Discovery View */
          <View style={styles.discoveryContainer}>
            <LinearGradient
              colors={["rgba(0,0,0,0.05)", "transparent"]}
              style={StyleSheet.absoluteFill}
            />

            <ScrollView
              contentContainerStyle={[
                styles.gridContainer,
                { paddingTop: insets.top + 160, paddingBottom: 16 },
              ]}
              showsVerticalScrollIndicator={false}
              //inverted={Platform.OS !== 'web'}
            >
              {discovery && discovery.length > 0 ? (
                <>
                  {/* Loading spinner top */}
                  <View style={styles.discoveryLoading}>
                    <Spinner />
                  </View>

                  {/* Grid */}
                  <View style={styles.grid}>
                    {discovery.map((event, index) => {
                      const vibeScore = event.vibeMatchScoreEvent || Math.min(
                        95,
                        Math.max(
                          75,
                          Math.floor(
                            80 +
                              ((event.id * 7) % 20) +
                              (event.tags?.length || 0) * 2 +
                              (event.category === "Nightlife" ? 5 : 0)
                          )
                        )
                      );

                      let scoreColor = "#9B51E0"; // joyn-purple
                      let dotColor = "#9B51E0";
                      if (vibeScore >= 90) {
                        scoreColor = "#cc5c24"; // joyn-green
                        dotColor = "#cc5c24";
                      } else if (vibeScore >= 85) {
                        scoreColor = "#F2C94C"; // joyn-yellow
                        dotColor = "#F2C94C";
                      }

                      return (
                        <TouchableOpacity
                          key={event.id}
                          onPress={() =>
                            navigation.navigate(
                              "EventDetail" as never,
                              { id: String(event.eventId || event.id) } as never
                            )
                          }
                          style={styles.gridItem}
                          activeOpacity={0.8}
                        >
                          <Image
                            source={{
                              uri:
                                event.imageUrl ||
                                `https://images.unsplash.com/photo-${
                                  1492684223066 + index
                                }?w=400&h=600&fit=crop&crop=center`,
                            }}
                            style={styles.gridItemImage}
                            resizeMode="cover"
                          />
                          <LinearGradient
                            colors={[
                              "rgba(0,0,0,0.6)",
                              "rgba(0,0,0,0.2)",
                              "transparent",
                            ]}
                            style={styles.gridItemGradient}
                          />

                          <View style={styles.gridItemInfo}>
                            <View style={styles.gridItemTop}>
                              <View style={styles.vibeBadge}>
                                <Text style={styles.vibeBadgeText}>
                                  {new Date(event.startTime).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </Text>
                              </View>
                              <View style={styles.vibeScoreContainer}>
                                <View
                                  style={[
                                    styles.vibeDot,
                                    { backgroundColor: dotColor },
                                  ]}
                                />
                                <Text
                                  style={[
                                    styles.vibeScoreText,
                                    { color: scoreColor },
                                  ]}
                                >
                                  {vibeScore}%
                                </Text>
                              </View>
                            </View>

                            <View style={styles.gridItemBottom}>
                              {event.tags && (
                                <View style={styles.categoryBadge}>
                                  <Text style={styles.categoryBadgeText}>
                                    {event.tags.slice(0, 1).join(", ")}
                                  </Text>
                                </View>
                              )}
                              <Text
                                style={styles.eventTitle}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                              >
                                {event.title}
                              </Text>
                              {event.venue && (
                                <Text
                                  style={styles.eventVenue}
                                  numberOfLines={1}
                                  ellipsizeMode="tail"
                                >
                                  {event.venue}
                                </Text>
                              )}
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              ) : (
                <View style={styles.discoveryEmpty}>
                  <View style={styles.discoveryEmptyCircle}>
                    <Plus size={40} color="#cc5c24" />
                  </View>
                  <Text style={styles.discoveryEmptyTitle}>
                    No events to discover
                  </Text>
                  <Text style={styles.discoveryEmptySubtitle}>
                    Check back later for new events to explore
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 128,
    zIndex: 10,
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
  filterPills: {
    flexDirection: "row",
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
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
  intentCapture: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 30,
    borderRadius: 12,
    overflow: "hidden",
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontWeight: "600",
    fontSize: 18,
    color: "#fff",
    marginBottom: 6,
  },
  emptySubtitle: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
  },

  discoveryContainer: {
    flex: 1,
    position: "relative",
  },
  discoveryLoading: {
    marginBottom: 24,
    alignItems: "center",
  },
  spinner: {
    width: 24,
    height: 24,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
    borderTopColor: "#cc5c24",
    borderRadius: 12,
  },
  gridContainer: {
    paddingHorizontal: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: GRID_ITEM_WIDTH,
    aspectRatio: 4 / 5,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  gridItemImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  gridItemGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  gridItemInfo: {
    flex: 1,
    justifyContent: "space-between",
    padding: 12,
  },
  gridItemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  vibeBadge: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  vibeBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  vibeScoreContainer: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  vibeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  vibeScoreText: {
    fontSize: 12,
    fontWeight: "600",
  },
  gridItemBottom: {},
  categoryBadge: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  categoryBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  eventTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  eventVenue: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 4,
  },

  discoveryEmpty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  discoveryEmptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,196,140,0.125)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#cc5c24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  discoveryEmptyTitle: {
    fontWeight: "700",
    fontSize: 20,
    color: "#fff",
    marginBottom: 8,
  },
  discoveryEmptySubtitle: {
    color: "#aaa",
    fontSize: 14,
    maxWidth: 250,
    textAlign: "center",
    marginBottom: 16,
  },
  createEventButton: {
    backgroundColor: "#cc5c24",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
});

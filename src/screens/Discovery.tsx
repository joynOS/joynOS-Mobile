import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Image as RNImage } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { eventsService } from "../services/events";
import EventDiscoverCard from "../components/EventDiscoverCard";

const windowWidth = Dimensions.get("window").width;
const GRID_ITEM_WIDTH = (windowWidth - 16) / 2;

export default function Discovery() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const loadMoreEvents = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await eventsService.browse();
      const list = Array.isArray(res)
        ? res
        : res && (res as any).items
        ? (res as any).items
        : [];
      setItems((prev) => [...list, ...prev]);
    } catch (error) {
      console.error("Error loading more events:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await eventsService.browse();
        const list = Array.isArray(res)
          ? res
          : res && (res as any).items
          ? (res as any).items
          : [];
        setItems(list);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);
      }
    })();
  }, []);
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.2)", "transparent"]}
        style={styles.gradientOverlay}
      />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerLeft}>
          <RNImage
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
                  if (tab.id === "you") navigation.navigate("You" as never);
                  else if (tab.id === "feed")
                    navigation.navigate("Feed" as never);
                }}
                style={[
                  styles.filterPill,
                  tab.id === "discovery" ? styles.filterPillActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    tab.id === "discovery" ? styles.filterPillTextActive : null,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.headerRight}></View>
      </View>

      {isLoading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Loading…</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No events to discover</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={items}
          keyExtractor={(it: any, idx) => String(it.id ?? idx)}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            paddingHorizontal: 8,
            gap: 15,
          }}
          contentContainerStyle={{
            paddingTop: -insets.top + 120,
            paddingBottom: 32 + insets.bottom,
          }}
          renderItem={({ item }) => (
            <EventDiscoverCard
              event={item}
              onPress={() =>
                navigation.navigate(
                  "EventDetail" as never,
                  { id: String(item.id) } as never
                )
              }
              style={{ width: GRID_ITEM_WIDTH, marginBottom: 16 }}
            />
          )}
          ListHeaderComponent={() =>
            isLoadingMore ? (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            ) : null
          }
          onScrollBeginDrag={(event) => {
            const { velocity } = event.nativeEvent;
            if (velocity && velocity.y < -2) {
              loadMoreEvents();
            }
          }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          inverted
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    zIndex: 10,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logo: { width: 28, height: 28, borderRadius: 6, marginRight: 12 },
  filterPills: { flexDirection: "row" },
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
  filterPillTextActive: { color: "#fff" },
  headerRight: { flexDirection: "row" },
  gridContainer: { paddingHorizontal: 12 },
  gridItem: {
    width: GRID_ITEM_WIDTH,
    aspectRatio: 4 / 5,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "rgba(40,40,40,1)",
  },
  gridItemImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: "rgba(40,40,40,1)",
  },
  gridItemGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  gridItemInfoTop: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateBadge: {
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  dateBadgeText: { color: "white", fontSize: 12, fontWeight: "600" },
  catBadge: {
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  catBadgeText: { color: "white", fontSize: 12, fontWeight: "600" },
  gridItemInfo: { position: "absolute", left: 8, right: 8, bottom: 8 },
  eventTitle: { color: "#fff", fontWeight: "700", fontSize: 14 },
  eventVenue: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 },
  empty: { alignItems: "center", paddingTop: 100 },
  emptyText: { color: "#aaa", fontSize: 16 },
});

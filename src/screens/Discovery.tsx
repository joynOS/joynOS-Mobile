import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image as RNImage } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { eventsService } from "../services/events";

const windowWidth = Dimensions.get("window").width;
const GRID_ITEM_WIDTH = (windowWidth - 24) / 2;

type Nav = NativeStackNavigationProp<RootStackParamList, "Discovery">;

export default function Discovery() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await eventsService.browse();
        const list = Array.isArray(res) ? res : (res && (res as any).items ? (res as any).items : []);
        setItems(list);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setIsLoading(false);
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

      <ScrollView
        contentContainerStyle={[
          styles.gridContainer,
          { paddingTop: 140 + insets.top, paddingBottom: 16 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Loading…</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No events to discover</Text>
          </View>
        ) : (
          <View>
            {items.map((event, index) => {
              const dateStr = event.startTime
                ? new Date(event.startTime).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "";
              const category =
                Array.isArray(event.aiNormalized?.categories) &&
                event.aiNormalized.categories.length > 0
                  ? event.aiNormalized.categories[0]
                  : undefined;
              return (
                <TouchableOpacity
                  key={event.id || index}
                  onPress={() =>
                    navigation.navigate(
                      "EventDetail" as never,
                      { id: String(event.id) } as never
                    )
                  }
                  style={styles.gridItem}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{
                      uri:
                        event.imageUrl ||
                        `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=600&fit=crop&crop=center`,
                    }}
                    style={styles.gridItemImage}
                    resizeMode="cover"
                    onError={(error) => console.log("Image load error:", error)}
                  />
                  <LinearGradient
                    colors={[
                      "transparent",
                      "rgba(0,0,0,0.3)",
                      "rgba(0,0,0,0.8)",
                    ]}
                    style={styles.gridItemGradient}
                  />
                  <View style={styles.gridItemInfoTop}>
                    {dateStr ? (
                      <View style={styles.dateBadge}>
                        <Text style={styles.dateBadgeText}>{dateStr}</Text>
                      </View>
                    ) : null}
                    {category && (
                      <View style={styles.catBadge}>
                        <Text style={styles.catBadgeText}>{category}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.gridItemInfo}>
                    <Text numberOfLines={2} style={styles.eventTitle}>
                      {event.title || "Untitled Event"}
                    </Text>
                    {event.venue && (
                      <Text numberOfLines={1} style={styles.eventVenue}>
                        {event.venue}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
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

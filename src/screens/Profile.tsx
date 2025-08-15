import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  FlatList,
  Modal,
  Switch,
  Platform,
  ListRenderItemInfo,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ArrowLeft,
  Share,
  MoreHorizontal,
  Edit,
  Star,
  LogOut,
  Settings,
  Shield,
  Bell,
  Moon,
  Sun,
  HelpCircle,
  Download,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react-native";

import { useAuth } from "../contexts/AuthContext";
import type { RootStackParamList } from "../navigation/types";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

// === Color tokens (mapeados a partir do Web) ===
const JOYN_GREEN = "#cb5b23"; // hsl(20,70%,47%) — mesmo tom usado no Web
const JOYN_PURPLE = "#8956fe"; // hsl(258,100%,67%)
const JOYN_YELLOW = "#f5d90a";

// === Mocks (somente quando não houver integração) ===
const MOCK_USER_FALLBACK = {
  name: "Joyn OS User",
  email: "user@example.com",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
  bio: "Jazz lover, weekend explorer, always up for good conversation ✨",
  interests: [
    "Jazz Music",
    "Art Galleries",
    "Wine Tasting",
    "Book Clubs",
    "Hiking",
    "Cooking",
  ],
};

const ALL_COMMUNITY_MEMBERS = [
  {
    id: 1,
    name: "Sarah Chen",
    description: "Jazz enthusiast",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b8e5?w=100&h=100&fit=crop&crop=face",
    compatibility: 94,
  },
  {
    id: 2,
    name: "Marcus Rivera",
    description: "Art lover",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    compatibility: 91,
  },
  {
    id: 3,
    name: "Emma Wilson",
    description: "Wine connoisseur",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    compatibility: 87,
  },
  {
    id: 4,
    name: "David Kim",
    description: "Hiker & chef",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    compatibility: 89,
  },
  {
    id: 5,
    name: "Luna Martinez",
    description: "Photographer",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    compatibility: 92,
  },
  {
    id: 6,
    name: "Alex Thompson",
    description: "Musician",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    compatibility: 88,
  },
  {
    id: 7,
    name: "Maya Patel",
    description: "Book lover",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    compatibility: 85,
  },
  {
    id: 8,
    name: "Jordan Lee",
    description: "Yoga instructor",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
    compatibility: 90,
  },
];

const ALL_PLACES = [
  {
    id: 1,
    name: "Blue Note",
    location: "Greenwich Village",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=120&fit=crop",
  },
  {
    id: 2,
    name: "Chelsea Galleries",
    location: "Art District",
    image:
      "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=200&h=120&fit=crop",
  },
  {
    id: 3,
    name: "Sky Lounge",
    location: "Rooftop Vibes",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=120&fit=crop",
  },
  {
    id: 4,
    name: "Riverside Park",
    location: "Outdoor Space",
    image:
      "https://images.unsplash.com/photo-1506629905607-c28bfc3e7d0d?w=200&h=120&fit=crop",
  },
  {
    id: 5,
    name: "The Library",
    location: "Midtown",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=120&fit=crop",
  },
  {
    id: 6,
    name: "Wine & Vinyl",
    location: "Lower East Side",
    image:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=120&fit=crop",
  },
  {
    id: 7,
    name: "Morning Yoga Studio",
    location: "SoHo",
    image:
      "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=200&h=120&fit=crop",
  },
  {
    id: 8,
    name: "Artisan Coffee",
    location: "Brooklyn Heights",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=120&fit=crop",
  },
];

const ATTENDED_EVENTS = [
  {
    id: 1,
    title: "Rooftop Sunset Sessions",
    venue: "Sky Lounge",
    date: "2 days ago",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=120&fit=crop",
  },
  {
    id: 2,
    title: "Gallery Night Walk",
    venue: "Chelsea Art District",
    date: "1 week ago",
    rating: 4,
    image:
      "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=200&h=120&fit=crop",
  },
  {
    id: 3,
    title: "Jazz & Wine Evening",
    venue: "Blue Note",
    date: "2 weeks ago",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=120&fit=crop",
  },
  {
    id: 4,
    title: "Morning Yoga Flow",
    venue: "Riverside Park",
    date: "3 weeks ago",
    rating: 4,
    image:
      "https://images.unsplash.com/photo-1506629905607-c28bfc3e7d0d?w=200&h=120&fit=crop",
  },
  {
    id: 5,
    title: "Art & Coffee Meetup",
    venue: "Artisan Coffee",
    date: "1 month ago",
    rating: 4,
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=120&fit=crop",
  },
  {
    id: 6,
    title: "Wine Tasting Social",
    venue: "Wine & Vinyl",
    date: "1 month ago",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=120&fit=crop",
  },
];

const PLAN_PREFERENCES = [
  {
    id: 1,
    title: "Cultural",
    description: "Art galleries, museums, cultural events",
    match: "High Match",
    color: "joyn-purple",
  },
  {
    id: 2,
    title: "Intimate",
    description: "Small groups, meaningful conversations",
    match: "Perfect Match",
    color: "joyn-green",
  },
  {
    id: 3,
    title: "Creative",
    description: "Musical, artistic, hands-on activities",
    match: "Great Match",
    color: "joyn-yellow",
  },
  {
    id: 4,
    title: "Morning",
    description: "Yoga, hiking, energizing activities",
    match: "Perfect Match",
    color: "joyn-green",
  },
  {
    id: 5,
    title: "Evening",
    description: "Dinners, wine tastings, jazz clubs",
    match: "High Match",
    color: "joyn-purple",
  },
  {
    id: 6,
    title: "Weekend",
    description: "Relaxed pace, outdoor activities",
    match: "Great Match",
    color: "joyn-yellow",
  },
];

export default function Profile() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user: authUser, logout } = useAuth();

  // States que existem no Web
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState<
    "public" | "private"
  >("public");
  const [activeTab, setActiveTab] = useState<
    "attended" | "places" | "circle" | "preferences"
  >("attended");

  // Dados do usuário (usa Auth se existir; senão, mocks)
  const commitScore =
    typeof (authUser as any)?.credibilityScore === "number"
      ? (authUser as any).credibilityScore
      : 89;
  const user = {
    name: authUser?.name || authUser?.email || MOCK_USER_FALLBACK.name,
    email: authUser?.email || MOCK_USER_FALLBACK.email,
    avatar: authUser?.avatar || MOCK_USER_FALLBACK.avatar,
    bio: authUser?.bio || MOCK_USER_FALLBACK.bio,
    interests: (authUser as any)?.interests || MOCK_USER_FALLBACK.interests,
  };

  const userStats = { attended: 24, organized: 3, rating: 4.8, circleSize: 12 };

  const handleLogout = async () => {
    Alert.alert("Confirm logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          try {
            // Usa a integração existente do AuthContext (authService.logout + cleanup)
            await logout();
          } catch (e) {
            console.error("Logout error", e);
          }
        },
      },
    ]);
  };

  const renderEventItem = ({
    item,
  }: ListRenderItemInfo<(typeof ATTENDED_EVENTS)[number]>) => (
    <View style={styles.cardTile}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.2)", "transparent"]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.ratingBadge}>
        <Star size={12} color={JOYN_YELLOW} fill={JOYN_YELLOW} />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
      <View style={styles.cardTextArea}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {item.venue}
        </Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {item.date}
        </Text>
      </View>
    </View>
  );

  const renderPlaceItem = ({
    item,
  }: ListRenderItemInfo<(typeof ALL_PLACES)[number]>) => (
    <View style={styles.cardTile}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.2)", "transparent"]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.cardTextArea}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {item.location}
        </Text>
      </View>
    </View>
  );

  const renderMemberItem = ({
    item,
  }: ListRenderItemInfo<(typeof ALL_COMMUNITY_MEMBERS)[number]>) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => Alert.alert("Open profile", item.name)}
      style={styles.cardTile}
    >
      <Image source={{ uri: item.avatar }} style={styles.cardImage} />
      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.2)", "transparent"]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.compatBadge}>
        <Text style={styles.compatText}>{item.compatibility}%</Text>
      </View>
      <View style={styles.cardTextArea}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // ---- DATA do FlatList principal (para evitar ScrollView + aninhamento) ----
  const data = useMemo(() => {
    switch (activeTab) {
      case "attended":
        return ATTENDED_EVENTS;
      case "places":
        return ALL_PLACES;
      case "circle":
        return ALL_COMMUNITY_MEMBERS;
      case "preferences":
        return [] as any[]; // conteúdo via ListFooter
    }
  }, [activeTab]);

  const numCols = activeTab === "preferences" ? 1 : 3;
  const listKey = `profile-${activeTab}-${numCols}`; // força re-render ao trocar colunas

  const renderItem = (info: ListRenderItemInfo<any>) => {
    switch (activeTab) {
      case "attended":
        return renderEventItem(info as any);
      case "places":
        return renderPlaceItem(info as any);
      case "circle":
        return renderMemberItem(info as any);
      case "preferences":
        return null;
    }
  };

  const ListHeader = (
    <View>
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <View
          style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}
        >
          <View>
            <View
              style={[
                styles.avatarGlow,
                { backgroundColor: `${JOYN_GREEN}33` },
              ]}
            />
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <TouchableOpacity
              style={styles.avatarEdit}
              activeOpacity={0.9}
              onPress={() => Alert.alert("Edit photo")}
            >
              <Edit size={12} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user.name}</Text>

            <View style={styles.statsRow}>
              <TouchableOpacity
                onPress={() => setActiveTab("attended")}
                activeOpacity={0.8}
                style={styles.statBox}
              >
                <BlurView
                  style={StyleSheet.absoluteFill}
                  intensity={20}
                  tint="dark"
                />
                <Text style={styles.statValue}>{userStats.attended}</Text>
                <Text style={styles.statLabel}>Events</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab("circle")}
                activeOpacity={0.8}
                style={styles.statBox}
              >
                <BlurView
                  style={StyleSheet.absoluteFill}
                  intensity={20}
                  tint="dark"
                />
                <Text style={styles.statValue}>{userStats.circleSize}</Text>
                <Text style={styles.statLabel}>Circle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab("preferences")}
                activeOpacity={0.8}
                style={styles.statBox}
              >
                <BlurView
                  style={StyleSheet.absoluteFill}
                  intensity={20}
                  tint="dark"
                />
                <Text style={styles.statValue}>{commitScore}%</Text>
                <Text style={styles.statLabel}>Commit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.userBio}>{user.bio}</Text>
      </View>

      {/* Tabs */}
      <View style={{ paddingHorizontal: 16 }}>
        <View style={styles.tabsList}>
          {/* Blur da barra de tabs */}
          <BlurView
            style={StyleSheet.absoluteFill}
            intensity={20}
            tint="dark"
          />
          {(
            [
              { key: "attended", label: "Attended" },
              { key: "places", label: "Places" },
              { key: "circle", label: "Circle" },
              { key: "preferences", label: "Preferences" },
            ] as const
          ).map((tab) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.9}
                style={[
                  styles.tabBtn,
                  active && { backgroundColor: JOYN_GREEN },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    active && { color: "#fff", fontWeight: "700" },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  const ListFooter =
    activeTab === "preferences" ? (
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
        {/* Interests */}
        <View style={{ marginBottom: 16 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => Alert.alert("Add Interest")}
              style={[
                styles.pill,
                {
                  backgroundColor: `${JOYN_GREEN}33`,
                  borderColor: `${JOYN_GREEN}66`,
                },
              ]}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
                + Add
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chipsWrap}>
            {user.interests.map((interest: string, idx: number) => (
              <View
                key={`${interest}-${idx}`}
                style={[
                  styles.chip,
                  {
                    borderColor: "rgba(255,255,255,0.2)",
                    backgroundColor: "rgba(255,255,255,0.08)",
                  },
                ]}
              >
                <Text style={styles.chipText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Plan Preferences Grid */}
        <View>
          <Text style={styles.sectionTitle}>Plan Preferences</Text>
          <View style={styles.prefGrid}>
            {PLAN_PREFERENCES.map((pref) => {
              const colorBg =
                pref.color === "joyn-green"
                  ? `${JOYN_GREEN}33`
                  : pref.color === "joyn-yellow"
                  ? `${JOYN_YELLOW}33`
                  : `${JOYN_PURPLE}33`;
              const colorText =
                pref.color === "joyn-green"
                  ? JOYN_GREEN
                  : pref.color === "joyn-yellow"
                  ? JOYN_YELLOW
                  : JOYN_PURPLE;
              return (
                <View key={pref.id} style={styles.prefCard}>
                  <Text style={styles.prefTitle}>{pref.title}</Text>
                  <Text style={styles.prefDesc}>{pref.description}</Text>
                  <View
                    style={[styles.matchPill, { backgroundColor: colorBg }]}
                  >
                    <Text style={[styles.matchText, { color: colorText }]}>
                      {pref.match}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.headerFloating}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconGhost}
          activeOpacity={0.8}
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            intensity={25}
            tint="dark"
          />
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            style={styles.iconGhost}
            activeOpacity={0.8}
            onPress={() => Alert.alert("Share")}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              intensity={25}
              tint="dark"
            />
            <Share size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconGhost}
            activeOpacity={0.8}
            onPress={() => setShowProfileMenu(true)}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              intensity={25}
              tint="dark"
            />
            <MoreHorizontal size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        key={listKey}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, idx) => String((item as any)?.id ?? idx)}
        numColumns={numCols}
        columnWrapperStyle={numCols > 1 ? { gap: 8 } : undefined}
        contentContainerStyle={{
          paddingTop: 80,
          paddingHorizontal: 16,
          paddingBottom: 16,
          gap: 8,
        }}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
      />

      {/* PROFILE MENU (Bottom Sheet) */}
      <Modal
        visible={showProfileMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <View style={{ flex: 1 }}>
          {/* Backdrop com Blur real */}
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setShowProfileMenu(false)}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              intensity={35}
              tint="dark"
            />
          </TouchableOpacity>

          {/* Painel */}
          <View style={styles.menuPanel}>
            {/* Header */}
            <View style={[styles.rowBetween, { marginBottom: 16 }]}>
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
                Profile Settings
              </Text>
              <TouchableOpacity
                onPress={() => setShowProfileMenu(false)}
                style={styles.iconRound}
              >
                <MoreHorizontal size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: "70%" }}
              showsVerticalScrollIndicator={false}
            >
              {/* Quick Actions */}
              <Text style={styles.menuSectionTitle}>Quick Actions</Text>
              <View style={{ gap: 8, marginBottom: 16 }}>
                <TouchableOpacity
                  style={styles.menuItemRow}
                  onPress={() => Alert.alert("Edit Profile")}
                >
                  <View
                    style={[
                      styles.menuIconCircle,
                      { backgroundColor: `${JOYN_GREEN}33` },
                    ]}
                  >
                    <Edit size={16} color={JOYN_GREEN} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuItemTitle}>Edit Profile</Text>
                    <Text style={styles.menuItemSubtitle}>
                      Update your info and photos
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItemRow}
                  onPress={() => Alert.alert("Settings")}
                >
                  <View
                    style={[
                      styles.menuIconCircle,
                      { backgroundColor: `${JOYN_PURPLE}33` },
                    ]}
                  >
                    <Settings size={16} color={JOYN_PURPLE} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuItemTitle}>Settings</Text>
                    <Text style={styles.menuItemSubtitle}>
                      Preferences and account
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Privacy & Security */}
              <Text style={styles.menuSectionTitle}>Privacy & Security</Text>
              <View style={{ gap: 8, marginBottom: 16 }}>
                <TouchableOpacity
                  style={[styles.menuItemRow, styles.rowBetween]}
                  onPress={() =>
                    setProfileVisibility((v) =>
                      v === "public" ? "private" : "public"
                    )
                  }
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View
                      style={[
                        styles.menuIconCircle,
                        { backgroundColor: `${JOYN_YELLOW}33` },
                      ]}
                    >
                      {profileVisibility === "public" ? (
                        <Eye size={16} color={JOYN_YELLOW} />
                      ) : (
                        <EyeOff size={16} color={JOYN_YELLOW} />
                      )}
                    </View>
                    <View>
                      <Text style={styles.menuItemTitle}>
                        Profile Visibility
                      </Text>
                      <Text style={styles.menuItemSubtitle}>
                        {profileVisibility === "public" ? "Public" : "Private"}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.toggleTrack,
                      {
                        backgroundColor:
                          profileVisibility === "public"
                            ? JOYN_GREEN
                            : "rgba(255,255,255,0.2)",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        { marginLeft: profileVisibility === "public" ? 20 : 2 },
                      ]}
                    />
                  </View>
                </TouchableOpacity>

                <View style={[styles.menuItemRow, styles.rowBetween]}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View
                      style={[
                        styles.menuIconCircle,
                        { backgroundColor: "rgba(255,159,64,0.2)" },
                      ]}
                    >
                      <Bell size={16} color={"#ff9f40"} />
                    </View>
                    <View>
                      <Text style={styles.menuItemTitle}>Notifications</Text>
                      <Text style={styles.menuItemSubtitle}>
                        {"Enable or disable push"}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    thumbColor={"#fff"}
                    trackColor={{
                      true: JOYN_GREEN,
                      false: "rgba(255,255,255,0.2)",
                    }}
                  />
                </View>

                <View style={[styles.menuItemRow, styles.rowBetween]}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View
                      style={[
                        styles.menuIconCircle,
                        { backgroundColor: "rgba(99,102,241,0.2)" },
                      ]}
                    >
                      {isDarkMode ? (
                        <Moon size={16} color={"#6366f1"} />
                      ) : (
                        <Sun size={16} color={"#6366f1"} />
                      )}
                    </View>
                    <View>
                      <Text style={styles.menuItemTitle}>Theme</Text>
                      <Text style={styles.menuItemSubtitle}>
                        {isDarkMode ? "Dark Mode" : "Light Mode"}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={isDarkMode}
                    onValueChange={setIsDarkMode}
                    thumbColor={"#fff"}
                    trackColor={{
                      true: JOYN_PURPLE,
                      false: "rgba(255,255,255,0.2)",
                    }}
                  />
                </View>
              </View>

              {/* Support & Data */}
              <Text style={styles.menuSectionTitle}>Support & Data</Text>
              <View style={{ gap: 8, marginBottom: 16 }}>
                <TouchableOpacity
                  style={styles.menuItemRow}
                  onPress={() => Alert.alert("Help & Support")}
                >
                  <View
                    style={[
                      styles.menuIconCircle,
                      { backgroundColor: "rgba(16,185,129,0.2)" },
                    ]}
                  >
                    <HelpCircle size={16} color={"#10b981"} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuItemTitle}>Help & Support</Text>
                    <Text style={styles.menuItemSubtitle}>
                      Get help and contact us
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItemRow}
                  onPress={() => Alert.alert("Download My Data")}
                >
                  <View
                    style={[
                      styles.menuIconCircle,
                      { backgroundColor: "rgba(34,211,238,0.2)" },
                    ]}
                  >
                    <Download size={16} color={"#22d3ee"} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuItemTitle}>Download My Data</Text>
                    <Text style={styles.menuItemSubtitle}>
                      Export your Joyn data
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Danger Zone */}
              <Text style={[styles.menuSectionTitle, { color: "#f87171" }]}>
                Danger Zone
              </Text>
              <View style={{ gap: 8, marginBottom: 24 }}>
                <TouchableOpacity
                  style={[
                    styles.menuItemRow,
                    {
                      borderColor: "rgba(248,113,113,0.4)",
                      backgroundColor: "rgba(248,113,113,0.1)",
                    },
                  ]}
                  onPress={() => Alert.alert("Delete Account")}
                >
                  <View
                    style={[
                      styles.menuIconCircle,
                      { backgroundColor: "rgba(248,113,113,0.2)" },
                    ]}
                  >
                    <Trash2 size={16} color={"#f87171"} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.menuItemTitle, { color: "#f87171" }]}>
                      Delete Account
                    </Text>
                    <Text
                      style={[
                        styles.menuItemSubtitle,
                        { color: "rgba(248,113,113,0.7)" },
                      ]}
                    >
                      Permanently delete your account
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItemRow}
                  onPress={handleLogout}
                >
                  <View
                    style={[
                      styles.menuIconCircle,
                      { backgroundColor: "rgba(156,163,175,0.2)" },
                    ]}
                  >
                    <LogOut size={16} color={"#9ca3af"} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuItemTitle}>Sign Out</Text>
                    <Text style={styles.menuItemSubtitle}>
                      Sign out of your account
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const TILE_H = 110;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  bgAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    zIndex: -1,
  },
  headerFloating: {
    position: "absolute",
    top: Platform.select({ ios: 45, android: 8 }),
    left: 0,
    right: 0,
    zIndex: 30,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconGhost: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden", // necessário para o BlurView ficar "dentro" do botão
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarGlow: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    top: 0,
    left: 0,
    transform: [{ scale: 1.2 }],
  },
  avatarEdit: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: JOYN_GREEN,
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },
  userBio: {
    marginTop: 12,
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingVertical: 10,
    overflow: "hidden", // para o BlurView
  },
  statValue: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 2,
  },
  statLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
  },
  tabsList: {
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 6,
    overflow: "hidden", // para o BlurView
  },
  tabBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  tabText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
  },
  cardTile: {
    flex: 1,
    height: TILE_H,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  cardTextArea: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 8,
    gap: 2,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  cardSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
  },
  cardMeta: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
  },
  ratingBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  ratingText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  compatBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(75,85,99,0.6)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  compatText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#fff",
    fontWeight: "600",
    marginBottom: 8,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "600",
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  prefGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  prefCard: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 12,
  },
  prefTitle: {
    color: "#fff",
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 13,
  },
  prefDesc: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 10 },
  matchPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  matchText: { fontSize: 11, fontWeight: "800" },

  // Bottom sheet
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    padding: 16,
  },
  iconRound: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  menuSectionTitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 12,
  },
  menuIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemTitle: { color: "#fff", fontWeight: "700", fontSize: 14 },
  menuItemSubtitle: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  toggleTrack: {
    width: 36,
    height: 22,
    borderRadius: 999,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
  },
});

import React, { useMemo, useState, useEffect } from "react";
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
  ActivityIndicator,
  Dimensions,
  TextInput,
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
import { profileService } from "../services/profile";
import { userService } from "../services/users";
import { useImagePicker } from "../components/ImagePicker";
import type { RootStackParamList } from "../navigation/types";
import type { 
  ProfileSummary, 
  AttendedEvent, 
  VisitedPlace, 
  CircleConnection,
  ProfilePreferences 
} from "../types/api";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

const JOYN_GREEN = "#cb5b23";
const JOYN_PURPLE = "#8956fe";
const JOYN_YELLOW = "#f5d90a";

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

export default function Profile() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user: authUser, logout, reloadMe } = useAuth();
  const { showImagePickerOptions } = useImagePicker();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState<
    "public" | "private"
  >("public");
  const [activeTab, setActiveTab] = useState<
    "attended" | "places" | "circle" | "preferences"
  >("attended");

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [attendedEvents, setAttendedEvents] = useState<AttendedEvent[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<VisitedPlace[]>([]);
  const [circleConnections, setCircleConnections] = useState<CircleConnection[]>([]);
  const [preferences, setPreferences] = useState<ProfilePreferences | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState({
    name: "",
    bio: "",
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const summaryData = await profileService.getSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load profile summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    try {
      switch (activeTab) {
        case 'attended':
          const eventsData = await profileService.getAttendedEvents();
          setAttendedEvents(eventsData.items);
          break;
        case 'places':
          const placesData = await profileService.getVisitedPlaces();
          setVisitedPlaces(placesData.items);
          break;
        case 'circle':
          const circleData = await profileService.getCircle();
          setCircleConnections(circleData.items);
          break;
        case 'preferences':
          const prefsData = await profileService.getPreferences();
          setPreferences(prefsData);
          break;
      }
    } catch (error) {
      console.error(`Failed to load ${activeTab} data:`, error);
    }
  };

  const commitScore = summary?.commitScore ? Math.round(summary.commitScore * 100) : 89;
  
  const user = {
    name: authUser?.name || authUser?.email || MOCK_USER_FALLBACK.name,
    email: authUser?.email || MOCK_USER_FALLBACK.email,
    avatar: authUser?.avatar || MOCK_USER_FALLBACK.avatar,
    bio: authUser?.bio || MOCK_USER_FALLBACK.bio,
    interests: preferences?.interests || MOCK_USER_FALLBACK.interests,
  };

  const userStats = { 
    attended: summary?.eventsCount || 0, 
    organized: 3, 
    rating: 4.8, 
    circleSize: summary?.circleCount || 0 
  };

  const handleAvatarEdit = () => {
    showImagePickerOptions({
      onImageSelected: async (image) => {
        if (image) {
          try {
            await userService.updateProfile({ avatar: image });
            await reloadMe();
            Alert.alert("Success", "Profile photo updated successfully!");
          } catch (error) {
            Alert.alert("Error", "Failed to update profile photo");
            console.error("Avatar update error:", error);
          }
        }
      },
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
  };

  const handleEditProfile = () => {
    setEditingProfile({
      name: user.name,
      bio: user.bio || "",
    });
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      await userService.updateProfile({
        name: editingProfile.name,
        bio: editingProfile.bio,
      });
      await reloadMe();
      setShowEditProfileModal(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
      console.error("Profile update error:", error);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Confirm logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (e) {
            console.error("Logout error", e);
          }
        },
      },
    ]);
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderEventItem = ({
    item,
  }: ListRenderItemInfo<AttendedEvent>) => (
    <View style={styles.cardTile}>
      <Image source={{ uri: item.imageUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4" }} style={styles.cardImage} />
      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.2)", "transparent"]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      {(item.myPlaceRating || item.myPlanRating) && (
        <View style={styles.ratingBadge}>
          <Star size={12} color={JOYN_YELLOW} fill={JOYN_YELLOW} />
          <Text style={styles.ratingText}>
            {Math.round(((item.myPlaceRating || 0) + (item.myPlanRating || 0)) / 2)}
          </Text>
        </View>
      )}
      <View style={styles.cardTextArea}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {item.venue}
        </Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {formatEventDate(item.startTime)}
        </Text>
      </View>
    </View>
  );

  const renderPlaceItem = ({
    item,
  }: ListRenderItemInfo<VisitedPlace>) => (
    <View style={styles.cardTile}>
      <Image source={{ uri: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4" }} style={styles.cardImage} />
      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.2)", "transparent"]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.cardTextArea}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.venue}
        </Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {item.address}
        </Text>
      </View>
    </View>
  );

  const renderMemberItem = ({
    item,
  }: ListRenderItemInfo<CircleConnection>) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => Alert.alert("Open profile", item.name)}
      style={styles.cardTile}
    >
      <Image source={{ uri: item.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" }} style={styles.cardImage} />
      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.2)", "transparent"]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.compatBadge}>
        <Text style={styles.compatText}>{item.matchPercent}%</Text>
      </View>
      <View style={styles.cardTextArea}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {item.tagline || "Member"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const data = useMemo(() => {
    switch (activeTab) {
      case "attended":
        return attendedEvents;
      case "places":
        return visitedPlaces;
      case "circle":
        return circleConnections;
      case "preferences":
        return [] as any[];
    }
  }, [activeTab, attendedEvents, visitedPlaces, circleConnections]);

  const numCols = activeTab === "preferences" ? 1 : 3;
  const listKey = `profile-${activeTab}-${numCols}`;

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
              onPress={handleAvatarEdit}
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

      <View style={{ paddingHorizontal: 16 }}>
        <View style={styles.tabsList}>
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
        {preferences ? (
          <>
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
                {preferences.interests.map((interest, idx) => (
                  <View
                    key={`${interest.id}-${idx}`}
                    style={[
                      styles.chip,
                      {
                        borderColor: "rgba(255,255,255,0.2)",
                        backgroundColor: "rgba(255,255,255,0.08)",
                      },
                    ]}
                  >
                    <Text style={styles.chipText}>{interest.emoji} {interest.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View>
              <Text style={styles.sectionTitle}>Plan Preferences</Text>
              <View style={styles.prefGrid}>
                {preferences.planPreferences.map((pref) => {
                  const colorBg = `${JOYN_GREEN}33`;
                  const colorText = JOYN_GREEN;
                  return (
                    <View key={pref.key} style={styles.prefCard}>
                      <Text style={styles.prefTitle}>{pref.title}</Text>
                      <Text style={styles.prefDesc}>{pref.subtitle}</Text>
                      <View
                        style={[styles.matchPill, { backgroundColor: colorBg }]}
                      >
                        <Text style={[styles.matchText, { color: colorText }]}>
                          {pref.matchLabel}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color={JOYN_GREEN} />
            <Text style={{ color: '#fff', marginTop: 16 }}>Loading preferences...</Text>
          </View>
        )}
      </View>
    ) : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={JOYN_GREEN} />
          <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        keyExtractor={(item, idx) => String((item as any)?.id ?? (item as any)?.eventId ?? (item as any)?.userId ?? idx)}
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

      <Modal
        visible={showEditProfileModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setShowEditProfileModal(false)}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              intensity={35}
              tint="dark"
            />
          </TouchableOpacity>

          <View style={styles.editProfilePanel}>
            <View style={[styles.rowBetween, { marginBottom: 24 }]}>
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
                Edit Profile
              </Text>
              <TouchableOpacity
                onPress={() => setShowEditProfileModal(false)}
                style={styles.iconRound}
              >
                <Text style={{ color: "#fff", fontSize: 18 }}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.editLabel}>Name</Text>
              <TextInput
                style={styles.editInput}
                value={editingProfile.name}
                onChangeText={(text) => setEditingProfile(prev => ({ ...prev, name: text }))}
                placeholder="Enter your name"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>

            <View style={{ marginBottom: 32 }}>
              <Text style={styles.editLabel}>Bio</Text>
              <TextInput
                style={[styles.editInput, styles.editTextArea]}
                value={editingProfile.bio}
                onChangeText={(text) => setEditingProfile(prev => ({ ...prev, bio: text }))}
                placeholder="Tell us about yourself"
                placeholderTextColor="rgba(255,255,255,0.5)"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.editButtonRow}>
              <TouchableOpacity
                style={[styles.editButton, styles.editButtonCancel]}
                onPress={() => setShowEditProfileModal(false)}
              >
                <Text style={styles.editButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButton, styles.editButtonSave]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.editButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showProfileMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <View style={{ flex: 1 }}>
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

          <View style={styles.menuPanel}>
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
              <Text style={styles.menuSectionTitle}>Quick Actions</Text>
              <View style={{ gap: 8, marginBottom: 16 }}>
                <TouchableOpacity
                  style={styles.menuItemRow}
                  onPress={handleEditProfile}
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
              </View>

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
const { width: screenWidth } = Dimensions.get('window');
const CARD_MARGIN = 16; // padding horizontal da FlatList
const CARD_GAP = 8; // gap entre cards
const CARD_WIDTH = (screenWidth - (CARD_MARGIN * 2) - (CARD_GAP * 2)) / 3;

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
    overflow: "hidden",
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
    overflow: "hidden",
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
    overflow: "hidden",
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
    width: CARD_WIDTH,
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
  editProfilePanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    padding: 24,
  },
  editLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
  },
  editTextArea: {
    height: 100,
    textAlignVertical: "top",
  },
  editButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonCancel: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  editButtonSave: {
    backgroundColor: JOYN_GREEN,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
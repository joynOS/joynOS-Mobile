import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import { Button } from "../components/Button";
import LoadingSpinner from "../components/LoadSpinner";
import InterestItem from "../components/InterestItem";
import DistanceSlider from "../components/DistanceSlider";
import { interestsService } from "../services/interests";
import { userService } from "../services/users";
import { RootStackParamList } from "../navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";

type InterestSelectorNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "InterestSelector"
>;
type InterestSelectorRouteProp = RouteProp<
  RootStackParamList,
  "InterestSelector"
>;

export default function InterestSelector() {
  const navigation = useNavigation<InterestSelectorNavigationProp>();
  const route = useRoute<InterestSelectorRouteProp>();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [radius, setRadius] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [interestOptions, setInterestOptions] = useState<
    { id: string; label: string; emoji: string }[]
  >([]);
  const { reloadMe } = useAuth();

  const phone = route.params?.phone;

  useEffect(() => {
    (async () => {
      try {
        const list = await interestsService.list();
        setInterestOptions(
          list.map((i) => ({ id: i.id, label: i.label, emoji: i.emoji }))
        );
      } catch (e) {
        setInterestOptions([]);
      }
    })();
  }, []);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((i) => i !== interestId)
        : [...prev, interestId]
    );
  };

  const handleComplete = async () => {
    if (selectedInterests.length < 3) return;
    setIsLoading(true);

    try {
      await userService.updatePreferences({
        currentLat: 40.7128,
        currentLng: -74.006,
        radiusMiles: radius,
      });
      await userService.updateInterests({ interestIds: selectedInterests });
      await reloadMe();
      // não navegar manualmente; App troca para PrivateNavigator ao detectar onboarding completo
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft color="white" size={20} />
        </Pressable>
        <Text style={styles.stepLabel}>Final Step</Text>
      </View>

      <Text style={styles.title}>What interests you?</Text>
      <Text style={styles.subtitle}>
        Select at least 3 interests to help us find your perfect events
      </Text>

      {/* Scrollable Interests */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Interests Card */}
        <View style={styles.card}>
          <View style={styles.interestGrid}>
            {interestOptions.map((item) => (
              <InterestItem
                key={item.id}
                label={`${item.emoji} ${item.label}`}
                selected={selectedInterests.includes(item.id)}
                onPress={() => toggleInterest(item.id)}
              />
            ))}
          </View>

          <View style={styles.selectionCount}>
            <Text
              style={{
                color: selectedInterests.length >= 3 ? "#cc5c24" : "#ccc",
              }}
            >
              {selectedInterests.length}/3 selected
            </Text>
          </View>
        </View>

        {/* Distance Slider Card */}
        <View style={styles.card}>
          <Text style={styles.distanceTitle}>
            <Text style={styles.boldText}>Discovery Radius</Text>
          </Text>
          <View style={styles.distanceDisplay}>
            <Text style={styles.distanceText}>Distance</Text>
            <Text style={styles.distanceValue}>{radius} miles</Text>
          </View>
          <View style={styles.sliderContainer}>
            <DistanceSlider value={radius} onChange={setRadius} />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>1 mile</Text>
              <Text style={styles.sliderLabelText}>50 miles</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Complete Button */}
      <View style={styles.footer}>
        <Button
          onPress={handleComplete}
          disabled={selectedInterests.length < 3 || isLoading}
          loading={isLoading}
          type="gradient"
          title={`Complete Setup (${selectedInterests.length}/3)`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black", paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
  },
  stepLabel: {
    color: "#cc5c24",
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  subtitle: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 20,
  },
  scroll: { paddingBottom: 100 },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  interestGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  selectionCount: {
    marginTop: 16,
    alignItems: "center",
  },
  distanceTitle: {
    textAlign: "center",
    marginBottom: 20,
  },
  boldText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  distanceDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  distanceText: {
    color: "#ccc",
    fontSize: 16,
  },
  dashLine: {
    color: "#ccc",
    fontSize: 16,
    marginHorizontal: 8,
  },
  distanceValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  sliderContainer: {
    marginTop: 10,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  sliderLabelText: {
    color: "#888",
    fontSize: 12,
  },
  footer: {
    paddingVertical: 16,
    backgroundColor: "black",
  },
});

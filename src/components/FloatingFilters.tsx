import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import {
  Grid3X3,
  UserCheck,
  Bookmark,
  Heart,
  Search,
} from "lucide-react-native";

type FilterType = "all" | "thisweek" | "saved" | "liked";

type Props = {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onSearchToggle: () => void;
  isSearchOpen: boolean;
  searchQuery: string;
};

const FloatingFilters: React.FC<Props> = ({
  activeFilter,
  onFilterChange,
  onSearchToggle,
  isSearchOpen,
  searchQuery,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onFilterChange("all")}
        style={[styles.button, activeFilter === "all" && styles.buttonActive]}
      >
        <BlurView
          intensity={15}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
        <Grid3X3 size={22} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onFilterChange("thisweek")}
        style={[
          styles.button,
          activeFilter === "thisweek" && styles.buttonActiveOrange,
        ]}
      >
        <BlurView
          intensity={15}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
        <UserCheck size={22} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onFilterChange("saved")}
        style={[
          styles.button,
          activeFilter === "saved" && styles.buttonActiveYellow,
        ]}
      >
        <BlurView
          intensity={15}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
        <Bookmark size={22} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onFilterChange("liked")}
        style={[
          styles.button,
          activeFilter === "liked" && styles.buttonActivePurple,
        ]}
      >
        <BlurView
          intensity={15}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
        <Heart size={22} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSearchToggle}
        style={[
          styles.button,
          (isSearchOpen || searchQuery) && styles.buttonActiveBlue,
        ]}
      >
        <BlurView
          intensity={15}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
        <Search size={22} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -128 }],
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    zIndex: 30,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.2)",
  },
  buttonActiveOrange: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.2)",
  },
  buttonActiveYellow: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.2)",
  },
  buttonActivePurple: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.2)",
  },
  buttonActiveBlue: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.2)",
  },
});

export default FloatingFilters;

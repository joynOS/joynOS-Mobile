import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { View, ActivityIndicator } from "react-native";
import "./global.css";

import { store } from "./src/shared/store";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { PublicNavigator } from "./src/navigation/PublicNavigator";
import { PrivateNavigator } from "./src/navigation/PrivateNavigator";
import VersionChecker from "./src/components/VersionChecker";

const AppContent = () => {
  const { user, loading, onboardingRequired } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000000",
        }}
      >
        <ActivityIndicator size="large" color="#cc5c24" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <VersionChecker>
        <></>
      </VersionChecker>
      {user ? (
        onboardingRequired ? (
          <PublicNavigator initialRouteName="PersonalityQuiz" />
        ) : (
          <PrivateNavigator />
        )
      ) : (
        <PublicNavigator />
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Provider>
  );
}

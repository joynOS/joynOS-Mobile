import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { View, ActivityIndicator } from 'react-native';

import { store } from './src/shared/store';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { PublicNavigator } from './src/navigation/PublicNavigator';
import { PrivateNavigator } from './src/navigation/PrivateNavigator';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color="#00C48C" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <PrivateNavigator /> : <PublicNavigator />}
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

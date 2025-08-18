import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Feed from '../screens/Feed';
import You from '../screens/You';
import SearchScreen from '../screens/Search';
import MapScreen from '../screens/Map';
import Profile from '../screens/Profile';
import EventDetail from '../screens/EventDetail';
import EventChat from '../screens/EventChat';
import EventLobby from '../screens/EventLobby';
import DiscoveryScreen from '../screens/Discovery';

import type { RootStackParamList } from './types';
import EventReview from '../screens/EventReview';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const PrivateNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="Feed"
    >
      <Stack.Screen name="Feed" component={Feed} />
      <Stack.Screen name="You" component={You} />
      <Stack.Screen name="Discovery" component={DiscoveryScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="EventDetail" component={EventDetail} />
      <Stack.Screen name="EventChat" component={EventChat} />
      <Stack.Screen name="EventLobby" component={EventLobby} />
      <Stack.Screen name="EventReview" component={EventReview} />
    </Stack.Navigator>
  );
};
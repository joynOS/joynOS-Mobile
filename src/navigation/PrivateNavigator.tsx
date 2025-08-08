import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Feed from '../screens/Feed';
import You from '../screens/You';
import SearchScreen from '../screens/Search';
import MapScreen from '../screens/Map';
import Profile from '../screens/Profile';

import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const PrivateNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="Feed"
    >
      <Stack.Screen name="Feed" component={Feed} />
      <Stack.Screen name="You" component={You} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="Profile" component={Profile} />
    </Stack.Navigator>
  );
};
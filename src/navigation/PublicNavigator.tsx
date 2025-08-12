import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Welcome from '../screens/Welcome';
import Login from '../screens/Login';
import Register from '../screens/Register';
import PersonalityQuiz from '../screens/PersonalityQuiz';
import InterestSelector from '../screens/InterestSelector';
import Terms from '../screens/Terms';
import Privacy from '../screens/Privacy';

const Stack = createNativeStackNavigator();

export const PublicNavigator = ({ initialRouteName = "Welcome" }: { initialRouteName?: string }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="PersonalityQuiz" component={PersonalityQuiz} />
      <Stack.Screen name="InterestSelector" component={InterestSelector} />
      <Stack.Screen name="Terms" component={Terms} />
      <Stack.Screen name="Privacy" component={Privacy} />
    </Stack.Navigator>
  );
};
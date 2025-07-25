import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Welcome from './src/screens/Welcome';
import PersonalityQuiz from './src/screens/PersonalityQuiz';
import InterestSelector from './src/screens/InterestSelector'; 

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="PersonalityQuiz" component={PersonalityQuiz} />
        <Stack.Screen name="InterestSelector" component={InterestSelector} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

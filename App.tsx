// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import Welcome from './src/screens/Welcome';
// import PersonalityQuiz from './src/screens/PersonalityQuiz';
// import InterestSelector from './src/screens/InterestSelector'; 
// import Feed from './src/screens/Feed';

// const Stack = createNativeStackNavigator();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="Welcome" component={Welcome} />
//         <Stack.Screen name="PersonalityQuiz" component={PersonalityQuiz} />
//         <Stack.Screen name="InterestSelector" component={InterestSelector} />
//         <Stack.Screen name="Feed" component={Feed} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';

import { store } from './src/shared/store';

import Welcome from './src/screens/Welcome';
import PersonalityQuiz from './src/screens/PersonalityQuiz';
import InterestSelector from './src/screens/InterestSelector';
import Feed from './src/screens/Feed';
import You from './src/screens/You';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="PersonalityQuiz" component={PersonalityQuiz} />
          <Stack.Screen name="InterestSelector" component={InterestSelector} />
          <Stack.Screen name="Feed" component={Feed} />
          <Stack.Screen name="You" component={You} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

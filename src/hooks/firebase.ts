import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
// import { getReactNativePersistence } from 'firebase/auth/react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as firebaseAuth from 'firebase/auth';

const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;



const firebaseConfig = {
    apiKey: 'AIzaSyAqweEZbCE1XUwVzxX1cyupZo7_mIls0W4',
    authDomain: 'joyn-os.firebaseapp.com',
    projectId: 'joyn-os',
    storageBucket: 'joyn-os.appspot.com',
    messagingSenderId: '951278295856',
    appId: '1:951278295856:android:4047718d38177e2bb4c6f5',
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
    // persistence: getReactNativePersistence(AsyncStorage),
    persistence: reactNativePersistence(AsyncStorage),
});

export { auth };
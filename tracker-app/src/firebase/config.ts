import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, onValue, remove } from 'firebase/database';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const manifestExtra =
  Constants.expoConfig?.extra ??
  Constants.manifest?.extra ??
  Constants.manifest2?.extra ??
  {};

const firebaseConfig = {
  apiKey: manifestExtra.firebaseApiKey,
  authDomain: manifestExtra.firebaseAuthDomain,
  projectId: manifestExtra.firebaseProjectId,
  storageBucket: manifestExtra.firebaseStorageBucket,
  messagingSenderId: manifestExtra.firebaseMessagingSenderId,
  appId: manifestExtra.firebaseAppId,
  databaseURL: manifestExtra.firebaseDatabaseUrl,
  measurementId: manifestExtra.firebaseMeasurementId,
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getDatabase(app);

import { useEffect, useMemo, useState } from 'react';
import 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import {
  useFonts,
  WorkSans_300Light,
  WorkSans_400Regular,
  WorkSans_500Medium,
  WorkSans_600SemiBold,
  WorkSans_700Bold,
} from '@expo-google-fonts/work-sans';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { onAuthStateChanged } from 'firebase/auth';
import { get, ref } from 'firebase/database';
import { View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { store } from '@/store';
import { appTheme } from '@/theme';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { auth, db } from '@/firebase/config';
import { setAuthError, setAuthLoading, setProfile, setUser } from '@/store/authSlice';
import type { UserProfile } from '@/types/tracker';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={appTheme}>
        <AuthBootstrap>
          <RootNavigation />
        </AuthBootstrap>
      </PaperProvider>
    </ReduxProvider>
  );
}

const AuthBootstrap = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const authLoading = useAppSelector((state) => state.auth.loading);
  const [fontsLoaded] = useFonts({
    WorkSans_300Light,
    WorkSans_400Regular,
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    WorkSans_700Bold,
    ...FontAwesome.font,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    dispatch(setAuthLoading(true));
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          dispatch(
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              displayName: firebaseUser.displayName,
            }),
          );
          const profileSnap = await get(ref(db, 'users/' + firebaseUser.uid));
          console.log('Profile snapshot:', profileSnap.exists());
          console.log('Profile data:', profileSnap.val());
          dispatch(setProfile((profileSnap.val() as UserProfile | undefined) ?? null));
        } else {
          dispatch(setUser(null));
          dispatch(setProfile(null));
        }
      } catch (err) {
        dispatch(setAuthError((err as Error).message));
      } finally {
        dispatch(setAuthLoading(false));
      }
    });
    return unsubscribe;
  }, [dispatch]);

  useEffect(() => {
    if (fontsLoaded && !authLoading && !ready) {
      setReady(true);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authLoading, ready]);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  return <>{children}</>;
};

function RootNavigation() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <AuthRedirect />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

function AuthRedirect() {
  const user = useAppSelector((state) => state.auth.user);
  const segments = useSegments();
  const router = useRouter();
  const isAuthGroup = useMemo(() => segments[0] === '(auth)', [segments]);

  useEffect(() => {
    if (!segments.length) return;
    if (!user && !isAuthGroup) {
      router.replace('/(auth)/login');
    }
    if (user && isAuthGroup) {
      router.replace('/(main)/dashboard');
    }
  }, [user, isAuthGroup, segments, router]);

  return null;
}

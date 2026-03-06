import { useEffect, useMemo, useState } from 'react';
import 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, usePathname } from 'expo-router';
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
import { setStudents, setCurrentMealPlan, setCurrentExercisePlan, setMealPlans } from '@/store/trackerSlice';
import type { UserProfile, Student, MealPlan, ExercisePlan } from '@/types/tracker';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
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
          
          // Load user profile
          const profileSnap = await get(ref(db, 'users/' + firebaseUser.uid));
          console.log('Profile loaded:', profileSnap.val());
          dispatch(setProfile((profileSnap.val() as UserProfile | undefined) ?? null));
          
          // Load students/children
          const studentsSnap = await get(ref(db, `users/${firebaseUser.uid}/students`));
          if (studentsSnap.exists()) {
            const studentsData = studentsSnap.val();
            const studentsList = Object.entries(studentsData).map(([id, data]) => ({ id, ...data as any }));
            console.log('Students loaded:', studentsList.length);
            dispatch(setStudents(studentsList));
          }
          
          // Load meal plans
          const mealPlansSnap = await get(ref(db, `users/${firebaseUser.uid}/mealPlans`));
          if (mealPlansSnap.exists()) {
            const mealPlansData = mealPlansSnap.val();
            const mealPlansList = Object.entries(mealPlansData).map(([id, data]) => ({ id, ...data as any }));
            console.log('Meal plans loaded:', mealPlansList.length);
            dispatch(setMealPlans(mealPlansList));
            // Set current meal plan to the first one if exists
            if (mealPlansList.length > 0) {
              dispatch(setCurrentMealPlan(mealPlansList[0]));
            }
          }
          
          // Load exercise plans
          const exercisePlansSnap = await get(ref(db, `users/${firebaseUser.uid}/exercisePlans`));
          if (exercisePlansSnap.exists()) {
            const exercisePlansData = exercisePlansSnap.val();
            const exercisePlansList = Object.entries(exercisePlansData).map(([id, data]) => ({ id, ...data as any }));
            console.log('Exercise plans loaded:', exercisePlansList.length);
            // Set current exercise plan to the first one if exists
            if (exercisePlansList.length > 0) {
              dispatch(setCurrentExercisePlan(exercisePlansList[0]));
            }
          }
        } else {
          dispatch(setUser(null));
          dispatch(setProfile(null));
          dispatch(setStudents([]));
          dispatch(setMealPlans([]));
          dispatch(setCurrentMealPlan(null));
          dispatch(setCurrentExercisePlan(null));
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
        <Stack.Screen name="index" />
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
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!segments.length) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onWelcomeScreen = pathname === '/' || pathname === '';

    if (!user) {
      // Not logged in - allow welcome screen, auth screens
      if (!inAuthGroup && !onWelcomeScreen) {
        // Redirect to welcome if not on auth or welcome
        router.replace('/');
      }
    } else {
      // Logged in - redirect away from auth/welcome to dashboard
      if (inAuthGroup || onWelcomeScreen) {
        router.replace('/(main)/dashboard');
      }
    }
  }, [user, segments, pathname, router]);

  return null;
}

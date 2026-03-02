import { useEffect } from 'react';
import { ref, onValue } from 'firebase/database';

import {
  subscribeToExerciseTasks,
  subscribeToMeals,
  subscribeToScreenSessions,
  subscribeToStudents,
} from '@/firebase/trackerApi';
import { useAppDispatch, useAppSelector } from './redux';
import {
  resetTrackerState,
  setExerciseTasks,
  setMeals,
  setScreenSessions,
  setStudents,
} from '@/store/trackerSlice';
import { setProfile } from '@/store/authSlice';
import type { UserProfile } from '@/types/tracker';
import { db } from '@/firebase/config';

export const useTrackerSync = () => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.uid);

  useEffect(() => {
    if (!userId) {
      dispatch(resetTrackerState());
      return;
    }

    let unsubMeals: (() => void) | undefined;
    let unsubTasks: (() => void) | undefined;
    let unsubSessions: (() => void) | undefined;
    let unsubProfile: (() => void) | undefined;
    let unsubStudents: (() => void) | undefined;
    let cancelled = false;

    const bootstrap = async () => {
      try {
        if (cancelled) return;

        // Subscribe to profile data
        unsubProfile = onValue(ref(db, `users/${userId}`), (snapshot) => {
          if (snapshot.exists()) {
            const profile = snapshot.val() as UserProfile;
            dispatch(setProfile(profile));
          }
        });

        // Subscribe to students data
        unsubStudents = subscribeToStudents(userId, (students) => dispatch(setStudents(students)));

        unsubMeals = subscribeToMeals(userId, (meals) => dispatch(setMeals(meals)));
        unsubTasks = subscribeToExerciseTasks(userId, (tasks) => dispatch(setExerciseTasks(tasks)));
        unsubSessions = subscribeToScreenSessions(userId, (sessions) =>
          dispatch(setScreenSessions(sessions)),
        );
      } catch (error) {
        console.error('Tracker sync failed', error);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
      unsubMeals?.();
      unsubTasks?.();
      unsubSessions?.();
      unsubProfile?.();
      unsubStudents?.();
    };
  }, [userId, dispatch]);
};

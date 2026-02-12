import { useEffect, useRef } from 'react';

import { demoExerciseTasks, demoMeals, demoScreenSessions } from '@/constants/demoData';
import { useAppDispatch, useAppSelector } from './redux';
import { setExerciseTasks, setMeals, setScreenSessions } from '@/store/trackerSlice';

export const useDemoSeed = () => {
  const dispatch = useAppDispatch();
  const seededRef = useRef(false);
  const hasMeals = useAppSelector((state) => state.tracker.meals.length > 0);
  const hasSessions = useAppSelector((state) => state.tracker.screenSessions.length > 0);
  const hasTasks = useAppSelector((state) => state.tracker.exerciseTasks.length > 0);

  useEffect(() => {
    if (seededRef.current || hasMeals || hasSessions || hasTasks) return;
    dispatch(setMeals(demoMeals));
    dispatch(setScreenSessions(demoScreenSessions));
    dispatch(setExerciseTasks(demoExerciseTasks));
    seededRef.current = true;
  }, [dispatch, hasMeals, hasSessions, hasTasks]);
};

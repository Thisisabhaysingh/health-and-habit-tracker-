import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';

import { auth, db } from './config';
import { bmiCategory, bmiFromMetric } from '@/utils/bmi';
import { getBMIGoal, getWeeklyGoal, calculateTargetWeight, estimateTargetDate, calculateRecommendedCalories } from '@/utils/bmi';
import type { UserProfile } from '@/types/tracker';
import type { ExerciseTask, MealEntry, ScreenSession } from '@/types/tracker';

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  age: number;
  heightCm: number;
  weightKg: number;
  calorieTarget: number;
  screenTimeLimitMin: number;
}

export const signUpWithProfile = async ({
  name,
  email,
  password,
  age,
  heightCm,
  weightKg,
  calorieTarget,
  screenTimeLimitMin,
}: SignUpPayload) => {
  try {
    console.log('Starting signup with:', { email, name });
    console.log('Firebase config check - auth available:', !!auth);
    
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User created successfully:', credential.user.uid);
    
    const bmi = bmiFromMetric(heightCm, weightKg);
    const category = bmiCategory(bmi);
    
    // Calculate BMI goals
    const targetBMI = getBMIGoal(bmi, category);
    const targetWeight = calculateTargetWeight(heightCm, targetBMI);
    const weeklyGoal = getWeeklyGoal(bmi, targetBMI);
    const targetDate = estimateTargetDate(weightKg, targetWeight, weeklyGoal);
    
    // Calculate recommended calories based on BMI goals
    const recommendedCalories = calculateRecommendedCalories(heightCm, weightKg, age, 'male');
    
    const profile: UserProfile = {
      uid: credential.user.uid,
      email,
      name,
      age,
      heightCm,
      weightKg,
      bmi,
      bmiCategory: category,
      calorieTarget: recommendedCalories,
      screenTimeLimitMin,
      createdAt: new Date().toISOString(),
      // BMI Goal Tracking
      targetBMI,
      targetWeight,
      weeklyGoal,
      targetDate,
    };
    
    console.log('Saving profile to database...');
    console.log('Profile data to save:', profile);
    await set(ref(db, `users/${credential.user.uid}`), profile);
    console.log('Profile saved successfully');
    
    // Verify the save
    const verifySnap = await get(ref(db, `users/${credential.user.uid}`));
    console.log('Verification - saved data:', verifySnap.val());
    
    return profile;
  } catch (error) {
    console.error('Signup error:', (error as any).code, (error as any).message);
    throw error;
  }
};

export const emailSignIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const emailSignOut = () => signOut(auth);

export const saveExerciseTasks = async (userId: string, tasks: ExerciseTask[]) => {
  try {
    // Clean up the data to remove undefined values that Firebase doesn't accept
    const cleanedTasks = tasks.map(task => {
      const cleanedTask: any = { ...task };
      // Remove undefined properties that Firebase doesn't accept
      if (cleanedTask.equipment === undefined) cleanedTask.equipment = [];
      if (cleanedTask.sets === undefined) delete cleanedTask.sets;
      if (cleanedTask.reps === undefined) delete cleanedTask.reps;
      if (cleanedTask.steps === undefined) delete cleanedTask.steps;
      return cleanedTask;
    });
    await set(ref(db, `users/${userId}/exerciseTasks`), cleanedTasks);
  } catch (error) {
    console.error('Error saving exercise tasks:', error);
    throw error;
  }
};

export const loadExerciseTasks = async (userId: string): Promise<ExerciseTask[]> => {
  try {
    const snapshot = await get(ref(db, `users/${userId}/exerciseTasks`));
    return snapshot.exists() ? snapshot.val() : [];
  } catch (error) {
    console.error('Error loading exercise tasks:', error);
    return [];
  }
};

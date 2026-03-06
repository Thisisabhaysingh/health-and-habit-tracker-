import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  remove,
  update,
} from 'firebase/database';

import { demoExerciseTasks, demoMeals, demoScreenSessions } from '@/constants/demoData';
import { db } from './config';
import type { ExerciseTask, MealEntry, ScreenSession, Student, MealPlan, ExercisePlan } from '@/types/tracker';

type MealPayload = Omit<MealEntry, 'id'>;
type ScreenSessionPayload = Omit<ScreenSession, 'id'>;
type ExerciseTaskPayload = Omit<ExerciseTask, 'id'>;
type StudentPayload = Omit<Student, 'id'>;
type MealPlanPayload = Omit<MealPlan, 'id'>;
type ExercisePlanPayload = Omit<ExercisePlan, 'id'>;

const mealsRef = (uid: string) => ref(db, `users/${uid}/meals`);
const exerciseRef = (uid: string) => ref(db, `users/${uid}/exerciseTasks`);
const screenRef = (uid: string) => ref(db, `users/${uid}/screenSessions`);
const studentsRef = (uid: string) => ref(db, `users/${uid}/students`);
const mealPlansRef = (uid: string) => ref(db, `users/${uid}/mealPlans`);
const exercisePlansRef = (uid: string) => ref(db, `users/${uid}/exercisePlans`);

const mapMeal = (snapshot: any, key: string): MealEntry => {
  const data = snapshot.val() as MealPayload;
  return {
    id: key,
    foodName: data.foodName,
    calories: data.calories,
    portion: data.portion,
    unit: data.unit,
    loggedAt: data.loggedAt,
    isCompleted: data.isCompleted || false,
    completedAt: data.completedAt || null,
  };
};

const mapTask = (snapshot: any, key: string): ExerciseTask => {
  const data = snapshot.val() as ExerciseTaskPayload;
  return {
    id: key,
    ...data,
  };
};

const mapScreenSession = (snapshot: any, key: string): ScreenSession => {
  const data = snapshot.val() as ScreenSessionPayload;
  return {
    id: key,
    date: data.date,
    minutes: data.minutes,
  };
};

export const createMealEntry = async (uid: string, payload: MealPayload) => {
  const newMealRef = push(mealsRef(uid));
  await set(newMealRef, payload);
  return newMealRef.key;
};

export const updateMealEntry = async (uid: string, mealId: string, payload: MealPayload) => {
  await update(ref(db, `users/${uid}/meals/${mealId}`), payload);
};

export const deleteMealEntry = async (uid: string, mealId: string) => {
  await remove(ref(db, `users/${uid}/meals/${mealId}`));
};

export const subscribeToMeals = (uid: string, callback: (meals: MealEntry[]) => void) => {
  return onValue(mealsRef(uid), (snapshot) => {
    const meals: MealEntry[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        meals.push(mapMeal(childSnapshot, childSnapshot.key!));
      });
    }
    callback(meals);
  });
};

export const setExerciseTaskCompletion = async (uid: string, taskId: string, completed: boolean) => {
  await update(ref(db, `users/${uid}/exerciseTasks/${taskId}`), { completed });
};

export const subscribeToExerciseTasks = (uid: string, callback: (tasks: ExerciseTask[]) => void) => {
  return onValue(exerciseRef(uid), (snapshot) => {
    const tasks: ExerciseTask[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        tasks.push(mapTask(childSnapshot, childSnapshot.key!));
      });
    }
    callback(tasks);
  });
};

export const logScreenTimeChunk = async (uid: string, payload: ScreenSessionPayload) => {
  const newSessionRef = push(screenRef(uid));
  await set(newSessionRef, payload);
  return newSessionRef.key;
};

// Student functions
const mapStudent = (snapshot: any, key: string): Student => {
  const data = snapshot.val() as StudentPayload;
  return {
    id: key,
    ...data,
  };
};

export const createStudent = async (uid: string, payload: StudentPayload) => {
  const newStudentRef = push(studentsRef(uid));
  await set(newStudentRef, payload);
  return newStudentRef.key;
};

export const updateStudent = async (uid: string, studentId: string, payload: Partial<StudentPayload>) => {
  await update(ref(db, `users/${uid}/students/${studentId}`), payload);
};

export const deleteStudent = async (uid: string, studentId: string) => {
  await remove(ref(db, `users/${uid}/students/${studentId}`));
};

export const subscribeToStudents = (uid: string, callback: (students: Student[]) => void) => {
  return onValue(studentsRef(uid), (snapshot) => {
    const students: Student[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        students.push(mapStudent(childSnapshot, childSnapshot.key!));
      });
    }
    callback(students);
  });
};

// Meal Plan functions
const mapMealPlan = (snapshot: any, key: string): MealPlan => {
  const data = snapshot.val() as MealPlanPayload;
  return {
    id: key,
    ...data,
  };
};

export const createMealPlan = async (uid: string, payload: MealPlanPayload) => {
  const newMealPlanRef = push(mealPlansRef(uid));
  await set(newMealPlanRef, payload);
  return newMealPlanRef.key;
};

export const updateMealPlan = async (uid: string, mealPlanId: string, payload: Partial<MealPlanPayload>) => {
  await update(ref(db, `users/${uid}/mealPlans/${mealPlanId}`), payload);
};

export const updateMealConsumption = async (uid: string, mealPlanId: string, date: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
  await update(ref(db, `users/${uid}/mealPlans/${mealPlanId}/meals/${date}/consumed`), {
    [mealType]: true
  });
};

export const subscribeToMealPlans = (uid: string, callback: (mealPlans: MealPlan[]) => void) => {
  return onValue(mealPlansRef(uid), (snapshot) => {
    const mealPlans: MealPlan[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        mealPlans.push(mapMealPlan(childSnapshot, childSnapshot.key!));
      });
    }
    callback(mealPlans);
  });
};

export const subscribeToCurrentMealPlan = (uid: string, studentId: string, callback: (mealPlan: MealPlan | null) => void) => {
  return onValue(mealPlansRef(uid), (snapshot) => {
    let currentMealPlan: MealPlan | null = null;
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const mealPlan = mapMealPlan(childSnapshot, childSnapshot.key!);
        if (mealPlan.studentId === studentId) {
          currentMealPlan = mealPlan;
        }
      });
    }
    callback(currentMealPlan);
  });
};

export const subscribeToScreenSessions = (uid: string, callback: (sessions: ScreenSession[]) => void) => {
  return onValue(screenRef(uid), (snapshot) => {
    const sessions: ScreenSession[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        sessions.push(mapScreenSession(childSnapshot, childSnapshot.key!));
      });
    }
    callback(sessions);
  });
};

// Exercise Plan functions
const mapExercisePlan = (snapshot: any, key: string): ExercisePlan => {
  const data = snapshot.val() as ExercisePlanPayload;
  return {
    id: key,
    ...data,
  };
};

export const createExercisePlan = async (uid: string, payload: ExercisePlanPayload) => {
  const newExercisePlanRef = push(exercisePlansRef(uid));
  await set(newExercisePlanRef, payload);
  return newExercisePlanRef.key;
};

export const updateExercisePlan = async (uid: string, exercisePlanId: string, payload: Partial<ExercisePlanPayload>) => {
  await update(ref(db, `users/${uid}/exercisePlans/${exercisePlanId}`), payload);
};

export const updateExerciseConsumption = async (uid: string, exercisePlanId: string, date: string, exerciseType: 'mobility' | 'strength' | 'cardio') => {
  await update(ref(db, `users/${uid}/exercisePlans/${exercisePlanId}/exercises/${date}/completed`), {
    [exerciseType]: true
  });
};

export const subscribeToExercisePlans = (uid: string, callback: (exercisePlans: ExercisePlan[]) => void) => {
  return onValue(exercisePlansRef(uid), (snapshot) => {
    const exercisePlans: ExercisePlan[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        exercisePlans.push(mapExercisePlan(childSnapshot, childSnapshot.key!));
      });
    }
    callback(exercisePlans);
  }, { onlyOnce: false });
};

export const subscribeToCurrentExercisePlan = (uid: string, studentId: string, callback: (exercisePlan: ExercisePlan | null) => void) => {
  return onValue(exercisePlansRef(uid), (snapshot) => {
    let currentExercisePlan: ExercisePlan | null = null;
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const exercisePlan = mapExercisePlan(childSnapshot, childSnapshot.key!);
        if (exercisePlan.studentId === studentId) {
          currentExercisePlan = exercisePlan;
        }
      });
    }
    callback(currentExercisePlan);
  });
};

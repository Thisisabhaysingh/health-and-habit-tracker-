import { ref, set, get } from 'firebase/database';
import { db } from './config';
import { 
  SHELTER_HOME_PROGRAMS, 
  getProgramByAge, 
  getTodaysExercises,
  type AgeGroupPlan,
  type DayPlan,
  type Exercise
} from '@/src/constants/exerciseLibrary';

// Seed the Shelter Home Fitness Program to Firebase
export const seedExerciseLibrary = async () => {
  try {
    const programsRef = ref(db, 'exerciseLibrary/shelterHome');
    await set(programsRef, SHELTER_HOME_PROGRAMS);
    
    console.log('Shelter Home Fitness Program seeded successfully!');
    return { success: true, message: 'Shelter Home Fitness Program seeded successfully' };
  } catch (error) {
    console.error('Error seeding exercise library:', error);
    return { success: false, message: 'Failed to seed exercise library', error };
  }
};

// Generate exercise plan for a student based on age and current day
export const generateExercisePlanForStudent = async (
  studentId: string,
  studentName: string,
  age: number,
  date: string = new Date().toISOString().split('T')[0]
): Promise<{
  studentId: string;
  studentName: string;
  date: string;
  dayPlan: DayPlan | null;
  exercises: Exercise[];
  totalDuration: number;
  totalCalories: number;
}> => {
  const dayOfWeek = new Date(date).getDay();
  const dayPlan = getTodaysExercises(age, dayOfWeek);
  
  if (!dayPlan) {
    return {
      studentId,
      studentName,
      date,
      dayPlan: null,
      exercises: [],
      totalDuration: 0,
      totalCalories: 0
    };
  }

  const totalDuration = dayPlan.exercises.reduce((sum, ex) => sum + ex.duration, 0);
  const totalCalories = dayPlan.exercises.reduce((sum, ex) => sum + ex.calories, 0);

  return {
    studentId,
    studentName,
    date,
    dayPlan,
    exercises: dayPlan.exercises,
    totalDuration,
    totalCalories
  };
};

// Get weekly plan for a student
export const getWeeklyPlanForStudent = async (
  studentId: string,
  age: number
): Promise<{
  studentId: string;
  weeklyPlan: DayPlan[];
  programInfo: AgeGroupPlan | null;
}> => {
  const program = getProgramByAge(age);
  
  return {
    studentId,
    weeklyPlan: program?.weeklyPlan || [],
    programInfo: program
  };
};

// Create full week exercise plan in Firebase
export const createExercisePlan = async (
  uid: string,
  studentId: string,
  studentName: string,
  age: number,
  startDate: string = new Date().toISOString().split('T')[0]
) => {
  try {
    const program = getProgramByAge(age);
    if (!program) {
      throw new Error('No program found for this age');
    }

    // Create 7 days of exercise plans
    const exercisePlans: Record<string, any> = {};
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      const dayPlan = getTodaysExercises(age, dayOfWeek);
      if (dayPlan) {
        exercisePlans[dateStr] = {
          day: dayPlan.day,
          title: dayPlan.title,
          focus: dayPlan.focus,
          duration: dayPlan.duration,
          exercises: dayPlan.exercises.map(ex => ({
            ...ex,
            completed: false
          })),
          completed: false,
          totalCalories: dayPlan.exercises.reduce((sum, ex) => sum + ex.calories, 0)
        };
      }
    }

    const planData = {
      studentId,
      studentName,
      age,
      ageRange: program.ageRange,
      programFocus: program.focus,
      createdAt: new Date().toISOString(),
      startDate,
      exercises: exercisePlans
    };

    const planRef = ref(db, `users/${uid}/exercisePlans/${studentId}`);
    await set(planRef, planData);

    return { success: true, planId: studentId, data: planData };
  } catch (error) {
    console.error('Error creating exercise plan:', error);
    return { success: false, error };
  }
};

// Get exercise plan from Firebase
export const getExercisePlan = async (uid: string, studentId: string) => {
  try {
    const planRef = ref(db, `users/${uid}/exercisePlans/${studentId}`);
    const snapshot = await get(planRef);
    
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    }
    return { success: false, error: 'Plan not found' };
  } catch (error) {
    console.error('Error getting exercise plan:', error);
    return { success: false, error };
  }
};

// Mark exercise as completed
export const markExerciseCompleted = async (
  uid: string,
  studentId: string,
  date: string,
  exerciseId: string,
  completed: boolean = true
) => {
  try {
    const exerciseRef = ref(db, `users/${uid}/exercisePlans/${studentId}/exercises/${date}/exercises`);
    const snapshot = await get(exerciseRef);
    
    if (!snapshot.exists()) {
      return { success: false, error: 'Exercise plan not found' };
    }

    const exercises = snapshot.val();
    const updatedExercises = exercises.map((ex: any) => 
      ex.id === exerciseId ? { ...ex, completed } : ex
    );

    await set(exerciseRef, updatedExercises);
    
    // Check if all exercises are completed for the day
    const allCompleted = updatedExercises.every((ex: any) => ex.completed);
    if (allCompleted) {
      const dayRef = ref(db, `users/${uid}/exercisePlans/${studentId}/exercises/${date}/completed`);
      await set(dayRef, true);
    }

    return { success: true };
  } catch (error) {
    console.error('Error marking exercise:', error);
    return { success: false, error };
  }
};

// Get today's exercise plan for a student
export const getTodaysPlan = async (uid: string, studentId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const planRef = ref(db, `users/${uid}/exercisePlans/${studentId}/exercises/${today}`);
    const snapshot = await get(planRef);
    
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val(), date: today };
    }
    return { success: false, error: 'No plan for today' };
  } catch (error) {
    console.error('Error getting today\'s plan:', error);
    return { success: false, error };
  }
};

// Get program info by age
export const getProgramInfo = (age: number) => {
  return getProgramByAge(age);
};

// Legacy functions for backwards compatibility (deprecated)
export const getExerciseRecommendationsByMeal = async () => {
  console.warn('getExerciseRecommendationsByMeal is deprecated. Use age-based programs instead.');
  return [];
};

export const getComplementaryExercises = () => {
  console.warn('getComplementaryExercises is deprecated. Use age-based programs instead.');
  return [];
};

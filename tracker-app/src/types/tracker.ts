export type PortionUnit = 'g' | 'ml' | 'serving' | 'plate' | 'piece' | 'bowl' | 'pieces' | 'packet' | 'spoon';

export type BmiCategory = 'Underweight' | 'Normal' | 'Overweight' | 'Obese';

export interface Student {
  id: string;
  name: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  bmi: number;
  bmiCategory: string;
  dailyCalorieNeeds: number;
  dietType: string;
  createdAt: string;
}

export interface MealWithGrams {
  name: string;
  calories: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  grams: number;
}

export interface MealPlan {
  id: string;
  studentId: string;
  weekStartDate: string;
  meals: {
    [date: string]: {
      breakfast: MealWithGrams;
      lunch: MealWithGrams;
      dinner: MealWithGrams;
      snack: MealWithGrams;
      totalCalories: number;
      totalGrams: number;
      consumed: {
        breakfast: boolean;
        lunch: boolean;
        dinner: boolean;
        snack: boolean;
      };
    };
  };
  createdAt: string;
}

export interface MealEntry {
  id: string;
  foodName: string;
  calories: number;
  portion: number;
  unit: PortionUnit;
  loggedAt: string; // ISO string
  isCompleted?: boolean;
  completedAt?: string | null;
  category?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface ExerciseTask {
  id: string;
  name: string;
  type: 'home' | 'gym';
  category: 'mobility' | 'strength' | 'cardio';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese';
  duration: number; // in minutes
  calories: number; // estimated calories burned
  equipment?: string[];
  instructions: string[];
  sets?: number;
  reps?: number;
  steps?: number;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface ExerciseWithDetails {
  name: string;
  type: 'home' | 'gym';
  category: 'mobility' | 'strength' | 'cardio';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  calories: number;
  equipment?: string[];
  instructions: string[];
  sets?: number;
  reps?: number;
}

export interface ExercisePlan {
  id: string;
  studentId: string;
  weekStartDate: string;
  exercises: {
    [date: string]: {
      mobility: ExerciseWithDetails;
      strength: ExerciseWithDetails;
      cardio: ExerciseWithDetails;
      totalCalories: number;
      totalDuration: number;
      completed: {
        mobility: boolean;
        strength: boolean;
        cardio: boolean;
      };
    };
  };
  createdAt: string;
}

export interface ScreenSession {
  id: string;
  date: string; // YYYY-MM-DD
  minutes: number;
}

export interface TrackerState {
  meals: MealEntry[];
  exerciseTasks: ExerciseTask[];
  screenSessions: ScreenSession[];
  students: Student[];
  currentMealPlan: MealPlan | null;
  currentExercisePlan: ExercisePlan | null;
  mealPlans: MealPlan[]; // Array to store meal plans for multiple children
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string | null;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  bmi: number;
  bmiCategory: BmiCategory;
  calorieTarget: number;
  screenTimeLimitMin: number;
  createdAt: string;
}

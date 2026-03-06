export type PortionUnit = 'g' | 'ml' | 'serving' | 'plate' | 'piece' | 'bowl' | 'pieces' | 'packet' | 'spoon';

export type BmiCategory = 'Underweight' | 'Normal' | 'Overweight' | 'Obese';

export type Region = 'kolkata' | 'delhi';

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
  region: Region; // Region for meal plan
  createdAt: string;
}

export interface MealWithGrams {
  name: string;
  calories: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  grams: number;
}

export interface DishCombination {
  id: string;
  name: string;
  items: string[];
  calories: number;
  protein: number;
  iron: boolean;
  calcium: boolean;
  energyDense: boolean;
}

export interface DailyMealPlan {
  day: string;
  breakfast: DishCombination;
  lunch: DishCombination;
  snack: DishCombination;
  dinner: DishCombination;
  specialNote?: string;
}

export interface MealPlan {
  id: string;
  studentId: string;
  studentName?: string;
  age?: number;
  weekStartDate?: string;
  createdAt: string;
  // Old format
  meals?: {
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
  // New Shelter Home format
  weeklyMenu?: DailyMealPlan[];
  completedMeals?: {
    [date: string]: {
      breakfast: boolean;
      lunch: boolean;
      dinner: boolean;
      snack: boolean;
    };
  };
  portionGuidelines?: {
    ageRange: string;
    chapati: number;
    rice: string;
    dal: string;
    milk: string;
    paneer: number;
    chicken: number;
    legumes: string;
  };
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
      // New Shelter Home format (array of exercises)
      exercises?: Array<{
        id: string;
        name: string;
        category: string;
        duration: number;
        calories: number;
        reps?: string;
        instructions: string[];
        completed?: boolean;
      }>;
      title?: string;
      focus?: string;
      day?: string;
      // Old format properties
      mobility?: ExerciseWithDetails;
      strength?: ExerciseWithDetails;
      cardio?: ExerciseWithDetails;
      totalCalories?: number;
      totalDuration?: number;
      completed?: {
        mobility: boolean;
        strength: boolean;
        cardio: boolean;
      } | boolean;
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
  exercisePlans: ExercisePlan[]; // Array to store exercise plans for multiple children
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
  // BMI Goal Tracking
  targetBMI: number;
  targetWeight: number;
  weeklyGoal: number;
  targetDate: string;
}

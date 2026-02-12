import { ref, set } from 'firebase/database';
import { db } from './config';
import { HOME_EXERCISES, GYM_EXERCISES } from '@/constants/exerciseLibrary';

export interface ExerciseLibraryEntry {
  id: string;
  name: string;
  type: 'home' | 'gym';
  category: 'mobility' | 'strength' | 'cardio';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese';
  duration: number;
  calories: number;
  equipment?: string[];
  instructions: string[];
  sets?: number;
  reps?: number;
  steps?: number;
  recommendedMeals?: string[]; // Meal categories this exercise pairs well with
}

export const seedExerciseLibrary = async () => {
  try {
    // Seed home exercises
    const homeExercisesRef = ref(db, 'exerciseLibrary/home');
    const homeExerciseData: Record<string, ExerciseLibraryEntry> = {};
    
    HOME_EXERCISES.forEach(exercise => {
      homeExerciseData[exercise.id] = {
        ...exercise,
        recommendedMeals: getRecommendedMealsForExercise(exercise.category, exercise.bmiCategory)
      };
    });
    
    await set(homeExercisesRef, homeExerciseData);
    
    // Seed gym exercises
    const gymExercisesRef = ref(db, 'exerciseLibrary/gym');
    const gymExerciseData: Record<string, ExerciseLibraryEntry> = {};
    
    GYM_EXERCISES.forEach(exercise => {
      gymExerciseData[exercise.id] = {
        ...exercise,
        recommendedMeals: getRecommendedMealsForExercise(exercise.category, exercise.bmiCategory)
      };
    });
    
    await set(gymExercisesRef, gymExerciseData);
    
    console.log('Exercise library seeded successfully!');
    return { success: true, message: 'Exercise library seeded successfully' };
  } catch (error) {
    console.error('Error seeding exercise library:', error);
    return { success: false, message: 'Failed to seed exercise library', error };
  }
};

// Get recommended meals based on exercise category and BMI category
const getRecommendedMealsForExercise = (
  exerciseCategory: 'mobility' | 'strength' | 'cardio',
  bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese'
): string[] => {
  const mealRecommendations: Record<string, Record<string, string[]>> = {
    underweight: {
      mobility: ['breakfast', 'lunch', 'dinner'], // Light exercises pair with all meals
      strength: ['breakfast', 'lunch', 'dinner'], // Strength needs protein from main meals
      cardio: ['breakfast', 'snack'], // Cardio pairs with energy-boosting meals
    },
    normal: {
      mobility: ['breakfast', 'lunch', 'snack'], // Light exercises for daily routine
      strength: ['lunch', 'dinner'], // Strength pairs with protein-rich meals
      cardio: ['breakfast', 'snack'], // Cardio for energy and metabolism
    },
    overweight: {
      mobility: ['breakfast', 'snack'], // Light exercises for daily activity
      strength: ['lunch', 'dinner'], // Strength for metabolism boost
      cardio: ['breakfast', 'lunch'], // Cardio for calorie burning
    },
    obese: {
      mobility: ['breakfast', 'snack'], // Gentle exercises for joint health
      strength: ['lunch', 'dinner'], // Strength for muscle building
      cardio: ['breakfast', 'lunch'], // Cardio for weight management
    },
  };
  
  return mealRecommendations[bmiCategory]?.[exerciseCategory] || ['snack'];
};

// Get exercise recommendations based on selected meal and BMI
export const getExerciseRecommendationsByMeal = async (
  mealCategory: string,
  bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese',
  exerciseType: 'home' | 'gym'
): Promise<ExerciseLibraryEntry[]> => {
  try {
    const exerciseLibraryRef = ref(db, `exerciseLibrary/${exerciseType}`);
    
    return new Promise((resolve, reject) => {
      import('firebase/database').then(({ onValue, get }) => {
        get(exerciseLibraryRef).then((snapshot) => {
          if (snapshot.exists()) {
            const exercises = snapshot.val() as Record<string, ExerciseLibraryEntry>;
            
            // Filter exercises that recommend this meal category and match BMI
            const recommendedExercises = Object.values(exercises).filter(exercise => 
              exercise.bmiCategory === bmiCategory &&
              exercise.recommendedMeals?.includes(mealCategory)
            );
            
            // Sort by relevance (strength > cardio > mobility for most meals)
            const sortedExercises = recommendedExercises.sort((a, b) => {
              const categoryOrder = { strength: 0, cardio: 1, mobility: 2 };
              return categoryOrder[a.category] - categoryOrder[b.category];
            });
            
            resolve(sortedExercises.slice(0, 6)); // Return top 6 recommendations
          } else {
            resolve([]);
          }
        }).catch(reject);
      });
    });
  } catch (error) {
    console.error('Error getting exercise recommendations:', error);
    return [];
  }
};

// Get complementary exercises for a specific meal
export const getComplementaryExercises = (
  mealCategory: string,
  bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese',
  exerciseType: 'home' | 'gym'
): ExerciseLibraryEntry[] => {
  const exercises = exerciseType === 'home' ? HOME_EXERCISES : GYM_EXERCISES;
  
  // Filter exercises based on BMI and meal compatibility
  const compatibleExercises = exercises.filter(exercise => {
    const recommendedMeals = getRecommendedMealsForExercise(exercise.category, bmiCategory);
    return exercise.bmiCategory === bmiCategory && recommendedMeals.includes(mealCategory);
  });
  
  // Return balanced mix of exercise types
  const strength = compatibleExercises.filter(e => e.category === 'strength').slice(0, 2);
  const cardio = compatibleExercises.filter(e => e.category === 'cardio').slice(0, 2);
  const mobility = compatibleExercises.filter(e => e.category === 'mobility').slice(0, 2);
  
  return [...strength, ...cardio, ...mobility];
};

export interface Exercise {
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
  recommendedMeals?: string[]; // Meal categories this exercise pairs well with
}

export const HOME_EXERCISES: Exercise[] = [
  // Mobility Exercises
  {
    id: 'home-mobility-1',
    name: 'Morning Stretch Routine',
    type: 'home',
    category: 'mobility',
    difficulty: 'beginner',
    bmiCategory: 'underweight',
    duration: 10,
    calories: 30,
    recommendedMeals: ['breakfast', 'lunch', 'dinner'],
    instructions: [
      'Start with neck rolls - 10 circles each direction',
      'Shoulder stretches - hold each for 30 seconds',
      'Cat-cow stretches - 15 repetitions',
      'Hip circles - 10 circles each direction',
      'Leg swings - 15 swings each leg'
    ]
  },
  {
    id: 'home-mobility-2',
    name: 'Full Body Flow',
    type: 'home',
    category: 'mobility',
    difficulty: 'intermediate',
    bmiCategory: 'normal',
    duration: 15,
    calories: 50,
    recommendedMeals: ['breakfast', 'lunch', 'snack'],
    instructions: [
      'Sun salutation variations - 5 rounds',
      'Spinal twists - 10 each side',
      'Dynamic lunges - 8 each side',
      'Arm circles - 20 forward, 20 backward',
      'Ankle and wrist rotations - 15 each'
    ]
  },
  {
    id: 'home-mobility-3',
    name: 'Joint Mobility Circuit',
    type: 'home',
    category: 'mobility',
    difficulty: 'beginner',
    bmiCategory: 'overweight',
    duration: 12,
    calories: 40,
    recommendedMeals: ['breakfast', 'snack'],
    instructions: [
      'Shoulder rolls - 20 forward, 20 backward',
      'Hip openers - 10 each side',
      'Knee circles - 10 each direction',
      'Spinal rotations - 15 each side',
      'Deep breathing with arm raises - 10 breaths'
    ]
  },
  {
    id: 'home-mobility-4',
    name: 'Gentle Movement Routine',
    type: 'home',
    category: 'mobility',
    difficulty: 'beginner',
    bmiCategory: 'obese',
    duration: 8,
    calories: 25,
    recommendedMeals: ['breakfast', 'snack'],
    instructions: [
      'Seated neck stretches - 10 each side',
      'Seated spinal twists - 10 each side',
      'Ankle pumps - 30 repetitions',
      'Shoulder shrugs - 20 repetitions',
      'Deep breathing exercises - 5 minutes'
    ]
  },
  
  // Strength Exercises
  {
    id: 'home-strength-1',
    name: 'Bodyweight Circuit',
    type: 'home',
    category: 'strength',
    difficulty: 'beginner',
    bmiCategory: 'underweight',
    duration: 20,
    calories: 150,
    recommendedMeals: ['breakfast', 'lunch', 'dinner'],
    sets: 3,
    reps: 12,
    instructions: [
      'Push-ups (knee or regular) - 12 reps',
      'Bodyweight squats - 15 reps',
      'Plank hold - 30 seconds',
      'Glute bridges - 15 reps',
      'Modified burpees - 8 reps'
    ]
  },
  {
    id: 'home-strength-2',
    name: 'Upper Body Blast',
    type: 'home',
    category: 'strength',
    difficulty: 'intermediate',
    bmiCategory: 'normal',
    duration: 25,
    calories: 200,
    recommendedMeals: ['lunch', 'dinner'],
    sets: 3,
    reps: 15,
    instructions: [
      'Push-ups - 15 reps',
      'Diamond push-ups - 10 reps',
      'Tricep dips (chair) - 12 reps',
      'Plank variations - 45 seconds',
      'Mountain climbers - 20 reps'
    ]
  },
  {
    id: 'home-strength-3',
    name: 'Low Impact Strength',
    type: 'home',
    category: 'strength',
    difficulty: 'beginner',
    bmiCategory: 'overweight',
    duration: 20,
    calories: 120,
    recommendedMeals: ['lunch', 'dinner'],
    sets: 2,
    reps: 10,
    instructions: [
      'Wall push-ups - 15 reps',
      'Chair squats - 12 reps',
      'Standing wall sits - 30 seconds',
      'Resistance band pulls - 15 reps',
      'Calf raises - 20 reps'
    ]
  },
  {
    id: 'home-strength-4',
    name: 'Seated Strength Workout',
    type: 'home',
    category: 'strength',
    difficulty: 'beginner',
    bmiCategory: 'obese',
    duration: 15,
    calories: 80,
    recommendedMeals: ['lunch', 'dinner'],
    sets: 2,
    reps: 8,
    instructions: [
      'Seated leg extensions - 12 reps',
      'Seated arm curls - 10 reps each arm',
      'Seated rowing motion - 15 reps',
      'Seated marches - 30 seconds',
      'Seated shoulder presses - 10 reps'
    ]
  },
  
  // Cardio Exercises
  {
    id: 'home-cardio-1',
    name: 'HIIT Jump Rope',
    type: 'home',
    category: 'cardio',
    difficulty: 'intermediate',
    bmiCategory: 'underweight',
    duration: 15,
    calories: 180,
    recommendedMeals: ['breakfast', 'snack'],
    instructions: [
      'Jump rope - 30 seconds',
      'Rest - 30 seconds',
      'High knees - 30 seconds',
      'Rest - 30 seconds',
      'Jumping jacks - 30 seconds',
      'Repeat 4 times'
    ]
  },
  {
    id: 'home-cardio-2',
    name: 'Dance Fitness',
    type: 'home',
    category: 'cardio',
    difficulty: 'intermediate',
    bmiCategory: 'normal',
    duration: 20,
    calories: 220,
    recommendedMeals: ['breakfast', 'snack'],
    instructions: [
      'Warm-up dance moves - 3 minutes',
      'High-energy dance routine - 12 minutes',
      'Cool-down stretches - 5 minutes',
      'Follow rhythm and keep moving continuously'
    ]
  },
  {
    id: 'home-cardio-3',
    name: 'Walking Intervals',
    type: 'home',
    category: 'cardio',
    difficulty: 'beginner',
    bmiCategory: 'overweight',
    duration: 25,
    calories: 150,
    recommendedMeals: ['breakfast', 'lunch'],
    steps: 3000,
    instructions: [
      'Normal pace walk - 5 minutes',
      'Brisk walk - 3 minutes',
      'Normal pace walk - 5 minutes',
      'Brisk walk - 3 minutes',
      'Repeat pattern, finish with cool-down'
    ]
  },
  {
    id: 'home-cardio-4',
    name: 'Low Impact Cardio',
    type: 'home',
    category: 'cardio',
    difficulty: 'beginner',
    bmiCategory: 'obese',
    duration: 20,
    calories: 100,
    recommendedMeals: ['breakfast', 'lunch'],
    instructions: [
      'Marching in place - 5 minutes',
      'Step touches - 5 minutes',
      'Arm circles with leg lifts - 5 minutes',
      'Seated pedaling motion - 5 minutes'
    ]
  }
];

export const GYM_EXERCISES: Exercise[] = [
  // Mobility Exercises
  {
    id: 'gym-mobility-1',
    name: 'Dynamic Warm-up Circuit',
    type: 'gym',
    category: 'mobility',
    difficulty: 'intermediate',
    bmiCategory: 'underweight',
    duration: 15,
    calories: 80,
    recommendedMeals: ['breakfast', 'lunch', 'dinner'],
    equipment: ['foam roller'],
    instructions: [
      'Foam roll major muscle groups - 10 minutes',
      'Dynamic stretches - 5 minutes',
      'Movement preparation exercises',
      'Focus on hips, shoulders, and thoracic spine'
    ]
  },
  {
    id: 'gym-mobility-2',
    name: 'Advanced Mobility Flow',
    type: 'gym',
    category: 'mobility',
    difficulty: 'advanced',
    bmiCategory: 'normal',
    duration: 20,
    calories: 100,
    recommendedMeals: ['breakfast', 'lunch', 'snack'],
    equipment: ['resistance bands', 'foam roller'],
    instructions: [
      'Band activations - 5 minutes',
      'Joint mobility exercises - 10 minutes',
      'Dynamic stretching - 5 minutes',
      'Movement patterns for main workout'
    ]
  },
  {
    id: 'gym-mobility-3',
    name: 'Functional Mobility',
    type: 'gym',
    category: 'mobility',
    difficulty: 'intermediate',
    bmiCategory: 'overweight',
    duration: 15,
    calories: 70,
    recommendedMeals: ['breakfast', 'snack'],
    equipment: ['resistance bands'],
    instructions: [
      'Band walks - 3 sets each direction',
      'Hip flexor stretches - 2 minutes each side',
      'Thoracic spine rotations - 10 each side',
      'Ankle mobility work - 5 minutes'
    ]
  },
  {
    id: 'gym-mobility-4',
    name: 'Supported Mobility',
    type: 'gym',
    category: 'mobility',
    difficulty: 'beginner',
    bmiCategory: 'obese',
    duration: 12,
    calories: 50,
    recommendedMeals: ['breakfast', 'snack'],
    equipment: ['chair', 'wall'],
    instructions: [
      'Supported squats - 15 reps',
      'Wall slides - 10 reps',
      'Supported leg swings - 10 each side',
      'Chair-based stretches - 5 minutes'
    ]
  },
  
  // Strength Exercises
  {
    id: 'gym-strength-1',
    name: 'Full Body Power',
    type: 'gym',
    category: 'strength',
    difficulty: 'intermediate',
    bmiCategory: 'underweight',
    duration: 45,
    calories: 350,
    recommendedMeals: ['breakfast', 'lunch', 'dinner'],
    sets: 4,
    reps: 8,
    equipment: ['barbell', 'dumbbells', 'cables'],
    instructions: [
      'Deadlifts - 4 sets x 8 reps',
      'Bench press - 4 sets x 8 reps',
      'Overhead press - 3 sets x 10 reps',
      'Bent over rows - 4 sets x 10 reps',
      'Squats - 4 sets x 8 reps'
    ]
  },
  {
    id: 'gym-strength-2',
    name: 'Hypertrophy Focus',
    type: 'gym',
    category: 'strength',
    difficulty: 'intermediate',
    bmiCategory: 'normal',
    duration: 50,
    calories: 400,
    recommendedMeals: ['lunch', 'dinner'],
    sets: 3,
    reps: 12,
    equipment: ['dumbbells', 'machines', 'cables'],
    instructions: [
      'Dumbbell chest press - 3 sets x 12 reps',
      'Lat pulldowns - 3 sets x 12 reps',
      'Leg press - 3 sets x 15 reps',
      'Shoulder press - 3 sets x 12 reps',
      'Bicep curls - 3 sets x 12 reps',
      'Tricep pushdowns - 3 sets x 12 reps'
    ]
  },
  {
    id: 'gym-strength-3',
    name: 'Strength Foundation',
    type: 'gym',
    category: 'strength',
    difficulty: 'beginner',
    bmiCategory: 'overweight',
    duration: 40,
    calories: 300,
    recommendedMeals: ['lunch', 'dinner'],
    sets: 3,
    reps: 10,
    equipment: ['machines', 'dumbbells'],
    instructions: [
      'Leg press - 3 sets x 12 reps',
      'Chest press machine - 3 sets x 12 reps',
      'Seated row - 3 sets x 12 reps',
      'Shoulder press machine - 3 sets x 10 reps',
      'Leg curls - 3 sets x 12 reps',
      'Core work - 10 minutes'
    ]
  },
  {
    id: 'gym-strength-4',
    name: 'Supported Strength',
    type: 'gym',
    category: 'strength',
    difficulty: 'beginner',
    bmiCategory: 'obese',
    duration: 30,
    calories: 200,
    recommendedMeals: ['lunch', 'dinner'],
    sets: 2,
    reps: 8,
    equipment: ['machines', 'cables'],
    instructions: [
      'Recumbent bike warm-up - 5 minutes',
      'Chest press machine - 2 sets x 10 reps',
      'Leg press - 2 sets x 10 reps',
      'Lat pulldown - 2 sets x 10 reps',
      'Seated leg curl - 2 sets x 12 reps',
      'Cool down stretches - 5 minutes'
    ]
  },
  
  // Cardio Exercises
  {
    id: 'gym-cardio-1',
    name: 'HIIT Cardio Blast',
    type: 'gym',
    category: 'cardio',
    difficulty: 'advanced',
    bmiCategory: 'underweight',
    duration: 25,
    calories: 300,
    recommendedMeals: ['breakfast', 'snack'],
    equipment: ['treadmill', 'rower'],
    instructions: [
      'Treadmill sprints - 30 seconds',
      'Rest - 30 seconds',
      'Rowing machine - 1 minute',
      'Rest - 30 seconds',
      'Battle ropes - 30 seconds',
      'Repeat 6-8 times'
    ]
  },
  {
    id: 'gym-cardio-2',
    name: 'Steady State Cardio',
    type: 'gym',
    category: 'cardio',
    difficulty: 'intermediate',
    bmiCategory: 'normal',
    duration: 35,
    calories: 350,
    recommendedMeals: ['breakfast', 'snack'],
    equipment: ['treadmill', 'elliptical'],
    instructions: [
      '5-minute warm-up',
      '20 minutes moderate intensity',
      '5-minute cool-down',
      'Maintain 70-80% max heart rate'
    ]
  },
  {
    id: 'gym-cardio-3',
    name: 'Low Impact Cardio',
    type: 'gym',
    category: 'cardio',
    difficulty: 'beginner',
    bmiCategory: 'overweight',
    duration: 30,
    calories: 250,
    recommendedMeals: ['breakfast', 'lunch'],
    equipment: ['elliptical', 'bike'],
    instructions: [
      'Elliptical - 15 minutes',
      'Stationary bike - 10 minutes',
      'Incline walking - 5 minutes',
      'Focus on consistent pace'
    ]
  },
  {
    id: 'gym-cardio-4',
    name: 'Supported Cardio',
    type: 'gym',
    category: 'cardio',
    difficulty: 'beginner',
    bmiCategory: 'obese',
    duration: 25,
    calories: 180,
    recommendedMeals: ['breakfast', 'lunch'],
    equipment: ['recumbent bike', 'hand bike'],
    instructions: [
      'Recumbent bike - 15 minutes',
      'Hand bike - 5 minutes',
      'Seated stepper - 5 minutes',
      'Monitor heart rate and perceived exertion'
    ]
  }
];

export const getExercisesByBMI = (bmi: number, exerciseType: 'home' | 'gym'): Exercise[] => {
  let category: 'underweight' | 'normal' | 'overweight' | 'obese';
  
  if (bmi < 18.5) {
    category = 'underweight';
  } else if (bmi >= 18.5 && bmi < 25) {
    category = 'normal';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'overweight';
  } else {
    category = 'obese';
  }
  
  const exercises = exerciseType === 'home' ? HOME_EXERCISES : GYM_EXERCISES;
  return exercises.filter(exercise => exercise.bmiCategory === category);
};

export const getExerciseByCategory = (exercises: Exercise[], category: 'mobility' | 'strength' | 'cardio'): Exercise[] => {
  return exercises.filter(exercise => exercise.category === category);
};

export const calculateBMI = (heightCm: number, weightKg: number): number => {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
};

export const getBMICategory = (bmi: number): 'underweight' | 'normal' | 'overweight' | 'obese' => {
  if (bmi < 18.5) return 'underweight';
  if (bmi >= 18.5 && bmi < 25) return 'normal';
  if (bmi >= 25 && bmi < 30) return 'overweight';
  return 'obese';
};

// Get complementary exercises for a specific meal
export const getComplementaryExercises = (
  mealCategory: string,
  bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese',
  exerciseType: 'home' | 'gym'
): Exercise[] => {
  const exercises = exerciseType === 'home' ? HOME_EXERCISES : GYM_EXERCISES;
  
  // Filter exercises based on BMI and meal compatibility
  const compatibleExercises = exercises.filter(exercise => {
    return exercise.bmiCategory === bmiCategory && 
           exercise.recommendedMeals?.includes(mealCategory);
  });
  
  // Return balanced mix of exercise types
  const strength = compatibleExercises.filter(e => e.category === 'strength').slice(0, 2);
  const cardio = compatibleExercises.filter(e => e.category === 'cardio').slice(0, 2);
  const mobility = compatibleExercises.filter(e => e.category === 'mobility').slice(0, 2);
  
  return [...strength, ...cardio, ...mobility];
};

export const bmiFromMetric = (heightCm: number, weightKg: number) => {
  if (!heightCm || !weightKg) return 0;
  const meters = heightCm / 100;
  return Number((weightKg / (meters * meters)).toFixed(1));
};

export const bmiCategory = (bmi: number) => {
  if (!bmi) return 'Normal';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export const calculateRecommendedCalories = (heightCm: number, weightKg: number, age: number, gender: 'male' | 'female' = 'male') => {
  if (!heightCm || !weightKg || !age) return 2000;

  // Calculate BMI first
  const bmi = bmiFromMetric(heightCm, weightKg);
  const category = bmiCategory(bmi);

  // Harris-Benedict equation for BMR
  let bmr: number;
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
  }

  // Activity factor (sedentary lifestyle assumed)
  const activityFactor = 1.2;

  // Base maintenance calories
  const maintenanceCalories = Math.round(bmr * activityFactor);

  // Adjust based on BMI category
  let recommendedCalories: number;
  switch (category) {
    case 'Underweight':
      // Add calories for weight gain
      recommendedCalories = maintenanceCalories + 500;
      break;
    case 'Normal':
      // Maintain current weight
      recommendedCalories = maintenanceCalories;
      break;
    case 'Overweight':
      // Slight deficit for weight loss
      recommendedCalories = maintenanceCalories - 300;
      break;
    case 'Obese':
      // More significant deficit for weight loss
      recommendedCalories = maintenanceCalories - 500;
      break;
    default:
      recommendedCalories = maintenanceCalories;
  }

  // Ensure minimum safe calories
  const minCalories = gender === 'male' ? 1500 : 1200;
  recommendedCalories = Math.max(recommendedCalories, minCalories);

  // Ensure maximum reasonable calories
  const maxCalories = 4000;
  recommendedCalories = Math.min(recommendedCalories, maxCalories);

  return recommendedCalories;
};

// BMI Goal Calculation Functions
export const getBMIGoal = (currentBMI: number, category: string): number => {
  // Target a healthy BMI range (18.5 - 24.9)
  if (category === 'Underweight') {
    return 21; // Target middle of normal range
  } else if (category === 'Overweight' || category === 'Obese') {
    return 23; // Target upper-normal for weight loss
  }
  return currentBMI; // Already normal, maintain
};

export const getWeeklyGoal = (currentBMI: number, targetBMI: number): number => {
  // Safe weight loss/gain rate: 0.5-1kg per week
  if (targetBMI > currentBMI) {
    return 0.5; // Gain weight
  } else if (targetBMI < currentBMI) {
    return -0.5; // Lose weight
  }
  return 0; // Maintain
};

export const calculateTargetWeight = (heightCm: number, targetBMI: number): number => {
  const meters = heightCm / 100;
  return Number((targetBMI * meters * meters).toFixed(1));
};

export const estimateTargetDate = (
  currentWeightKg: number,
  targetWeightKg: number,
  weeklyGoalKg: number
): string => {
  if (weeklyGoalKg === 0 || currentWeightKg === targetWeightKg) {
    return new Date().toISOString();
  }
  const weightDiff = Math.abs(targetWeightKg - currentWeightKg);
  const weeksNeeded = Math.ceil(weightDiff / Math.abs(weeklyGoalKg));
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + weeksNeeded * 7);
  return targetDate.toISOString();
};

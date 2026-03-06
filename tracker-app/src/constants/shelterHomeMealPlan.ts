// Shelter Home Weekly Meal Plan - Balanced Nutrition for Children
// Based on Shelter Home Fitness Program nutritional guidelines

export interface PortionGuideline {
  ageRange: string;
  minAge: number;
  maxAge: number;
  chapati: number; // number of chapatis (30g flour each)
  rice: string; // cup measurement
  dal: string; // katori measurement
  milk: string; // ml
  paneer: number; // grams
  chicken: number; // grams
  legumes: string; // katori
}

export interface DishCombination {
  id: string;
  name: string;
  items: string[];
  calories: number;
  protein: number; // grams
  iron: boolean;
  calcium: boolean;
  energyDense: boolean;
}

export interface DailyMealPlan {
  id?: string;
  day: string;
  breakfast: DishCombination;
  lunch: DishCombination;
  snack: DishCombination;
  dinner: DishCombination;
  specialNote?: string;
}

// Age-wise Portion Guidelines (8-16 years)
export const AGE_PORTION_GUIDELINES: PortionGuideline[] = [
  {
    ageRange: '8-10 years',
    minAge: 8,
    maxAge: 10,
    chapati: 2,
    rice: '3/4 cup',
    dal: '1 katori',
    milk: '200 ml',
    paneer: 40,
    chicken: 60,
    legumes: '1 katori'
  },
  {
    ageRange: '11-13 years',
    minAge: 11,
    maxAge: 13,
    chapati: 3,
    rice: '1 cup',
    dal: '1.5 katori',
    milk: '250 ml',
    paneer: 60,
    chicken: 90,
    legumes: '1.5 katori'
  },
  {
    ageRange: '14-16 years',
    minAge: 14,
    maxAge: 16,
    chapati: 4,
    rice: '1.5 cups',
    dal: '2 katori',
    milk: '300 ml',
    paneer: 80,
    chicken: 120,
    legumes: '2 katori'
  }
];

// Nutrition Principles
export const NUTRITION_PRINCIPLES = [
  'Daily protein from dal, legumes, milk, paneer, chicken, peanuts',
  'Iron-rich foods including chole, rajma, greens, jaggery',
  'Calcium through milk, curd, paneer',
  'Energy-dense meals using rice, chapati, healthy oils',
  'Low oil cooking methods',
  'Familiar local foods to encourage intake'
];

// Weekly Menu - Dish Combinations
export const SHELTER_HOME_WEEKLY_MENU: DailyMealPlan[] = [
  {
    day: 'Monday',
    breakfast: {
      id: 'mon-breakfast',
      name: 'Vegetable Poha with Milk & Banana',
      items: ['Vegetable Poha (1 plate)', 'Milk (200-300ml)', 'Banana (1)'],
      calories: 450,
      protein: 12,
      iron: false,
      calcium: true,
      energyDense: true
    },
    lunch: {
      id: 'mon-lunch',
      name: 'Chapati, Dal, Sabzi, Rice & Curd',
      items: ['Chapati (2-4)', 'Arhar Dal (1-2 katori)', 'Aloo Gobi Sabzi', 'Rice (3/4-1.5 cup)', 'Curd (1 bowl)'],
      calories: 650,
      protein: 18,
      iron: false,
      calcium: true,
      energyDense: true
    },
    snack: {
      id: 'mon-snack',
      name: 'Roasted Chana with Jaggery',
      items: ['Roasted Chana (1 bowl)', 'Jaggery (1 piece)', 'Lemon Water'],
      calories: 250,
      protein: 10,
      iron: true,
      calcium: false,
      energyDense: true
    },
    dinner: {
      id: 'mon-dinner',
      name: 'Chapati, Khichdi, Salad & Milk',
      items: ['Chapati (1-2)', 'Vegetable Khichdi (1 plate)', 'Salad', 'Milk (200-300ml)'],
      calories: 500,
      protein: 14,
      iron: false,
      calcium: true,
      energyDense: true
    }
  },
  {
    day: 'Tuesday',
    breakfast: {
      id: 'tue-breakfast',
      name: 'Upma with Protein',
      items: ['Upma (1 plate)', 'Peanuts (handful) OR Boiled Egg (1)', 'Milk (200-300ml)'],
      calories: 480,
      protein: 15,
      iron: false,
      calcium: true,
      energyDense: true
    },
    lunch: {
      id: 'tue-lunch',
      name: 'Chapati, Chole, Sabzi & Rice',
      items: ['Chapati (2-4)', 'Chole (1-2 katori)', 'Seasonal Sabzi', 'Rice (3/4-1.5 cup)'],
      calories: 700,
      protein: 20,
      iron: true,
      calcium: false,
      energyDense: true
    },
    snack: {
      id: 'tue-snack',
      name: 'Sprouts Chaat',
      items: ['Sprouts (moong/chana)', 'Onion, Tomato, Lemon', 'Spices'],
      calories: 180,
      protein: 12,
      iron: true,
      calcium: false,
      energyDense: false
    },
    dinner: {
      id: 'tue-dinner',
      name: 'Chapati, Dal & Vegetable',
      items: ['Chapati (2-4)', 'Moong Dal (1-2 katori)', 'Seasonal Vegetable'],
      calories: 450,
      protein: 16,
      iron: false,
      calcium: false,
      energyDense: true
    }
  },
  {
    day: 'Wednesday',
    specialNote: 'Paneer Day - Extra Protein',
    breakfast: {
      id: 'wed-breakfast',
      name: 'Vegetable Paratha with Curd',
      items: ['Vegetable Paratha (1-2)', 'Curd (1 bowl)', 'Fruit (seasonal)'],
      calories: 420,
      protein: 12,
      iron: false,
      calcium: true,
      energyDense: true
    },
    lunch: {
      id: 'wed-lunch',
      name: 'Chapati, Paneer Bhurji, Rice & Dal',
      items: ['Chapati (2-4)', 'Paneer Bhurji (40-80g paneer)', 'Rice (3/4-1.5 cup)', 'Dal (1 katori)'],
      calories: 750,
      protein: 25,
      iron: false,
      calcium: true,
      energyDense: true
    },
    snack: {
      id: 'wed-snack',
      name: 'Vegetable Sandwich with Milk',
      items: ['Vegetable Sandwich (1)', 'Milk (200-300ml)'],
      calories: 320,
      protein: 12,
      iron: false,
      calcium: true,
      energyDense: true
    },
    dinner: {
      id: 'wed-dinner',
      name: 'Chapati, Vegetable Curry & Dal Soup',
      items: ['Chapati (2-4)', 'Mixed Vegetable Curry', 'Dal Soup (1-2 katori)'],
      calories: 480,
      protein: 16,
      iron: false,
      calcium: false,
      energyDense: true
    }
  },
  {
    day: 'Thursday',
    breakfast: {
      id: 'thu-breakfast',
      name: 'Dalia Porridge with Milk & Banana',
      items: ['Dalia Porridge (1 bowl)', 'Milk (200-300ml)', 'Banana (1)'],
      calories: 400,
      protein: 11,
      iron: true,
      calcium: true,
      energyDense: true
    },
    lunch: {
      id: 'thu-lunch',
      name: 'Vegetable Khichdi, Kadhi & Salad',
      items: ['Vegetable Khichdi (1 plate)', 'Kadhi (1 bowl)', 'Salad'],
      calories: 600,
      protein: 18,
      iron: false,
      calcium: true,
      energyDense: true
    },
    snack: {
      id: 'thu-snack',
      name: 'Boiled Corn',
      items: ['Boiled Corn (1 cup)', 'Butter (optional)'],
      calories: 150,
      protein: 5,
      iron: false,
      calcium: false,
      energyDense: false
    },
    dinner: {
      id: 'thu-dinner',
      name: 'Chapati, Vegetable Curry & Curd',
      items: ['Chapati (2-4)', 'Seasonal Vegetable Curry', 'Curd (1 bowl)'],
      calories: 450,
      protein: 14,
      iron: false,
      calcium: true,
      energyDense: true
    }
  },
  {
    day: 'Friday',
    specialNote: 'Chicken Day - Non-Veg Protein',
    breakfast: {
      id: 'fri-breakfast',
      name: 'Idli with Sambar & Milk',
      items: ['Idli (2-3)', 'Sambar (1 bowl)', 'Milk (200-300ml)'],
      calories: 380,
      protein: 12,
      iron: true,
      calcium: true,
      energyDense: true
    },
    lunch: {
      id: 'fri-lunch',
      name: 'Chapati, Chicken Curry, Rice & Vegetable',
      items: ['Chapati (2-4)', 'Chicken Curry (60-120g chicken)', 'Rice (3/4-1.5 cup)', 'Vegetable Sabzi'],
      calories: 800,
      protein: 35,
      iron: true,
      calcium: false,
      energyDense: true
    },
    snack: {
      id: 'fri-snack',
      name: 'Peanut Chikki',
      items: ['Peanut Chikki (1 piece)'],
      calories: 200,
      protein: 6,
      iron: true,
      calcium: false,
      energyDense: true
    },
    dinner: {
      id: 'fri-dinner',
      name: 'Chapati, Dal & Vegetable',
      items: ['Chapati (2-4)', 'Dal (1-2 katori)', 'Seasonal Vegetable'],
      calories: 480,
      protein: 16,
      iron: false,
      calcium: false,
      energyDense: true
    }
  },
  {
    day: 'Saturday',
    breakfast: {
      id: 'sat-breakfast',
      name: 'Besan Chilla with Milk',
      items: ['Besan Chilla (1-2)', 'Milk (200-300ml)'],
      calories: 380,
      protein: 15,
      iron: true,
      calcium: true,
      energyDense: true
    },
    lunch: {
      id: 'sat-lunch',
      name: 'Rajma, Rice, Chapati & Salad',
      items: ['Rajma (1-2 katori)', 'Rice (3/4-1.5 cup)', 'Chapati (1-2)', 'Salad'],
      calories: 700,
      protein: 22,
      iron: true,
      calcium: false,
      energyDense: true
    },
    snack: {
      id: 'sat-snack',
      name: 'Fruit & Roasted Peanuts',
      items: ['Seasonal Fruit (1)', 'Roasted Peanuts (handful)'],
      calories: 220,
      protein: 8,
      iron: false,
      calcium: false,
      energyDense: true
    },
    dinner: {
      id: 'sat-dinner',
      name: 'Chapati, Vegetable Curry & Dal',
      items: ['Chapati (2-4)', 'Mixed Vegetable Curry', 'Dal (1-2 katori)'],
      calories: 500,
      protein: 16,
      iron: false,
      calcium: false,
      energyDense: true
    }
  },
  {
    day: 'Sunday',
    specialNote: 'Special Meal Day',
    breakfast: {
      id: 'sun-breakfast',
      name: 'Vegetable Sandwich with Milk & Fruit',
      items: ['Vegetable Sandwich (1)', 'Milk (200-300ml)', 'Fruit (1)'],
      calories: 420,
      protein: 13,
      iron: false,
      calcium: true,
      energyDense: true
    },
    lunch: {
      id: 'sun-lunch',
      name: 'Indo-Chinese: Fried Rice, Noodles & Manchurian',
      items: ['Vegetable Fried Rice (1 plate)', 'Noodles (1 cup)', 'Manchurian (low oil, 4-5 pieces)'],
      calories: 750,
      protein: 18,
      iron: false,
      calcium: false,
      energyDense: true
    },
    snack: {
      id: 'sun-snack',
      name: 'Popcorn or Makhana',
      items: ['Popcorn OR Makhana (1 bowl)', 'Light butter/spices'],
      calories: 150,
      protein: 4,
      iron: false,
      calcium: false,
      energyDense: false
    },
    dinner: {
      id: 'sun-dinner',
      name: 'Light Dinner: Chapati, Dal & Soup',
      items: ['Chapati (1-2)', 'Light Dal (1 katori)', 'Vegetable Soup (1 bowl)'],
      calories: 350,
      protein: 12,
      iron: false,
      calcium: false,
      energyDense: false
    }
  }
];

// Get portion guidelines by age
export const getPortionGuidelinesByAge = (age: number): PortionGuideline | null => {
  return AGE_PORTION_GUIDELINES.find(
    g => age >= g.minAge && age <= g.maxAge
  ) || null;
};

// Get daily meal plan by day
export const getDailyMealPlan = (day: string): DailyMealPlan | null => {
  return SHELTER_HOME_WEEKLY_MENU.find(
    plan => plan.day.toLowerCase() === day.toLowerCase()
  ) || null;
};

// Get today's meal plan
export const getTodayMealPlan = (): DailyMealPlan => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  return getDailyMealPlan(today) || SHELTER_HOME_WEEKLY_MENU[0];
};

// Calculate daily nutrition totals for a meal plan
export const calculateDailyNutrition = (plan: DailyMealPlan) => {
  const meals = [plan.breakfast, plan.lunch, plan.snack, plan.dinner];
  return {
    totalCalories: meals.reduce((sum, m) => sum + m.calories, 0),
    totalProtein: meals.reduce((sum, m) => sum + m.protein, 0),
    ironRichMeals: meals.filter(m => m.iron).length,
    calciumRichMeals: meals.filter(m => m.calcium).length,
    energyDenseMeals: meals.filter(m => m.energyDense).length
  };
};

// Region-specific weekly menus
export type Region = 'kolkata' | 'delhi';

// Kolkata Meal Plan (Original - Bengali influenced)
export const KOLKATA_WEEKLY_MENU: DailyMealPlan[] = SHELTER_HOME_WEEKLY_MENU;

// Delhi Meal Plan (North Indian style with Punjabi/Delhi influences)
export const DELHI_WEEKLY_MENU: DailyMealPlan[] = [
  {
    day: 'Monday',
    breakfast: {
      id: 'mon-breakfast-delhi',
      name: 'Aloo Paratha with Curd and Pickle',
      items: ['Aloo Paratha (1-2)', 'Curd (1 bowl)', 'Pickle', 'Milk (200-300ml)'],
      calories: 520,
      protein: 14,
      iron: false,
      calcium: true,
      energyDense: true
    },
    lunch: {
      id: 'mon-lunch-delhi',
      name: 'Chapati, Rajma, Rice & Salad',
      items: ['Chapati (2-4)', 'Rajma (1-2 katori)', 'Rice (3/4-1.5 cup)', 'Green Salad', 'Papad'],
      calories: 680,
      protein: 20,
      iron: true,
      calcium: false,
      energyDense: true
    },
    snack: {
      id: 'mon-snack-delhi',
      name: 'Chana Chaat with Lemon',
      items: ['Chana Chaat (1 bowl)', 'Lemon Water', 'Sev (garnish)'],
      calories: 240,
      protein: 10,
      iron: true,
      calcium: false,
      energyDense: true
    },
    dinner: {
      id: 'mon-dinner-delhi',
      name: 'Chapati, Dal Makhani & Mixed Veg',
      items: ['Chapati (2-4)', 'Dal Makhani (1 katori)', 'Mixed Vegetable Sabzi', 'Raita (1 bowl)'],
      calories: 550,
      protein: 18,
      iron: false,
      calcium: true,
      energyDense: true
    }
  },
  {
    day: 'Tuesday',
    breakfast: {
      id: 'tue-breakfast-delhi',
      name: 'Chole Bhature',
      items: ['Bhature (1-2)', 'Chole (1 bowl)', 'Halwa (1 serving)', 'Milk (200-300ml)'],
      calories: 650,
      protein: 16,
      iron: true,
      calcium: true,
      energyDense: true
    },
    lunch: {
      id: 'tue-lunch-delhi',
      name: 'Chapati, Kadhi Pakora, Rice & Vegetable',
      items: ['Chapati (2-4)', 'Kadhi Pakora (1 bowl)', 'Rice (3/4-1.5 cup)', 'Seasonal Sabzi'],
      calories: 620,
      protein: 18,
      iron: false,
      calcium: true,
      energyDense: true
    },
    snack: {
      id: 'tue-snack-delhi',
      name: 'Fruit Chaat',
      items: ['Seasonal Fruits (mixed)', 'Chaat Masala', 'Lemon', 'Roasted Cumin'],
      calories: 160,
      protein: 3,
      iron: true,
      calcium: false,
      energyDense: false
    },
    dinner: {
      id: 'tue-dinner-delhi',
      name: 'Chapati, Sarson Ka Saag & Makki Roti',
      items: ['Makki Roti (1-2)', 'Sarson Ka Saag (1 bowl)', 'Chapati (1-2)', 'White Butter (1 tsp)', 'Jaggery (1 piece)'],
      calories: 580,
      protein: 15,
      iron: true,
      calcium: true,
      energyDense: true
    }
  },
  {
    day: 'Wednesday',
    specialNote: 'Paneer Day - Extra Protein',
    breakfast: {
      id: 'wed-breakfast-delhi',
      name: 'Paneer Paratha with Dahi',
      items: ['Paneer Paratha (1-2)', 'Dahi (1 bowl)', 'Pickle', 'Milk (200-300ml)'],
      calories: 550,
      protein: 22,
      iron: false,
      calcium: true,
      energyDense: true
    },
    lunch: {
      id: 'wed-lunch-delhi',
      name: 'Chapati, Matar Paneer, Rice & Salad',
      items: ['Chapati (2-4)', 'Matar Paneer (40-80g paneer)', 'Rice (3/4-1.5 cup)', 'Green Salad', 'Papad'],
      calories: 720,
      protein: 24,
      iron: false,
      calcium: true,
      energyDense: true
    },
    snack: {
      id: 'wed-snack-delhi',
      name: 'Samosa with Chutney',
      items: ['Samosa (1)', 'Green Chutney', 'Tamarind Chutney', 'Tea (optional)'],
      calories: 280,
      protein: 6,
      iron: false,
      calcium: false,
      energyDense: true
    },
    dinner: {
      id: 'wed-dinner-delhi',
      name: 'Chapati, Chana Masala & Jeera Rice',
      items: ['Chapati (2-4)', 'Chana Masala (1-2 katori)', 'Jeera Rice (3/4-1 cup)', 'Onion Salad'],
      calories: 560,
      protein: 20,
      iron: true,
      calcium: false,
      energyDense: true
    }
  },
  {
    day: 'Thursday',
    breakfast: {
      id: 'thu-breakfast-delhi',
      name: 'Gobhi Paratha with Dahi',
      items: ['Gobhi Paratha (1-2)', 'Dahi (1 bowl)', 'Pickle', 'Milk (200-300ml)'],
      calories: 480,
      protein: 12,
      iron: false,
      calcium: true,
      energyDense: true
    },
    lunch: {
      id: 'thu-lunch-delhi',
      name: 'Chapati, Lobhiya, Rice & Raita',
      items: ['Chapati (2-4)', 'Lobhiya/Black Eyed Beans (1-2 katori)', 'Rice (3/4-1.5 cup)', 'Boondi Raita (1 bowl)'],
      calories: 600,
      protein: 20,
      iron: true,
      calcium: true,
      energyDense: true
    },
    snack: {
      id: 'thu-snack-delhi',
      name: 'Jalebi with Milk',
      items: ['Jalebi (1-2)', 'Milk (200ml)', 'Or Fruit (1)'],
      calories: 320,
      protein: 8,
      iron: false,
      calcium: true,
      energyDense: true
    },
    dinner: {
      id: 'thu-dinner-delhi',
      name: 'Chapati, Palak Paneer & Dal',
      items: ['Chapati (2-4)', 'Palak Paneer (40-80g paneer)', 'Arhar Dal (1 katori)', 'Salad'],
      calories: 580,
      protein: 22,
      iron: true,
      calcium: true,
      energyDense: true
    }
  },
  {
    day: 'Friday',
    specialNote: 'Chicken Day - Non-Veg Protein',
    breakfast: {
      id: 'fri-breakfast-delhi',
      name: 'Bedmi Puri with Aloo Sabzi',
      items: ['Bedmi Puri (2-3)', 'Aloo Sabzi (1 bowl)', 'Milk (200-300ml)'],
      calories: 580,
      protein: 14,
      iron: true,
      calcium: true,
      energyDense: true
    },
    lunch: {
      id: 'fri-lunch-delhi',
      name: 'Butter Chicken, Naan & Rice',
      items: ['Butter Chicken (60-120g chicken)', 'Naan/Tandoori Roti (1-2)', 'Rice (3/4-1 cup)', 'Mixed Raita'],
      calories: 850,
      protein: 38,
      iron: true,
      calcium: true,
      energyDense: true
    },
    snack: {
      id: 'fri-snack-delhi',
      name: 'Dahi Bhalle',
      items: ['Dahi Bhalle (2-3 pieces)', 'Chutneys', 'Spices'],
      calories: 220,
      protein: 8,
      iron: false,
      calcium: true,
      energyDense: true
    },
    dinner: {
      id: 'fri-dinner-delhi',
      name: 'Chapati, Aloo Gobhi & Dal Tadka',
      items: ['Chapati (2-4)', 'Aloo Gobhi (1 plate)', 'Dal Tadka (1-2 katori)'],
      calories: 480,
      protein: 14,
      iron: false,
      calcium: false,
      energyDense: true
    }
  },
  {
    day: 'Saturday',
    breakfast: {
      id: 'sat-breakfast-delhi',
      name: 'Poha with Peanuts and Lemon',
      items: ['Delhi Style Poha (1 plate)', 'Peanuts (handful)', 'Lemon', 'Milk (200-300ml)'],
      calories: 420,
      protein: 12,
      iron: false,
      calcium: true,
      energyDense: true
    },
    lunch: {
      id: 'sat-lunch-delhi',
      name: 'Chapati, Baingan Bharta, Rice & Dal',
      items: ['Chapati (2-4)', 'Baingan Bharta (1 bowl)', 'Rice (3/4-1.5 cup)', 'Arhar Dal (1 katori)'],
      calories: 580,
      protein: 16,
      iron: true,
      calcium: false,
      energyDense: true
    },
    snack: {
      id: 'sat-snack-delhi',
      name: 'Gol Gappe / Pani Puri',
      items: ['Pani Puri (6-8 pieces)', 'Spiced Water', 'Filling'],
      calories: 180,
      protein: 4,
      iron: false,
      calcium: false,
      energyDense: false
    },
    dinner: {
      id: 'sat-dinner-delhi',
      name: 'Chapati, Mix Vegetable & Kheer',
      items: ['Chapati (2-4)', 'Mix Vegetable (1 plate)', 'Kheer (1 bowl, small portion)'],
      calories: 520,
      protein: 14,
      iron: false,
      calcium: true,
      energyDense: true
    }
  },
  {
    day: 'Sunday',
    specialNote: 'Special Sunday Meal',
    breakfast: {
      id: 'sun-breakfast-delhi',
      name: 'Chana Bhatura with Lassi',
      items: ['Chana Bhatura (1-2 bhaturas)', 'Chole (1 bowl)', 'Sweet Lassi (1 glass)'],
      calories: 650,
      protein: 18,
      iron: true,
      calcium: true,
      energyDense: true
    },
    lunch: {
      id: 'sun-lunch-delhi',
      name: 'Biryani with Raita & Salad',
      items: ['Veg Biryani (1 plate)', 'Raita (1 bowl)', 'Green Salad', 'Papad'],
      calories: 700,
      protein: 16,
      iron: false,
      calcium: true,
      energyDense: true
    },
    snack: {
      id: 'sun-snack-delhi',
      name: 'Aloo Tikki Chaat',
      items: ['Aloo Tikki (1-2)', 'Chutneys', 'Yogurt', 'Spices'],
      calories: 280,
      protein: 6,
      iron: false,
      calcium: true,
      energyDense: true
    },
    dinner: {
      id: 'sun-dinner-delhi',
      name: 'Light Dinner: Chapati, Dal & Soup',
      items: ['Chapati (1-2)', 'Light Moong Dal (1 katori)', 'Tomato Soup (1 bowl)'],
      calories: 360,
      protein: 12,
      iron: false,
      calcium: false,
      energyDense: false
    }
  }
];

// Get meal plan by region
export const getRegionalMealPlan = (region: Region, day: string): DailyMealPlan | null => {
  const menu = region === 'delhi' ? DELHI_WEEKLY_MENU : KOLKATA_WEEKLY_MENU;
  return menu.find(plan => plan.day.toLowerCase() === day.toLowerCase()) || null;
};

// Get today's regional meal plan
export const getTodayRegionalMealPlan = (region: Region): DailyMealPlan => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  return getRegionalMealPlan(region, today) || (region === 'delhi' ? DELHI_WEEKLY_MENU[0] : SHELTER_HOME_WEEKLY_MENU[0]);
};

// Export region options for UI
export const REGION_OPTIONS: { value: Region; label: string; country: string }[] = [
  { value: 'kolkata', label: 'Kolkata', country: 'India' },
  { value: 'delhi', label: 'Delhi', country: 'India' }
];

// Get all meal combinations for a specific meal type across the week by region
export const getWeeklyMealCombinations = (mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner'): DishCombination[] => {
  return SHELTER_HOME_WEEKLY_MENU.map(day => day[mealType]);
};

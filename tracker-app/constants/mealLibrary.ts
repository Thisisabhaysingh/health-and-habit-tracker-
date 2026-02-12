export interface MealLibraryItem {
  id: string;
  name: string;
  calories: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  portion: string;
  unit: 'serving' | 'g' | 'ml' | 'plate' | 'piece' | 'bowl' | 'pieces' | 'packet' | 'spoon' | 'cup';
  bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese';
  tags: string[];
  region: string;
  mealType: string;
}

export const REGIONS = [
  'All India',
  'North India',
  'South India',
  'East India',
  'West India',
  'Central India',
  'Northeast India'
];

export const INDIAN_MEAL_LIBRARY: MealLibraryItem[] = [
  // Breakfast Items
  {
    id: '1',
    name: 'Upma',
    calories: 275,
    category: 'breakfast',
    portion: '1 plate',
    unit: 'plate',
    bmiCategory: 'normal',
    tags: ['traditional', 'high-protein'],
    region: 'North India',
    mealType: 'traditional'
  },
  {
    id: '2',
    name: 'Poha',
    calories: 180,
    category: 'breakfast',
    portion: '1 bowl',
    unit: 'bowl',
    bmiCategory: 'normal',
    tags: ['light', 'carbs'],
    region: 'West India',
    mealType: 'traditional'
  },
  {
    id: '3',
    name: 'Idli',
    calories: 150,
    category: 'breakfast',
    portion: '2 pieces',
    unit: 'pieces',
    bmiCategory: 'normal',
    tags: ['fermented', 'protein'],
    region: 'South India',
    mealType: 'traditional'
  },
  
  // Lunch Items
  {
    id: '4',
    name: 'Rajma Chawal',
    calories: 350,
    category: 'lunch',
    portion: '1 plate',
    unit: 'plate',
    bmiCategory: 'normal',
    tags: ['spicy', 'rice'],
    region: 'East India',
    mealType: 'traditional'
  },
  {
    id: '5',
    name: 'Dal Roti',
    calories: 300,
    category: 'lunch',
    portion: '2 pieces',
    unit: 'pieces',
    bmiCategory: 'normal',
    tags: ['protein', 'wheat'],
    region: 'North India',
    mealType: 'traditional'
  },
  
  // Dinner Items
  {
    id: '6',
    name: 'Palak Paneer',
    calories: 400,
    category: 'dinner',
    portion: '1 bowl',
    unit: 'bowl',
    bmiCategory: 'normal',
    tags: ['curry', 'protein'],
    region: 'North India',
    mealType: 'traditional'
  },
  {
    id: '7',
    name: 'Biryani',
    calories: 500,
    category: 'dinner',
    portion: '1 plate',
    unit: 'plate',
    bmiCategory: 'normal',
    tags: ['rice', 'spicy', 'festive'],
    region: 'Hyderabad',
    mealType: 'traditional'
  },
  
  // Snack Items
  {
    id: '8',
    name: 'Banana',
    calories: 90,
    category: 'snack',
    portion: '1 piece',
    unit: 'piece',
    bmiCategory: 'normal',
    tags: ['fruit', 'healthy'],
    region: 'All India',
    mealType: 'fruit'
  },
  {
    id: '9',
    name: 'Samosa',
    calories: 150,
    category: 'snack',
    portion: '2 pieces',
    unit: 'pieces',
    bmiCategory: 'normal',
    tags: ['fried', 'street-food'],
    region: 'North India',
    mealType: 'traditional'
  },
  {
    id: '10',
    name: 'Chai',
    calories: 50,
    category: 'snack',
    portion: '1 cup',
    unit: 'cup',
    bmiCategory: 'normal',
    tags: ['beverage', 'tea'],
    region: 'All India',
    mealType: 'beverage'
  }
];

export const getMealsByRegionAndCategory = (region: string, category: string): MealLibraryItem[] => {
  return INDIAN_MEAL_LIBRARY.filter(meal => 
    (region === 'All India' || meal.region === region) && meal.category === category
  );
};

export const getBMISuggestedMeals = (bmi: number): MealLibraryItem[] => {
  if (bmi < 18.5) {
    return INDIAN_MEAL_LIBRARY.filter(meal => meal.bmiCategory === 'underweight');
  } else if (bmi >= 25) {
    return INDIAN_MEAL_LIBRARY.filter(meal => meal.bmiCategory === 'overweight' || meal.bmiCategory === 'obese');
  } else {
    return INDIAN_MEAL_LIBRARY.filter(meal => meal.bmiCategory === 'normal');
  }
};
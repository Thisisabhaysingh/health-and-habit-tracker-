import { ref, set, get, update, push, onValue } from 'firebase/database';
import { db } from './config';
import { 
  SHELTER_HOME_WEEKLY_MENU, 
  KOLKATA_WEEKLY_MENU,
  DELHI_WEEKLY_MENU,
  getTodayMealPlan, 
  getPortionGuidelinesByAge,
  type DailyMealPlan,
  type PortionGuideline,
  type Region
} from '@/src/constants/shelterHomeMealPlan';

const mealPlansRef = (uid: string) => ref(db, `users/${uid}/mealPlans`);

export interface MealPlanPayload {
  studentId: string;
  studentName: string;
  age: number;
  region: Region;
  createdAt: string;
  weeklyMenu: DailyMealPlan[];
  portionGuidelines: PortionGuideline | null;
  completedMeals: Record<string, {
    breakfast: boolean;
    lunch: boolean;
    snack: boolean;
    dinner: boolean;
  }>;
}

// Create weekly meal plan for a student
export const createWeeklyMealPlan = async (
  uid: string,
  studentId: string,
  studentName: string,
  age: number,
  region: Region = 'kolkata'
) => {
  try {
    const portionGuidelines = getPortionGuidelinesByAge(age);
    
    // Select meal plan based on region
    const weeklyMenu = region === 'delhi' ? DELHI_WEEKLY_MENU : KOLKATA_WEEKLY_MENU;
    
    const planData: MealPlanPayload = {
      studentId,
      studentName,
      age,
      region,
      createdAt: new Date().toISOString(),
      weeklyMenu,
      portionGuidelines,
      completedMeals: {}
    };

    // Initialize completedMeals for the week
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      planData.completedMeals[dateStr] = {
        breakfast: false,
        lunch: false,
        snack: false,
        dinner: false
      };
    }

    const planRef = ref(db, `users/${uid}/mealPlans/${studentId}`);
    await set(planRef, planData);

    return { success: true, data: planData };
  } catch (error) {
    console.error('Error creating meal plan:', error);
    return { success: false, error };
  }
};

// Get meal plan for a student
export const getMealPlan = async (uid: string, studentId: string) => {
  try {
    const planRef = ref(db, `users/${uid}/mealPlans/${studentId}`);
    const snapshot = await get(planRef);
    
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    }
    return { success: false, error: 'Plan not found' };
  } catch (error) {
    console.error('Error getting meal plan:', error);
    return { success: false, error };
  }
};

// Mark meal as completed
export const markMealCompleted = async (
  uid: string,
  studentId: string,
  date: string,
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner',
  completed: boolean = true
) => {
  try {
    const mealRef = ref(db, `users/${uid}/mealPlans/${studentId}/completedMeals/${date}/${mealType}`);
    await set(mealRef, completed);
    return { success: true };
  } catch (error) {
    console.error('Error marking meal:', error);
    return { success: false, error };
  }
};

// Get today's meal status for a student
export const getTodayMealStatus = async (uid: string, studentId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const statusRef = ref(db, `users/${uid}/mealPlans/${studentId}/completedMeals/${today}`);
    const snapshot = await get(statusRef);
    
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val(), date: today };
    }
    
    // Initialize if not exists
    const defaultStatus = {
      breakfast: false,
      lunch: false,
      snack: false,
      dinner: false
    };
    await set(statusRef, defaultStatus);
    return { success: true, data: defaultStatus, date: today };
  } catch (error) {
    console.error('Error getting today\'s meal status:', error);
    return { success: false, error };
  }
};

// Subscribe to meal plan updates
export const subscribeToMealPlan = (uid: string, studentId: string, callback: (plan: any) => void) => {
  const planRef = ref(db, `users/${uid}/mealPlans/${studentId}`);
  return onValue(planRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });
};

// Get all meal plans for a user
export const getAllMealPlans = async (uid: string) => {
  try {
    const plansRef = mealPlansRef(uid);
    const snapshot = await get(plansRef);
    
    if (snapshot.exists()) {
      const plans: any[] = [];
      snapshot.forEach((childSnapshot) => {
        plans.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      return { success: true, data: plans };
    }
    return { success: true, data: [] };
  } catch (error) {
    console.error('Error getting all meal plans:', error);
    return { success: false, error };
  }
};

// Delete meal plan
export const deleteMealPlan = async (uid: string, studentId: string) => {
  try {
    const planRef = ref(db, `users/${uid}/mealPlans/${studentId}`);
    await set(planRef, null);
    return { success: true };
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    return { success: false, error };
  }
};

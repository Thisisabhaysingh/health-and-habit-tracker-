import { PayloadAction, createSlice, nanoid } from '@reduxjs/toolkit';

import type { ExerciseTask, MealEntry, ScreenSession, TrackerState, Student, MealPlan, ExercisePlan } from '@/types/tracker';

const initialState: TrackerState = {
  meals: [],
  exerciseTasks: [],
  screenSessions: [],
  students: [],
  currentMealPlan: null,
  currentExercisePlan: null,
};

const trackerSlice = createSlice({
  name: 'tracker',
  initialState,
  reducers: {
    setMeals(state, action: PayloadAction<MealEntry[]>) {
      state.meals = action.payload;
    },
    setScreenSessions(state, action: PayloadAction<ScreenSession[]>) {
      state.screenSessions = action.payload;
    },
    setExerciseTasks(state, action: PayloadAction<ExerciseTask[]>) {
      state.exerciseTasks = action.payload;
    },
    seedDailyExercise(state, action: PayloadAction<Omit<ExerciseTask, 'id' | 'completed'>[]>) {
      const newTasks = action.payload.map((task) => ({
        ...task,
        id: nanoid(),
        completed: false,
      }));
      // Remove existing tasks for today and add new ones
      const today = new Date().toDateString();
      state.exerciseTasks = [
        ...state.exerciseTasks.filter(task => task.date !== today),
        ...newTasks
      ];
    },
    toggleExerciseTask(state, action: PayloadAction<string>) {
      state.exerciseTasks = state.exerciseTasks.map((task) =>
        task.id === action.payload ? { ...task, completed: !task.completed } : task,
      );
    },
    addExerciseTask(state, action: PayloadAction<Omit<ExerciseTask, 'id'>>) {
      const newTask = { ...action.payload, id: nanoid() };
      state.exerciseTasks.unshift(newTask);
    },
    addMeal(state, action: PayloadAction<Omit<MealEntry, 'id'>>) {
      state.meals.unshift({ ...action.payload, id: nanoid() });
    },
    updateMeal(state, action: PayloadAction<MealEntry>) {
      console.log('=== REDUX UPDATE MEAL START ===');
      console.log('Current state meals:', state.meals.length);
      console.log('Action payload:', action.payload);
      
      const index = state.meals.findIndex((meal) => meal.id === action.payload.id);
      console.log('Found meal index:', index);
      console.log('Meal at index:', state.meals[index]);
      
      if (index !== -1) {
        console.log('Updating meal at index', index, 'from:', state.meals[index], 'to:', action.payload);
        state.meals[index] = action.payload;
        console.log('State after update:', state.meals.length);
      } else {
        console.log('Meal not found for update');
      }
      console.log('=== REDUX UPDATE MEAL END ===');
    },
    removeMeal(state, action: PayloadAction<string>) {
      state.meals = state.meals.filter((meal) => meal.id !== action.payload);
    },
    logScreenSession(state, action: PayloadAction<Omit<ScreenSession, 'id'>>) {
      state.screenSessions.unshift({ ...action.payload, id: nanoid() });
    },
    // Student reducers
    setStudents(state, action: PayloadAction<Student[]>) {
      state.students = action.payload;
    },
    addStudent(state, action: PayloadAction<Omit<Student, 'id'>>) {
      const newStudent = { ...action.payload, id: nanoid() };
      state.students.unshift(newStudent);
    },
    updateStudent(state, action: PayloadAction<Student>) {
      const index = state.students.findIndex((student) => student.id === action.payload.id);
      if (index !== -1) {
        state.students[index] = action.payload;
      }
    },
    removeStudent(state, action: PayloadAction<string>) {
      state.students = state.students.filter((student) => student.id !== action.payload);
    },
    // Meal Plan reducers
    setCurrentMealPlan(state, action: PayloadAction<MealPlan | null>) {
      state.currentMealPlan = action.payload;
    },
    updateMealPlan(state, action: PayloadAction<MealPlan>) {
      if (state.currentMealPlan && state.currentMealPlan.id === action.payload.id) {
        state.currentMealPlan = action.payload;
      }
    },
    updateMealConsumption(state, action: PayloadAction<{ date: string; mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' }>) {
      if (state.currentMealPlan && state.currentMealPlan.meals[action.payload.date]) {
        state.currentMealPlan.meals[action.payload.date].consumed[action.payload.mealType] = true;
      }
    },
    // Exercise Plan reducers
    setCurrentExercisePlan(state, action: PayloadAction<ExercisePlan | null>) {
      state.currentExercisePlan = action.payload;
    },
    updateExercisePlan(state, action: PayloadAction<ExercisePlan>) {
      if (state.currentExercisePlan && state.currentExercisePlan.id === action.payload.id) {
        state.currentExercisePlan = action.payload;
      }
    },
    updateExerciseConsumption(state, action: PayloadAction<{ date: string; exerciseType: 'mobility' | 'strength' | 'cardio' }>) {
      if (state.currentExercisePlan && state.currentExercisePlan.exercises[action.payload.date]) {
        state.currentExercisePlan.exercises[action.payload.date].completed[action.payload.exerciseType] = true;
      }
    },
    resetTrackerState: () => ({
      ...initialState,
    }),
  },
});

export const {
  setMeals,
  setScreenSessions,
  setExerciseTasks,
  seedDailyExercise,
  toggleExerciseTask,
  addExerciseTask,
  addMeal,
  updateMeal,
  removeMeal,
  logScreenSession,
  setStudents,
  addStudent,
  updateStudent,
  removeStudent,
  setCurrentMealPlan,
  updateMealPlan,
  updateMealConsumption,
  setCurrentExercisePlan,
  updateExercisePlan,
  updateExerciseConsumption,
  resetTrackerState,
} = trackerSlice.actions;

export default trackerSlice.reducer;

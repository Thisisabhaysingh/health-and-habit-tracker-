import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, ProgressBar, Text, useTheme } from 'react-native-paper';

import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import type { Student, MealPlan, ExercisePlan } from '@/types/tracker';
import { 
  subscribeToCurrentMealPlan,
  subscribeToCurrentExercisePlan,
  subscribeToStudents,
  subscribeToExercisePlans,
  subscribeToMealPlans
} from '@/src/firebase/trackerApi';
import { subscribeToMealPlan as subscribeToShelterMealPlan } from '@/src/firebase/mealPlanApi';
import { calculateDailyNutrition } from '@/src/constants/shelterHomeMealPlan';

// Color themes
const colors = {
  meal: {
    primary: '#16a34a',
    light: '#dcfce7',
    surface: '#f0fdf4',
    dark: '#15803d',
  },
  exercise: {
    primary: '#ea580c',
    light: '#ffedd5',
    surface: '#fff7ed',
    dark: '#c2410c',
  },
  screen: {
    primary: '#0891b2',
    light: '#cffafe',
    surface: '#ecfeff',
    dark: '#0e7490',
  },
};

const fonts = {
  regular: 'WorkSans_400Regular',
  medium: 'WorkSans_500Medium',
  semibold: 'WorkSans_600SemiBold',
  bold: 'WorkSans_700Bold',
} as const;

export default function DashboardScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { user, profile } = useAppSelector((state) => state.auth);
  const { screenSessions, currentMealPlan, currentExercisePlan, students, mealPlans, exercisePlans } = useAppSelector((state) => state.tracker);

  const heroAnim = useRef(new Animated.Value(0)).current;
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

  // Load all exercise plans on mount
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribers: (() => void)[] = [];

    // Subscribe to ALL meal plans for real-time updates
    const unsubscribeAllMealPlans = subscribeToMealPlans(user.uid, (plans) => {
      dispatch({ type: 'tracker/setMealPlans', payload: plans });
    });
    unsubscribers.push(unsubscribeAllMealPlans);

    // Subscribe to ALL exercise plans for real-time updates
    const unsubscribeAllExercisePlans = subscribeToExercisePlans(user.uid, (plans) => {
      dispatch({ type: 'tracker/setExercisePlans', payload: plans });
    });
    unsubscribers.push(unsubscribeAllExercisePlans);

    // Subscribe to updates for all students
    students.forEach(student => {
      // Subscribe to old format meal plans
      const unsubscribeMeal = subscribeToCurrentMealPlan(user.uid, student.id, (mealPlan) => {
        if (mealPlan) {
          dispatch({ type: 'tracker/addMealPlan', payload: mealPlan });
        }
      });
      unsubscribers.push(unsubscribeMeal);

      // Subscribe to new Shelter Home meal plans
      const unsubscribeShelterMeal = subscribeToShelterMealPlan(user.uid, student.id, (mealPlan) => {
        if (mealPlan) {
          dispatch({ type: 'tracker/addMealPlan', payload: mealPlan });
        }
      });
      unsubscribers.push(unsubscribeShelterMeal);

      const unsubscribeExercise = subscribeToCurrentExercisePlan(user.uid, student.id, (exercisePlan) => {
        if (exercisePlan) {
          dispatch({ type: 'tracker/setCurrentExercisePlan', payload: exercisePlan });
          dispatch({ type: 'tracker/addExercisePlan', payload: exercisePlan });
        }
      });
      unsubscribers.push(unsubscribeExercise);
    });

    const unsubscribeStudents = subscribeToStudents(user.uid, (updatedStudents) => {
      dispatch({ type: 'tracker/setStudents', payload: updatedStudents });
    });
    unsubscribers.push(unsubscribeStudents);

    return () => unsubscribers.forEach(unsub => unsub());
  }, [user?.uid, dispatch, students.length]);

  useEffect(() => {
    Animated.spring(heroAnim, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 14,
      speed: 1.2,
    }).start();
  }, [heroAnim]);

  const palette = useMemo(() => ({
    background: theme.dark ? '#0f172a' : '#f8fafc',
    surface: theme.dark ? '#1e293b' : '#ffffff',
    textPrimary: theme.dark ? '#f1f5f9' : '#1e293b',
    textSecondary: theme.dark ? '#94a3b8' : '#64748b',
    border: theme.dark ? '#334155' : '#e2e8f0',
  }), [theme.dark]);

  const todayLabel = useMemo(() =>
    new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
  []);

  const today = new Date().toISOString().split('T')[0];

  // Get ALL meal plans (not just current)
  const allMealPlans = useMemo(() => {
    const plans = [...mealPlans];
    if (currentMealPlan && !plans.find(p => p.id === currentMealPlan.id)) {
      plans.push(currentMealPlan);
    }
    return plans;
  }, [mealPlans, currentMealPlan]);

  // Get ALL exercise plans (not just current) - use exercisePlans from top level
  const allExercisePlans = useMemo(() => {
    const plans: ExercisePlan[] = [...(exercisePlans || [])];
    // Also add currentExercisePlan if it exists and not already included
    if (currentExercisePlan && !plans.find(p => p.id === currentExercisePlan.id)) {
      plans.push(currentExercisePlan);
    }
    // Ensure each plan has exercises property
    return plans.filter(p => p && p.exercises);
  }, [exercisePlans, currentExercisePlan]);

  // Calculate TOTAL meal progress across ALL students - Updated for Shelter Home format
  const mealProgress = useMemo(() => {
    let completedMeals = 0;
    let totalMeals = 0;
    let caloriesConsumed = 0;
    let totalTargetCalories = 0;

    // Calculate from all meal plans using new Shelter Home format
    allMealPlans.forEach((plan: any) => {
      // New format: weeklyMenu + completedMeals
      if (plan.weeklyMenu && plan.completedMeals) {
        const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
        const todayPlan = plan.weeklyMenu.find((day: any) => day.day === todayDayName);
        const todayCompleted = plan.completedMeals[today] || { breakfast: false, lunch: false, dinner: false, snack: false };
        
        if (todayPlan) {
          const completedCount = Object.values(todayCompleted).filter(Boolean).length;
          completedMeals += completedCount;
          totalMeals += 4;
          
          // Calculate calories based on completion
          const dailyNutrition = calculateDailyNutrition(todayPlan);
          caloriesConsumed += dailyNutrition.totalCalories * (completedCount / 4);
        }
      } 
      // Old format fallback: meals object
      else if (plan.meals && plan.meals[today]) {
        const todayMeals = plan.meals[today];
        Object.values(todayMeals.consumed).forEach((consumed: any) => {
          if (consumed) completedMeals++;
          totalMeals++;
        });
        
        // Calculate consumed calories
        const consumedCount = Object.values(todayMeals.consumed).filter(Boolean).length;
        caloriesConsumed += (todayMeals.totalCalories || 0) * (consumedCount / 4);
      }
    });

    // Calculate total target calories for all students
    students.forEach(student => {
      totalTargetCalories += student.dailyCalorieNeeds || 2000;
    });

    // If no meal plans exist yet, show expected total based on students
    if (totalMeals === 0 && students.length > 0) {
      totalMeals = students.length * 4; // 4 meals per student
    }

    return {
      completed: completedMeals,
      total: totalMeals,
      percentage: totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0,
      caloriesConsumed: Math.round(caloriesConsumed),
      caloriesTarget: totalTargetCalories,
      remaining: totalMeals - completedMeals,
    };
  }, [allMealPlans, today, students]);

  // Calculate TOTAL exercise progress across ALL students
  const exerciseProgress = useMemo(() => {
    let completedExercises = 0;
    let totalExercises = 0;
    let durationCompleted = 0;
    let totalDuration = 0;
    let caloriesBurned = 0;
    let totalTargetCalories = 0;

    // Calculate from all exercise plans using allExercisePlans
    allExercisePlans.forEach((plan: ExercisePlan) => {
      if (plan.exercises[today]) {
        const todayExercises = plan.exercises[today];
        // Handle new Shelter Home program structure
        const dayPlan = todayExercises as any;
        if (dayPlan.exercises && Array.isArray(dayPlan.exercises)) {
          const exercises = dayPlan.exercises;
          const completed = exercises.filter((ex: any) => ex.completed).length;
          completedExercises += completed;
          totalExercises += exercises.length;
          
          // Calculate weighted duration and calories
          exercises.forEach((ex: any) => {
            totalDuration += ex.duration || 0;
            totalTargetCalories += ex.calories || 0;
            if (ex.completed) {
              durationCompleted += ex.duration || 0;
              caloriesBurned += ex.calories || 0;
            }
          });
        } else {
          // Fallback to old structure (backward compatibility)
          const completed = Object.values(todayExercises.completed || {}).filter(Boolean).length;
          completedExercises += completed;
          totalExercises += 3; // 3 exercises per day per student
          
          durationCompleted += (todayExercises.totalDuration || 0) * (completed / 3);
          totalDuration += todayExercises.totalDuration || 0;
          caloriesBurned += (todayExercises.totalCalories || 0) * (completed / 3);
          totalTargetCalories += todayExercises.totalCalories || 0;
        }
      }
    });

    // If no exercise plans exist yet, show expected total based on students
    if (totalExercises === 0 && students.length > 0) {
      totalExercises = students.length * 8; // ~8 exercises per student (Shelter Home program)
      totalDuration = students.length * 40; // ~40 min per student
    }

    return {
      completed: completedExercises,
      total: totalExercises,
      percentage: totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0,
      durationCompleted: Math.round(durationCompleted),
      totalDuration,
      caloriesBurned: Math.round(caloriesBurned),
      remaining: totalExercises - completedExercises,
    };
  }, [allExercisePlans, today, students]);

  // Calculate screen time
  const screenProgress = useMemo(() => {
    const screenToday = screenSessions[0]?.minutes ?? 0;
    const limit = profile?.screenTimeLimitMin ?? 180;
    return {
      used: screenToday,
      limit,
      percentage: Math.min(screenToday / limit, 1),
      remaining: Math.max(limit - screenToday, 0),
    };
  }, [screenSessions, profile]);

  // Get weekly stats aggregated across all students - Updated for Shelter Home format
  const weeklyStats = useMemo(() => {
    let mealDaysTracked = 0;
    let exerciseDaysTracked = 0;
    let totalCaloriesConsumed = 0;
    let totalCaloriesBurned = 0;
    let totalExerciseMinutes = 0;

    allMealPlans.forEach((plan: any) => {
      // New Shelter Home format
      if (plan.weeklyMenu && plan.completedMeals) {
        Object.entries(plan.completedMeals).forEach(([date, dayCompleted]: [string, any]) => {
          const completed = Object.values(dayCompleted).filter(Boolean).length;
          if (completed > 0) {
            mealDaysTracked++;
            // Find the day plan for this date
            const dateObj = new Date(date);
            const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];
            const dayPlan = plan.weeklyMenu.find((d: any) => d.day === dayName);
            if (dayPlan) {
              const nutrition = calculateDailyNutrition(dayPlan);
              totalCaloriesConsumed += nutrition.totalCalories * (completed / 4);
            }
          }
        });
      }
      // Old format fallback
      else if (plan.meals) {
        Object.entries(plan.meals).forEach(([date, dayMeals]: [string, any]) => {
          const completed = Object.values(dayMeals.consumed).filter(Boolean).length;
          if (completed > 0) mealDaysTracked++;
          totalCaloriesConsumed += (dayMeals.totalCalories || 0) * (completed / 4);
        });
      }
    });

    // Use allExercisePlans from top level
    allExercisePlans.forEach((plan: ExercisePlan) => {
      Object.entries(plan.exercises).forEach(([date, dayExercises]) => {
        const dayPlan = dayExercises as any;
        // Handle new Shelter Home format
        if (dayPlan.exercises && Array.isArray(dayPlan.exercises)) {
          const completed = dayPlan.exercises.filter((ex: any) => ex.completed).length;
          if (completed > 0) exerciseDaysTracked++;
          dayPlan.exercises.forEach((ex: any) => {
            if (ex.completed) {
              totalCaloriesBurned += ex.calories || 0;
              totalExerciseMinutes += ex.duration || 0;
            }
          });
        } else {
          // Fallback to old format
          const completed = Object.values(dayExercises.completed || {}).filter(Boolean).length;
          if (completed > 0) exerciseDaysTracked++;
          totalCaloriesBurned += (dayExercises.totalCalories || 0) * (completed / 3);
          totalExerciseMinutes += (dayExercises.totalDuration || 0) * (completed / 3);
        }
      });
    });

    return {
      mealDaysTracked,
      exerciseDaysTracked,
      avgDailyCalories: mealDaysTracked > 0 ? Math.round(totalCaloriesConsumed / mealDaysTracked) : 0,
      avgDailyBurn: exerciseDaysTracked > 0 ? Math.round(totalCaloriesBurned / exerciseDaysTracked) : 0,
      avgExerciseMinutes: exerciseDaysTracked > 0 ? Math.round(totalExerciseMinutes / exerciseDaysTracked) : 0,
    };
  }, [allMealPlans, allExercisePlans]);

  const toggleStudentExpansion = (studentId: string) => {
    setExpandedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) newSet.delete(studentId);
      else newSet.add(studentId);
      return newSet;
    });
  };

  const getStudentTodayMeals = (studentId: string): any => {
    const plan = allMealPlans.find((p: any) => p.studentId === studentId);
    if (!plan) return null;
    
    // New Shelter Home format
    if (plan.weeklyMenu && plan.completedMeals) {
      const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
      const todayPlan = plan.weeklyMenu.find((day: any) => day.day === todayDayName);
      const todayCompleted = plan.completedMeals[today] || { breakfast: false, lunch: false, dinner: false, snack: false };
      
      if (todayPlan) {
        return {
          consumed: todayCompleted,
          meals: {
            breakfast: todayPlan.breakfast,
            lunch: todayPlan.lunch,
            dinner: todayPlan.dinner,
            snack: todayPlan.snack
          }
        };
      }
    }
    
    // Old format fallback
    return plan?.meals?.[today];
  };

  const getStudentTodayExercises = (studentId: string): any => {
    // Use allExercisePlans from closure
    const plan = allExercisePlans.find((p: ExercisePlan) => p.studentId === studentId);
    return plan?.exercises[today];
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: palette.textPrimary }]}>
              Hello, {profile?.name?.split(' ')[0] || 'User'}
            </Text>
            <Text style={[styles.date, { color: palette.textSecondary }]}>{todayLabel}</Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: colors.meal.light }]}>
            <MaterialCommunityIcons name="account" size={28} color={colors.meal.primary} />
          </View>
        </View>

        {/* Family Overview Stats */}
        <View style={[styles.familyCard, { backgroundColor: palette.surface }]}>
          <View style={styles.familyHeader}>
            <MaterialCommunityIcons name="account-group" size={24} color={palette.textSecondary} />
            <Text style={[styles.familyTitle, { color: palette.textPrimary }]}>
              {students.length} {students.length === 1 ? 'Child' : 'Children'}
            </Text>
          </View>
          <Text style={[styles.familySubtitle, { color: palette.textSecondary }]}>
            Daily targets across all children
          </Text>
        </View>

        {/* Quick Stats - Modern Row Design */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={[styles.statLeft, { backgroundColor: colors.meal.light }]}>
              <MaterialCommunityIcons name="food-apple" size={22} color={colors.meal.primary} />
            </View>
            <View style={[styles.statCenter, { backgroundColor: colors.meal.surface }]}>
              <Text style={[styles.statNumber, { color: colors.meal.dark }]}>{mealProgress.remaining}</Text>
              <Text style={[styles.statText, { color: palette.textSecondary }]}>Meals</Text>
            </View>
            <View style={[styles.statRight, { backgroundColor: colors.meal.surface }]}>
              <Text style={[styles.statUnit, { color: colors.meal.primary }]}>left</Text>
            </View>
          </View>
          
          <View style={styles.statRow}>
            <View style={[styles.statLeft, { backgroundColor: colors.exercise.light }]}>
              <MaterialCommunityIcons name="dumbbell" size={22} color={colors.exercise.primary} />
            </View>
            <View style={[styles.statCenter, { backgroundColor: colors.exercise.surface }]}>
              <Text style={[styles.statNumber, { color: colors.exercise.dark }]}>{exerciseProgress.remaining}</Text>
              <Text style={[styles.statText, { color: palette.textSecondary }]}>Exercises</Text>
            </View>
            <View style={[styles.statRight, { backgroundColor: colors.exercise.surface }]}>
              <Text style={[styles.statUnit, { color: colors.exercise.primary }]}>left</Text>
            </View>
          </View>
          
          <View style={styles.statRow}>
            <View style={[styles.statLeft, { backgroundColor: colors.screen.light }]}>
              <MaterialCommunityIcons name="monitor" size={22} color={colors.screen.primary} />
            </View>
            <View style={[styles.statCenter, { backgroundColor: colors.screen.surface }]}>
              <Text style={[styles.statNumber, { color: colors.screen.dark }]}>{screenProgress.remaining}</Text>
              <Text style={[styles.statText, { color: palette.textSecondary }]}>Minutes</Text>
            </View>
            <View style={[styles.statRight, { backgroundColor: colors.screen.surface }]}>
              <Text style={[styles.statUnit, { color: colors.screen.primary }]}>left</Text>
            </View>
          </View>
        </View>

        {/* Today's Family Progress - Professional Design */}
        <View style={[styles.progressSection, { backgroundColor: palette.surface }]}>
          <View style={styles.progressSectionHeader}>
            <MaterialCommunityIcons name="chart-line" size={20} color={palette.textSecondary} />
            <Text style={[styles.progressSectionTitle, { color: palette.textPrimary }]}>
              Today's Progress
            </Text>
          </View>
          
          {/* Meal Progress */}
          <View style={styles.progressItem}>
            <View style={styles.progressItemHeader}>
              <View style={styles.progressItemLeft}>
                <View style={[styles.progressIconBg, { backgroundColor: colors.meal.light }]}>
                  <MaterialCommunityIcons name="food-apple" size={18} color={colors.meal.primary} />
                </View>
                <Text style={[styles.progressItemLabel, { color: palette.textPrimary }]}>Meals</Text>
              </View>
              <View style={[styles.progressBadge, { backgroundColor: mealProgress.percentage === 100 ? colors.meal.light : '#f1f5f9' }]}>
                <Text style={[styles.progressBadgeText, { color: mealProgress.percentage === 100 ? colors.meal.dark : palette.textSecondary }]}>
                  {mealProgress.percentage}%
                </Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarBg, { backgroundColor: '#e2e8f0' }]}>
                <View style={[styles.progressBarFill, { 
                  backgroundColor: colors.meal.primary, 
                  width: `${mealProgress.percentage}%` 
                }]} />
              </View>
            </View>
            <View style={styles.progressStats}>
              <Text style={[styles.progressStatText, { color: palette.textSecondary }]}>
                {mealProgress.completed}/{mealProgress.total} completed
              </Text>
              <Text style={[styles.progressStatText, { color: palette.textSecondary }]}>
                {mealProgress.caloriesConsumed.toLocaleString()} cal
              </Text>
            </View>
          </View>

          {/* Exercise Progress */}
          <View style={[styles.progressItem, styles.progressItemBorder, { borderTopColor: palette.border }]}>
            <View style={styles.progressItemHeader}>
              <View style={styles.progressItemLeft}>
                <View style={[styles.progressIconBg, { backgroundColor: colors.exercise.light }]}>
                  <MaterialCommunityIcons name="dumbbell" size={18} color={colors.exercise.primary} />
                </View>
                <Text style={[styles.progressItemLabel, { color: palette.textPrimary }]}>Exercise</Text>
              </View>
              <View style={[styles.progressBadge, { backgroundColor: exerciseProgress.percentage === 100 ? colors.exercise.light : '#f1f5f9' }]}>
                <Text style={[styles.progressBadgeText, { color: exerciseProgress.percentage === 100 ? colors.exercise.dark : palette.textSecondary }]}>
                  {exerciseProgress.percentage}%
                </Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarBg, { backgroundColor: '#e2e8f0' }]}>
                <View style={[styles.progressBarFill, { 
                  backgroundColor: colors.exercise.primary, 
                  width: `${exerciseProgress.percentage}%` 
                }]} />
              </View>
            </View>
            <View style={styles.progressStats}>
              <Text style={[styles.progressStatText, { color: palette.textSecondary }]}>
                {exerciseProgress.completed}/{exerciseProgress.total} workouts
              </Text>
              <Text style={[styles.progressStatText, { color: palette.textSecondary }]}>
                {exerciseProgress.durationCompleted} min • {exerciseProgress.caloriesBurned} cal
              </Text>
            </View>
          </View>

          {/* Screen Time Progress */}
          <View style={[styles.progressItem, styles.progressItemBorder, { borderTopColor: palette.border }]}>
            <View style={styles.progressItemHeader}>
              <View style={styles.progressItemLeft}>
                <View style={[styles.progressIconBg, { backgroundColor: colors.screen.light }]}>
                  <MaterialCommunityIcons name="monitor" size={18} color={colors.screen.primary} />
                </View>
                <Text style={[styles.progressItemLabel, { color: palette.textPrimary }]}>Screen Time</Text>
              </View>
              <View style={[styles.progressBadge, { 
                backgroundColor: screenProgress.percentage > 0.8 ? '#fee2e2' : '#f1f5f9' 
              }]}>
                <Text style={[styles.progressBadgeText, { 
                  color: screenProgress.percentage > 0.8 ? '#dc2626' : palette.textSecondary 
                }]}>
                  {Math.round(screenProgress.percentage * 100)}%
                </Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarBg, { backgroundColor: '#e2e8f0' }]}>
                <View style={[styles.progressBarFill, { 
                  backgroundColor: screenProgress.percentage > 0.8 ? '#ef4444' : colors.screen.primary, 
                  width: `${Math.min(screenProgress.percentage * 100, 100)}%` 
                }]} />
              </View>
            </View>
            <View style={styles.progressStats}>
              <Text style={[styles.progressStatText, { color: palette.textSecondary }]}>
                {screenProgress.used}/{screenProgress.limit} min used
              </Text>
              <Text style={[styles.progressStatText, { 
                color: screenProgress.percentage > 0.8 ? '#ef4444' : palette.textSecondary 
              }]}>
                {screenProgress.remaining} min left
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly Summary */}
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Weekly Family Summary</Text>
        <View style={[styles.weeklyCard, { backgroundColor: palette.surface }]}>
          <View style={styles.weeklyRow}>
            <View style={styles.weeklyItem}>
              <MaterialCommunityIcons name="food" size={20} color={colors.meal.primary} />
              <Text style={[styles.weeklyValue, { color: palette.textPrimary }]}>{weeklyStats.mealDaysTracked}</Text>
              <Text style={[styles.weeklyLabel, { color: palette.textSecondary }]}>Days Tracked</Text>
            </View>
            <View style={styles.weeklyDivider} />
            <View style={styles.weeklyItem}>
              <MaterialCommunityIcons name="fire" size={20} color={colors.meal.primary} />
              <Text style={[styles.weeklyValue, { color: palette.textPrimary }]}>{weeklyStats.avgDailyCalories}</Text>
              <Text style={[styles.weeklyLabel, { color: palette.textSecondary }]}>Avg Calories</Text>
            </View>
            <View style={styles.weeklyDivider} />
            <View style={styles.weeklyItem}>
              <MaterialCommunityIcons name="run" size={20} color={colors.exercise.primary} />
              <Text style={[styles.weeklyValue, { color: palette.textPrimary }]}>{weeklyStats.avgExerciseMinutes}</Text>
              <Text style={[styles.weeklyLabel, { color: palette.textSecondary }]}>Avg Minutes</Text>
            </View>
          </View>
        </View>

        {/* Students Section */}
        {students.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Per Child Details</Text>
            
            {students.map(student => {
              const isExpanded = expandedStudents.has(student.id);
              const todayMeals = getStudentTodayMeals(student.id);
              const todayExercises = getStudentTodayExercises(student.id);
              
              // Calculate individual stats
              const mealDone = todayMeals ? Object.values(todayMeals.consumed).filter(Boolean).length : 0;
              const mealTotal = 4;
              
              // Handle both old and new exercise formats for per-child stats
              let exerciseDone = 0;
              let exerciseTotal = 3; // default for old format
              if (todayExercises) {
                const dayPlan = todayExercises as any;
                if (dayPlan.exercises && Array.isArray(dayPlan.exercises)) {
                  // New Shelter Home format
                  exerciseTotal = dayPlan.exercises.length;
                  exerciseDone = dayPlan.exercises.filter((ex: any) => ex.completed).length;
                } else {
                  // Old format
                  exerciseDone = Object.values(todayExercises.completed || {}).filter(Boolean).length;
                }
              }
              
              return (
                <Card key={student.id} style={[styles.studentCard, { backgroundColor: palette.surface }]}>
                  <TouchableOpacity onPress={() => toggleStudentExpansion(student.id)} style={styles.studentHeader}>
                    <View style={styles.studentMain}>
                      <View style={[styles.studentAvatar, { backgroundColor: colors.meal.light }]}>
                        <MaterialCommunityIcons name="account" size={24} color={colors.meal.primary} />
                      </View>
                      <View style={styles.studentInfo}>
                        <Text style={[styles.studentName, { color: palette.textPrimary }]}>{student.name}</Text>
                        <View style={styles.studentStatsRow}>
                          <View style={styles.miniStat}>
                            <MaterialCommunityIcons name="food-apple" size={14} color={mealDone === mealTotal ? colors.meal.primary : palette.textSecondary} />
                            <Text style={[styles.miniStatText, { color: mealDone === mealTotal ? colors.meal.dark : palette.textSecondary }]}>
                              {mealDone}/{mealTotal}
                            </Text>
                          </View>
                          <View style={styles.miniStat}>
                            <MaterialCommunityIcons name="dumbbell" size={14} color={exerciseDone === exerciseTotal ? colors.exercise.primary : palette.textSecondary} />
                            <Text style={[styles.miniStatText, { color: exerciseDone === exerciseTotal ? colors.exercise.dark : palette.textSecondary }]}>
                              {exerciseDone}/{exerciseTotal}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <View style={styles.arrowContainer}>
                      <MaterialCommunityIcons 
                        name={isExpanded ? "chevron-up" : "chevron-down"} 
                        size={24} 
                        color={palette.textSecondary} 
                      />
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.studentDetails}>
                      {/* Meal Status */}
                      {todayMeals && (
                        <View style={styles.detailSection}>
                          <View style={styles.detailHeader}>
                            <MaterialCommunityIcons name="food-apple" size={18} color={colors.meal.primary} />
                            <Text style={[styles.detailTitle, { color: colors.meal.dark }]}>Today's Meals</Text>
                            <Text style={[styles.detailCount, { color: palette.textSecondary }]}>
                              {mealDone}/{mealTotal} done
                            </Text>
                          </View>
                          <View style={styles.mealGrid}>
                            {[
                              { key: 'breakfast', icon: 'coffee', label: 'Breakfast' },
                              { key: 'lunch', icon: 'food', label: 'Lunch' },
                              { key: 'dinner', icon: 'food-variant', label: 'Dinner' },
                              { key: 'snack', icon: 'apple', label: 'Snack' },
                            ].map(({ key, icon, label }) => (
                              <View key={key} style={[
                                styles.mealItem,
                                todayMeals.consumed[key as keyof typeof todayMeals.consumed] && { backgroundColor: colors.meal.light }
                              ]}>
                                <MaterialCommunityIcons 
                                  name={icon as any} 
                                  size={20} 
                                  color={todayMeals.consumed[key as keyof typeof todayMeals.consumed] ? colors.meal.primary : palette.textSecondary} 
                                />
                                <Text style={[
                                  styles.mealLabel, 
                                  { color: todayMeals.consumed[key as keyof typeof todayMeals.consumed] ? colors.meal.dark : palette.textSecondary }
                                ]}>
                                  {label}
                                </Text>
                                {todayMeals.consumed[key as keyof typeof todayMeals.consumed] && (
                                  <MaterialCommunityIcons name="check-circle" size={14} color={colors.meal.primary} />
                                )}
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Exercise Status */}
                      {todayExercises && (
                        <View style={styles.detailSection}>
                          <View style={styles.detailHeader}>
                            <MaterialCommunityIcons name="dumbbell" size={18} color={colors.exercise.primary} />
                            <Text style={[styles.detailTitle, { color: colors.exercise.dark }]}>Today's Workout</Text>
                            <Text style={[styles.detailCount, { color: palette.textSecondary }]}>
                              {exerciseDone}/{exerciseTotal} done
                            </Text>
                          </View>
                          <View style={styles.exerciseList}>
                            {(todayExercises as any).exercises && Array.isArray((todayExercises as any).exercises) ? (
                              // New Shelter Home format
                              (todayExercises as any).exercises.map((exercise: any, index: number) => (
                                <View key={exercise.id || index} style={[
                                  styles.exerciseItem,
                                  exercise.completed && { backgroundColor: colors.exercise.light }
                                ]}>
                                  <View style={styles.exerciseMain}>
                                    <MaterialCommunityIcons 
                                      name={exercise.category === 'cardio' ? 'run' : 
                                            exercise.category === 'strength' ? 'dumbbell' : 
                                            exercise.category === 'yoga' ? 'meditation' :
                                            exercise.category === 'dance' ? 'music' :
                                            exercise.category === 'warmup' ? 'run-fast' : 'yoga'} 
                                      size={20} 
                                      color={exercise.completed ? colors.exercise.primary : palette.textSecondary} 
                                    />
                                    <View>
                                      <Text style={[
                                        styles.exerciseName, 
                                        { color: exercise.completed ? palette.textPrimary : palette.textSecondary }
                                      ]}>
                                        {exercise.name}
                                      </Text>
                                      <Text style={[styles.exerciseSub, { color: palette.textSecondary }]}>
                                        {exercise.category} • {exercise.duration} min
                                      </Text>
                                    </View>
                                  </View>
                                  {exercise.completed && (
                                    <MaterialCommunityIcons name="check-circle" size={20} color={colors.exercise.primary} />
                                  )}
                                </View>
                              ))
                            ) : (
                              // Old format
                              <>
                                {[
                                  { key: 'mobility', icon: 'yoga', label: 'Mobility', exercise: todayExercises.mobility },
                                  { key: 'strength', icon: 'dumbbell', label: 'Strength', exercise: todayExercises.strength },
                                  { key: 'cardio', icon: 'run', label: 'Cardio', exercise: todayExercises.cardio },
                                ].map(({ key, icon, label, exercise }) => (
                                  <View key={key} style={[
                                    styles.exerciseItem,
                                    todayExercises.completed[key as keyof typeof todayExercises.completed] && { backgroundColor: colors.exercise.light }
                                  ]}>
                                    <View style={styles.exerciseMain}>
                                      <MaterialCommunityIcons 
                                        name={icon as any} 
                                        size={20} 
                                        color={todayExercises.completed[key as keyof typeof todayExercises.completed] ? colors.exercise.primary : palette.textSecondary} 
                                      />
                                      <View>
                                        <Text style={[
                                          styles.exerciseName, 
                                          { color: todayExercises.completed[key as keyof typeof todayExercises.completed] ? palette.textPrimary : palette.textSecondary }
                                        ]}>
                                          {label}
                                        </Text>
                                        <Text style={[styles.exerciseSub, { color: palette.textSecondary }]}>
                                          {exercise?.name} • {exercise?.duration} min
                                        </Text>
                                      </View>
                                    </View>
                                    {todayExercises.completed[key as keyof typeof todayExercises.completed] && (
                                      <MaterialCommunityIcons name="check-circle" size={20} color={colors.exercise.primary} />
                                    )}
                                  </View>
                                ))}
                              </>
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </Card>
              );
            })}
          </>
        )}

        {students.length === 0 && (
          <Card style={[styles.emptyCard, { backgroundColor: palette.surface }]}>
            <MaterialCommunityIcons name="account-off" size={48} color={palette.textSecondary} />
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              No children added yet. Go to the Children tab to add students.
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: fonts.bold,
  },
  date: {
    fontSize: 14,
    fontFamily: fonts.regular,
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  familyCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  familyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  familyTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  familySubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    marginTop: 4,
  },
  statsContainer: {
    gap: 10,
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statLeft: {
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  statCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  statRight: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 16,
    paddingLeft: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: fonts.bold,
  },
  statText: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  progressSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  progressSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  progressItem: {
    paddingVertical: 16,
  },
  progressItemBorder: {
    borderTopWidth: 1,
  },
  progressItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  progressBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 48,
    alignItems: 'center',
  },
  progressBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: fonts.bold,
  },
  progressBarContainer: {
    marginBottom: 10,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressStatText: {
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    marginBottom: 12,
    marginTop: 8,
  },
  weeklyCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  weeklyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  weeklyItem: {
    alignItems: 'center',
    flex: 1,
  },
  weeklyValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fonts.bold,
    marginTop: 4,
  },
  weeklyLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  weeklyDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },
  studentCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingRight: 12,
  },
  studentMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    flexShrink: 1,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
    flexShrink: 1,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  studentStatsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniStatText: {
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  studentDetails: {
    padding: 16,
    paddingTop: 0,
  },
  detailSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  detailCount: {
    fontSize: 13,
    fontFamily: fonts.regular,
    marginLeft: 'auto',
  },
  mealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mealLabel: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  exerciseList: {
    gap: 10,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  exerciseMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: fonts.medium,
  },
  exerciseSub: {
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginTop: 12,
  },
});

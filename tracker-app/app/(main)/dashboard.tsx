import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Card,
  Chip,
  Divider,
  ProgressBar,
  Text,
  useTheme,
} from 'react-native-paper';

import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { calculateRecommendedCalories } from '@/utils/bmi';
import type { Student } from '@/types/tracker';
import { 
  HOME_EXERCISES, 
  GYM_EXERCISES, 
  getExercisesByBMI, 
  getExerciseByCategory, 
  calculateBMI,
  getBMICategory,
  getComplementaryExercises,
  type Exercise 
} from '@/constants/exerciseLibrary';

const FloatingBackground = () => {
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;
  const floatAnim4 = useRef(new Animated.Value(0)).current;
  const floatAnim5 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateFloat = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000 + delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3000 + delay,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateFloat(floatAnim1, 0);
    animateFloat(floatAnim2, 500);
    animateFloat(floatAnim3, 1000);
    animateFloat(floatAnim4, 1500);
    animateFloat(floatAnim5, 2000);
  }, []);

  const icons = [
    { name: 'dumbbell', anim: floatAnim1, left: '10%', top: '15%', color: '#ef4444' },
    { name: 'heart-pulse', anim: floatAnim2, left: '80%', top: '25%', color: '#ec4899' },
    { name: 'apple', anim: floatAnim3, left: '15%', top: '60%', color: '#10b981' },
    { name: 'run', anim: floatAnim4, left: '75%', top: '70%', color: '#3b82f6' },
    { name: 'meditation', anim: floatAnim5, left: '50%', top: '40%', color: '#8b5cf6' },
  ];

  return (
    <View style={styles.floatingBackground}>
      {icons.map((icon, index) => (
        <Animated.View
          key={index}
          style={[
            styles.floatingIcon,
            {
              left: icon.left as any,
              top: icon.top as any,
              transform: [
                {
                  translateY: icon.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                  }),
                },
              ],
            },
          ]}>
          <MaterialCommunityIcons
            name={icon.name as any}
            size={32}
            color={icon.color}
          />
        </Animated.View>
      ))}
    </View>
  );
};

const createPalette = (isDark: boolean) => ({
  background: isDark ? 'rgba(0,8,14,0.9)' : '#f8fafc',
  heroGradient: isDark
    ? (['#ff006e', '#8338ec', '#3a86ff'] as const)
    : (['#ff006e', '#8338ec', '#3a86ff'] as const),
  surface: isDark ? 'rgba(4,22,33,0.72)' : 'rgba(255,255,255,0.85)',
  border: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)',
  textPrimary: isDark ? '#f7fbff' : '#0f172a',
  textMuted: isDark ? 'rgba(247,251,255,0.72)' : '#475569',
  accentWarm: '#f87171',
  accentCool: '#38bdf8',
  accentSun: '#facc15',
  accentLime: '#4ade80',
  pillBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.04)',
  bullet: isDark ? '#0fa3b1' : '#0ea5e9',
  avatarBg: isDark ? 'rgba(255,255,255,0.1)' : '#e0f2fe',
  avatarText: isDark ? '#f7fbff' : '#0f172a',
});

const fonts = {
  light: 'WorkSans_300Light',
  regular: 'WorkSans_400Regular',
  medium: 'WorkSans_500Medium',
  semibold: 'WorkSans_600SemiBold',
  bold: 'WorkSans_700Bold',
} as const;

export default function DashboardScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { profile } = useAppSelector((state) => state.auth);
  const { meals, exerciseTasks, screenSessions, currentMealPlan, currentExercisePlan, students, mealPlans } = useAppSelector((state) => state.tracker);

  const heroAnim = useRef(new Animated.Value(0)).current;
  
  // State for student meal details modal
  const [selectedStudentForMeals, setSelectedStudentForMeals] = useState<Student | null>(null);
  const [showMealModal, setShowMealModal] = useState(false);
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [expandedExerciseStudents, setExpandedExerciseStudents] = useState<Set<string>>(new Set());

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    [],
  );

  useEffect(() => {
    Animated.spring(heroAnim, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 14,
      speed: 1.2,
    }).start();
  }, [heroAnim]);

  const palette = useMemo(() => createPalette(theme.dark), [theme.dark]);

  const cardSurface = useMemo(
    () => ({
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderWidth: 1,
    }),
    [palette.surface, palette.border],
  );

  const {
    caloriesConsumed,
    calorieTarget,
    nextMeal,
    nextExercise,
    screenUsage,
    screenLimit,
    weeklyAvgScreen,
  } = useMemo(() => {
    const todayKey = new Date().toDateString();
    const todaysMeals = meals.filter(
      (meal) => new Date(meal.loggedAt).toDateString() === todayKey,
    );
    const completedMeals = todaysMeals.filter(meal => meal.isCompleted);
    const calories = completedMeals.reduce((sum, meal) => sum + meal.calories, 0);
    
    // Calculate recommended calories based on BMI if profile exists
    let target = 1800; // Default fallback
    if (profile?.heightCm && profile?.weightKg && profile?.age) {
      target = calculateRecommendedCalories(
        profile.heightCm,
        profile.weightKg,
        profile.age,
        'male' // Default to male, could be enhanced later
      );
    } else if (profile?.calorieTarget) {
      // Fallback to existing calorieTarget if BMI calculation not possible
      target = profile.calorieTarget;
    }
    
    const next = todaysMeals[0]?.foodName ?? meals[0]?.foodName ?? 'Hydrate & stretch';

    // Filter exercise tasks for today only
    const todaysExerciseTasks = exerciseTasks.filter(
      (task) => task.date === todayKey,
    );
    
    // Find next exercise to focus on (incomplete task)
    const nextExerciseTask = todaysExerciseTasks.find((task) => !task.completed);
    const nextExercise = nextExerciseTask?.name || 'All exercises completed!';
    
    const screenToday = screenSessions[0]?.minutes ?? 0;
    const limit = profile?.screenTimeLimitMin ?? 180;
    const avg =
      screenSessions.reduce((sum, session) => sum + session.minutes, 0) /
        Math.max(1, screenSessions.length) || 0;

    return {
      caloriesConsumed: calories,
      calorieTarget: target,
      nextMeal: next,
      nextExercise: nextExercise,
      screenUsage: screenToday,
      screenLimit: limit,
      weeklyAvgScreen: Math.round(avg),
    };
  }, [meals, exerciseTasks, profile, screenSessions]);

  const calorieProgress = Math.min(caloriesConsumed / calorieTarget, 1);
  const screenProgress = Math.min(screenUsage / screenLimit, 1);

  // Get today's exercise tasks for movement plan
  const todayExerciseTasks = useMemo(() => {
    const todayKey = new Date().toDateString();
    return exerciseTasks.filter((task) => task.date === todayKey);
  }, [exerciseTasks]);

  // Calculate exercise plan completion for students
  const { completedExercisePlans, totalExercisePlans, exercisePlanProgress, studentsWithPlans } = useMemo(() => {
    if (!currentExercisePlan || !students.length) {
      return {
        completedExercisePlans: 0,
        totalExercisePlans: 0,
        exercisePlanProgress: 0,
        studentsWithPlans: [],
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const todayExercises = currentExercisePlan.exercises[today];
    
    if (!todayExercises) {
      const studentWithPlan = students.find(s => s.id === currentExercisePlan.studentId);
      return {
        completedExercisePlans: 0,
        totalExercisePlans: 3,
        exercisePlanProgress: 0,
        studentsWithPlans: studentWithPlan ? [studentWithPlan] : [],
      };
    }

    // Count completed exercises for today
    const completedExercises = Object.values(todayExercises.completed).filter(Boolean).length;
    const totalExercises = 3; // mobility, strength, cardio
    
    // Calculate progress percentage
    const progress = (completedExercises / totalExercises) * 100;
    
    // Get the student who has this exercise plan
    const studentWithPlan = students.find(s => s.id === currentExercisePlan.studentId);
    
    return {
      completedExercisePlans: completedExercises,
      totalExercisePlans: totalExercises,
      exercisePlanProgress: Math.round(progress),
      studentsWithPlans: studentWithPlan ? [studentWithPlan] : [],
    };
  }, [currentExercisePlan, students]);

  // Calculate meal plan completion for students
  const { completedMealPlans, totalMealPlans, mealPlanProgress } = useMemo(() => {
    if (!currentMealPlan) {
      return {
        completedMealPlans: 0,
        totalMealPlans: 0,
        mealPlanProgress: 0,
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const todayMeals = currentMealPlan.meals[today];
    
    if (!todayMeals) {
      return {
        completedMealPlans: 0,
        totalMealPlans: 4,
        mealPlanProgress: 0,
      };
    }

    // Count completed meals for today
    const completedMeals = Object.values(todayMeals.consumed).filter(Boolean).length;
    const totalMeals = 4; // breakfast, lunch, dinner, snack
    
    // Calculate progress percentage
    const progress = (completedMeals / totalMeals) * 100;
    
    return {
      completedMealPlans: completedMeals,
      totalMealPlans: totalMeals,
      mealPlanProgress: Math.round(progress),
    };
  }, [currentMealPlan]);

  // Calculate student meal data for timeline - handle multiple children
  const studentMealData = useMemo(() => {
    if (!mealPlans.length || !students.length) {
      return [];
    }

    const today = new Date().toISOString().split('T')[0];
    const allStudentMeals: any[] = [];

    mealPlans.forEach(mealPlan => {
      const studentWithPlan = students.find(s => s.id === mealPlan.studentId);
      
      if (!studentWithPlan) return;

      const todayMeals = mealPlan.meals[today];
      if (!todayMeals) return;

      // Create meal data for each meal type for this student
      const mealTypes = [
        { type: 'breakfast', name: '🌅 Breakfast', emoji: '🌅' },
        { type: 'lunch', name: '☀️ Lunch', emoji: '☀️' },
        { type: 'dinner', name: '🌆 Dinner', emoji: '🌆' },
        { type: 'snack', name: '🍎 Snack', emoji: '🍎' }
      ];

      mealTypes.forEach(mealType => {
        const mealKey = mealType.type as 'breakfast' | 'lunch' | 'dinner' | 'snack';
        const mealData = todayMeals[mealKey];
        
        allStudentMeals.push({
          studentId: studentWithPlan.id,
          studentName: studentWithPlan.name,
          studentAge: studentWithPlan.age,
          studentBMI: studentWithPlan.bmi,
          mealType: mealType.type,
          mealName: mealType.name,
          mealEmoji: mealType.emoji,
          foodName: mealData.name,
          calories: mealData.calories,
          grams: mealData.grams,
          consumed: todayMeals.consumed[mealKey],
          loggedAt: new Date().toISOString(),
          mealPlanId: mealPlan.id
        });
      });
    });

    return allStudentMeals;
  }, [mealPlans, students]);

  // Get weekly meal data for selected student
  const getStudentWeeklyMeals = (studentId: string) => {
    const studentMealPlan = mealPlans.find(plan => plan.studentId === studentId);
    if (!studentMealPlan) return [];

    const weeklyMeals: any[] = [];
    const today = new Date();
    
    // Generate next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      const dayMeals = studentMealPlan.meals[dateStr];
      if (dayMeals) {
        const mealTypes = [
          { type: 'breakfast', name: '🌅 Breakfast', emoji: '🌅' },
          { type: 'lunch', name: '☀️ Lunch', emoji: '☀️' },
          { type: 'dinner', name: '🌆 Dinner', emoji: '🌆' },
          { type: 'snack', name: '🍎 Snack', emoji: '🍎' }
        ];

        mealTypes.forEach(mealType => {
          const mealKey = mealType.type as 'breakfast' | 'lunch' | 'dinner' | 'snack';
          const mealData = dayMeals[mealKey];
          
          weeklyMeals.push({
            date: dateStr,
            dayName,
            mealType: mealType.type,
            mealName: mealType.name,
            mealEmoji: mealType.emoji,
            foodName: mealData.name,
            calories: mealData.calories,
            grams: mealData.grams,
            consumed: dayMeals.consumed[mealKey]
          });
        });
      }
    }

    return weeklyMeals;
  };

  // Handle student click to show meal details
  const handleStudentClick = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudentForMeals(student);
      setShowMealModal(true);
    }
  };

  // Toggle student section expansion
  const toggleStudentExpansion = (studentId: string) => {
    setExpandedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  // Toggle exercise section expansion
  const toggleExerciseExpansion = (studentId: string) => {
    setExpandedExerciseStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  // Calculate meal completion statistics for hero card
  const mealCompletionStats = useMemo(() => {
    if (!students.length) {
      return { completedAll: 0, totalStudents: 0, percentage: 0 };
    }

    const today = new Date().toISOString().split('T')[0];
    let completedAllCount = 0;

    students.forEach(student => {
      const studentMealPlan = mealPlans.find(plan => plan.studentId === student.id);
      if (!studentMealPlan) return; // Student doesn't have meal plan, can't be counted as completed

      const todayMeals = studentMealPlan.meals[today];
      if (todayMeals) {
        const allMealsCompleted = todayMeals.consumed.breakfast && 
                                todayMeals.consumed.lunch && 
                                todayMeals.consumed.dinner && 
                                todayMeals.consumed.snack;
        
        if (allMealsCompleted) {
          completedAllCount++;
        }
      }
    });

    const totalStudents = students.length;
    const percentage = totalStudents > 0 ? (completedAllCount / totalStudents) * 100 : 0;

    return {
      completedAll: completedAllCount,
      totalStudents: totalStudents,
      percentage: Math.round(percentage)
    };
  }, [mealPlans, students]);
  useEffect(() => {
    if (screenUsage > screenLimit) {
      Alert.alert(
        'Screen Time Limit Exceeded',
        `You've used ${screenUsage} minutes of screen time today, which exceeds your limit of ${screenLimit} minutes. Consider taking a break!`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [screenUsage, screenLimit]);

  return (
    <View style={[styles.screen, { backgroundColor: 'transparent' }]}>
      <FloatingBackground />
      {/* App Header Bar - Fixed Position */}
      <View style={styles.appHeader}>
        <Text style={styles.appHeaderText}>Healthify</Text>
      </View>
      
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 80, paddingBottom: 60 },
        ]}
        showsVerticalScrollIndicator={false}>
        
        <Animated.View
          style={[
            styles.heroWrapper,
            {
              opacity: heroAnim,
              transform: [
                {
                  translateY: heroAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
                {
                  scale: heroAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
            },
          ]}>
          <Card style={styles.heroCard} mode="contained">
            <View style={[styles.heroGradient, { backgroundColor: '#006879' }]}>
              <View style={styles.heroHeader}>
                <View>
                  <Text
                    variant="titleMedium"
                    style={[styles.heroGreeting, { color: 'white' }]}>
                    Hey {profile?.name?.split(' ')[0] ?? 'Explorer'} 👋🏽
                  </Text>
                  <Text style={[styles.heroSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>
                    {todayLabel} · Here's your wellbeing snapshot.
                  </Text>
                </View>
              </View>

              <View style={styles.heroMetaRow}>
                <View style={[styles.heroMetaCard, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                  <Text style={[styles.heroMetaLabel, { color: 'rgba(255,255,255,0.8)' }]}>
                    Today's Meals
                  </Text>
                  <Text style={[styles.heroMetaValue, { color: 'white' }]}>
                    {mealCompletionStats.completedAll}/{mealCompletionStats.totalStudents} Done
                  </Text>
                  <View style={styles.heroProgressTrack}>
                    <View
                      style={[
                        styles.heroProgressFill,
                        { width: `${mealCompletionStats.percentage}%`, backgroundColor: palette.accentLime },
                      ]}
                    />
                  </View>
                </View>
                <View style={[styles.heroMetaCard, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                  <Text style={[styles.heroMetaLabel, { color: 'rgba(255,255,255,0.8)' }]}>Next focus</Text>
                  <Text style={[styles.heroMetaValueSmall, { color: 'white' }]} numberOfLines={2}>
                    {nextExercise}
                  </Text>
                  <Chip
                    compact
                    icon="calendar-check"
                    style={[styles.heroPill, { backgroundColor: 'rgba(255,255,255,0.12)' }]}
                    textStyle={{ color: 'white', fontSize: 12 }}>
                    {completedExercisePlans}/{totalExercisePlans || 1} exercises
                  </Chip>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        <View style={styles.metricRow}>
          <Card style={styles.metricCard}>
            <Card.Title
              title="Diet Complete"
              subtitle="Today"
              left={CardIcon('food-apple', palette.accentLime)}
              titleStyle={[styles.metricTitle, { color: palette.textPrimary }]}
              subtitleStyle={[styles.cardSubtitle, { color: palette.textMuted }]}
            />
            <Card.Content>
              <Text style={[styles.metricValue, { color: palette.textPrimary }]}>{mealCompletionStats.completedAll}/{mealCompletionStats.totalStudents}</Text>
              <Text style={[styles.metricCaption, { color: palette.textMuted }]}>Children completed all meals</Text>
              <ProgressBar
                progress={mealCompletionStats.percentage / 100}
                color={palette.accentLime}
                style={styles.progress}
              />
            </Card.Content>
          </Card>
          <Card style={styles.metricCard}>
            <Card.Title
              title="Screen"
              subtitle="Today"
              left={CardIcon('monitor', palette.accentCool)}
              titleStyle={[styles.metricTitle, { color: palette.textPrimary }]}
              subtitleStyle={[styles.cardSubtitle, { color: palette.textMuted }]}
            />
            <Card.Content>
              <Text style={[styles.metricValue, { color: palette.textPrimary }]}>{screenUsage} min</Text>
              <Text style={[styles.metricCaption, { color: palette.textMuted }]}>Limit {screenLimit} min</Text>
              <ProgressBar
                progress={screenProgress}
                color={palette.accentCool}
                style={styles.progress}
              />
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.sectionCard}>
          <Card.Title
            title="Student Meals"
            subtitle="Daily nutrition tracking"
            titleStyle={[styles.cardTitle, { color: palette.textPrimary }]}
            subtitleStyle={[styles.cardSubtitle, { color: palette.textMuted }]}
          />
          <Card.Content>
            {studentMealData.length > 0 ? (
              // Group meals by student
              Object.values(
                studentMealData.reduce((acc: any, meal) => {
                  if (!acc[meal.studentId]) {
                    acc[meal.studentId] = {
                      studentId: meal.studentId,
                      studentName: meal.studentName,
                      studentAge: meal.studentAge,
                      studentBMI: meal.studentBMI,
                      meals: []
                    };
                  }
                  acc[meal.studentId].meals.push(meal);
                  return acc;
                }, {})
              ).map((studentData: any) => {
                const isExpanded = expandedStudents.has(studentData.studentId);
                return (
                <View key={studentData.studentId} style={styles.studentMealSection}>
                  <TouchableOpacity
                    style={styles.studentHeader}
                    onPress={() => toggleStudentExpansion(studentData.studentId)}>
                    <View style={styles.studentHeaderContent}>
                      <View style={styles.studentInfoRow}>
                        <Text style={[styles.studentName, { color: palette.textPrimary }]}>
                          👤 {studentData.studentName}
                        </Text>
                        <MaterialCommunityIcons 
                          name={isExpanded ? "chevron-up" : "chevron-down"} 
                          size={20} 
                          color={palette.textMuted} 
                        />
                      </View>
                      <Text style={[styles.studentDetails, { color: palette.textMuted }]}>
                        Age: {studentData.studentAge} • BMI: {studentData.studentBMI.toFixed(1)}
                      </Text>
                      <Text style={[styles.viewDetailsText, { color: palette.accentWarm }]}>
                        {isExpanded ? "Hide meals" : "View all meals"} {isExpanded ? "↑" : "↓"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  {isExpanded && (
                    <View style={styles.mealsList}>
                      {studentData.meals.map((meal: any, index: number) => (
                        <View key={`${meal.studentId}-${meal.mealType}`} style={styles.timelineRow}>
                          <View style={[styles.timelineBullet, { backgroundColor: meal.consumed ? palette.accentLime : palette.bullet }]} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.timelineTitle, { color: palette.textPrimary }]}>
                              {meal.mealEmoji} {meal.mealName}
                            </Text>
                            <Text style={[styles.timelineSubtitle, { color: palette.textMuted }]}>
                              {meal.foodName} · {meal.calories} kcal · {meal.grams}g
                            </Text>
                            <Text style={[styles.timelineStatus, { color: meal.consumed ? palette.accentLime : palette.textMuted }]}>
                              {meal.consumed ? '✅ Consumed' : '⏳ Pending'}
                            </Text>
                          </View>
                          <Chip 
                            compact 
                            style={{ backgroundColor: palette.pillBg }}
                            textStyle={{ fontSize: 11 }}>
                            {meal.mealType}
                          </Chip>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: palette.textMuted }]}>
                  No meal plans generated yet. Generate a meal plan from the Meals tab to see student nutrition data.
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.sectionCard}>
          <Card.Title
            title="Movement plan"
            subtitle="Student exercise progress"
            titleStyle={[styles.cardTitle, { color: palette.textPrimary }]}
            subtitleStyle={[styles.cardSubtitle, { color: palette.textMuted }]}
          />
          <Card.Content>
            {studentsWithPlans.length > 0 ? (
              studentsWithPlans.map((student: Student) => {
                const isExpanded = expandedExerciseStudents.has(student.id);
                const today = new Date().toISOString().split('T')[0];
                const todayExercises = currentExercisePlan?.exercises[today];
                
                return (
                  <View key={student.id} style={styles.studentMealSection}>
                    <TouchableOpacity
                      style={styles.studentHeader}
                      onPress={() => toggleExerciseExpansion(student.id)}>
                      <View style={styles.studentHeaderContent}>
                        <View style={styles.studentInfoRow}>
                          <Text style={[styles.studentName, { color: palette.textPrimary }]}>
                            🏃 {student.name}
                          </Text>
                          <MaterialCommunityIcons 
                            name={isExpanded ? "chevron-up" : "chevron-down"} 
                            size={20} 
                            color={palette.textMuted} 
                          />
                        </View>
                        <Text style={[styles.studentDetails, { color: palette.textMuted }]}>
                          Age: {student.age} • BMI: {student.bmi.toFixed(1)}
                        </Text>
                        <View style={styles.exerciseSummary}>
                          <Text style={[styles.viewDetailsText, { color: palette.accentWarm }]}>
                            {isExpanded ? "Hide exercises" : "View all exercises"} {isExpanded ? "↑" : "↓"}
                          </Text>
                          <Text style={[styles.timelineStatus, { color: palette.textMuted }]}>
                            {completedExercisePlans}/{totalExercisePlans} completed ({exercisePlanProgress}%)
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    
                    {isExpanded && todayExercises && (
                      <View style={styles.mealsList}>
                        <View style={styles.exerciseSummary}>
                          <View style={styles.stat}>
                            <Text style={[styles.metricValue, { color: palette.textPrimary }]}>
                              {completedExercisePlans}/{totalExercisePlans}
                            </Text>
                            <Text style={[styles.metricCaption, { color: palette.textMuted }]}>exercises completed</Text>
                          </View>
                          <View style={styles.stat}>
                            <Text style={[styles.metricValue, { color: palette.textPrimary }]}>
                              {exercisePlanProgress}%
                            </Text>
                            <Text style={[styles.metricCaption, { color: palette.textMuted }]}>daily progress</Text>
                          </View>
                        </View>
                        <Divider style={styles.divider} />
                        <ProgressBar
                          progress={exercisePlanProgress / 100}
                          color={palette.accentWarm}
                          style={styles.progress}
                        />
                        
                        {/* Individual Exercise Items */}
                        <View style={styles.exerciseItemsList}>
                          <View style={styles.timelineRow}>
                            <View style={[styles.timelineBullet, { backgroundColor: todayExercises.completed.mobility ? palette.accentLime : palette.bullet }]} />
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.timelineTitle, { color: palette.textPrimary }]}>
                                🤸 Mobility
                              </Text>
                              <Text style={[styles.timelineSubtitle, { color: palette.textMuted }]}>
                                {todayExercises.mobility.name} · {todayExercises.mobility.duration} min · {todayExercises.mobility.calories} kcal
                              </Text>
                              <Text style={[styles.timelineStatus, { color: todayExercises.completed.mobility ? palette.accentLime : palette.textMuted }]}>
                                {todayExercises.completed.mobility ? '✅ Completed' : '⏳ Pending'}
                              </Text>
                            </View>
                            <Chip 
                              compact 
                              style={{ backgroundColor: palette.pillBg }}
                              textStyle={{ fontSize: 11 }}>
                              {todayExercises.mobility.difficulty}
                            </Chip>
                          </View>
                          
                          <View style={styles.timelineRow}>
                            <View style={[styles.timelineBullet, { backgroundColor: todayExercises.completed.strength ? palette.accentLime : palette.bullet }]} />
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.timelineTitle, { color: palette.textPrimary }]}>
                                💪 Strength
                              </Text>
                              <Text style={[styles.timelineSubtitle, { color: palette.textMuted }]}>
                                {todayExercises.strength.name} · {todayExercises.strength.duration} min · {todayExercises.strength.calories} kcal
                              </Text>
                              <Text style={[styles.timelineStatus, { color: todayExercises.completed.strength ? palette.accentLime : palette.textMuted }]}>
                                {todayExercises.completed.strength ? '✅ Completed' : '⏳ Pending'}
                              </Text>
                            </View>
                            <Chip 
                              compact 
                              style={{ backgroundColor: palette.pillBg }}
                              textStyle={{ fontSize: 11 }}>
                              {todayExercises.strength.difficulty}
                            </Chip>
                          </View>
                          
                          <View style={styles.timelineRow}>
                            <View style={[styles.timelineBullet, { backgroundColor: todayExercises.completed.cardio ? palette.accentLime : palette.bullet }]} />
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.timelineTitle, { color: palette.textPrimary }]}>
                                🏃 Cardio
                              </Text>
                              <Text style={[styles.timelineSubtitle, { color: palette.textMuted }]}>
                                {todayExercises.cardio.name} · {todayExercises.cardio.duration} min · {todayExercises.cardio.calories} kcal
                              </Text>
                              <Text style={[styles.timelineStatus, { color: todayExercises.completed.cardio ? palette.accentLime : palette.textMuted }]}>
                                {todayExercises.completed.cardio ? '✅ Completed' : '⏳ Pending'}
                              </Text>
                            </View>
                            <Chip 
                              compact 
                              style={{ backgroundColor: palette.pillBg }}
                              textStyle={{ fontSize: 11 }}>
                              {todayExercises.cardio.difficulty}
                            </Chip>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: palette.textMuted }]}>
                  No exercise plans generated yet. Select a student and generate a plan from the Exercise tab.
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.sectionCard}>
          <Card.Title
            title="Mindful screen use"
            subtitle="7-day average"
            titleStyle={[styles.cardTitle, { color: palette.textPrimary }]}
            subtitleStyle={[styles.cardSubtitle, { color: palette.textMuted }]}
          />
          <Card.Content>
            <View style={styles.screenRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.metricValue, { color: palette.textPrimary }]}>{weeklyAvgScreen} min</Text>
                <Text style={[styles.metricCaption, { color: palette.textMuted }]}>avg daily use</Text>
              </View>
              <View>
                <Text style={[styles.metricValue, { color: palette.textPrimary }]}>{screenLimit} min</Text>
                <Text style={[styles.metricCaption, { color: palette.textMuted }]}>personal limit</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const CardIcon =
  (icon: string, color: string) =>
  (props: { size?: number; color?: string }) =>
    <MaterialCommunityIcons {...props} name={icon as any} size={20} color={color} />;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 4,
    position: 'relative',
  },
  scroll: {
    paddingHorizontal: 4,
    gap: 16,
    position: 'relative',
    zIndex: 1,
  },
  
  // App header styles
  appHeader: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: -4,
    right: -4,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appHeaderText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'left',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  
  heroWrapper: {
    borderRadius: 32,
  },
  heroCard: {
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 8,
    backgroundColor: 'white',
    shadowColor: '#ff006e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  heroGradient: {
    padding: 24,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  heroGreeting: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  heroSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.light,
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 16,
  },
  heroMetaCard: {
    flex: 1,
    borderRadius: 22,
    padding: 16,
    gap: 6,
    minWidth: 0,
  },
  heroMetaLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    lineHeight: 20,
    fontFamily: fonts.light,
  },
  heroMetaValue: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: fonts.bold,
  },
  heroMetaValueSmall: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
    fontFamily: fonts.medium,
  },
  heroPill: {
    marginTop: 4,
    borderRadius: 999,
  },
  heroProgressTrack: {
    marginTop: 8,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 999,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    borderRadius: 24,
    elevation: 4,
    minWidth: 0,
    paddingHorizontal: 4,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: fonts.medium,
    letterSpacing: 0,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    letterSpacing: -0.1,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: fonts.light,
    letterSpacing: 0.2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
    fontFamily: fonts.bold,
  },
  metricCaption: {
    marginTop: 1,
    fontSize: 10,
    fontFamily: fonts.light,
  },
  progress: {
    marginTop: 6,
    height: 4,
    borderRadius: 4,
  },
  sectionCard: {
    borderRadius: 24,
    elevation: 4,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  timelineBullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.medium,
  },
  timelineSubtitle: {
    fontSize: 12,
    fontFamily: fonts.light,
  },
  exerciseSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
  },
  stat: {
    alignItems: 'center',
    minWidth: 80,
  },
  divider: {
    marginVertical: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  taskChip: {
    borderRadius: 16,
  },
  studentInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
  },
  timelineStatus: {
    fontSize: 11,
    fontFamily: fonts.medium,
    marginTop: 4,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    textAlign: 'center',
    lineHeight: 18,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  studentDetails: {
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  studentMealSection: {
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  studentHeader: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  studentHeaderContent: {
    flex: 1,
  },
  studentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealsList: {
    padding: 12,
  },
  exerciseItemsList: {
    marginTop: 12,
  },
  viewDetailsText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    marginTop: 4,
  },
  moreMealsText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  screenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  floatingBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    backgroundColor: 'white',
  },
  floatingIcon: {
    position: 'absolute',
    zIndex: 0,
  },
});

import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, View } from 'react-native';
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
  const { meals, exerciseTasks, screenSessions, currentMealPlan, currentExercisePlan, students } = useAppSelector((state) => state.tracker);

  const heroAnim = useRef(new Animated.Value(0)).current;

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

  // Alert when screen time exceeds limit
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
                    Today's energy
                  </Text>
                  <Text style={[styles.heroMetaValue, { color: 'white' }]}>
                    {caloriesConsumed}/{calorieTarget} kcal
                  </Text>
                  <View style={styles.heroProgressTrack}>
                    <View
                      style={[
                        styles.heroProgressFill,
                        { width: `${calorieProgress * 100}%`, backgroundColor: palette.accentLime },
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
              title="Calories"
              subtitle="Today"
              left={CardIcon('fire', palette.accentWarm)}
              titleStyle={[styles.metricTitle, { color: palette.textPrimary }]}
              subtitleStyle={[styles.cardSubtitle, { color: palette.textMuted }]}
            />
            <Card.Content>
              <Text style={[styles.metricValue, { color: palette.textPrimary }]}>{caloriesConsumed} kcal</Text>
              <Text style={[styles.metricCaption, { color: palette.textMuted }]}>Goal {calorieTarget} kcal</Text>
              <ProgressBar
                progress={calorieProgress}
                color={palette.accentWarm}
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
            title="Meals timeline"
            subtitle="Latest check-ins"
            titleStyle={[styles.cardTitle, { color: palette.textPrimary }]}
            subtitleStyle={[styles.cardSubtitle, { color: palette.textMuted }]}
          />
          <Card.Content>
            {meals.slice(0, 3).map((meal) => (
              <View key={meal.id} style={styles.timelineRow}>
                <View style={[styles.timelineBullet, { backgroundColor: palette.bullet }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.timelineTitle, { color: palette.textPrimary }]}>{meal.foodName}</Text>
                  <Text style={[styles.timelineSubtitle, { color: palette.textMuted }]}>
                    {meal.calories} kcal ·{' '}
                    {new Date(meal.loggedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Chip compact style={{ backgroundColor: palette.pillBg }}>
                  {meal.portion} {meal.unit}
                </Chip>
              </View>
            ))}
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
              <>
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
                <View style={styles.chipRow}>
                  <Chip
                    icon={currentExercisePlan?.exercises[new Date().toISOString().split('T')[0]]?.completed.mobility ? 'check' : 'clock-outline'}
                    mode={currentExercisePlan?.exercises[new Date().toISOString().split('T')[0]]?.completed.mobility ? 'flat' : 'outlined'}
                    style={[styles.taskChip, { backgroundColor: palette.pillBg }]}
                    selectedColor={palette.textPrimary}>
                    Mobility
                  </Chip>
                  <Chip
                    icon={currentExercisePlan?.exercises[new Date().toISOString().split('T')[0]]?.completed.strength ? 'check' : 'clock-outline'}
                    mode={currentExercisePlan?.exercises[new Date().toISOString().split('T')[0]]?.completed.strength ? 'flat' : 'outlined'}
                    style={[styles.taskChip, { backgroundColor: palette.pillBg }]}
                    selectedColor={palette.textPrimary}>
                    Strength
                  </Chip>
                  <Chip
                    icon={currentExercisePlan?.exercises[new Date().toISOString().split('T')[0]]?.completed.cardio ? 'check' : 'clock-outline'}
                    mode={currentExercisePlan?.exercises[new Date().toISOString().split('T')[0]]?.completed.cardio ? 'flat' : 'outlined'}
                    style={[styles.taskChip, { backgroundColor: palette.pillBg }]}
                    selectedColor={palette.textPrimary}>
                    Cardio
                  </Chip>
                </View>
                <View style={styles.studentInfo}>
                  <Text style={[styles.studentName, { color: palette.textPrimary }]}>
                    {studentsWithPlans[0]?.name}
                  </Text>
                  <Text style={[styles.studentDetails, { color: palette.textMuted }]}>
                    Age: {studentsWithPlans[0]?.age} • BMI: {studentsWithPlans[0]?.bmi.toFixed(1)}
                  </Text>
                </View>
              </>
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
            title="Meal plan"
            subtitle="Daily nutrition goals"
            titleStyle={[styles.cardTitle, { color: palette.textPrimary }]}
            subtitleStyle={[styles.cardSubtitle, { color: palette.textMuted }]}
          />
          <Card.Content>
            <View style={styles.exerciseSummary}>
              <View style={styles.stat}>
                <Text style={[styles.metricValue, { color: palette.textPrimary }]}>
                  {completedMealPlans}/{totalMealPlans}
                </Text>
                <Text style={[styles.metricCaption, { color: palette.textMuted }]}>meals completed</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.metricValue, { color: palette.textPrimary }]}>
                  {mealPlanProgress}%
                </Text>
                <Text style={[styles.metricCaption, { color: palette.textMuted }]}>daily progress</Text>
              </View>
            </View>
            <Divider style={styles.divider} />
            <ProgressBar
              progress={mealPlanProgress / 100}
              color={palette.accentLime}
              style={styles.progress}
            />
            {currentMealPlan && (
              <View style={styles.chipRow}>
                <Chip
                  icon={currentMealPlan.meals[new Date().toISOString().split('T')[0]]?.consumed.breakfast ? 'check' : 'clock-outline'}
                  mode={currentMealPlan.meals[new Date().toISOString().split('T')[0]]?.consumed.breakfast ? 'flat' : 'outlined'}
                  style={[styles.taskChip, { backgroundColor: palette.pillBg }]}
                  selectedColor={palette.textPrimary}>
                  Breakfast
                </Chip>
                <Chip
                  icon={currentMealPlan.meals[new Date().toISOString().split('T')[0]]?.consumed.lunch ? 'check' : 'clock-outline'}
                  mode={currentMealPlan.meals[new Date().toISOString().split('T')[0]]?.consumed.lunch ? 'flat' : 'outlined'}
                  style={[styles.taskChip, { backgroundColor: palette.pillBg }]}
                  selectedColor={palette.textPrimary}>
                  Lunch
                </Chip>
                <Chip
                  icon={currentMealPlan.meals[new Date().toISOString().split('T')[0]]?.consumed.dinner ? 'check' : 'clock-outline'}
                  mode={currentMealPlan.meals[new Date().toISOString().split('T')[0]]?.consumed.dinner ? 'flat' : 'outlined'}
                  style={[styles.taskChip, { backgroundColor: palette.pillBg }]}
                  selectedColor={palette.textPrimary}>
                  Dinner
                </Chip>
                <Chip
                  icon={currentMealPlan.meals[new Date().toISOString().split('T')[0]]?.consumed.snack ? 'check' : 'clock-outline'}
                  mode={currentMealPlan.meals[new Date().toISOString().split('T')[0]]?.consumed.snack ? 'flat' : 'outlined'}
                  style={[styles.taskChip, { backgroundColor: palette.pillBg }]}
                  selectedColor={palette.textPrimary}>
                  Snack
                </Chip>
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

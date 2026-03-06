import React, { useMemo, useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button, Card, Text, useTheme, Checkbox, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import type { RootState } from '@/src/store';
import { 
  createWeeklyMealPlan,
  markMealCompleted,
  subscribeToMealPlan,
  type MealPlanPayload
} from '@/src/firebase/mealPlanApi';
import type { Student } from '@/types/tracker';
import { 
  SHELTER_HOME_WEEKLY_MENU, 
  getPortionGuidelinesByAge,
  calculateDailyNutrition,
  getTodayRegionalMealPlan,
  getRegionalMealPlan,
  REGION_OPTIONS,
  type DailyMealPlan,
  type DishCombination,
  type PortionGuideline,
  type Region
} from '@/src/constants/shelterHomeMealPlan';

const fonts = {
  regular: 'WorkSans_400Regular',
  medium: 'WorkSans_500Medium',
  semibold: 'WorkSans_600SemiBold',
  bold: 'WorkSans_700Bold',
} as const;

// Green theme for meals
const mealColors = {
  primary: '#16a34a',
  primaryLight: '#dcfce7',
  primaryDark: '#15803d',
  accent: '#22c55e',
  surface: '#f0fdf4',
};

export default function MealsScreen() {
  const theme = useTheme();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { students } = useAppSelector((state: RootState) => state.tracker);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentMealPlan, setCurrentMealPlanState] = useState<MealPlanPayload | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showPortionGuide, setShowPortionGuide] = useState(false);

  const palette = useMemo(() => ({
    background: theme.dark ? '#0f172a' : '#f8fafc',
    surface: theme.dark ? '#1e293b' : '#ffffff',
    textPrimary: theme.dark ? '#f1f5f9' : '#1e293b',
    textSecondary: theme.dark ? '#94a3b8' : '#64748b',
    border: theme.dark ? '#334155' : '#e2e8f0',
    accent: mealColors.primary,
    accentLight: mealColors.primaryLight,
    success: '#16a34a',
    error: '#ef4444',
  }), [theme.dark]);

  useEffect(() => {
    if (!user?.uid || !selectedStudent) return;

    const unsubscribe = subscribeToMealPlan(user.uid, selectedStudent.id, (mealPlan) => {
      setCurrentMealPlanState(mealPlan);
    });

    return () => unsubscribe();
  }, [user?.uid, selectedStudent?.id]);

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleGenerateMealPlan = async () => {
    if (!selectedStudent) {
      showMessage('Please select a student first.', 'error');
      return;
    }

    if (!user?.uid) {
      showMessage('User not authenticated', 'error');
      return;
    }

    try {
      const result = await createWeeklyMealPlan(
        user.uid,
        selectedStudent.id,
        selectedStudent.name,
        selectedStudent.age,
        selectedStudent.region || 'kolkata'
      );
      
      if (result.success) {
        showMessage(`${selectedStudent.region === 'delhi' ? 'Delhi' : 'Kolkata'} meal plan created for ${selectedStudent.name}`);
      } else {
        showMessage('Failed to create meal plan', 'error');
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      showMessage('Failed to generate meal plan', 'error');
    }
  };

  const handleMarkMealCompleted = async (date: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    if (!selectedStudent) return;

    if (!user?.uid) {
      showMessage('User not authenticated', 'error');
      return;
    }

    try {
      const currentStatus = currentMealPlan?.completedMeals?.[date]?.[mealType] || false;
      await markMealCompleted(user.uid, selectedStudent.id, date, mealType, !currentStatus);
      showMessage(`${mealType.charAt(0).toUpperCase() + mealType.slice(1)} ${!currentStatus ? 'marked as completed' : 'marked as pending'}`);
    } catch (error) {
      console.error('Error marking meal:', error);
      showMessage('Failed to update meal status', 'error');
    }
  };

  // Get today's day name
  const today = new Date();
  const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
  const todayDateStr = today.toISOString().split('T')[0];
  
  // Get today's meal plan from weekly menu
  const todayMealPlan = currentMealPlan?.weeklyMenu?.find((day: DailyMealPlan) => day.day === todayDayName);
  const todayCompleted = currentMealPlan?.completedMeals?.[todayDateStr];
  
  const todayProgress = todayMealPlan ? {
    completed: todayCompleted ? Object.values(todayCompleted).filter(Boolean).length : 0,
    total: 4,
    calories: calculateDailyNutrition(todayMealPlan).totalCalories,
  } : null;

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    if (!currentMealPlan?.weeklyMenu) return null;
    
    let totalCalories = 0;
    let completedMeals = 0;
    let totalMeals = 0;
    
    currentMealPlan.weeklyMenu.forEach((dayPlan: DailyMealPlan) => {
      const nutrition = calculateDailyNutrition(dayPlan);
      totalCalories += nutrition.totalCalories;
      totalMeals += 4;
    });
    
    // Count completed meals from completedMeals record
    if (currentMealPlan.completedMeals) {
      Object.values(currentMealPlan.completedMeals).forEach((day: Record<string, boolean>) => {
        Object.values(day).forEach((completed: boolean) => {
          if (completed) completedMeals++;
        });
      });
    }
    
    return {
      avgCalories: Math.round(totalCalories / 7),
      completedMeals,
      totalMeals,
      progress: totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0,
    };
  }, [currentMealPlan]);

  // Get portion guidelines for selected student
  const portionGuidelines = selectedStudent ? getPortionGuidelinesByAge(selectedStudent.age) : null;

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={[styles.header, { backgroundColor: mealColors.surface }]}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons name="food-apple" size={32} color={mealColors.primary} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: mealColors.primaryDark }]}>Meal Planning</Text>
              <Text style={[styles.headerSubtitle, { color: palette.textSecondary }]}>
                Shelter Home Nutrition Program
              </Text>
            </View>
          </View>
          
          {message && (
            <View style={[styles.messageBanner, { backgroundColor: message.type === 'success' ? mealColors.primaryLight : '#fef2f2' }]}>
              <MaterialCommunityIcons 
                name={message.type === 'success' ? 'check-circle' : 'alert-circle'} 
                size={20} 
                color={message.type === 'success' ? mealColors.primary : palette.error} 
              />
              <Text style={[styles.messageText, { color: message.type === 'success' ? mealColors.primaryDark : palette.error }]}>
                {message.text}
              </Text>
            </View>
          )}

          {/* Student Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>Select Student</Text>
            
            {students.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: palette.surface }]}>
                <MaterialCommunityIcons name="account-off" size={48} color={palette.textSecondary} />
                <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                  No students available. Add students from the Children tab.
                </Text>
              </View>
            ) : (
              <View style={styles.studentList}>
                {students.map((student) => (
                  <TouchableOpacity
                    key={student.id}
                    style={[
                      styles.studentItem,
                      { borderColor: palette.border, backgroundColor: palette.surface },
                      selectedStudent?.id === student.id && [styles.studentItemSelected, { borderColor: mealColors.primary, backgroundColor: mealColors.surface }],
                    ]}
                    onPress={() => setSelectedStudent(student)}>
                    <View style={styles.studentIcon}>
                      <MaterialCommunityIcons name="account-circle" size={40} color={selectedStudent?.id === student.id ? mealColors.primary : palette.textSecondary} />
                    </View>
                    <View style={styles.studentInfo}>
                      <Text style={[styles.studentName, { color: palette.textPrimary }]}>
                        {student.name}
                      </Text>
                      <Text style={[styles.studentMeta, { color: palette.textSecondary }]}>
                        Age {student.age} • {student.weight}kg • BMI {student.bmi.toFixed(1)} • {student.region === 'delhi' ? 'Delhi' : 'Kolkata'}
                      </Text>
                    </View>
                    {selectedStudent?.id === student.id && (
                      <MaterialCommunityIcons name="check-circle" size={24} color={mealColors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Portion Guidelines Card */}
          {selectedStudent && portionGuidelines && (
            <Card style={[styles.portionCard, { backgroundColor: palette.surface, borderColor: mealColors.primary }]}>
              <TouchableOpacity onPress={() => setShowPortionGuide(!showPortionGuide)}>
                <View style={styles.portionHeader}>
                  <MaterialCommunityIcons name="information" size={20} color={mealColors.primary} />
                  <Text style={[styles.portionTitle, { color: mealColors.primaryDark }]}>
                    Portion Guidelines ({portionGuidelines.ageRange})
                  </Text>
                  <MaterialCommunityIcons 
                    name={showPortionGuide ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={palette.textSecondary} 
                  />
                </View>
              </TouchableOpacity>
              
              {showPortionGuide && (
                <View style={styles.portionContent}>
                  <View style={styles.portionRow}>
                    <Text style={[styles.portionLabel, { color: palette.textSecondary }]}>Chapati</Text>
                    <Text style={[styles.portionValue, { color: palette.textPrimary }]}>{portionGuidelines.chapati} (30g flour each)</Text>
                  </View>
                  <View style={styles.portionRow}>
                    <Text style={[styles.portionLabel, { color: palette.textSecondary }]}>Rice (cooked)</Text>
                    <Text style={[styles.portionValue, { color: palette.textPrimary }]}>{portionGuidelines.rice}</Text>
                  </View>
                  <View style={styles.portionRow}>
                    <Text style={[styles.portionLabel, { color: palette.textSecondary }]}>Dal/Curry</Text>
                    <Text style={[styles.portionValue, { color: palette.textPrimary }]}>{portionGuidelines.dal}</Text>
                  </View>
                  <View style={styles.portionRow}>
                    <Text style={[styles.portionLabel, { color: palette.textSecondary }]}>Milk</Text>
                    <Text style={[styles.portionValue, { color: palette.textPrimary }]}>{portionGuidelines.milk}</Text>
                  </View>
                  <View style={styles.portionRow}>
                    <Text style={[styles.portionLabel, { color: palette.textSecondary }]}>Paneer (when served)</Text>
                    <Text style={[styles.portionValue, { color: palette.textPrimary }]}>{portionGuidelines.paneer}g</Text>
                  </View>
                  <View style={styles.portionRow}>
                    <Text style={[styles.portionLabel, { color: palette.textSecondary }]}>Chicken (when served)</Text>
                    <Text style={[styles.portionValue, { color: palette.textPrimary }]}>{portionGuidelines.chicken}g</Text>
                  </View>
                  <View style={styles.portionRow}>
                    <Text style={[styles.portionLabel, { color: palette.textSecondary }]}>Legumes (Rajma/Chole)</Text>
                    <Text style={[styles.portionValue, { color: palette.textPrimary }]}>{portionGuidelines.legumes}</Text>
                  </View>
                </View>
              )}
            </Card>
          )}

          {/* Quick Stats */}
          {selectedStudent && (
            <View style={[styles.statsCard, { backgroundColor: palette.surface, borderColor: mealColors.primary }]}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="account" size={24} color={mealColors.primary} />
                  <Text style={[styles.statValue, { color: palette.textPrimary }]}>{selectedStudent.name}</Text>
                  <Text style={[styles.statLabel, { color: palette.textSecondary }]}>Age {selectedStudent.age}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="fire" size={24} color={mealColors.primary} />
                  <Text style={[styles.statValue, { color: palette.textPrimary }]}>{selectedStudent.dailyCalorieNeeds}</Text>
                  <Text style={[styles.statLabel, { color: palette.textSecondary }]}>Daily Target</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="scale-bathroom" size={24} color={mealColors.primary} />
                  <Text style={[styles.statValue, { color: palette.textPrimary }]}>{selectedStudent.bmi.toFixed(1)}</Text>
                  <Text style={[styles.statLabel, { color: palette.textSecondary }]}>BMI</Text>
                </View>
              </View>
            </View>
          )}

          {/* Today's Progress */}
          {todayProgress && (
            <View style={[styles.progressCard, { backgroundColor: mealColors.surface }]}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressTitle, { color: mealColors.primaryDark }]}>Today's Progress</Text>
                <Text style={[styles.progressPercent, { color: mealColors.primary }]}>
                  {Math.round((todayProgress.completed / todayProgress.total) * 100)}%
                </Text>
              </View>
              <ProgressBar 
                progress={todayProgress.completed / todayProgress.total} 
                color={mealColors.primary}
                style={styles.progressBar}
              />
              <Text style={[styles.progressDetail, { color: palette.textSecondary }]}>
                {todayProgress.completed} of {todayProgress.total} meals completed • {todayProgress.calories} calories
              </Text>
            </View>
          )}

          {/* Weekly Stats */}
          {weeklyStats && (
            <View style={[styles.statsGrid, { backgroundColor: palette.surface }]}>
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="calendar-week" size={24} color={mealColors.primary} />
                <Text style={[styles.statBoxValue, { color: palette.textPrimary }]}>{weeklyStats.avgCalories}</Text>
                <Text style={[styles.statBoxLabel, { color: palette.textSecondary }]}>Avg Daily Cal</Text>
              </View>
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="check-all" size={24} color={mealColors.primary} />
                <Text style={[styles.statBoxValue, { color: palette.textPrimary }]}>{weeklyStats.completedMeals}/{weeklyStats.totalMeals}</Text>
                <Text style={[styles.statBoxLabel, { color: palette.textSecondary }]}>Meals Done</Text>
              </View>
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="chart-line" size={24} color={mealColors.primary} />
                <Text style={[styles.statBoxValue, { color: palette.textPrimary }]}>{weeklyStats.progress}%</Text>
                <Text style={[styles.statBoxLabel, { color: palette.textSecondary }]}>Weekly Progress</Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          {selectedStudent && (
            <View style={styles.section}>
              <Button
                mode="contained"
                onPress={handleGenerateMealPlan}
                style={[styles.actionButton, { backgroundColor: mealColors.primary }]}
                labelStyle={styles.actionButtonLabel}
                icon={({size, color}) => <MaterialCommunityIcons name="calendar-plus" size={size} color={color} />}
                textColor="#ffffff">
                Generate Weekly Plan
              </Button>
            </View>
          )}

          {/* Weekly Plan */}
          {currentMealPlan && selectedStudent && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>
                Weekly Plan for {selectedStudent.name}
              </Text>
              
              <View style={styles.daysList}>
                {currentMealPlan.weeklyMenu?.map((dayPlan: DailyMealPlan, index: number) => {
                  // Calculate date for this day (starting from today)
                  const dateObj = new Date(today);
                  dateObj.setDate(today.getDate() + index);
                  const dateStr = dateObj.toISOString().split('T')[0];
                  
                  const isToday = dayPlan.day === todayDayName;
                  const isExpanded = expandedDay === dayPlan.day;
                  const dayCompleted = currentMealPlan.completedMeals?.[dateStr] || {
                    breakfast: false, lunch: false, dinner: false, snack: false
                  };
                  const completedCount = Object.values(dayCompleted).filter(Boolean).length;
                  const dailyNutrition = calculateDailyNutrition(dayPlan);
                  
                  return (
                    <View
                      key={dayPlan.day}
                      style={[
                        styles.dayCard,
                        { backgroundColor: palette.surface, borderColor: isToday ? mealColors.primary : palette.border },
                        isToday && styles.dayCardToday,
                      ]}>
                      <TouchableOpacity
                        style={styles.dayHeader}
                        onPress={() => setExpandedDay(isExpanded ? null : dayPlan.day)}>
                        <View style={styles.dayInfo}>
                          <View style={[styles.dayIcon, { backgroundColor: isToday ? mealColors.primaryLight : 'transparent' }]}>
                            <Text style={[styles.dayName, { color: isToday ? mealColors.primaryDark : palette.textPrimary }]}>
                              {dayPlan.day.slice(0, 3)}
                            </Text>
                          </View>
                          <View>
                            <Text style={[styles.dayDate, { color: palette.textSecondary }]}>
                              {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Text>
                            {isToday && <Text style={[styles.todayBadge, { color: mealColors.primary }]}>Today</Text>}
                            {dayPlan.specialNote && (
                              <Text style={[styles.specialNote, { color: mealColors.primary }]}>{dayPlan.specialNote}</Text>
                            )}
                          </View>
                        </View>
                        <View style={styles.dayStats}>
                          <View style={[styles.completionBadge, { backgroundColor: completedCount === 4 ? mealColors.primaryLight : palette.border }]}>
                            <Text style={[styles.completionText, { color: completedCount === 4 ? mealColors.primaryDark : palette.textSecondary }]}>
                              {completedCount}/4
                            </Text>
                          </View>
                          <Text style={[styles.dayStat, { color: palette.textSecondary }]}>
                            {dailyNutrition.totalCalories} cal
                          </Text>
                          <MaterialCommunityIcons 
                            name={isExpanded ? "chevron-up" : "chevron-down"} 
                            size={20} 
                            color={palette.textSecondary} 
                          />
                        </View>
                      </TouchableOpacity>
                      
                      {isExpanded && (
                        <View style={styles.mealsContainer}>
                          {([
                            { key: 'breakfast', label: 'Breakfast', meal: dayPlan.breakfast, icon: 'coffee' },
                            { key: 'lunch', label: 'Lunch', meal: dayPlan.lunch, icon: 'food' },
                            { key: 'dinner', label: 'Dinner', meal: dayPlan.dinner, icon: 'food-variant' },
                            { key: 'snack', label: 'Snack', meal: dayPlan.snack, icon: 'apple' },
                          ] as const).map(({ key, label, meal, icon }) => (
                            <View key={key} style={[styles.mealRow, { borderColor: palette.border }]}>
                              <View style={styles.mealContent}>
                                <View style={styles.mealHeader}>
                                  <View style={styles.mealLabelRow}>
                                    <MaterialCommunityIcons name={icon as any} size={18} color={mealColors.primary} />
                                    <Text style={[styles.mealLabel, { color: mealColors.primary }]}>{label}</Text>
                                  </View>
                                  <Checkbox
                                    status={dayCompleted[key] ? 'checked' : 'unchecked'}
                                    onPress={() => handleMarkMealCompleted(dateStr, key)}
                                    color={mealColors.primary}
                                  />
                                </View>
                                
                                {/* Dish Combination Name */}
                                <Text style={[styles.mealName, { color: palette.textPrimary }]}>{meal.name}</Text>
                                
                                {/* Individual Items */}
                                <View style={styles.itemsList}>
                                  {meal.items.map((item, idx) => (
                                    <View key={idx} style={styles.itemRow}>
                                      <MaterialCommunityIcons name="circle-small" size={16} color={palette.textSecondary} />
                                      <Text style={[styles.itemText, { color: palette.textSecondary }]}>{item}</Text>
                                    </View>
                                  ))}
                                </View>
                                
                                {/* Nutrition & Tags */}
                                <View style={styles.mealMetaRow}>
                                  <Text style={[styles.mealMeta, { color: palette.textSecondary }]}>
                                    {meal.calories} cal • {meal.protein}g protein
                                  </Text>
                                </View>
                                <View style={styles.tagsRow}>
                                  {meal.iron && (
                                    <View style={[styles.tag, { backgroundColor: '#fee2e2' }]}>
                                      <Text style={[styles.tagText, { color: '#dc2626' }]}>Iron</Text>
                                    </View>
                                  )}
                                  {meal.calcium && (
                                    <View style={[styles.tag, { backgroundColor: '#dbeafe' }]}>
                                      <Text style={[styles.tagText, { color: '#2563eb' }]}>Calcium</Text>
                                    </View>
                                  )}
                                  {meal.energyDense && (
                                    <View style={[styles.tag, { backgroundColor: '#fef3c7' }]}>
                                      <Text style={[styles.tagText, { color: '#d97706' }]}>Energy</Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                            </View>
                          ))}
                          
                          <View style={[styles.daySummary, { backgroundColor: mealColors.surface }]}>
                            <Text style={[styles.daySummaryText, { color: mealColors.primaryDark }]}>
                              Daily Total: {dailyNutrition.totalCalories} calories • {dailyNutrition.totalProtein}g protein
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}
          
          {!selectedStudent && (
            <View style={[styles.emptyCard, { backgroundColor: palette.surface }]}>
              <MaterialCommunityIcons name="account-search" size={48} color={palette.textSecondary} />
              <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                Select a student to view their meal plan
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#16a34a20',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: fonts.bold,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  messageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  messageText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  portionCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  portionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  portionTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    flex: 1,
  },
  portionContent: {
    marginTop: 16,
    gap: 8,
  },
  portionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  portionLabel: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  portionValue: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  statsCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },
  progressCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#16a34a20',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fonts.bold,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressDetail: {
    fontSize: 13,
    fontFamily: fonts.regular,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statBoxValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fonts.bold,
    marginTop: 8,
  },
  statBoxLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 4,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginTop: 12,
  },
  studentList: {
    gap: 10,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  studentItemSelected: {
    borderWidth: 2,
  },
  studentIcon: {
    marginRight: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  studentMeta: {
    fontSize: 13,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  actionButton: {
    borderRadius: 10,
    marginBottom: 10,
  },
  actionButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    paddingVertical: 4,
  },
  daysList: {
    gap: 10,
  },
  dayCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dayCardToday: {
    borderWidth: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayName: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  dayDate: {
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  todayBadge: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  specialNote: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    marginTop: 2,
  },
  dayStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  completionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completionText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  dayStat: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  mealsContainer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  mealRow: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
  },
  mealContent: {
    flex: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mealLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mealName: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    marginBottom: 6,
  },
  itemsList: {
    marginLeft: 4,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    flex: 1,
  },
  mealMetaRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  mealMeta: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  daySummary: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  daySummaryText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    textAlign: 'center',
  },
});

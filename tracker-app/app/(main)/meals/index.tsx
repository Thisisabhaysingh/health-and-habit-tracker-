import React, { useMemo, useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { Button, Card, Chip, IconButton, Text, TextInput, useTheme, Divider, ProgressBar, Checkbox } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import type { RootState } from '@/src/store';
import { 
  createMealPlan,
  updateMealConsumption as updateMealConsumptionFirebase,
  subscribeToCurrentMealPlan
} from '@/src/firebase/trackerApi';
import type { PortionUnit, Student, MealPlan, MealWithGrams } from '@/types/tracker';
import AnimatedBackground from '@/components/AnimatedBackground';
import { INDIAN_MEAL_LIBRARY, REGIONS, getMealsByRegionAndCategory, getBMISuggestedMeals, type MealLibraryItem } from '@/constants/mealLibrary';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const SCREEN_WIDTH = Dimensions.get('window').width - 40;

// BMI-based calorie calculation and meal generation functions
const calculateBMI = (height: number, weight: number): number => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

const getDietType = (bmi: number): string => {
  if (bmi < 18.5) return 'High-Calorie Diet';
  if (bmi < 25) return 'Balanced Diet';
  if (bmi < 30) return 'Low-Calorie Diet';
  return 'Weight Loss Diet';
};

const calculateDailyCalorieNeeds = (age: number, gender: string = 'male', bmi: number): number => {
  let baseCalories = 0;
  
  // Base calories by age
  if (age >= 8 && age <= 9) baseCalories = 1600;
  else if (age >= 10 && age <= 11) baseCalories = 1800;
  else if (age >= 12 && age <= 13) baseCalories = 2000;
  else if (age >= 14 && age <= 15) baseCalories = 2200;
  else if (age >= 16 && age <= 18) baseCalories = 2400;
  else baseCalories = 2000;
  
  // Adjust based on BMI
  if (bmi < 18.5) return baseCalories + 300; // Underweight needs more calories
  if (bmi < 25) return baseCalories; // Normal weight
  if (bmi < 30) return baseCalories - 200; // Overweight needs fewer calories
  return baseCalories - 400; // Obese needs significant calorie reduction
};

const generateStudentMealPlan = (student: Student): MealPlan => {
  const today = new Date();
  const mealPlan: MealPlan = {
    id: `plan-${student.id}-${today.getTime()}`,
    studentId: student.id,
    weekStartDate: today.toISOString().split('T')[0],
    meals: {},
    createdAt: today.toISOString()
  };

  // Filter meals suitable for student's calorie needs
  const maxMealCalories = student.dailyCalorieNeeds / 4; // Max 25% of daily calories per meal
  const suitableMeals = INDIAN_MEAL_LIBRARY.filter(meal => meal.calories <= maxMealCalories);
  
  const breakfastMeals = suitableMeals.filter(m => m.category === 'breakfast');
  const lunchMeals = suitableMeals.filter(m => m.category === 'lunch');
  const dinnerMeals = suitableMeals.filter(m => m.category === 'dinner');
  const snackMeals = suitableMeals.filter(m => m.category === 'snack');

  const getRandomMeal = (mealArray: MealLibraryItem[]) => {
    return mealArray[Math.floor(Math.random() * mealArray.length)];
  };

  // Generate meals for next 7 days
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    const breakfast = getRandomMeal(breakfastMeals.length > 0 ? breakfastMeals : suitableMeals);
    const lunch = getRandomMeal(lunchMeals.length > 0 ? lunchMeals : suitableMeals);
    const dinner = getRandomMeal(dinnerMeals.length > 0 ? dinnerMeals : suitableMeals);
    const snack = getRandomMeal(snackMeals.length > 0 ? snackMeals : suitableMeals);
    
    const totalCalories = breakfast.calories + lunch.calories + dinner.calories + snack.calories;
    
    // Calculate grams for each meal based on calorie density
    const breakfastGrams = Math.round(breakfast.calories * 0.25);
    const lunchGrams = Math.round(lunch.calories * 0.3);
    const dinnerGrams = Math.round(dinner.calories * 0.35);
    const snackGrams = Math.round(snack.calories * 0.2);
    const totalGrams = breakfastGrams + lunchGrams + dinnerGrams + snackGrams;
    
    mealPlan.meals[dateStr] = {
      breakfast: { ...breakfast, grams: breakfastGrams },
      lunch: { ...lunch, grams: lunchGrams },
      dinner: { ...dinner, grams: dinnerGrams },
      snack: { ...snack, grams: snackGrams },
      totalCalories,
      totalGrams,
      consumed: {
        breakfast: false,
        lunch: false,
        dinner: false,
        snack: false
      }
    };
  }

  return mealPlan;
};

const fonts = {
  light: 'WorkSans_300Light',
  regular: 'WorkSans_400Regular',
  medium: 'WorkSans_500Medium',
  semibold: 'WorkSans_600SemiBold',
  bold: 'WorkSans_700Bold',
} as const;

export default function MealsScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { students } = useAppSelector((state: RootState) => state.tracker);

  // Meal plan states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createPalette = (isDark: boolean) => ({
    textPrimary: isDark ? '#E9FFF7' : '#0f172a',
    textMuted: isDark ? 'rgba(233,255,247,0.7)' : '#475569',
    background: isDark ? '#0f172a' : '#f8fafc',
    surface: isDark ? '#1e293b' : '#ffffff',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e2e8f0',
    chipBg: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.05)',
    inputBg: isDark ? '#334155' : '#ffffff',
    accent: '#10b981',
  });

  const palette = useMemo(() => createPalette(theme.dark), [theme.dark]);

  // Load current meal plan when student is selected
  useEffect(() => {
    if (!user?.uid || !selectedStudent) return;

    const unsubscribe = subscribeToCurrentMealPlan(user.uid, selectedStudent.id, (mealPlan) => {
      setCurrentMealPlan(mealPlan);
    });

    return () => unsubscribe();
  }, [user?.uid, selectedStudent?.id]);

  const handleGenerateMealPlan = async () => {
    if (!selectedStudent) {
      setError('Please select a student first.');
      return;
    }

    if (!user?.uid) {
      setError('❌ User not authenticated');
      return;
    }

    try {
      const newMealPlan = generateStudentMealPlan(selectedStudent);
      const mealPlanPayload: Omit<MealPlan, 'id'> = {
        studentId: newMealPlan.studentId,
        weekStartDate: newMealPlan.weekStartDate,
        meals: newMealPlan.meals,
        createdAt: newMealPlan.createdAt
      };

      await createMealPlan(user.uid, mealPlanPayload);
      setError(`✅ 7-day meal plan generated for ${selectedStudent.name}!`);
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      setError('❌ Failed to generate meal plan. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleMarkMealCompleted = async (date: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    if (!currentMealPlan) return;

    if (!user?.uid) {
      setError('❌ User not authenticated');
      return;
    }

    try {
      await updateMealConsumptionFirebase(user.uid, currentMealPlan.id, date, mealType);
      setError(`✅ ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} marked as completed!`);
      setTimeout(() => setError(null), 2000);
    } catch (error) {
      console.error('Error marking meal as completed:', error);
      setError('❌ Failed to mark meal as completed. Please try again.');
      setTimeout(() => setError(null), 2000);
    }
  };

  const handleDownloadPDF = async () => {
    if (!currentMealPlan || !selectedStudent) {
      setError('Please generate a meal plan first.');
      return;
    }

    try {
      // Generate HTML for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>7-Day Meal Plan - ${selectedStudent.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
            .header h1 { color: #10b981; margin: 0; }
            .header p { margin: 5px 0; color: #666; }
            .student-info { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .day-section { margin-bottom: 25px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
            .day-header { background: #10b981; color: white; padding: 12px; font-weight: bold; font-size: 18px; }
            .meal-table { width: 100%; border-collapse: collapse; }
            .meal-table th { background: #f1f5f9; padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            .meal-table td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
            .meal-table tr:last-child td { border-bottom: none; }
            .calories { font-weight: bold; color: #10b981; }
            .total-row { background: #f8fafc; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🍽️ 7-Day Meal Plan</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="student-info">
            <strong>Student:</strong> ${selectedStudent.name}<br>
            <strong>Age:</strong> ${selectedStudent.age} years<br>
            <strong>Height:</strong> ${selectedStudent.height} cm<br>
            <strong>Weight:</strong> ${selectedStudent.weight} kg<br>
            <strong>Daily Calorie Target:</strong> ${selectedStudent.dailyCalorieNeeds} calories
          </div>
          
          ${Object.entries(currentMealPlan.meals).map(([date, dayMeals]) => {
            const dateObj = new Date(date);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            
            return `
              <div class="day-section">
                <div class="day-header">${dayName} - ${dateStr}</div>
                <table class="meal-table">
                  <thead>
                    <tr>
                      <th>Meal</th>
                      <th>Food Item</th>
                      <th>Calories</th>
                      <th>Portion (g)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>🌅 Breakfast</td>
                      <td>${dayMeals.breakfast.name}</td>
                      <td class="calories">${dayMeals.breakfast.calories}</td>
                      <td>${dayMeals.breakfast.grams}g</td>
                    </tr>
                    <tr>
                      <td>☀️ Lunch</td>
                      <td>${dayMeals.lunch.name}</td>
                      <td class="calories">${dayMeals.lunch.calories}</td>
                      <td>${dayMeals.lunch.grams}g</td>
                    </tr>
                    <tr>
                      <td>🌆 Dinner</td>
                      <td>${dayMeals.dinner.name}</td>
                      <td class="calories">${dayMeals.dinner.calories}</td>
                      <td>${dayMeals.dinner.grams}g</td>
                    </tr>
                    <tr>
                      <td>🍎 Snack</td>
                      <td>${dayMeals.snack.name}</td>
                      <td class="calories">${dayMeals.snack.calories}</td>
                      <td>${dayMeals.snack.grams}g</td>
                    </tr>
                    <tr class="total-row">
                      <td colspan="2"><strong>Daily Total</strong></td>
                      <td class="calories"><strong>${dayMeals.totalCalories}</strong></td>
                      <td><strong>${dayMeals.totalGrams}g</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            `;
          }).join('')}
          
          <div class="footer">
            <p>This meal plan is generated based on the student's BMI and daily calorie requirements.</p>
            <p>Consult with a nutritionist for personalized dietary advice.</p>
          </div>
        </body>
        </html>
      `;

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // Share the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Meal Plan PDF',
          UTI: 'com.adobe.pdf',
        });
      } else {
        setError('❌ Sharing is not available on this device');
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('❌ Failed to generate PDF. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: palette.background }]}>
      <AnimatedBackground />
      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: 'transparent' }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: 60 }]}
          showsVerticalScrollIndicator={false}>
          
          {/* App Header Bar */}
          <View style={styles.appHeader}>
            <Text style={styles.appHeaderText}>Healthify</Text>
          </View>

          <Text style={styles.title}>
            🍽️ Meal Planner
          </Text>

          <Card style={[styles.card, { backgroundColor: palette.surface }]}>
            <Card.Content style={styles.cardContent}>

              {/* Student Selection */}
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                👤 Select Student
              </Text>
              {students.length === 0 ? (
                <Text style={[styles.emptyStateText, { color: palette.textMuted }]}>
                  No students available. Please add students from the Children tab first.
                </Text>
              ) : (
                students.map((student: Student) => (
                  <TouchableOpacity
                    key={student.id}
                    style={[
                      styles.studentOption,
                      {
                        backgroundColor: selectedStudent?.id === student.id ? palette.accent + '20' : palette.inputBg,
                        borderColor: selectedStudent?.id === student.id ? palette.accent : palette.cardBorder,
                        borderWidth: 1
                      }
                    ]}
                    onPress={() => setSelectedStudent(student)}>
                    <View style={styles.studentOptionHeader}>
                      <Text style={[styles.studentOptionText, { color: palette.textPrimary, flex: 1 }]}>
                        {student.name}
                      </Text>
                      {selectedStudent?.id === student.id && (
                        <Text style={[styles.selectedText, { color: palette.accent }]}>✓ Selected</Text>
                      )}
                    </View>
                    <View style={styles.studentOptionDetails}>
                      <Text style={[styles.studentOptionDetailText, { color: palette.textMuted }]}>
                        Age: {student.age}
                      </Text>
                      <Text style={[styles.studentOptionDetailText, { color: palette.textMuted }]}>
                        BMI: {student.bmi.toFixed(1)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}

              {/* Generate Meal Plan Button */}
              {selectedStudent && (
                <TouchableOpacity
                  style={[styles.addChildButton, { backgroundColor: palette.accent, marginBottom: 16 }]}
                  onPress={handleGenerateMealPlan}>
                  <Text style={styles.addChildText}>🍽️ Generate 7-Day Meal Plan</Text>
                </TouchableOpacity>
              )}

              {/* Download PDF Button */}
              {selectedStudent && currentMealPlan && (
                <TouchableOpacity
                  style={[styles.addChildButton, { backgroundColor: '#3b82f6', marginBottom: 16 }]}
                  onPress={handleDownloadPDF}>
                  <Text style={styles.addChildText}>📄 Download Meal Plan PDF</Text>
                </TouchableOpacity>
              )}

              {/* Error Message */}
              {error && (
                <Card style={[styles.errorCard, { backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1 }]}>
                  <Text style={[styles.errorText, { color: '#dc2626' }]}>{error}</Text>
                </Card>
              )}

              {/* Meal Plan Display */}
              {!selectedStudent ? (
                <Card style={[styles.emptyStateCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder, borderWidth: 1 }]}>
                  <Text style={[styles.emptyStateText, { color: palette.textMuted }]}>
                    Please select a student to generate meal plans.
                  </Text>
                </Card>
              ) : !currentMealPlan ? (
                <Card style={[styles.emptyStateCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder, borderWidth: 1 }]}>
                  <Text style={[styles.emptyStateText, { color: palette.textMuted }]}>
                    No meal plan generated yet. Tap "Generate 7-Day Meal Plan" to create a personalized plan for {selectedStudent.name}.
                  </Text>
                </Card>
              ) : (
                <View style={styles.recommendationsContainer}>
                  <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                    🍽️ 7-Day Meal Plan for {selectedStudent.name}
                  </Text>
                  
                  {Object.entries(currentMealPlan.meals).map(([date, dayMeals]) => {
                    const dateObj = new Date(date);
                    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const isToday = date === new Date().toISOString().split('T')[0];
                    
                    return (
                      <Card
                        key={date}
                        style={[
                          styles.dayCard,
                          { 
                            borderColor: palette.cardBorder, 
                            borderWidth: 1,
                            backgroundColor: isToday ? '#fef3c7' : palette.cardBg
                          }
                        ]}>
                        <Card.Content>
                          <TouchableOpacity
                            onPress={() => setExpandedDay(expandedDay === date ? null : date)}>
                            <View style={styles.dayHeader}>
                              <View>
                                <Text style={[styles.dayTitle, { color: palette.textPrimary }]}>
                                  {dayName}
                                </Text>
                                <Text style={[styles.dayDate, { color: palette.textMuted }]}>
                                  {dateStr}
                                </Text>
                              </View>
                              <View style={styles.dayStats}>
                                <Text style={[styles.dayStat, { color: palette.textMuted }]}>
                                  🔥 {dayMeals.totalCalories} cal
                                </Text>
                                <Text style={[styles.dayStat, { color: palette.textMuted }]}>
                                  ⚖️ {dayMeals.totalGrams}g
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>

                          {expandedDay === date && (
                            <View style={styles.mealsList}>
                              {/* Breakfast */}
                              <View style={styles.mealItem}>
                                <View style={styles.mealHeader}>
                                  <Text style={[styles.mealName, { color: palette.textPrimary }]}>
                                    🌅 Breakfast
                                  </Text>
                                  <Checkbox
                                    status={dayMeals.consumed.breakfast ? 'checked' : 'unchecked'}
                                    onPress={() => handleMarkMealCompleted(date, 'breakfast')}
                                    color={palette.accent}
                                  />
                                </View>
                                <Text style={[styles.mealDetails, { color: palette.textPrimary }]}>
                                  {dayMeals.breakfast.name}
                                </Text>
                                <Text style={[styles.mealDetails, { color: palette.textMuted }]}>
                                  🔥 {dayMeals.breakfast.calories} cal
                                </Text>
                                <Text style={[styles.mealDetails, { color: palette.textMuted }]}>
                                  ⚖️ {dayMeals.breakfast.grams}g
                                </Text>
                              </View>

                              {/* Lunch */}
                              <View style={styles.mealItem}>
                                <View style={styles.mealHeader}>
                                  <Text style={[styles.mealName, { color: palette.textPrimary }]}>
                                    ☀️ Lunch
                                  </Text>
                                  <Checkbox
                                    status={dayMeals.consumed.lunch ? 'checked' : 'unchecked'}
                                    onPress={() => handleMarkMealCompleted(date, 'lunch')}
                                    color={palette.accent}
                                  />
                                </View>
                                <Text style={[styles.mealDetails, { color: palette.textPrimary }]}>
                                  {dayMeals.lunch.name}
                                </Text>
                                <Text style={[styles.mealDetails, { color: palette.textMuted }]}>
                                  🔥 {dayMeals.lunch.calories} cal
                                </Text>
                                <Text style={[styles.mealDetails, { color: palette.textMuted }]}>
                                  ⚖️ {dayMeals.lunch.grams}g
                                </Text>
                              </View>

                              {/* Dinner */}
                              <View style={styles.mealItem}>
                                <View style={styles.mealHeader}>
                                  <Text style={[styles.mealName, { color: palette.textPrimary }]}>
                                    🌆 Dinner
                                  </Text>
                                  <Checkbox
                                    status={dayMeals.consumed.dinner ? 'checked' : 'unchecked'}
                                    onPress={() => handleMarkMealCompleted(date, 'dinner')}
                                    color={palette.accent}
                                  />
                                </View>
                                <Text style={[styles.mealDetails, { color: palette.textPrimary }]}>
                                  {dayMeals.dinner.name}
                                </Text>
                                <Text style={[styles.mealDetails, { color: palette.textMuted }]}>
                                  🔥 {dayMeals.dinner.calories} cal
                                </Text>
                                <Text style={[styles.mealDetails, { color: palette.textMuted }]}>
                                  ⚖️ {dayMeals.dinner.grams}g
                                </Text>
                              </View>

                              {/* Snack */}
                              <View style={styles.mealItem}>
                                <View style={styles.mealHeader}>
                                  <Text style={[styles.mealName, { color: palette.textPrimary }]}>
                                    🍎 Snack
                                  </Text>
                                  <Checkbox
                                    status={dayMeals.consumed.snack ? 'checked' : 'unchecked'}
                                    onPress={() => handleMarkMealCompleted(date, 'snack')}
                                    color={palette.accent}
                                  />
                                </View>
                                <Text style={[styles.mealDetails, { color: palette.textPrimary }]}>
                                  {dayMeals.snack.name}
                                </Text>
                                <Text style={[styles.mealDetails, { color: palette.textMuted }]}>
                                  🔥 {dayMeals.snack.calories} cal
                                </Text>
                                <Text style={[styles.mealDetails, { color: palette.textMuted }]}>
                                  ⚖️ {dayMeals.snack.grams}g
                                </Text>
                              </View>
                            </View>
                          )}
                        </Card.Content>
                      </Card>
                    );
                  })}
                </View>
              )}
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    padding: 20,
  },
  title: {
    fontWeight: '600',
    marginBottom: 24,
    fontFamily: fonts.semibold,
    fontSize: 24,
  },
  
  // App header styles
  appHeader: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 16,
    marginLeft: -20,
    marginRight: -20,
    marginTop: -20,
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
    fontFamily: fonts.bold,
  },

  // Card styles
  card: {
    marginBottom: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 0,
  },
  ageGroupCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  // Form styles
  input: {
    marginBottom: 8,
    fontFamily: fonts.regular,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
    fontFamily: fonts.regular,
  },
  addChildButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addChildText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },

  // Student selection styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: fonts.semibold,
  },
  studentOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  studentOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  studentOptionDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  studentOptionText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: fonts.medium,
  },
  studentOptionDetailText: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  selectedText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },

  // Meal plan styles
  errorCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  emptyStateCard: {
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: fonts.regular,
  },
  recommendationsContainer: {
    marginTop: 16,
  },
  dayCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  dayDate: {
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  dayStats: {
    flexDirection: 'row',
    gap: 12,
  },
  dayStat: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  mealsList: {
    marginTop: 16,
    gap: 12,
  },
  mealItem: {
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.medium,
    flex: 1,
    marginRight: 8,
    maxWidth: '80%',
  },
  mealDetails: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
});

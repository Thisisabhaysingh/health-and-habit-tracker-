import React, { useMemo, useState, useRef, useEffect } from 'react';

import { 

  ScrollView, 

  StyleSheet, 

  View, 

  Alert, 

  Animated, 

  TouchableOpacity,

  KeyboardAvoidingView,

  Platform 

} from 'react-native';

import { 

  Button, 

  Card, 

  Chip, 

  IconButton, 

  Text, 

  useTheme, 

  Divider, 

  List, 

  Switch, 

  Checkbox,

  TextInput,

  Portal,

  Modal,

  FAB

} from 'react-native-paper';

import { LineChart } from 'react-native-chart-kit';

import { Dimensions } from 'react-native';



import { useAppDispatch, useAppSelector } from '@/hooks/redux';

import { 

  setCurrentExercisePlan,

  updateExerciseConsumption,

  toggleExerciseTask, 

  seedDailyExercise, 

  addExerciseTask, 

  setExerciseTasks 

} from '@/store/trackerSlice';

import { 

  createStudent, 

  updateStudent, 

  deleteStudent, 

  subscribeToStudents,

  createExercisePlan,

  updateExerciseConsumption as updateExerciseConsumptionFirebase,

  subscribeToCurrentExercisePlan

} from '@/src/firebase/trackerApi';

import AnimatedBackground from '@/components/AnimatedBackground';

import { 

  HOME_EXERCISES, 

  GYM_EXERCISES, 

  getExercisesByBMI, 

  getExerciseByCategory, 

  getComplementaryExercises,

  getBMICategory,

  type Exercise 

} from '@/constants/exerciseLibrary';

import type { Student, ExercisePlan, ExerciseWithDetails } from '@/types/tracker';

import * as Print from 'expo-print';

import * as Sharing from 'expo-sharing';



const SCREEN_WIDTH = Dimensions.get('window').width - 40;



interface StudentFormData {

  name: string;

  age: string;

  height: string;

  weight: string;

}



const generateStudentExercisePlan = (student: Student, exerciseType: 'home' | 'gym'): ExercisePlan => {

  const today = new Date();

  const exercisePlan: ExercisePlan = {

    id: `plan-${student.id}-${today.getTime()}`,

    studentId: student.id,

    weekStartDate: today.toISOString().split('T')[0],

    exercises: {},

    createdAt: today.toISOString()

  };



  // Get exercises suitable for student's BMI category

  const bmiCategory = getBMICategory(student.bmi);

  const suitableExercises = getExercisesByBMI(student.bmi, exerciseType);

  

  // Ensure we have exercises to work with

  if (!suitableExercises || suitableExercises.length === 0) {

    console.error('No suitable exercises found for BMI:', student.bmi, 'Type:', exerciseType);

    return exercisePlan;

  }

  

  const mobilityExercises = suitableExercises.filter(e => e.category === 'mobility');

  const strengthExercises = suitableExercises.filter(e => e.category === 'strength');

  const cardioExercises = suitableExercises.filter(e => e.category === 'cardio');

  

  // Generate 7-day plan

  for (let i = 0; i < 7; i++) {

    const date = new Date(today);

    date.setDate(date.getDate() + i);

    const dateStr = date.toISOString().split('T')[0];

    

    // Select random exercises for each category with fallbacks

    const mobility = mobilityExercises.length > 0 ? mobilityExercises[Math.floor(Math.random() * mobilityExercises.length)] : suitableExercises[0];

    const strength = strengthExercises.length > 0 ? strengthExercises[Math.floor(Math.random() * strengthExercises.length)] : suitableExercises[0];

    const cardio = cardioExercises.length > 0 ? cardioExercises[Math.floor(Math.random() * cardioExercises.length)] : suitableExercises[0];

    

    // Ensure we have valid exercises

    if (!mobility || !strength || !cardio) {

      console.error('Missing exercise data for plan generation');

      continue;

    }

    

    // Validate exercise properties

    const validateExercise = (exercise: any, type: string) => {

      if (!exercise || !exercise.name || !exercise.calories || !exercise.duration) {

        console.error(`Invalid ${type} exercise:`, exercise);

        return null;

      }

      return exercise;

    };

    

    const validMobility = validateExercise(mobility, 'mobility');

    const validStrength = validateExercise(strength, 'strength');

    const validCardio = validateExercise(cardio, 'cardio');

    

    if (!validMobility || !validStrength || !validCardio) {

      console.error('Invalid exercise data, skipping day:', dateStr);

      continue;

    }

    

    const totalCalories = validMobility.calories + validStrength.calories + validCardio.calories;

    const totalDuration = validMobility.duration + validStrength.duration + validCardio.duration;

    

    exercisePlan.exercises[dateStr] = {

      mobility: { 

        name: validMobility.name,

        type: validMobility.type,

        category: validMobility.category,

        difficulty: validMobility.difficulty,

        duration: validMobility.duration,

        calories: validMobility.calories,

        equipment: validMobility.equipment || [],

        instructions: validMobility.instructions,

        sets: validMobility.sets || null,

        reps: validMobility.reps || null

      },

      strength: { 

        name: validStrength.name,

        type: validStrength.type,

        category: validStrength.category,

        difficulty: validStrength.difficulty,

        duration: validStrength.duration,

        calories: validStrength.calories,

        equipment: validStrength.equipment || [],

        instructions: validStrength.instructions,

        sets: validStrength.sets || null,

        reps: validStrength.reps || null

      },

      cardio: { 

        name: validCardio.name,

        type: validCardio.type,

        category: validCardio.category,

        difficulty: validCardio.difficulty,

        duration: validCardio.duration,

        calories: validCardio.calories,

        equipment: validCardio.equipment || [],

        instructions: validCardio.instructions,

        sets: validCardio.sets || null,

        reps: validCardio.reps || null

      },

      totalCalories,

      totalDuration,

      completed: {

        mobility: false,

        strength: false,

        cardio: false

      }

    };

  }



  return exercisePlan;

};



const fonts = {

  light: 'WorkSans_300Light',

  regular: 'WorkSans_400Regular',

  medium: 'WorkSans_500Medium',

  semibold: 'WorkSans_600SemiBold',

  bold: 'WorkSans_700Bold',

} as const;



export default function ExerciseScreen() {

  const theme = useTheme();

  const dispatch = useAppDispatch();

  const { user } = useAppSelector(state => state.auth);

  const { students } = useAppSelector(state => state.tracker);

  

  // Exercise plan states

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [currentExercisePlan, setCurrentExercisePlan] = useState<ExercisePlan | null>(null);

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

    accent: '#ef4444',

  });



  const palette = useMemo(() => createPalette(theme.dark), [theme.dark]);



  // Load current exercise plan when student is selected

  useEffect(() => {

    if (!user?.uid || !selectedStudent) return;



    const unsubscribe = subscribeToCurrentExercisePlan(user.uid, selectedStudent.id, (exercisePlan) => {

      setCurrentExercisePlan(exercisePlan);

    });



    return () => unsubscribe();

  }, [user?.uid, selectedStudent?.id]);



  const handleGenerateExercisePlan = async () => {

    if (!selectedStudent) {

      setError('Please select a student first.');

      return;

    }



    if (!user?.uid) {

      setError('❌ User not authenticated');

      return;

    }



    try {

      const newExercisePlan = generateStudentExercisePlan(selectedStudent, 'home');

      const exercisePlanPayload: Omit<ExercisePlan, 'id'> = {

        studentId: newExercisePlan.studentId,

        weekStartDate: newExercisePlan.weekStartDate,

        exercises: newExercisePlan.exercises,

        createdAt: newExercisePlan.createdAt

      };



      await createExercisePlan(user.uid, exercisePlanPayload);

      setError(`✅ 7-day exercise plan generated for ${selectedStudent.name}!`);

      setTimeout(() => setError(null), 3000);

    } catch (error) {

      console.error('Error generating exercise plan:', error);

      setError('❌ Failed to generate exercise plan. Please try again.');

      setTimeout(() => setError(null), 3000);

    }

  };



  const handleMarkExerciseCompleted = async (date: string, exerciseType: 'mobility' | 'strength' | 'cardio') => {

    if (!currentExercisePlan) return;



    if (!user?.uid) {

      setError('❌ User not authenticated');

      return;

    }



    try {

      await updateExerciseConsumptionFirebase(user.uid, currentExercisePlan.id, date, exerciseType);

      setError(`✅ ${exerciseType.charAt(0).toUpperCase() + exerciseType.slice(1)} marked as completed!`);

      setTimeout(() => setError(null), 2000);

    } catch (error) {

      console.error('Error marking exercise as completed:', error);

      setError('❌ Failed to mark exercise as completed. Please try again.');

      setTimeout(() => setError(null), 2000);

    }

  };



  const handleDownloadPDF = async () => {

    if (!currentExercisePlan || !selectedStudent) {

      setError('Please generate an exercise plan first.');

      return;

    }



    try {

      // Generate HTML for PDF

      const htmlContent = `

        <!DOCTYPE html>

        <html>

        <head>

          <meta charset="utf-8">

          <title>7-Day Exercise Plan - ${selectedStudent.name}</title>

          <style>

            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }

            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ef4444; padding-bottom: 20px; }

            .header h1 { color: #ef4444; margin: 0; }

            .header p { margin: 5px 0; color: #666; }

            .student-info { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }

            .day-section { margin-bottom: 25px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }

            .day-header { background: #ef4444; color: white; padding: 12px; font-weight: bold; font-size: 18px; }

            .exercise-table { width: 100%; border-collapse: collapse; }

            .exercise-table th { background: #f1f5f9; padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }

            .exercise-table td { padding: 10px; border-bottom: 1px solid #f1f5f9; }

            .exercise-table tr:last-child td { border-bottom: none; }

            .calories { font-weight: bold; color: #ef4444; }

            .total-row { background: #f8fafc; font-weight: bold; }

            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }

          </style>

        </head>

        <body>

          <div class="header">

            <h1>💪 7-Day Exercise Plan</h1>

            <p>Generated on ${new Date().toLocaleDateString()}</p>

          </div>

          

          <div class="student-info">

            <strong>Student:</strong> ${selectedStudent.name}<br>

            <strong>Age:</strong> ${selectedStudent.age} years<br>

            <strong>Height:</strong> ${selectedStudent.height} cm<br>

            <strong>Weight:</strong> ${selectedStudent.weight} kg<br>

            <strong>BMI:</strong> ${selectedStudent.bmi} (${selectedStudent.bmiCategory})

          </div>

          

          ${Object.entries(currentExercisePlan.exercises).map(([date, dayExercises]) => {

            const dateObj = new Date(date);

            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

            

            return `

              <div class="day-section">

                <div class="day-header">${dayName} - ${dateStr}</div>

                <table class="exercise-table">

                  <thead>

                    <tr>

                      <th>Exercise</th>

                      <th>Type</th>

                      <th>Duration</th>

                      <th>Calories</th>

                      <th>Details</th>

                    </tr>

                  </thead>

                  <tbody>

                    <tr>

                      <td>🧘 ${dayExercises.mobility.name}</td>

                      <td>${dayExercises.mobility.category}</td>

                      <td>${dayExercises.mobility.duration} min</td>

                      <td class="calories">${dayExercises.mobility.calories}</td>

                      <td>${dayExercises.mobility.sets ? `${dayExercises.mobility.sets} sets` : 'Flexibility'}</td>

                    </tr>

                    <tr>

                      <td>💪 ${dayExercises.strength.name}</td>

                      <td>${dayExercises.strength.category}</td>

                      <td>${dayExercises.strength.duration} min</td>

                      <td class="calories">${dayExercises.strength.calories}</td>

                      <td>${dayExercises.strength.sets ? `${dayExercises.strength.sets}x${dayExercises.strength.reps}` : 'Strength'}</td>

                    </tr>

                    <tr>

                      <td>🏃 ${dayExercises.cardio.name}</td>

                      <td>${dayExercises.cardio.category}</td>

                      <td>${dayExercises.cardio.duration} min</td>

                      <td class="calories">${dayExercises.cardio.calories}</td>

                      <td>Cardio</td>

                    </tr>

                    <tr class="total-row">

                      <td colspan="2"><strong>Daily Total</strong></td>

                      <td><strong>${dayExercises.totalDuration} min</strong></td>

                      <td class="calories"><strong>${dayExercises.totalCalories}</strong></td>

                      <td><strong>Full Workout</strong></td>

                    </tr>

                  </tbody>

                </table>

              </div>

            `;

          }).join('')}

          

          <div class="footer">

            <p>This exercise plan is generated based on the student's BMI and fitness level.</p>

            <p>Consult with a fitness professional for personalized exercise advice.</p>

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

          dialogTitle: 'Share Exercise Plan PDF',

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



          <Text variant="headlineLarge" style={styles.title}>

            Exercise Planner

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

                students.map((student) => (

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



              {/* Generate Exercise Plan Button */}

              {selectedStudent && (

                <TouchableOpacity

                  style={[styles.addChildButton, { backgroundColor: palette.accent, marginBottom: 16 }]}

                  onPress={handleGenerateExercisePlan}>

                  <Text style={styles.addChildText}>🎯 Generate 7-Day Exercise Plan</Text>

                </TouchableOpacity>

              )}



              {/* Download PDF Button */}

              {selectedStudent && currentExercisePlan && (

                <TouchableOpacity

                  style={[styles.addChildButton, { backgroundColor: '#3b82f6', marginBottom: 16 }]}

                  onPress={handleDownloadPDF}>

                  <Text style={styles.addChildText}>📄 Download Exercise Plan PDF</Text>

                </TouchableOpacity>

              )}



              {/* Error Message */}

              {error && (

                <Card style={[styles.errorCard, { backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1 }]}>

                  <Text style={[styles.errorText, { color: '#dc2626' }]}>{error}</Text>

                </Card>

              )}



              {/* Exercise Plan Display */}

              {!selectedStudent ? (

                <Card style={[styles.emptyStateCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder, borderWidth: 1 }]}>

                  <Text style={[styles.emptyStateText, { color: palette.textMuted }]}>

                    Please select a student to generate exercise plans.

                  </Text>

                </Card>

              ) : !currentExercisePlan ? (

                <Card style={[styles.emptyStateCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder, borderWidth: 1 }]}>

                  <Text style={[styles.emptyStateText, { color: palette.textMuted }]}>

                    No exercise plan generated yet. Tap "Generate 7-Day Exercise Plan" to create a personalized plan for {selectedStudent.name}.

                  </Text>

                </Card>

              ) : (

                <View style={styles.recommendationsContainer}>

                  <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>

                    💪 7-Day Exercise Plan for {selectedStudent.name}

                  </Text>

                  

                  {Object.entries(currentExercisePlan.exercises).map(([date, dayExercises]) => {

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

                                  🕒 {dayExercises.totalDuration} min

                                </Text>

                                <Text style={[styles.dayStat, { color: palette.textMuted }]}>

                                  🔥 {dayExercises.totalCalories} cal

                                </Text>

                              </View>

                            </View>

                          </TouchableOpacity>



                          {expandedDay === date && (

                            <View style={styles.exercisesList}>

                              {/* Mobility Exercise */}

                              <View style={styles.exerciseItem}>

                                <View style={styles.exerciseHeader}>

                                  <Text style={[styles.exerciseName, { color: palette.textPrimary }]}>

                                    🧘 {dayExercises.mobility.name}

                                  </Text>

                                  <Checkbox

                                    status={dayExercises.completed.mobility ? 'checked' : 'unchecked'}

                                    onPress={() => handleMarkExerciseCompleted(date, 'mobility')}

                                    color={palette.accent}

                                  />

                                </View>

                                <Text style={[styles.exerciseDetails, { color: palette.textMuted }]}>

                                  🕒 {dayExercises.mobility.duration} min

                                </Text>

                                <Text style={[styles.exerciseDetails, { color: palette.textMuted }]}>

                                  🔥 {dayExercises.mobility.calories} cal

                                </Text>

                                {dayExercises.mobility.sets && (

                                  <Text style={[styles.exerciseDetails, { color: palette.textMuted }]}>

                                    Sets: {dayExercises.mobility.sets} {dayExercises.mobility.reps && `x ${dayExercises.mobility.reps}`}

                                  </Text>

                                )}

                              </View>



                              {/* Strength Exercise */}

                              <View style={styles.exerciseItem}>

                                <View style={styles.exerciseHeader}>

                                  <Text style={[styles.exerciseName, { color: palette.textPrimary }]}>

                                    💪 {dayExercises.strength.name}

                                  </Text>

                                  <Checkbox

                                    status={dayExercises.completed.strength ? 'checked' : 'unchecked'}

                                    onPress={() => handleMarkExerciseCompleted(date, 'strength')}

                                    color={palette.accent}

                                  />

                                </View>

                                <Text style={[styles.exerciseDetails, { color: palette.textMuted }]}>

                                  🕒 {dayExercises.strength.duration} min

                                </Text>

                                <Text style={[styles.exerciseDetails, { color: palette.textMuted }]}>

                                  🔥 {dayExercises.strength.calories} cal

                                </Text>

                                {dayExercises.strength.sets && (

                                  <Text style={[styles.exerciseDetails, { color: palette.textMuted }]}>

                                    Sets: {dayExercises.strength.sets} {dayExercises.strength.reps && `x ${dayExercises.strength.reps}`}

                                  </Text>

                                )}

                              </View>



                              {/* Cardio Exercise */}

                              <View style={styles.exerciseItem}>

                                <View style={styles.exerciseHeader}>

                                  <Text style={[styles.exerciseName, { color: palette.textPrimary }]}>

                                    🏃 {dayExercises.cardio.name}

                                  </Text>

                                  <Checkbox

                                    status={dayExercises.completed.cardio ? 'checked' : 'unchecked'}

                                    onPress={() => handleMarkExerciseCompleted(date, 'cardio')}

                                    color={palette.accent}

                                  />

                                </View>

                                <Text style={[styles.exerciseDetails, { color: palette.textMuted }]}>

                                  🕒 {dayExercises.cardio.duration} min

                                </Text>

                                <Text style={[styles.exerciseDetails, { color: palette.textMuted }]}>

                                  🔥 {dayExercises.cardio.calories} cal

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



  // Exercise plan styles

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

    fontSize: 16,

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

  exercisesList: {

    marginTop: 16,

    gap: 12,

  },

  exerciseItem: {

    padding: 12,

    backgroundColor: '#f8fafc',

    borderRadius: 8,

    borderLeftWidth: 3,

    borderLeftColor: '#ef4444',

  },

  exerciseHeader: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 4,

  },

  exerciseName: {

    fontSize: 14,

    fontWeight: '600',

    flex: 1,

    marginRight: 8,

    maxWidth: '80%',

    fontFamily: fonts.medium,

  },

  exerciseDetails: {

    fontSize: 12,

    fontFamily: fonts.regular,

  },

});


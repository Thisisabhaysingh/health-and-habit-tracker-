import React, { useMemo, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button, Card, Text, useTheme, Checkbox, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import type { RootState } from '@/src/store';
import { 
  subscribeToCurrentExercisePlan
} from '@/src/firebase/trackerApi';
import { markExerciseCompleted, createExercisePlan } from '@/src/firebase/exerciseApi';
import type { Student } from '@/types/tracker';
import { getTodaysExercises, type Exercise, type DayPlan } from '@/src/constants/exerciseLibrary';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const fonts = {
  regular: 'WorkSans_400Regular',
  medium: 'WorkSans_500Medium',
  semibold: 'WorkSans_600SemiBold',
  bold: 'WorkSans_700Bold',
} as const;

// Exercise theme colors
const colors = {
  exercise: {
    primary: '#ea580c',
    light: '#ffedd5',
    surface: '#fff7ed',
    dark: '#c2410c',
  },
  meal: {
    primary: '#16a34a',
    light: '#dcfce7',
  }
};

// Category colors
const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
  warmup: { bg: '#fef3c7', text: '#d97706', icon: 'run-fast' },
  cardio: { bg: '#fee2e2', text: '#dc2626', icon: 'heart-pulse' },
  strength: { bg: '#dbeafe', text: '#2563eb', icon: 'dumbbell' },
  mobility: { bg: '#d1fae5', text: '#059669', icon: 'yoga' },
  dance: { bg: '#f3e8ff', text: '#9333ea', icon: 'music' },
  yoga: { bg: '#ccfbf1', text: '#0d9488', icon: 'meditation' },
  cooldown: { bg: '#f3f4f6', text: '#6b7280', icon: 'sleep' },
};

export default function ExerciseScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { students, exercisePlans } = useAppSelector((state: RootState) => state.tracker);
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [todaysPlan, setTodaysPlan] = useState<DayPlan | null>(null);
  // Track completed exercises per student: { [studentId]: Set<exerciseId> }
  const [completedExercisesMap, setCompletedExercisesMap] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const palette = useMemo(() => ({
    background: theme.dark ? '#0f172a' : '#f8fafc',
    surface: theme.dark ? '#1e293b' : '#ffffff',
    textPrimary: theme.dark ? '#f1f5f9' : '#1e293b',
    textSecondary: theme.dark ? '#94a3b8' : '#64748b',
    border: theme.dark ? '#334155' : '#e2e8f0',
  }), [theme.dark]);

  // Get today's date string
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Subscribe to exercise plans and load completed exercises
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribers: (() => void)[] = [];

    students.forEach(student => {
      const unsubscribe = subscribeToCurrentExercisePlan(user.uid, student.id, (plan) => {
        if (plan) {
          dispatch({ type: 'tracker/addExercisePlan', payload: plan });
          
          // Load completed exercises from the plan for today
          if (plan.exercises && plan.exercises[today] && plan.exercises[today].exercises) {
            const completed = new Set<string>();
            plan.exercises[today].exercises.forEach((ex: any) => {
              if (ex.completed) {
                completed.add(ex.id);
              }
            });
            setCompletedExercisesMap(prev => ({
              ...prev,
              [student.id]: completed
            }));
          }
        }
      });
      unsubscribers.push(unsubscribe);
    });

    return () => unsubscribers.forEach(unsub => unsub());
  }, [user?.uid, students, dispatch, today]);

  // Get today's plan when student is selected
  useEffect(() => {
    if (selectedStudent) {
      const today = new Date();
      const plan = getTodaysExercises(selectedStudent.age, today.getDay());
      setTodaysPlan(plan);
    }
  }, [selectedStudent]);

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  };

  // Handle student selection - close others, toggle current
  const handleStudentPress = (student: Student) => {
    if (expandedStudentId === student.id) {
      // Close if already open
      setExpandedStudentId(null);
      setSelectedStudent(null);
    } else {
      // Open new, close others
      setExpandedStudentId(student.id);
      setSelectedStudent(student);
    }
  };

  const handleGeneratePlan = async () => {
    if (!selectedStudent || !user?.uid) {
      showMessage('Please select a child first');
      return;
    }

    setLoading(true);
    try {
      const result = await createExercisePlan(
        user.uid,
        selectedStudent.id,
        selectedStudent.name,
        selectedStudent.age
      );

      if (result.success) {
        dispatch({ type: 'tracker/setCurrentExercisePlan', payload: result.data });
        showMessage(`Exercise plan created for ${selectedStudent.name}!`);
      } else {
        showMessage('Failed to create exercise plan');
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      showMessage('Error creating exercise plan');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExercise = async (exerciseId: string) => {
    if (!user?.uid || !selectedStudent || !todaysPlan) return;
    
    const studentId = selectedStudent.id;
    const currentCompleted = completedExercisesMap[studentId] || new Set();
    const newCompleted = !currentCompleted.has(exerciseId);
    
    // Update local state immediately for UI feedback - per student
    setCompletedExercisesMap(prev => {
      const studentSet = new Set(prev[studentId] || []);
      if (studentSet.has(exerciseId)) {
        studentSet.delete(exerciseId);
      } else {
        studentSet.add(exerciseId);
      }
      return {
        ...prev,
        [studentId]: studentSet
      };
    });
    
    // Save to Firebase
    try {
      await markExerciseCompleted(user.uid, studentId, today, exerciseId, newCompleted);
      
      // Update Redux store for dashboard sync
      dispatch({ 
        type: 'tracker/updateExerciseConsumption', 
        payload: { date: today, exerciseId, completed: newCompleted } 
      });
    } catch (error) {
      console.error('Error saving exercise progress:', error);
      showMessage('Failed to save progress');
    }
  };

  const handleDownloadPDF = async () => {
    if (!todaysPlan || !selectedStudent) {
      showMessage('No plan to download');
      return;
    }

    const todayStr = new Date().toLocaleDateString();
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #ea580c; }
            h2 { color: #333; margin-top: 20px; }
            .exercise { margin: 15px 0; padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
            .category { color: #666; font-size: 14px; }
            .duration { color: #ea580c; font-weight: bold; }
            .instructions { margin-top: 8px; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>Shelter Home Fitness Program</h1>
          <p><strong>Child:</strong> ${selectedStudent.name}</p>
          <p><strong>Age:</strong> ${selectedStudent.age}</p>
          <p><strong>Date:</strong> ${todayStr}</p>
          <hr/>
          <h2>${todaysPlan.title}</h2>
          <p><strong>Focus:</strong> ${todaysPlan.focus}</p>
          <p><strong>Total Duration:</strong> ${todaysPlan.duration} minutes</p>
          <hr/>
          ${todaysPlan.exercises.map((ex, i) => `
            <div class="exercise">
              <h3>${i + 1}. ${ex.name}</h3>
              <div class="category">Category: ${ex.category}</div>
              <div class="duration">Duration: ${ex.duration} min | Calories: ${ex.calories}</div>
              ${ex.reps ? `<div>Reps/Sets: ${ex.reps}</div>` : ''}
              <div class="instructions">
                <strong>Instructions:</strong>
                <ul>
                  ${ex.instructions.map(inst => `<li>${inst}</li>`).join('')}
                </ul>
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      showMessage('Failed to generate PDF');
    }
  };

  // Get completed exercises for the selected student
  const completedExercises = useMemo(() => {
    return selectedStudent ? (completedExercisesMap[selectedStudent.id] || new Set()) : new Set();
  }, [completedExercisesMap, selectedStudent]);

  // Calculate progress by category
  const progressByCategory = useMemo(() => {
    if (!todaysPlan) return {};
    
    const categories = ['warmup', 'cardio', 'strength', 'mobility', 'dance', 'yoga', 'cooldown'];
    const result: Record<string, { total: number; completed: number; percentage: number }> = {};
    
    categories.forEach(cat => {
      const catExercises = todaysPlan.exercises.filter(ex => ex.category === cat);
      const total = catExercises.length;
      const completed = catExercises.filter(ex => completedExercises.has(ex.id)).length;
      result[cat] = {
        total,
        completed,
        percentage: total > 0 ? completed / total : 0
      };
    });
    
    return result;
  }, [completedExercises, todaysPlan]);

  const overallProgress = useMemo(() => {
    if (!todaysPlan || todaysPlan.exercises.length === 0) return 0;
    return completedExercises.size / todaysPlan.exercises.length;
  }, [completedExercises, todaysPlan]);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.exercise.surface }]}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="dumbbell" size={32} color={colors.exercise.primary} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.exercise.dark }]}>
              Exercise Plan
            </Text>
            <Text style={[styles.headerSubtitle, { color: palette.textSecondary }]}>
              Shelter Home Fitness Program
            </Text>
          </View>
        </View>

        {/* Message Banner */}
        {message && (
          <View style={[styles.messageBanner, { backgroundColor: colors.exercise.light }]}>
            <MaterialCommunityIcons name="information" size={20} color={colors.exercise.primary} />
            <Text style={[styles.messageText, { color: colors.exercise.dark }]}>
              {message}
            </Text>
          </View>
        )}

        {/* Children Cards with Stats */}
        {students.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.textSecondary }]}>
              Select Child
            </Text>
            
            {students.map(student => {
              const isExpanded = expandedStudentId === student.id;
              const isSelected = selectedStudent?.id === student.id;
              
              // Get completed count for this specific student
              const studentCompletedSet = completedExercisesMap[student.id] || new Set();
              const studentPlan = getTodaysExercises(student.age, new Date().getDay());
              const totalExercises = studentPlan?.exercises.length || 0;
              const completedCount = studentCompletedSet.size;
              
              return (
                <Card key={student.id} style={[styles.studentCard, { backgroundColor: palette.surface }]}>
                  <TouchableOpacity 
                    onPress={() => handleStudentPress(student)} 
                    style={styles.studentHeader}>
                    <View style={styles.studentMain}>
                      <View style={[styles.studentAvatar, { backgroundColor: colors.exercise.light }]}>
                        <MaterialCommunityIcons name="account" size={24} color={colors.exercise.primary} />
                      </View>
                      <View style={styles.studentInfo}>
                        <Text style={[styles.studentName, { color: palette.textPrimary }]}>
                          {student.name}
                        </Text>
                        <View style={styles.studentStatsRow}>
                          <View style={styles.miniStat}>
                            <MaterialCommunityIcons name="cake" size={14} color={palette.textSecondary} />
                            <Text style={[styles.miniStatText, { color: palette.textSecondary }]}>
                              Age {student.age}
                            </Text>
                          </View>
                          <View style={styles.miniStat}>
                            <MaterialCommunityIcons name="dumbbell" size={14} color={colors.exercise.primary} />
                            <Text style={[styles.miniStatText, { color: colors.exercise.dark }]}>
                              {completedCount}/{totalExercises} done
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

                  {isExpanded && isSelected && todaysPlan && (
                    <View style={styles.studentDetails}>
                      {/* Progress Card */}
                      <Card style={[styles.progressCard, { backgroundColor: palette.surface, borderColor: colors.exercise.primary }]}>
                        <View style={[styles.progressHeader, { backgroundColor: colors.exercise.surface }]}>
                          <View style={styles.progressTitleRow}>
                            <MaterialCommunityIcons name="dumbbell" size={24} color={colors.exercise.primary} />
                            <Text style={[styles.progressTitle, { color: colors.exercise.dark }]}>
                              {todaysPlan.title}
                            </Text>
                          </View>
                          <Text style={[styles.progressPercent, { color: colors.exercise.primary }]}>
                            {Math.round(overallProgress * 100)}%
                          </Text>
                        </View>
                        <View style={styles.cardContent}>
                          <ProgressBar 
                            progress={overallProgress} 
                            color={colors.exercise.primary}
                            style={styles.progressBar}
                          />
                          <View style={styles.progressDetails}>
                            <Text style={[styles.progressDetail, { color: palette.textSecondary }]}>
                              {completedExercises.size} of {todaysPlan.exercises.length} exercises done
                            </Text>
                            <Text style={[styles.progressDetail, { color: palette.textSecondary }]}>
                              {todaysPlan.duration} min total
                            </Text>
                          </View>
                        </View>
                      </Card>

                      {/* Category Progress Bars */}
                      <View style={styles.categoryProgressSection}>
                        <Text style={[styles.categoryTitle, { color: palette.textSecondary }]}>
                          Progress by Category
                        </Text>
                        {Object.entries(progressByCategory)
                          .filter(([_, data]) => data.total > 0)
                          .map(([category, data]) => {
                            const colors_cat = categoryColors[category] || categoryColors.cooldown;
                            return (
                              <View key={category} style={styles.categoryItem}>
                                <View style={styles.categoryHeader}>
                                  <View style={[styles.categoryIcon, { backgroundColor: colors_cat.bg }]}>
                                    <MaterialCommunityIcons name={colors_cat.icon as any} size={16} color={colors_cat.text} />
                                  </View>
                                  <Text style={[styles.categoryName, { color: palette.textPrimary }]}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                  </Text>
                                  <Text style={[styles.categoryCount, { color: palette.textSecondary }]}>
                                    {data.completed}/{data.total}
                                  </Text>
                                </View>
                                <ProgressBar
                                  progress={data.percentage}
                                  color={colors_cat.text}
                                  style={[styles.categoryProgressBar, { backgroundColor: colors_cat.bg }]}
                                />
                              </View>
                            );
                          })}
                      </View>

                      {/* Today's Exercises */}
                      <View style={styles.exercisesSection}>
                        <Text style={[styles.sectionTitle, { color: palette.textSecondary }]}>
                          Today's Exercises ({todaysPlan.exercises.length})
                        </Text>
                        
                        {todaysPlan.exercises.map((exercise, index) => {
                          const catColors = categoryColors[exercise.category] || categoryColors.cooldown;
                          const isCompleted = completedExercises.has(exercise.id);
                          
                          return (
                            <Card key={exercise.id} style={[styles.exerciseCard, { backgroundColor: palette.surface }]}>
                              <TouchableOpacity 
                                style={styles.exerciseContent}
                                onPress={() => handleToggleExercise(exercise.id)}>
                                
                                <View style={styles.exerciseMain}>
                                  <View style={[styles.exerciseIcon, { backgroundColor: isCompleted ? '#dcfce7' : catColors.bg }]}>
                                    <MaterialCommunityIcons 
                                      name={catColors.icon as any} 
                                      size={24} 
                                      color={isCompleted ? '#16a34a' : catColors.text} 
                                    />
                                  </View>
                                  
                                  <View style={styles.exerciseInfo}>
                                    <Text style={[styles.exerciseNumber, { color: palette.textSecondary }]}>
                                      Exercise {index + 1}
                                    </Text>
                                    <Text 
                                      style={[styles.exerciseName, { color: palette.textPrimary }]} 
                                      numberOfLines={1}
                                      ellipsizeMode="tail"
                                    >
                                      {exercise.name}
                                    </Text>
                                    <View style={styles.exerciseMeta}>
                                      <View style={[styles.categoryBadge, { backgroundColor: catColors.bg }]}>
                                        <Text style={[styles.categoryBadgeText, { color: catColors.text }]}>
                                          {exercise.category}
                                        </Text>
                                      </View>
                                      <Text style={[styles.exerciseDuration, { color: colors.exercise.primary }]}>
                                        {exercise.duration} min
                                      </Text>
                                      {exercise.reps && (
                                        <Text style={[styles.exerciseReps, { color: palette.textSecondary }]}>
                                          • {exercise.reps}
                                        </Text>
                                      )}
                                    </View>
                                    
                                    {/* Instructions */}
                                    <View style={styles.instructionsList}>
                                      {exercise.instructions.slice(0, 2).map((inst, i) => (
                                        <Text key={i} style={[styles.instruction, { color: palette.textSecondary }]}>
                                          • {inst}
                                        </Text>
                                      ))}
                                    </View>
                                  </View>
                                </View>

                                <Checkbox
                                  status={isCompleted ? 'checked' : 'unchecked'}
                                  onPress={() => handleToggleExercise(exercise.id)}
                                  color={colors.exercise.primary}
                                />
                              </TouchableOpacity>
                            </Card>
                          );
                        })}

                        {/* Download PDF Button */}
                        <Button
                          mode="outlined"
                          onPress={handleDownloadPDF}
                          style={[styles.downloadButton, { borderColor: colors.exercise.primary }]}
                          labelStyle={{ color: colors.exercise.primary }}
                          icon={({size, color}) => <MaterialCommunityIcons name="file-download" size={size} color={color} />}>
                          Download Plan as PDF
                        </Button>
                      </View>
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}

        {/* Generate Plan Button */}
        {selectedStudent && (
          <Button
            mode="contained"
            onPress={handleGeneratePlan}
            loading={loading}
            disabled={loading}
            style={[styles.generateButton, { backgroundColor: colors.exercise.primary }]}
            labelStyle={styles.buttonLabel}
            icon={({size, color}) => <MaterialCommunityIcons name="refresh" size={size} color={color} />}>
            Generate New Plan for {selectedStudent.name}
          </Button>
        )}

        {/* Empty State */}
        {students.length === 0 && (
          <Card style={[styles.emptyCard, { backgroundColor: palette.surface }]}>
            <MaterialCommunityIcons name="account-off" size={48} color={palette.textSecondary} />
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              No children added yet. Add a child in the Children tab first.
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ea580c20',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffedd5',
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  studentCard: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  arrowContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  studentDetails: {
    padding: 16,
    paddingTop: 0,
  },
  progressCard: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  progressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fonts.bold,
  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressDetail: {
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  categoryProgressSection: {
    gap: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    marginBottom: 8,
  },
  categoryItem: {
    gap: 6,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: fonts.medium,
    textTransform: 'capitalize',
  },
  categoryCount: {
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  categoryProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  exercisesSection: {
    marginTop: 16,
  },
  generateButton: {
    borderRadius: 10,
    marginBottom: 24,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    paddingVertical: 4,
  },
  exerciseCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  exerciseMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 8,
  },
  exerciseNumber: {
    fontSize: 11,
    fontFamily: fonts.medium,
    marginBottom: 2,
  },
  exerciseName: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    marginBottom: 4,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: fonts.medium,
    textTransform: 'capitalize',
  },
  exerciseDuration: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: fonts.medium,
  },
  exerciseReps: {
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  instructionsList: {
    gap: 2,
  },
  instruction: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  downloadButton: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
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
});

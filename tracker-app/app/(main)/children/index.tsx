import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  TextInput,
  Button,
  IconButton,
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import type { RootState } from '@/src/store';
import { setStudents } from '@/src/store/trackerSlice';
import { 
  createStudent, 
  updateStudent, 
  deleteStudent, 
  subscribeToStudents
} from '@/src/firebase/trackerApi';
import AnimatedBackground from '@/components/AnimatedBackground';
import { calculateBMI, getBMICategory } from '@/constants/exerciseLibrary';
import type { Student } from '@/types/tracker';

const SCREEN_WIDTH = Dimensions.get('window').width - 40;

interface StudentFormData {
  name: string;
  age: string;
  height: string;
  weight: string;
}

const fonts = {
  regular: 'WorkSans_400Regular',
  medium: 'WorkSans_500Medium',
  semibold: 'WorkSans_600SemiBold',
  bold: 'WorkSans_700Bold',
} as const;

export default function ChildrenScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { students } = useAppSelector((state: RootState) => state.tracker);
  
  // Student management states
  const [studentFormData, setStudentFormData] = useState<StudentFormData>({
    name: '',
    age: '',
    height: '',
    weight: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<StudentFormData>>({});
  const [error, setError] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

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

  // Load students from database
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToStudents(user.uid, (students) => {
      // Update students in Redux state
      dispatch(setStudents(students));
    });

    return () => unsubscribe();
  }, [user?.uid, dispatch]);

  // Student management functions
  const validateStudentForm = (): boolean => {
    const errors: Partial<StudentFormData> = {};

    if (!studentFormData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!studentFormData.age.trim() || isNaN(Number(studentFormData.age)) || Number(studentFormData.age) <= 0) {
      errors.age = 'Valid age is required';
    }

    if (!studentFormData.height.trim() || isNaN(Number(studentFormData.height)) || Number(studentFormData.height) <= 0) {
      errors.height = 'Valid height is required';
    }

    if (!studentFormData.weight.trim() || isNaN(Number(studentFormData.weight)) || Number(studentFormData.weight) <= 0) {
      errors.weight = 'Valid weight is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddStudent = async () => {
    if (!validateStudentForm()) return;

    if (!user?.uid) {
      setError('❌ User not authenticated');
      return;
    }

    try {
      const age = Number(studentFormData.age);
      const height = Number(studentFormData.height);
      const weight = Number(studentFormData.weight);
      const bmi = calculateBMI(height, weight);
      const bmiCategory = getBMICategory(bmi);
      
      // Calculate daily calorie needs based on age, gender, and activity level
      let dailyCalorieNeeds = 2000; // Base value
      if (age < 18) {
        dailyCalorieNeeds = 1800 + (bmi < 18.5 ? 200 : bmi > 25 ? -200 : 0);
      } else if (age < 30) {
        dailyCalorieNeeds = 2200 + (bmi < 18.5 ? 300 : bmi > 25 ? -300 : 0);
      } else if (age < 50) {
        dailyCalorieNeeds = 2000 + (bmi < 18.5 ? 200 : bmi > 25 ? -200 : 0);
      } else {
        dailyCalorieNeeds = 1800 + (bmi < 18.5 ? 100 : bmi > 25 ? -100 : 0);
      }

      const studentData = {
        name: studentFormData.name.trim(),
        age,
        height,
        weight,
        bmi,
        bmiCategory,
        dailyCalorieNeeds,
        dietType: 'balanced',
        createdAt: new Date().toISOString()
      };

      await createStudent(user.uid, studentData);
      setStudentFormData({ name: '', age: '', height: '', weight: '' });
      setError(`✅ ${studentData.name} added successfully!`);
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error('Error adding student:', error);
      setError('❌ Failed to add student. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentFormData({
      name: student.name,
      age: student.age.toString(),
      height: student.height.toString(),
      weight: student.weight.toString()
    });
    setFormErrors({});
  };

  const handleUpdateStudent = async () => {
    if (!validateStudentForm() || !editingStudent) return;

    if (!user?.uid) {
      setError('❌ User not authenticated');
      return;
    }

    try {
      const age = Number(studentFormData.age);
      const height = Number(studentFormData.height);
      const weight = Number(studentFormData.weight);
      const bmi = calculateBMI(height, weight);
      const bmiCategory = getBMICategory(bmi);
      
      // Calculate daily calorie needs based on age, gender, and activity level
      let dailyCalorieNeeds = 2000; // Base value
      if (age < 18) {
        dailyCalorieNeeds = 1800 + (bmi < 18.5 ? 200 : bmi > 25 ? -200 : 0);
      } else if (age < 30) {
        dailyCalorieNeeds = 2200 + (bmi < 18.5 ? 300 : bmi > 25 ? -300 : 0);
      } else if (age < 50) {
        dailyCalorieNeeds = 2000 + (bmi < 18.5 ? 200 : bmi > 25 ? -200 : 0);
      } else {
        dailyCalorieNeeds = 1800 + (bmi < 18.5 ? 100 : bmi > 25 ? -100 : 0);
      }

      const updatedStudentData = {
        name: studentFormData.name.trim(),
        age,
        height,
        weight,
        bmi,
        bmiCategory,
        dailyCalorieNeeds,
        dietType: 'balanced',
        createdAt: editingStudent.createdAt
      };

      await updateStudent(user.uid, editingStudent.id, updatedStudentData);
      
      // Reset form
      setEditingStudent(null);
      setStudentFormData({ name: '', age: '', height: '', weight: '' });
      setError(`✅ ${updatedStudentData.name} updated successfully!`);
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error('Error updating student:', error);
      setError('❌ Failed to update student. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setStudentFormData({ name: '', age: '', height: '', weight: '' });
    setFormErrors({});
  };

  const handleDeleteStudent = (studentId: string, studentName: string) => {
    Alert.alert(
      'Remove Student',
      `Are you sure you want to remove ${studentName}? This will also delete their meal and exercise plans.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (!user?.uid) return;
            
            try {
              await deleteStudent(user.uid, studentId);
              setError(`✅ ${studentName} removed successfully!`);
              setTimeout(() => setError(null), 3000);
            } catch (error) {
              console.error('Error removing student:', error);
              setError('❌ Failed to remove student. Please try again.');
              setTimeout(() => setError(null), 3000);
            }
          }
        }
      ]
    );
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
            👥 Children Management
          </Text>

          <Card style={[styles.card, { backgroundColor: palette.surface }]}>
            <Card.Content style={styles.cardContent}>

              {/* Add Student Form */}
              <Card style={[styles.ageGroupCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder, borderWidth: 1 }]}>
                <Card.Title 
                  title={editingStudent ? "✏️ Edit Child" : "👤 Add New Child"} 
                  titleStyle={{ fontSize: 16, fontWeight: '600' }}
                />
                <Card.Content>
                  <TextInput
                    label="Child Name"
                    value={studentFormData.name}
                    onChangeText={(text) => setStudentFormData(prev => ({ ...prev, name: text }))}
                    style={[styles.input, { backgroundColor: palette.inputBg }]}
                    error={!!formErrors.name}
                    mode="outlined"
                  />
                  {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
                  
                  <View style={styles.row}>
                    <View style={styles.halfWidth}>
                      <TextInput
                        label="Age"
                        value={studentFormData.age}
                        onChangeText={(text) => setStudentFormData(prev => ({ ...prev, age: text }))}
                        style={[styles.input, { backgroundColor: palette.inputBg }]}
                        error={!!formErrors.age}
                        mode="outlined"
                        keyboardType="numeric"
                      />
                      {formErrors.age && <Text style={styles.errorText}>{formErrors.age}</Text>}
                    </View>
                    
                    <View style={styles.halfWidth}>
                      <TextInput
                        label="Height (cm)"
                        value={studentFormData.height}
                        onChangeText={(text) => setStudentFormData(prev => ({ ...prev, height: text }))}
                        style={[styles.input, { backgroundColor: palette.inputBg }]}
                        error={!!formErrors.height}
                        mode="outlined"
                        keyboardType="numeric"
                      />
                      {formErrors.height && <Text style={styles.errorText}>{formErrors.height}</Text>}
                    </View>
                  </View>
                  
                  <TextInput
                    label="Weight (kg)"
                    value={studentFormData.weight}
                    onChangeText={(text) => setStudentFormData(prev => ({ ...prev, weight: text }))}
                    style={[styles.input, { backgroundColor: palette.inputBg }]}
                    error={!!formErrors.weight}
                    mode="outlined"
                    keyboardType="numeric"
                  />
                  {formErrors.weight && <Text style={styles.errorText}>{formErrors.weight}</Text>}
                  
                  <View style={styles.buttonRow}>
                    {editingStudent ? (
                      <>
                        <TouchableOpacity
                          style={[styles.addChildButton, { backgroundColor: palette.accent, flex: 1, marginRight: 8 }]}
                          onPress={handleUpdateStudent}>
                          <Text style={styles.addChildText}>💾 Update</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.addChildButton, { backgroundColor: '#94a3b8', flex: 1 }]}
                          onPress={handleCancelEdit}>
                          <Text style={styles.addChildText}>❌ Cancel</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        style={[styles.addChildButton, { backgroundColor: palette.accent }]}
                        onPress={handleAddStudent}>
                        <Text style={styles.addChildText}>➕ Add Child</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Card.Content>
              </Card>

              {/* Error Message */}
              {error && (
                <Card style={[styles.errorCard, { backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1 }]}>
                  <Text style={[styles.errorText, { color: '#dc2626' }]}>{error}</Text>
                </Card>
              )}

              {/* Children List */}
              <Text style={[styles.sectionTitle, { color: palette.textPrimary, marginTop: 20 }]}>
                📋 Registered Children
              </Text>
              
              {students.length === 0 ? (
                <Card style={[styles.emptyStateCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder, borderWidth: 1 }]}>
                  <Text style={[styles.emptyStateText, { color: palette.textMuted }]}>
                    No children registered yet. Add a child above to get started.
                  </Text>
                </Card>
              ) : (
                students.map((student: Student) => (
                  <Card
                    key={student.id}
                    style={[
                      styles.studentCard,
                      {
                        backgroundColor: palette.cardBg,
                        borderColor: palette.cardBorder,
                        borderWidth: 1
                      }
                    ]}>
                    <Card.Content style={styles.studentCardContent}>
                      <View style={styles.studentInfo}>
                        <Text style={[styles.studentName, { color: palette.textPrimary }]}>
                          {student.name}
                        </Text>
                        <Text style={[styles.studentDetails, { color: palette.textMuted }]}>
                          Age: {student.age} • Height: {student.height}cm • Weight: {student.weight}kg
                        </Text>
                        <Text style={[styles.studentDetails, { color: palette.textMuted }]}>
                          BMI: {student.bmi.toFixed(1)} ({student.bmiCategory}) • Daily Calories: {student.dailyCalorieNeeds}
                        </Text>
                      </View>
                      <View style={styles.studentActions}>
                        <IconButton
                          icon="pencil"
                          size={20}
                          iconColor="#3b82f6"
                          onPress={() => handleEditStudent(student)}
                        />
                        <IconButton
                          icon="delete"
                          size={20}
                          iconColor="#ef4444"
                          onPress={() => handleDeleteStudent(student.id, student.name)}
                        />
                      </View>
                    </Card.Content>
                  </Card>
                ))
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
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Student list styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: fonts.semibold,
  },
  studentCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  studentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.medium,
  },
  studentDetails: {
    fontSize: 14,
    marginTop: 2,
    fontFamily: fonts.regular,
  },
  studentActions: {
    flexDirection: 'row',
  },

  // Other styles
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
});

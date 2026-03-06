import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  TextInput,
  Button,
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import type { RootState } from '@/src/store';
import { setStudents } from '@/src/store/trackerSlice';
import {
  createStudent, 
  updateStudent, 
  deleteStudent, 
  subscribeToStudents
} from '@/src/firebase/trackerApi';
import { calculateBMI, getBMICategory } from '@/constants/exerciseLibrary';
import type { Student, Region } from '@/types/tracker';
import { REGION_OPTIONS } from '@/constants/shelterHomeMealPlan';

// Expandable State Dropdown Component
interface StateDropdownProps {
  value: Region;
  onSelect: (region: Region) => void;
  palette: {
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
  };
}

const StateDropdown: React.FC<StateDropdownProps> = ({ value, onSelect, palette }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const selectedOption = REGION_OPTIONS.find(opt => opt.value === value);
  
  return (
    <View style={styles.regionContainer}>
      <Text style={[styles.regionLabel, { color: palette.textSecondary }]}>
        State (for meal plan)
      </Text>
      
      {/* Dropdown Header */}
      <TouchableOpacity
        style={[
          styles.dropdownHeader,
          { 
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.dropdownHeaderContent}>
          <MaterialCommunityIcons name="map-marker" size={20} color={childrenColors.primary} />
          <Text style={[styles.dropdownHeaderText, { color: palette.textPrimary }]}>
            {selectedOption?.label || 'Select State'}
          </Text>
        </View>
        <MaterialCommunityIcons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={24} 
          color={palette.textSecondary} 
        />
      </TouchableOpacity>
      
      {/* Dropdown Options */}
      {isExpanded && (
        <View style={[styles.dropdownList, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          {REGION_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.dropdownOption,
                {
                  backgroundColor: value === option.value 
                    ? childrenColors.primaryLight 
                    : 'transparent',
                },
              ]}
              onPress={() => {
                onSelect(option.value);
                setIsExpanded(false);
              }}
            >
              <View style={styles.dropdownOptionContent}>
                <MaterialCommunityIcons 
                  name="map-marker" 
                  size={18} 
                  color={value === option.value ? childrenColors.primary : palette.textSecondary} 
                />
                <Text
                  style={[
                    styles.dropdownOptionText,
                    {
                      color: value === option.value ? childrenColors.primary : palette.textPrimary,
                      fontWeight: value === option.value ? '600' : '400',
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </View>
              {value === option.value && (
                <MaterialCommunityIcons name="check" size={18} color={childrenColors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const fonts = {
  regular: 'WorkSans_400Regular',
  medium: 'WorkSans_500Medium',
  semibold: 'WorkSans_600SemiBold',
  bold: 'WorkSans_700Bold',
} as const;

// Violet theme for children
const childrenColors = {
  primary: '#8b5cf6',      // violet-500
  primaryLight: '#ede9fe', // violet-100
  primaryDark: '#7c3aed',  // violet-600
  accent: '#a78bfa',       // violet-400
  surface: '#f5f3ff',      // violet-50
};

interface StudentFormData {
  name: string;
  age: string;
  height: string;
  weight: string;
  region: Region;
}

export default function ChildrenScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { students } = useAppSelector((state: RootState) => state.tracker);
  
  const [studentFormData, setStudentFormData] = useState<StudentFormData>({
    name: '',
    age: '',
    height: '',
    weight: '',
    region: 'kolkata'
  });
  const [formErrors, setFormErrors] = useState<Partial<StudentFormData>>({});
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const palette = useMemo(() => ({
    background: theme.dark ? '#0f172a' : '#f8fafc',
    surface: theme.dark ? '#1e293b' : '#ffffff',
    textPrimary: theme.dark ? '#f1f5f9' : '#1e293b',
    textSecondary: theme.dark ? '#94a3b8' : '#64748b',
    border: theme.dark ? '#334155' : '#e2e8f0',
  }), [theme.dark]);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToStudents(user.uid, (students) => {
      dispatch(setStudents(students));
    });

    return () => unsubscribe();
  }, [user?.uid, dispatch]);

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

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

  const calculateDailyCalories = (age: number, bmi: number): number => {
    let base = 2000;
    if (age < 18) base = 1800;
    else if (age < 30) base = 2200;
    else if (age < 50) base = 2000;
    else base = 1800;
    
    return base + (bmi < 18.5 ? 200 : bmi > 25 ? -200 : 0);
  };

  const handleAddStudent = async () => {
    if (!validateStudentForm()) return;
    if (!user?.uid) {
      showMessage('User not authenticated', 'error');
      return;
    }

    try {
      const age = Number(studentFormData.age);
      const height = Number(studentFormData.height);
      const weight = Number(studentFormData.weight);
      const bmi = calculateBMI(height, weight);
      const bmiCategory = getBMICategory(bmi);
      const dailyCalorieNeeds = calculateDailyCalories(age, bmi);

      const studentData = {
        name: studentFormData.name.trim(),
        age,
        height,
        weight,
        bmi,
        bmiCategory,
        dailyCalorieNeeds,
        dietType: 'balanced',
        region: studentFormData.region,
        createdAt: new Date().toISOString()
      };

      await createStudent(user.uid, studentData);
      setStudentFormData({ name: '', age: '', height: '', weight: '', region: 'kolkata' });
      showMessage(`${studentData.name} added successfully!`);
    } catch (error) {
      console.error('Error adding student:', error);
      showMessage('Failed to add student. Please try again.', 'error');
    }
  };

  const handleUpdateStudent = async () => {
    if (!validateStudentForm() || !editingStudent) return;
    if (!user?.uid) {
      showMessage('User not authenticated', 'error');
      return;
    }

    try {
      const age = Number(studentFormData.age);
      const height = Number(studentFormData.height);
      const weight = Number(studentFormData.weight);
      const bmi = calculateBMI(height, weight);
      const bmiCategory = getBMICategory(bmi);
      const dailyCalorieNeeds = calculateDailyCalories(age, bmi);

      const updatedStudentData = {
        name: studentFormData.name.trim(),
        age,
        height,
        weight,
        bmi,
        bmiCategory,
        dailyCalorieNeeds,
        dietType: 'balanced',
        region: studentFormData.region,
        createdAt: editingStudent.createdAt
      };

      await updateStudent(user.uid, editingStudent.id, updatedStudentData);
      
      setEditingStudent(null);
      setStudentFormData({ name: '', age: '', height: '', weight: '', region: 'kolkata' });
      showMessage(`${updatedStudentData.name} updated successfully!`);
    } catch (error) {
      console.error('Error updating student:', error);
      showMessage('Failed to update student. Please try again.', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setStudentFormData({ name: '', age: '', height: '', weight: '', region: 'kolkata' });
    setFormErrors({});
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentFormData({
      name: student.name,
      age: student.age.toString(),
      height: student.height.toString(),
      weight: student.weight.toString(),
      region: student.region || 'kolkata'
    });
    setFormErrors({});
  };

  const handleDeleteStudent = (studentId: string, studentName: string) => {
    Alert.alert(
      'Remove Child',
      `Are you sure you want to remove ${studentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (!user?.uid) return;
            try {
              await deleteStudent(user.uid, studentId);
              showMessage(`${studentName} removed successfully!`);
            } catch (error) {
              console.error('Error removing student:', error);
              showMessage('Failed to remove student. Please try again.', 'error');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={[styles.header, { backgroundColor: childrenColors.surface }]}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons name="account-group" size={32} color={childrenColors.primary} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: childrenColors.primaryDark }]}>Children</Text>
              <Text style={[styles.headerSubtitle, { color: palette.textSecondary }]}>
                Manage your children's profiles
              </Text>
            </View>
          </View>

          {/* Message Banner */}
          {message && (
            <View style={[styles.messageBanner, { backgroundColor: message.type === 'success' ? childrenColors.primaryLight : '#fef2f2' }]}>
              <MaterialCommunityIcons 
                name={message.type === 'success' ? 'check-circle' : 'alert-circle'} 
                size={20} 
                color={message.type === 'success' ? childrenColors.primary : '#ef4444'} 
              />
              <Text style={[styles.messageText, { color: message.type === 'success' ? childrenColors.primaryDark : '#ef4444' }]}>
                {message.text}
              </Text>
            </View>
          )}

          {/* Quick Stats */}
          <View style={[styles.statsCard, { backgroundColor: palette.surface }]}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="account-group" size={24} color={childrenColors.primary} />
                <Text style={[styles.statValue, { color: palette.textPrimary }]}>{students.length}</Text>
                <Text style={[styles.statLabel, { color: palette.textSecondary }]}>Children</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="calculator" size={24} color={childrenColors.primary} />
                <Text style={[styles.statValue, { color: palette.textPrimary }]}>
                  {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.bmi, 0) / students.length) : 0}
                </Text>
                <Text style={[styles.statLabel, { color: palette.textSecondary }]}>Avg BMI</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="fire" size={24} color={childrenColors.primary} />
                <Text style={[styles.statValue, { color: palette.textPrimary }]}>
                  {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.dailyCalorieNeeds, 0) / students.length) : 0}
                </Text>
                <Text style={[styles.statLabel, { color: palette.textSecondary }]}>Avg Calories</Text>
              </View>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>
              {editingStudent ? 'Edit Child' : 'Add New Child'}
            </Text>
            
            <Card style={[styles.formCard, { backgroundColor: palette.surface }]}>
              <View style={styles.formContent}>
                <TextInput
                  label="Child Name"
                  value={studentFormData.name}
                  onChangeText={(text) => setStudentFormData(prev => ({ ...prev, name: text }))}
                  style={styles.input}
                  error={!!formErrors.name}
                  mode="outlined"
                  outlineColor={palette.border}
                  activeOutlineColor={childrenColors.primary}
                />
                {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
                
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <TextInput
                      label="Age (years)"
                      value={studentFormData.age}
                      onChangeText={(text) => setStudentFormData(prev => ({ ...prev, age: text }))}
                      style={styles.input}
                      error={!!formErrors.age}
                      mode="outlined"
                      keyboardType="numeric"
                      outlineColor={palette.border}
                      activeOutlineColor={childrenColors.primary}
                    />
                    {formErrors.age && <Text style={styles.errorText}>{formErrors.age}</Text>}
                  </View>
                  
                  <View style={styles.halfWidth}>
                    <TextInput
                      label="Height (cm)"
                      value={studentFormData.height}
                      onChangeText={(text) => setStudentFormData(prev => ({ ...prev, height: text }))}
                      style={styles.input}
                      error={!!formErrors.height}
                      mode="outlined"
                      keyboardType="numeric"
                      outlineColor={palette.border}
                      activeOutlineColor={childrenColors.primary}
                    />
                    {formErrors.height && <Text style={styles.errorText}>{formErrors.height}</Text>}
                  </View>
                </View>
                
                <TextInput
                  label="Weight (kg)"
                  value={studentFormData.weight}
                  onChangeText={(text) => setStudentFormData(prev => ({ ...prev, weight: text }))}
                  style={styles.input}
                  error={!!formErrors.weight}
                  mode="outlined"
                  keyboardType="numeric"
                  outlineColor={palette.border}
                  activeOutlineColor={childrenColors.primary}
                />
                {formErrors.weight && <Text style={styles.errorText}>{formErrors.weight}</Text>}
                
                {/* State Selection - Expandable Dropdown */}
                <StateDropdown 
                  value={studentFormData.region}
                  onSelect={(region) => setStudentFormData(prev => ({ ...prev, region }))}
                  palette={palette}
                />
                
                <View style={styles.buttonRow}>
                  {editingStudent ? (
                    <>
                      <Button
                        mode="contained"
                        onPress={handleUpdateStudent}
                        style={[styles.actionButton, { backgroundColor: childrenColors.primary }]}
                        labelStyle={styles.buttonLabel}
                        icon={({size, color}) => <MaterialCommunityIcons name="content-save" size={size} color={color} />}
                      >
                        Update
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={handleCancelEdit}
                        style={[styles.secondaryButton, { borderColor: palette.border }]}
                        labelStyle={[styles.buttonLabel, { color: palette.textSecondary }]}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      mode="contained"
                      onPress={handleAddStudent}
                      style={[styles.actionButton, { backgroundColor: childrenColors.primary }]}
                      labelStyle={styles.buttonLabel}
                      icon={({size, color}) => <MaterialCommunityIcons name="plus" size={size} color={color} />}
                    >
                      Add Child
                    </Button>
                  )}
                </View>
              </View>
            </Card>
          </View>

          {/* Children List */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>
              Registered Children ({students.length})
            </Text>
            
            {students.length === 0 ? (
              <Card style={[styles.emptyCard, { backgroundColor: palette.surface }]}>
                <MaterialCommunityIcons name="account-off" size={48} color={palette.textSecondary} />
                <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                  No children registered yet. Add a child to get started.
                </Text>
              </Card>
            ) : (
              <View style={styles.childrenList}>
                {students.map((student) => (
                  <Card key={student.id} style={[styles.childCard, { backgroundColor: palette.surface }]}>
                    <View style={styles.childContent}>
                      <View style={styles.childMain}>
                        <View style={[styles.childAvatar, { backgroundColor: childrenColors.primaryLight }]}>
                          <MaterialCommunityIcons name="account" size={28} color={childrenColors.primary} />
                        </View>
                        <View style={styles.childInfo}>
                          <Text style={[styles.childName, { color: palette.textPrimary }]}>
                            {student.name}
                          </Text>
                          <Text style={[styles.childMeta, { color: palette.textSecondary }]}>
                            Age {student.age} • {student.height}cm • {student.weight}kg
                          </Text>
                          <View style={styles.childStats}>
                            <View style={styles.badge}>
                              <Text style={[styles.badgeText, { color: childrenColors.primary }]}>
                                BMI {student.bmi.toFixed(1)}
                              </Text>
                            </View>
                            <View style={styles.badge}>
                              <Text style={[styles.badgeText, { color: childrenColors.primary }]}>
                                {student.dailyCalorieNeeds} cal/day
                              </Text>
                            </View>
                            <View style={[styles.badge, { backgroundColor: student.region === 'delhi' ? '#fef3c7' : '#f5f3ff' }]}>
                              <Text style={[styles.badgeText, { color: student.region === 'delhi' ? '#d97706' : childrenColors.primary }]}>
                                {student.region === 'delhi' ? 'Delhi' : 'Kolkata'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      <View style={styles.childActions}>
                        <TouchableOpacity 
                          style={[styles.iconButton, { backgroundColor: childrenColors.primaryLight }]}
                          onPress={() => handleEditStudent(student)}>
                          <MaterialCommunityIcons name="pencil" size={20} color={childrenColors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.iconButton, { backgroundColor: '#fef2f2' }]}
                          onPress={() => handleDeleteStudent(student.id, student.name)}>
                          <MaterialCommunityIcons name="delete" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </View>
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
    borderColor: '#8b5cf620',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ede9fe',
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
  statsCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fonts.bold,
    marginTop: 8,
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
  formCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formContent: {
    padding: 16,
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'transparent',
    fontFamily: fonts.regular,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginBottom: 8,
    fontFamily: fonts.regular,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    borderRadius: 10,
    flex: 1,
  },
  secondaryButton: {
    borderRadius: 10,
    borderWidth: 1,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    paddingVertical: 4,
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
  childrenList: {
    gap: 12,
  },
  childCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  childContent: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'center',
  },
  childMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  childAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  childMeta: {
    fontSize: 13,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  childStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  badge: {
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: fonts.medium,
  },
  childActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  regionContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  regionLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    marginBottom: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dropdownHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownHeaderText: {
    fontSize: 15,
    fontFamily: fonts.medium,
  },
  dropdownList: {
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dropdownOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownOptionText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
});

import React, { useMemo, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert, TouchableOpacity } from 'react-native';
import { Button, Card, Text, useTheme, TextInput, Modal, Portal, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { emailSignOut } from '@/firebase/authApi';
import { setProfile } from '@/store/authSlice';
import { calculateRecommendedCalories } from '@/utils/bmi';
import { 
  REGION_OPTIONS, 
  type DailyMealPlan, 
  type DishCombination,
  KOLKATA_WEEKLY_MENU,
  DELHI_WEEKLY_MENU 
} from '@/src/constants/shelterHomeMealPlan';

const fonts = {
  regular: 'WorkSans_400Regular',
  medium: 'WorkSans_500Medium',
  semibold: 'WorkSans_600SemiBold',
  bold: 'WorkSans_700Bold',
} as const;

// Pink theme for profile
const profileColors = {
  primary: '#ec4899',      // pink-500
  primaryLight: '#fce7f3', // pink-100
  primaryDark: '#db2777',  // pink-600
  accent: '#f472b6',       // pink-400
  surface: '#fdf2f8',      // pink-50
};

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  const [signingOut, setSigningOut] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [countryMealModalVisible, setCountryMealModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('kolkata');
  const [mealPlanData, setMealPlanData] = useState<DailyMealPlan[]>([]);
  const [editForm, setEditForm] = useState({
    name: '',
    heightCm: '',
    weightKg: '',
    screenTimeLimitMin: '',
  });

  const palette = useMemo(() => ({
    background: theme.dark ? '#0f172a' : '#f8fafc',
    surface: theme.dark ? '#1e293b' : '#ffffff',
    textPrimary: theme.dark ? '#f1f5f9' : '#1e293b',
    textSecondary: theme.dark ? '#94a3b8' : '#64748b',
    border: theme.dark ? '#334155' : '#e2e8f0',
  }), [theme.dark]);

  // Initialize edit form when profile data loads
  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        heightCm: profile.heightCm?.toString() || '',
        weightKg: profile.weightKg?.toString() || '',
        screenTimeLimitMin: profile.screenTimeLimitMin?.toString() || '',
      });
    }
  }, [profile]);

  const handleEditProfile = () => {
    setEditForm({
      name: profile?.name || '',
      heightCm: profile?.heightCm?.toString() || '',
      weightKg: profile?.weightKg?.toString() || '',
      screenTimeLimitMin: profile?.screenTimeLimitMin?.toString() || '',
    });
    setEditModalVisible(true);
  };

  const handleSaveProfile = () => {
    const height = parseFloat(editForm.heightCm);
    const weight = parseFloat(editForm.weightKg);
    const screenTime = parseInt(editForm.screenTimeLimitMin);

    if (!editForm.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (isNaN(height) || height <= 0 || height > 300) {
      Alert.alert('Error', 'Please enter a valid height (1-300 cm)');
      return;
    }

    if (isNaN(weight) || weight <= 0 || weight > 500) {
      Alert.alert('Error', 'Please enter a valid weight (1-500 kg)');
      return;
    }

    if (isNaN(screenTime) || screenTime < 30 || screenTime > 600) {
      Alert.alert('Error', 'Please enter a valid screen time limit (30-600 minutes)');
      return;
    }

    const bmi = weight / Math.pow(height / 100, 2);
    
    let bmiCategory: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 25) bmiCategory = 'Normal';
    else if (bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';

    const recommendedCalories = calculateRecommendedCalories(
      height,
      weight,
      profile?.age || 25,
      'male'
    );

    const updatedProfile = {
      uid: user?.uid || '',
      email: user?.email || '',
      name: editForm.name.trim(),
      age: profile?.age || 25,
      heightCm: height,
      weightKg: weight,
      bmi: bmi,
      bmiCategory: bmiCategory,
      calorieTarget: recommendedCalories,
      screenTimeLimitMin: screenTime,
      createdAt: profile?.createdAt || new Date().toISOString(),
      // BMI Goal Tracking - set defaults based on current values
      targetBMI: profile?.targetBMI || 22,
      targetWeight: profile?.targetWeight || weight,
      weeklyGoal: profile?.weeklyGoal || 0.5,
      targetDate: profile?.targetDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    };

    dispatch(setProfile(updatedProfile));
    setEditModalVisible(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleLogout = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await emailSignOut();
    } finally {
      setSigningOut(false);
    }
  };

  const recommendedCalories = (() => {
    if (profile?.heightCm && profile?.weightKg && profile?.age) {
      return calculateRecommendedCalories(profile.heightCm, profile.weightKg, profile.age, 'male');
    }
    return profile?.calorieTarget ?? 1800;
  })();

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView 
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: 100 }]} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header */}
        <View style={[styles.header, { backgroundColor: profileColors.surface }]}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="account-circle" size={32} color={profileColors.primary} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: profileColors.primaryDark }]}>Profile</Text>
            <Text style={[styles.headerSubtitle, { color: palette.textSecondary }]}>
              Manage your account settings
            </Text>
          </View>
        </View>

        {/* Profile Card */}
        <Card style={[styles.profileCard, { backgroundColor: palette.surface }]}>
          <View style={[styles.profileHeader, { backgroundColor: profileColors.surface }]}>
            <View style={[styles.avatarContainer, { backgroundColor: profileColors.primaryLight }]}>
              <Text style={[styles.avatarText, { color: profileColors.primary }]}>
                {profile?.name?.slice(0, 1)?.toUpperCase() ?? 'U'}
              </Text>
            </View>
            <View style={styles.profileTitle}>
              <Text style={[styles.profileName, { color: profileColors.primaryDark }]}>
                {profile?.name ?? 'User'}
              </Text>
              <Text style={[styles.profileEmail, { color: palette.textSecondary }]}>
                {user?.email ?? 'No email'}
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: profileColors.primaryLight }]}
              onPress={handleEditProfile}>
              <MaterialCommunityIcons name="pencil" size={20} color={profileColors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileContent}>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="human-male-height" size={24} color={profileColors.primary} />
                <Text style={[styles.statValue, { color: palette.textPrimary }]}>
                  {profile?.heightCm ?? 0} cm
                </Text>
                <Text style={[styles.statLabel, { color: palette.textSecondary }]}>Height</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="scale" size={24} color={profileColors.primary} />
                <Text style={[styles.statValue, { color: palette.textPrimary }]}>
                  {profile?.weightKg ?? 0} kg
                </Text>
                <Text style={[styles.statLabel, { color: palette.textSecondary }]}>Weight</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="calculator" size={24} color={profileColors.primary} />
                <Text style={[styles.statValue, { color: palette.textPrimary }]}>
                  {profile?.bmi?.toFixed(1) ?? '0.0'}
                </Text>
                <Text style={[styles.statLabel, { color: palette.textSecondary }]}>BMI</Text>
              </View>
            </View>

            {/* Additional Info */}
            <View style={[styles.infoCard, { backgroundColor: profileColors.surface }]}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="fire" size={20} color={profileColors.primary} />
                  <View>
                    <Text style={[styles.infoLabel, { color: palette.textSecondary }]}>Daily Calories</Text>
                    <Text style={[styles.infoValue, { color: palette.textPrimary }]}>
                      {recommendedCalories} kcal
                    </Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="monitor" size={20} color={profileColors.primary} />
                  <View>
                    <Text style={[styles.infoLabel, { color: palette.textSecondary }]}>Screen Limit</Text>
                    <Text style={[styles.infoValue, { color: palette.textPrimary }]}>
                      {profile?.screenTimeLimitMin ?? 180} min
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={[styles.bmiBadge, { backgroundColor: profileColors.primaryLight }]}>
                <MaterialCommunityIcons name="heart-pulse" size={16} color={profileColors.primary} />
                <Text style={[styles.bmiText, { color: profileColors.primaryDark }]}>
                  BMI Status: {profile?.bmiCategory ?? 'Unknown'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Country Meal Management Card */}
        <Card style={[styles.mealCard, { backgroundColor: palette.surface }]}>
          <View style={[styles.mealCardHeader, { backgroundColor: profileColors.surface }]}>
            <View style={[styles.mealIconContainer, { backgroundColor: profileColors.primaryLight }]}>
              <MaterialCommunityIcons name="food-variant" size={24} color={profileColors.primary} />
            </View>
            <View style={styles.mealTitleContainer}>
              <Text style={[styles.mealCardTitle, { color: profileColors.primaryDark }]}>
                Country Meal Plans
              </Text>
              <Text style={[styles.mealCardSubtitle, { color: palette.textSecondary }]}>
                Manage meals by region
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.manageButton, { backgroundColor: profileColors.primaryLight }]}
              onPress={() => {
                setSelectedCountry('kolkata');
                setMealPlanData(KOLKATA_WEEKLY_MENU);
                setCountryMealModalVisible(true);
              }}>
              <MaterialCommunityIcons name="playlist-edit" size={20} color={profileColors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.mealList}>
            {REGION_OPTIONS.map((region) => (
              <TouchableOpacity
                key={region.value}
                style={[styles.mealItem, { borderColor: palette.border }]}
                onPress={() => {
                  setSelectedCountry(region.value);
                  setMealPlanData(region.value === 'delhi' ? DELHI_WEEKLY_MENU : KOLKATA_WEEKLY_MENU);
                  setCountryMealModalVisible(true);
                }}>
                <View style={styles.mealItemContent}>
                  <MaterialCommunityIcons name="map-marker" size={20} color={profileColors.primary} />
                  <View style={styles.mealItemText}>
                    <Text style={[styles.mealItemTitle, { color: palette.textPrimary }]}>
                      {region.label}
                    </Text>
                    <Text style={[styles.mealItemSubtitle, { color: palette.textSecondary }]}>
                      {region.value === 'delhi' ? 'North Indian cuisine' : 'Bengali cuisine'}
                    </Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={palette.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Logout Button */}
        <Button
          mode="contained"
          onPress={handleLogout}
          loading={signingOut}
          disabled={signingOut}
          style={[styles.logoutButton, { backgroundColor: profileColors.primary }]}
          labelStyle={styles.logoutButtonLabel}
          icon={({size, color}) => <MaterialCommunityIcons name="logout" size={size} color={color} />}>
          Sign Out
        </Button>
      </ScrollView>
      
      {/* Edit Modal */}
      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIcon, { backgroundColor: profileColors.primaryLight }]}>
                <MaterialCommunityIcons name="account-edit" size={24} color={profileColors.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>Edit Profile</Text>
            </View>
            
            <TextInput
              label="Name"
              value={editForm.name}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
              style={styles.input}
              mode="outlined"
              outlineColor={palette.border}
              activeOutlineColor={profileColors.primary}
            />
            
            <View style={styles.inputRow}>
              <TextInput
                label="Height (cm)"
                value={editForm.heightCm}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, heightCm: text }))}
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                outlineColor={palette.border}
                activeOutlineColor={profileColors.primary}
              />
              <TextInput
                label="Weight (kg)"
                value={editForm.weightKg}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, weightKg: text }))}
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                outlineColor={palette.border}
                activeOutlineColor={profileColors.primary}
              />
            </View>
            
            <TextInput
              label="Screen Time Limit (minutes)"
              value={editForm.screenTimeLimitMin}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, screenTimeLimitMin: text }))}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              outlineColor={palette.border}
              activeOutlineColor={profileColors.primary}
            />
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setEditModalVisible(false)}
                style={[styles.modalButton, { borderColor: palette.border }]}
                labelStyle={{ color: palette.textSecondary }}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveProfile}
                style={[styles.modalButton, { backgroundColor: profileColors.primary }]}
                labelStyle={{ color: 'white' }}>
                Save
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* Country Meal Modal */}
      <Portal>
        <Modal
          visible={countryMealModalVisible}
          onDismiss={() => setCountryMealModalVisible(false)}
          contentContainerStyle={[styles.modal, { maxHeight: '80%' }]}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIcon, { backgroundColor: profileColors.primaryLight }]}>
                <MaterialCommunityIcons name="food-variant" size={24} color={profileColors.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>
                {selectedCountry === 'delhi' ? 'Delhi' : 'Kolkata'} Meal Plan
              </Text>
            </View>
            
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {mealPlanData.map((dayPlan, index) => (
                <View key={index} style={[styles.dayPlanCard, { backgroundColor: profileColors.surface, borderColor: palette.border }]}>
                  <Text style={[styles.dayPlanTitle, { color: profileColors.primaryDark }]}>
                    {dayPlan.day}
                  </Text>
                  
                  {dayPlan.specialNote && (
                    <Text style={[styles.specialNote, { color: profileColors.primary }]}>
                      {dayPlan.specialNote}
                    </Text>
                  )}
                  
                  <View style={styles.mealTypes}>
                    <View style={styles.mealTypeItem}>
                      <MaterialCommunityIcons name="coffee" size={16} color={profileColors.primary} />
                      <Text style={[styles.mealTypeText, { color: palette.textSecondary }]}>
                        Breakfast: {dayPlan.breakfast.name}
                      </Text>
                    </View>
                    <View style={styles.mealTypeItem}>
                      <MaterialCommunityIcons name="food" size={16} color={profileColors.primary} />
                      <Text style={[styles.mealTypeText, { color: palette.textSecondary }]}>
                        Lunch: {dayPlan.lunch.name}
                      </Text>
                    </View>
                    <View style={styles.mealTypeItem}>
                      <MaterialCommunityIcons name="apple" size={16} color={profileColors.primary} />
                      <Text style={[styles.mealTypeText, { color: palette.textSecondary }]}>
                        Snack: {dayPlan.snack.name}
                      </Text>
                    </View>
                    <View style={styles.mealTypeItem}>
                      <MaterialCommunityIcons name="food-variant" size={16} color={profileColors.primary} />
                      <Text style={[styles.mealTypeText, { color: palette.textSecondary }]}>
                        Dinner: {dayPlan.dinner.name}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setCountryMealModalVisible(false)}
                style={[styles.modalButton, { borderColor: palette.border }]}
                labelStyle={{ color: palette.textSecondary }}>
                Close
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
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
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ec489920',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fce7f3',
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
  profileCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#fce7f3',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: fonts.bold,
  },
  profileTitle: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fonts.bold,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContent: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
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
    height: 50,
    backgroundColor: '#e2e8f0',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fce7f3',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  bmiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bmiText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  logoutButton: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  logoutButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    paddingVertical: 4,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 16,
  },
  modalContent: {
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  modalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fonts.bold,
  },
  input: {
    backgroundColor: 'transparent',
    fontFamily: fonts.regular,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    borderRadius: 10,
  },
  // Country Meal Card Styles
  mealCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  mealCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#fce7f3',
  },
  mealIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  mealCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fonts.bold,
  },
  mealCardSubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  manageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealList: {
    padding: 8,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  mealItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealItemText: {
    marginLeft: 8,
  },
  mealItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  mealItemSubtitle: {
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  // Day Plan Modal Styles
  dayPlanCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  dayPlanTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: fonts.bold,
    marginBottom: 4,
  },
  specialNote: {
    fontSize: 12,
    fontStyle: 'italic',
    fontFamily: fonts.medium,
    marginBottom: 8,
  },
  mealTypes: {
    gap: 6,
  },
  mealTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealTypeText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    flex: 1,
  },
});

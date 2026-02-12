import React, { useMemo, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Avatar, Button, Card, Text, useTheme, IconButton, TextInput, Modal, Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedBackground from '@/components/AnimatedBackground';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { emailSignOut } from '@/firebase/authApi';
import { setProfile } from '@/store/authSlice';
import { calculateRecommendedCalories } from '@/utils/bmi';

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  console.log('ProfileScreen - profile data:', profile);
  console.log('ProfileScreen - heightCm:', profile?.heightCm);
  console.log('ProfileScreen - weightKg:', profile?.weightKg);
  const [signingOut, setSigningOut] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    heightCm: '',
    weightKg: '',
    screenTimeLimitMin: '',
  });

const createPalette = (isDark: boolean) => ({
  textPrimary: isDark ? '#F4FFF8' : '#0f172a',
  textMuted: isDark ? 'rgba(244,255,248,0.7)' : '#475569',
  cardBg: 'white',
  cardBorder: 'transparent',
  accent: '#ec4899',
  background: 'white',
});

const palette = useMemo(() => createPalette(theme.dark), [theme.dark]);

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
    console.log('Profile data:', profile); // Debug log
    console.log('Profile heightCm:', profile?.heightCm);
    console.log('Profile weightKg:', profile?.weightKg);
    // Pre-fill form with current profile data
    setEditForm({
      name: profile?.name || '',
      heightCm: profile?.heightCm?.toString() || '',
      weightKg: profile?.weightKg?.toString() || '',
      screenTimeLimitMin: profile?.screenTimeLimitMin?.toString() || '',
    });
    setEditModalVisible(true);
  };

  const handleSaveProfile = () => {
    // Validate form data
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

    // Calculate BMI
    const bmi = weight / Math.pow(height / 100, 2);
    
    // Determine BMI category
    let bmiCategory: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 25) bmiCategory = 'Normal';
    else if (bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';

    // Calculate recommended calories based on BMI
    const recommendedCalories = calculateRecommendedCalories(
      height,
      weight,
      profile?.age || 25,
      'male' // Default to male, could be enhanced later
    );

    // Update profile with all required fields
    const updatedProfile = {
      uid: user?.uid || '',
      email: user?.email || '',
      name: editForm.name.trim(),
      age: profile?.age || 25, // Keep existing age or default
      heightCm: height,
      weightKg: weight,
      bmi: bmi,
      bmiCategory: bmiCategory,
      calorieTarget: recommendedCalories,
      screenTimeLimitMin: screenTime,
      createdAt: profile?.createdAt || new Date().toISOString(),
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

  return (
    <View style={[styles.screen, { backgroundColor: 'transparent' }]}>
      <AnimatedBackground />
      {/* App Header Bar - Fixed Position */}
      <View style={styles.appHeader}>
        <Text style={styles.appHeaderText}>Healthify</Text>
      </View>
      
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: 80 }]} showsVerticalScrollIndicator={false}>
        
        <Text variant="headlineLarge" style={[styles.title, { color: palette.textPrimary }]}>
          Profile
        </Text>
        <Text style={[styles.subtitle, { color: palette.textMuted }]}>Your account details</Text>

        <Card style={[styles.card, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder, borderWidth: 1 }]}>
          <Card.Content style={styles.cardContent}>
            <Avatar.Text
              label={profile?.name?.slice(0, 1)?.toUpperCase() ?? 'U'}
              size={64}
              style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)' }}
              color={palette.accent}
            />
            <View style={styles.details}>
              <Text style={[styles.name, { color: palette.textPrimary }]} numberOfLines={1}>
                {profile?.name ?? 'Healthy Explorer'}
              </Text>
              <Text style={[styles.meta, { color: palette.textMuted }]} numberOfLines={2}>
                {user?.email ?? 'No email registered'}
              </Text>
            </View>
            <IconButton
              icon="pencil"
              size={20}
              onPress={handleEditProfile}
              style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)' }}
              iconColor={palette.accent}
            />
          </Card.Content>
          <Card.Content style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={[styles.statLabel, { color: palette.textMuted }]}>Calorie target</Text>
              <Text style={[styles.statValue, { color: palette.textPrimary }]}>
                {(() => {
                  if (profile?.heightCm && profile?.weightKg && profile?.age) {
                    return calculateRecommendedCalories(
                      profile.heightCm,
                      profile.weightKg,
                      profile.age,
                      'male'
                    );
                  }
                  return profile?.calorieTarget ?? 1800;
                })()} kcal
              </Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={[styles.statLabel, { color: palette.textMuted }]}>Screen limit</Text>
              <Text style={[styles.statValue, { color: palette.textPrimary }]}>
                {profile?.screenTimeLimitMin ?? 180} min
              </Text>
            </View>
          </Card.Content>
          <Card.Content style={styles.additionalStats}>
            <View style={styles.statBlock}>
              <Text style={[styles.statLabel, { color: palette.textMuted }]}>Height</Text>
              <Text style={[styles.statValue, { color: palette.textPrimary }]}>
                {profile?.heightCm ?? 0} cm
              </Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={[styles.statLabel, { color: palette.textMuted }]}>Weight</Text>
              <Text style={[styles.statValue, { color: palette.textPrimary }]}>
                {profile?.weightKg ?? 0} kg
              </Text>
            </View>
          </Card.Content>
          <Card.Actions style={styles.actions}>
            <Button
              mode="contained"
              onPress={handleLogout}
              loading={signingOut}
              disabled={signingOut}
              buttonColor={palette.accent}
              textColor="white"
              style={styles.logoutButton}>
              Logout
            </Button>
          </Card.Actions>
        </Card>
      </ScrollView>
      
      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modal}>
          <View style={styles.modalContent}>
            <Text variant="headlineMedium" style={styles.modalTitle}>Edit Profile</Text>
            
            <TextInput
              label="Name"
              value={editForm.name}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Height (cm)"
              value={editForm.heightCm}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, heightCm: text }))}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Weight (kg)"
              value={editForm.weightKg}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, weightKg: text }))}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Screen Time Limit (minutes)"
              value={editForm.screenTimeLimitMin}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, screenTimeLimitMin: text }))}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />
            
            <View style={styles.modalActions}>
              <Button
                mode="text"
                onPress={() => setEditModalVisible(false)}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveProfile}
                buttonColor={palette.accent}
                textColor="white">
                Save
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 4,
    position: 'relative',
  },
  scroll: {
    paddingHorizontal: 4,
    paddingTop: 24,
    paddingBottom: 60,
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
  
  title: {
    fontWeight: '600',
    marginBottom: 24,
  },
  subtitle: {
    color: '#475569',
  },
  card: {
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingBottom: 8,
  },
  details: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
  },
  meta: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 12,
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 12,
  },
  statBlock: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
  },
  logoutButton: {
    borderRadius: 12,
    flex: 1,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalContent: {
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#0f172a',
  },
  input: {
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
});

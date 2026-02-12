import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ActivityIndicator, Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signUpWithProfile } from '@/firebase/authApi';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setAuthError } from '@/store/authSlice';
import { calculateRecommendedCalories } from '@/utils/bmi';

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

const numericFields = ['age', 'heightCm', 'weightKg', 'screenTimeLimitMin'] as const;

export default function SignupScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const authError = useAppSelector((state) => state.auth.error);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    heightCm: '',
    weightKg: '',
    screenTimeLimitMin: '',
  });
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const heroAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(heroAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 1.2,
      bounciness: 10,
    }).start();

    Animated.timing(formAnim, {
      toValue: 1,
      duration: 500,
      delay: 220,
      useNativeDriver: true,
    }).start();
  }, [heroAnim, formAnim]);

  const createPalette = (isDark: boolean) => ({
    background: isDark ? 'rgba(0,8,14,0.9)' : '#f8fafc',
    heroGradient: isDark
      ? (['#ff006e', '#8338ec', '#3a86ff'] as const)
      : (['#ff006e', '#8338ec', '#3a86ff'] as const),
    surface: 'rgba(255,255,255,0.95)',
    border: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)',
    textPrimary: '#0f172a',
    textMuted: '#475569',
    heroTitle: '#012D2A',
    heroSubtitle: 'rgba(1,45,42,0.7)',
    heroChipBg: 'rgba(255,255,255,0.2)',
    heroChipText: '#012D2A',
    formBg: 'rgba(255,255,255,0.95)',
    inputBg: 'rgba(255,255,255,0.95)',
    borderColor: 'rgba(15,23,42,0.12)',
    sectionLabel: '#475569',
    ctaActiveText: '#ffffff',
    ctaDisabledText: '#94a3b8',
    ctaActive: '#0EF1B5',
    ctaDisabledBg: '#e5e7eb',
    ctaDisabledBorder: '#d1d5db',
    accentWarm: '#f87171',
    accentCool: '#38bdf8',
    accentSun: '#facc15',
    accentLime: '#4ade80',
    accentMint: '#10b981',
    accentRose: '#f43f5e',
    accentViolet: '#8b5cf6',
    accentSky: '#0ea5e9',
    footerText: theme.dark ? '#E6FFF6' : '#E2FDF7',
    linkColor: '#0EF1B5',
    ctaBg: '#0EF1B5',
    ctaText: '#022C22',
    scrollPad: 96,
  });

  const palette = useMemo(() => createPalette(theme.dark), [theme.dark]);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()), [form.email]);
  const passwordValid = form.password.length >= 6;
  const confirmValid = form.password === form.confirmPassword && form.confirmPassword.length > 0;
  const numericValid = (value: string) => {
    const sanitized = value.trim();
    if (!sanitized.length) {
      return false;
    }
    const parsed = Number(sanitized);
    return Number.isFinite(parsed) && parsed > 0;
  };

  const numericFieldsValid = useMemo(
    () => numericFields.every((field) => numericValid(form[field])),
    [form],
  );

  const isValid = useMemo(() => {
    return form.name.trim().length > 0 && emailValid && passwordValid && confirmValid && numericFieldsValid;
  }, [confirmValid, emailValid, numericFieldsValid, passwordValid, form.name]);

  const handleSubmit = async () => {
    setTouched(true);
    if (!isValid) {
      dispatch(setAuthError('Please complete all fields with valid data.'));
      return;
    }
    try {
      setLoading(true);
      dispatch(setAuthError(null));
      
      // Calculate recommended calories based on BMI
      const recommendedCalories = calculateRecommendedCalories(
        Number(form.heightCm),
        Number(form.weightKg),
        Number(form.age),
        'male' // Default to male, could be added as a form field later
      );
      
      await signUpWithProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        age: Number(form.age),
        heightCm: Number(form.heightCm),
        weightKg: Number(form.weightKg),
        calorieTarget: recommendedCalories,
        screenTimeLimitMin: Number(form.screenTimeLimitMin),
      });
    } catch (error) {
      dispatch(setAuthError((error as Error).message));
    } finally {
      setLoading(false);
    }
  };

  const renderNumberField = (
    key: (typeof numericFields)[number],
    label: string,
    props?: Partial<React.ComponentProps<typeof TextInput>>,
  ) => (
    <TextInput
      key={key}
      label={label}
      value={form[key]}
      onChangeText={(text) => setField(key, text.replace(/[^0-9.]/g, ''))}
      keyboardType="numeric"
      mode="outlined"
      style={styles.input}
      left={<TextInput.Icon icon="chart-bell-curve" />}
      {...props}
    />
  );

  const showInvalidHint = touched && !isValid;
  const ctaActive = isValid;
  const ctaTextColor = ctaActive ? palette.ctaActiveText : palette.ctaDisabledText;
  const ctaPressDisabled = loading;

  const onCtaPress = () => {
    setTouched(true);
    if (ctaActive && !ctaPressDisabled) {
      void handleSubmit();
    }
  };

  return (
    <View style={styles.container}>
      <FloatingBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={styles.scrollWrapper}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scroll, { paddingBottom: palette.scrollPad }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}>
          <Animated.View
            style={[
              styles.heroCard,
              {
                transform: [
                  {
                    translateY: heroAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [35, 0],
                    }),
                  },
                  {
                    scale: heroAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
                opacity: heroAnim,
              },
            ]}>
            <LinearGradient
              colors={['#1FA9FF', '#0EF1B5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}>
              <Text variant="headlineLarge" style={[styles.heroTitle, { color: palette.heroTitle }]}>
                Design your healthiest loop
              </Text>
              <Text style={[styles.heroSubtitle, { color: palette.heroSubtitle }]}>
                Personalized insights for nutrition, mobility, and mindful tech time.
              </Text>
              <View style={styles.heroChips}>
                <View style={[styles.heroChip, { backgroundColor: palette.heroChipBg }]}>
                  <Text style={[styles.chipLabel, { color: palette.heroChipText }]}>Mindful Meals</Text>
                  <Text style={[styles.chipValue, { color: palette.heroChipText }]}>
                    Smart logs + macros
                  </Text>
                </View>
                <View style={[styles.heroChip, { backgroundColor: palette.heroChipBg }]}>
                  <Text style={[styles.chipLabel, { color: palette.heroChipText }]}>
                    Balanced Screen
                  </Text>
                  <Text style={[styles.chipValue, { color: palette.heroChipText }]}>Live alerts</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          <Animated.View
            style={[
              styles.formCard,
              {
                backgroundColor: palette.formBg,
                borderColor: palette.borderColor,
                opacity: formAnim,
                transform: [
                  {
                    translateY: formAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [45, 0],
                    }),
                  },
                ],
              },
            ]}>
            <Text style={[styles.sectionTitle, { color: palette.sectionLabel }]}>Identity</Text>
            <TextInput
              label="Full name"
              value={form.name}
              onChangeText={(text) => setField('name', text)}
              mode="outlined"
              style={[styles.input, { backgroundColor: palette.inputBg }]}
              left={<TextInput.Icon icon="account-outline" />}
              error={touched && !form.name.trim()}
            />
            <TextInput
              label="Email"
              value={form.email}
              onChangeText={(text) => setField('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              style={[styles.input, { backgroundColor: palette.inputBg }]}
              left={<TextInput.Icon icon="email-outline" />}
              error={touched && !emailValid}
            />

            <Text style={[styles.sectionTitle, { color: palette.sectionLabel }]}>Security</Text>
            <View style={styles.row}>
              <TextInput
                label="Password"
                value={form.password}
                onChangeText={(text) => setField('password', text)}
                secureTextEntry
                mode="outlined"
                style={[styles.input, { backgroundColor: palette.inputBg }]}
                left={<TextInput.Icon icon="lock-outline" />}
                error={touched && !passwordValid}
              />
              <TextInput
                label="Confirm"
                value={form.confirmPassword}
                onChangeText={(text) => setField('confirmPassword', text)}
                secureTextEntry
                mode="outlined"
                style={[styles.input, { backgroundColor: palette.inputBg }]}
                left={<TextInput.Icon icon="check-decagram" />}
                error={touched && !confirmValid}
              />
            </View>

            <Text style={[styles.sectionTitle, { color: palette.sectionLabel }]}>Vitals</Text>
            <View style={styles.row}>
              {renderNumberField('age', 'Age (yrs)', {
                left: <TextInput.Icon icon="calendar-range" />,
                error: touched && !numericValid(form.age),
              })}
              {renderNumberField('heightCm', 'Height (cm)', {
                left: <TextInput.Icon icon="human-height" />,
                error: touched && !numericValid(form.heightCm),
              })}
            </View>
            <View style={styles.row}>
              {renderNumberField('weightKg', 'Weight (kg)', {
                left: <TextInput.Icon icon="scale-bathroom" />,
                error: touched && !numericValid(form.weightKg),
              })}
            </View>
            {renderNumberField('screenTimeLimitMin', 'Daily screen limit (min)', {
              left: <TextInput.Icon icon="clock-outline" />,
              error: touched && !numericValid(form.screenTimeLimitMin),
            })}

            {showInvalidHint && (
              <HelperText type="error" visible>
                Complete every field, ensure passwords match, and numeric values are above zero.
              </HelperText>
            )}
            {!!authError && (
              <HelperText type="error" visible>
                {authError}
              </HelperText>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={onCtaPress}
              disabled={ctaPressDisabled}
              style={({ pressed }) => [
                styles.ctaPressable,
                ctaActive
                  ? { backgroundColor: palette.ctaActive, transform: [{ scale: pressed ? 0.97 : 1 }] }
                  : {
                      backgroundColor: palette.ctaDisabledBg,
                      borderColor: palette.ctaDisabledBorder,
                      borderWidth: 1,
                    },
                ctaPressDisabled && styles.ctaDisabled,
              ]}>
              {loading ? (
                <ActivityIndicator color={ctaTextColor} />
              ) : (
                <Text style={[styles.ctaText, { color: ctaTextColor }]}>Create account</Text>
              )}
            </Pressable>
          </Animated.View>

          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: palette.footerText }]}>
              Already have an account?
            </Text>
            <Link href="/(auth)/login" asChild>
              <Button mode="text" compact labelStyle={[styles.linkLabel, { color: palette.linkColor }]}>
                Sign in
              </Button>
            </Link>
          </View>
          <View style={{ height: 32 }} />
        </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  scrollWrapper: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 70,
    gap: 28,
  },
  heroCard: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 26,
    gap: 16,
  },
  heroTitle: {
    color: '#01211d',
    fontWeight: '700',
  },
  heroSubtitle: {
    color: 'rgba(1,33,29,0.75)',
    lineHeight: 20,
  },
  heroChips: {
    flexDirection: 'row',
    gap: 12,
  },
  heroChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 18,
    padding: 14,
  },
  chipLabel: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#02312c',
    fontWeight: '600',
  },
  chipValue: {
    color: '#02312c',
    marginTop: 6,
  },
  formCard: {
    backgroundColor: 'rgba(4,21,34,0.75)',
    borderRadius: 28,
    padding: 22,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionTitle: {
    color: '#E2FDF7',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  ctaPressable: {
    marginTop: 8,
    borderRadius: 18,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    fontWeight: '600',
    fontSize: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  footerText: {
    color: '#E2FDF7',
  },
  linkLabel: {
    color: '#0EF1B5',
    fontWeight: '600',
  },
});

import React, { useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { Link } from 'expo-router';
import { signUpWithProfile } from '@/firebase/authApi';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setAuthError } from '@/store/authSlice';
import { calculateRecommendedCalories } from '@/utils/bmi';

const fonts = {
  regular: 'WorkSans_400Regular',
  medium: 'WorkSans_500Medium',
  semibold: 'WorkSans_600SemiBold',
  bold: 'WorkSans_700Bold',
} as const;

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

  const palette = {
    background: theme.dark ? '#0f172a' : '#f8fafc',
    surface: theme.dark ? '#1e293b' : '#ffffff',
    textPrimary: theme.dark ? '#f1f5f9' : '#1e293b',
    textSecondary: theme.dark ? '#94a3b8' : '#64748b',
    border: theme.dark ? '#334155' : '#e2e8f0',
    accent: '#0f172a',
    error: '#ef4444',
  };

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (authError) dispatch(setAuthError(null));
  };

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()), [form.email]);
  const passwordValid = form.password.length >= 6;
  const confirmValid = form.password === form.confirmPassword && form.confirmPassword.length > 0;
  const numericValid = (value: string) => {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) && parsed > 0;
  };
  const numericFieldsValid = useMemo(() => numericFields.every((field) => numericValid(form[field])), [form]);
  const isValid = form.name.trim().length > 0 && emailValid && passwordValid && confirmValid && numericFieldsValid;

  const handleSubmit = async () => {
    setTouched(true);
    if (!isValid) {
      dispatch(setAuthError('Please complete all fields with valid data.'));
      return;
    }
    try {
      setLoading(true);
      dispatch(setAuthError(null));
      
      const recommendedCalories = calculateRecommendedCalories(
        Number(form.heightCm),
        Number(form.weightKg),
        Number(form.age),
        'male'
      );
      
      console.log('Form values:', { 
        heightCm: form.heightCm, 
        weightKg: form.weightKg, 
        age: form.age,
        heightType: typeof form.heightCm,
        weightType: typeof form.weightKg
      });
      
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        age: Number(form.age),
        heightCm: Number(form.heightCm),
        weightKg: Number(form.weightKg),
        calorieTarget: recommendedCalories,
        screenTimeLimitMin: Number(form.screenTimeLimitMin),
      };
      
      console.log('Signup payload:', payload);
      
      await signUpWithProfile(payload);
    } catch (error) {
      dispatch(setAuthError((error as Error).message));
    } finally {
      setLoading(false);
    }
  };

  const renderNumberField = (
    key: (typeof numericFields)[number],
    label: string,
    props?: Partial<React.ComponentProps<typeof TextInput>>
  ) => (
    <TextInput
      key={key}
      label={label}
      value={form[key]}
      onChangeText={(text) => setField(key, text.replace(/[^0-9.]/g, ''))}
      keyboardType="numeric"
      mode="outlined"
      style={[styles.input, { backgroundColor: palette.surface }]}
      outlineColor={palette.border}
      activeOutlineColor={palette.accent}
      textColor={palette.textPrimary}
      error={touched && !numericValid(form[key])}
      {...props}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
          <View style={styles.content}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: palette.textPrimary }]}>Athlead</Text>
            <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
              Create your account to get started
            </Text>

            <View style={[styles.formCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>Personal Info</Text>
              <TextInput
                label="Full name"
                value={form.name}
                onChangeText={(text) => setField('name', text)}
                mode="outlined"
                style={[styles.input, { backgroundColor: palette.surface }]}
                outlineColor={palette.border}
                activeOutlineColor={palette.accent}
                textColor={palette.textPrimary}
                error={touched && !form.name.trim()}
              />
              <TextInput
                label="Email"
                value={form.email}
                onChangeText={(text) => setField('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
                style={[styles.input, { backgroundColor: palette.surface }]}
                outlineColor={palette.border}
                activeOutlineColor={palette.accent}
                textColor={palette.textPrimary}
                error={touched && !emailValid}
              />

              <Text style={[styles.sectionLabel, { color: palette.textSecondary, marginTop: 16 }]}>Security</Text>
              <TextInput
                label="Password"
                value={form.password}
                onChangeText={(text) => setField('password', text)}
                secureTextEntry
                mode="outlined"
                style={[styles.input, { backgroundColor: palette.surface }]}
                outlineColor={palette.border}
                activeOutlineColor={palette.accent}
                textColor={palette.textPrimary}
                error={touched && !passwordValid}
              />
              <TextInput
                label="Confirm password"
                value={form.confirmPassword}
                onChangeText={(text) => setField('confirmPassword', text)}
                secureTextEntry
                mode="outlined"
                style={[styles.input, { backgroundColor: palette.surface }]}
                outlineColor={palette.border}
                activeOutlineColor={palette.accent}
                textColor={palette.textPrimary}
                error={touched && !confirmValid}
              />

              <Text style={[styles.sectionLabel, { color: palette.textSecondary, marginTop: 16 }]}>Health Profile</Text>
              <View style={styles.row}>
                {renderNumberField('age', 'Age (years)')}
                {renderNumberField('heightCm', 'Height (cm)')}
              </View>
              <View style={styles.row}>
                {renderNumberField('weightKg', 'Weight (kg)')}
                {renderNumberField('screenTimeLimitMin', 'Screen limit (min)')}
              </View>

              {touched && !isValid && (
                <HelperText type="error" visible style={[styles.errorText, { color: palette.error }]}>
                  Complete all fields. Password must be 6+ characters and match.
                </HelperText>
              )}
              {authError && (
                <HelperText type="error" visible style={[styles.errorText, { color: palette.error }]}>
                  {authError}
                </HelperText>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={[styles.submitButton, { backgroundColor: palette.accent }]}
                labelStyle={styles.submitButtonLabel}
                textColor="#ffffff">
                Create account
              </Button>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: palette.textSecondary }]}>Already have an account?</Text>
              <Link href="/(auth)/login" asChild>
                <Button
                  mode="text"
                  compact
                  labelStyle={[styles.linkLabel, { color: palette.accent }]}
                  textColor={palette.accent}>
                  Sign in
                </Button>
              </Link>
            </View>
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
    flexGrow: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 40,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: fonts.bold,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
    marginBottom: 32,
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    marginTop: 8,
    marginBottom: 8,
  },
  submitButton: {
    borderRadius: 10,
    marginTop: 16,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    paddingVertical: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 15,
    fontFamily: fonts.regular,
  },
  linkLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
});

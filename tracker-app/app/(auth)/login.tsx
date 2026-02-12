import { Link } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { emailSignIn } from '@/firebase/authApi';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setAuthError } from '@/store/authSlice';

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

export default function LoginScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const authError = useAppSelector((state) => state.auth.error);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const heroAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(heroAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 1.4,
      bounciness: 12,
    }).start();

    Animated.timing(formAnim, {
      toValue: 1,
      duration: 450,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, [heroAnim, formAnim]);

  const handleSubmit = async () => {
    if (!email || !password) {
      dispatch(setAuthError('Please enter your email and password.'));
      return;
    }

    try {
      setLoading(true);
      dispatch(setAuthError(null));
      await emailSignIn(email.trim(), password);
    } catch (error) {
      dispatch(setAuthError((error as Error).message));
    } finally {
      setLoading(false);
    }
  };

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
    heroPillBg: 'rgba(255,255,255,0.2)',
    heroPillText: '#012D2A',
    formBg: 'rgba(255,255,255,0.95)',
    inputBg: 'rgba(255,255,255,0.95)',
    borderColor: 'rgba(15,23,42,0.12)',
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
    scrollPadding: 96,
  });

  const palette = createPalette(theme.dark);

  return (
    <View style={styles.container}>
      <FloatingBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: palette.scrollPadding }]}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          <Animated.View
            style={[
              styles.heroCard,
              {
                transform: [
                  {
                    translateY: heroAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                  {
                    scale: heroAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.92, 1],
                    }),
                  },
                ],
                opacity: heroAnim,
              },
            ]}>
            <LinearGradient
              colors={['#0EF1B5', '#1FA9FF']}
              style={styles.heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Text variant="headlineMedium" style={[styles.heroTitle, { color: palette.heroTitle }]}>
                Personal Health Tracker
              </Text>
              <Text style={[styles.heroSubtitle, { color: palette.heroSubtitle }]}>
                Sync meals, workouts, and screen time with a single mindful hub.
              </Text>
              <View style={styles.heroStatsRow}>
                <View style={[styles.statPill, { backgroundColor: palette.heroPillBg }]}>
                  <Text style={[styles.statValue, { color: palette.heroPillText }]}>24h</Text>
                  <Text style={[styles.statLabel, { color: palette.heroPillText }]}>habit streak</Text>
                </View>
                <View style={[styles.statPill, { backgroundColor: palette.heroPillBg }]}>
                  <Text style={[styles.statValue, { color: palette.heroPillText }]}>+180</Text>
                  <Text style={[styles.statLabel, { color: palette.heroPillText }]}>cal mindful meals</Text>
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
                      outputRange: [40, 0],
                    }),
                  },
                ],
              },
            ]}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              style={[styles.input, { backgroundColor: palette.inputBg }]}
              left={<TextInput.Icon icon="email-outline" />}
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              mode="outlined"
              style={[styles.input, { backgroundColor: palette.inputBg }]}
              left={<TextInput.Icon icon="lock-outline" />}
            />
            {!!authError && (
              <HelperText type="error" visible>
                {authError}
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              style={styles.cta}
              contentStyle={styles.ctaContent}
              labelStyle={styles.ctaLabel}
              buttonColor={palette.ctaBg}
              textColor={palette.ctaText}
              disabled={loading}>
              Sign in
            </Button>

            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: palette.footerText }]}>New here?</Text>
              <Link href="/(auth)/signup" asChild>
                <Button
                  mode="text"
                  compact
                  labelStyle={[styles.linkLabel, { color: palette.linkColor }]}>
                  Create account
                </Button>
              </Link>
            </View>
            <View style={{ height: 24 }} />
          </Animated.View>
        </ScrollView>
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
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 80,
    gap: 28,
  },
  heroCard: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 24,
    borderRadius: 28,
    gap: 16,
  },
  heroTitle: {
    color: '#012D2A',
    fontWeight: '700',
  },
  heroSubtitle: {
    color: 'rgba(1,45,42,0.7)',
    lineHeight: 20,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 14,
    borderRadius: 18,
  },
  statValue: {
    color: '#012D2A',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: '#012D2A',
    opacity: 0.8,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  formCard: {
    backgroundColor: 'rgba(4,21,34,0.7)',
    borderRadius: 28,
    padding: 22,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cta: {
    marginTop: 8,
    borderRadius: 16,
  },
  ctaContent: {
    height: 52,
  },
  ctaLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  footerText: {
    color: '#E2FDF7',
  },
  linkLabel: {
    color: '#0EF1B5',
    fontWeight: '600',
  },
});

import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { emailSignIn } from '@/firebase/authApi';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setAuthError } from '@/store/authSlice';

const fonts = {
  regular: 'WorkSans_400Regular',
  medium: 'WorkSans_500Medium',
  semibold: 'WorkSans_600SemiBold',
  bold: 'WorkSans_700Bold',
} as const;

export default function LoginScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const authError = useAppSelector((state) => state.auth.error);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const palette = {
    background: theme.dark ? '#0f172a' : '#f8fafc',
    surface: theme.dark ? '#1e293b' : '#ffffff',
    textPrimary: theme.dark ? '#f1f5f9' : '#1e293b',
    textSecondary: theme.dark ? '#94a3b8' : '#64748b',
    border: theme.dark ? '#334155' : '#e2e8f0',
    accent: '#0f172a',
    error: '#ef4444',
  };

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
              Sign in to continue your health journey
            </Text>

            <View style={[styles.formCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <TextInput
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (authError) dispatch(setAuthError(null));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
                style={[styles.input, { backgroundColor: palette.surface }]}
                outlineColor={palette.border}
                activeOutlineColor={palette.accent}
                textColor={palette.textPrimary}
              />
              <TextInput
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (authError) dispatch(setAuthError(null));
                }}
                secureTextEntry
                mode="outlined"
                style={[styles.input, { backgroundColor: palette.surface }]}
                outlineColor={palette.border}
                activeOutlineColor={palette.accent}
                textColor={palette.textPrimary}
              />

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
                Sign in
              </Button>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: palette.textSecondary }]}>New here?</Text>
              <Link href="/(auth)/signup" asChild>
                <Button
                  mode="text"
                  compact
                  labelStyle={[styles.linkLabel, { color: palette.accent }]}
                  textColor={palette.accent}>
                  Create account
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
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 24,
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
  input: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    marginBottom: 16,
  },
  submitButton: {
    borderRadius: 10,
    marginTop: 8,
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

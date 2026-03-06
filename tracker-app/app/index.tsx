import React from 'react';
import { View, StyleSheet, ImageBackground, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, Surface, useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={require('@/assets/images/welcome-bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Surface style={styles.contentCard} elevation={4}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text variant="headlineMedium" style={styles.title}>
              Athlead
            </Text>

            <Text variant="bodyLarge" style={styles.subtitle}>
              Health & Habit Tracker for Shelter Homes
            </Text>

            <Text variant="bodyMedium" style={styles.description}>
              Track nutrition, exercise, and health metrics for children with age-appropriate meal plans and fitness programs.
            </Text>

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={() => router.push('/(auth)/login')}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                Login
              </Button>

              <Button
                mode="outlined"
                onPress={() => router.push('/(auth)/signup')}
                style={styles.signupButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                Sign Up
              </Button>
            </View>

            <Text variant="bodySmall" style={styles.terms}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </Surface>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    padding: 24,
    paddingBottom: 48,
  },
  contentCard: {
    borderRadius: 24,
    padding: 32,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  loginButton: {
    borderRadius: 12,
    backgroundColor: '#3b82f6',
  },
  signupButton: {
    borderRadius: 12,
    borderColor: '#3b82f6',
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  terms: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 16,
  },
});

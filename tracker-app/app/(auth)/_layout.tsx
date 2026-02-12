import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleAlign: 'center',
      }}>
      <Stack.Screen
        name="login"
        options={{
          title: 'Welcome back',
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: 'Create account',
        }}
      />
    </Stack>
  );
}

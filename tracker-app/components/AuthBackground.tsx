import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface AuthBackgroundProps {
  children: React.ReactNode;
}

export function AuthBackground({ children }: AuthBackgroundProps) {
  const floatA = useRef(new Animated.Value(0)).current;
  const floatB = useRef(new Animated.Value(0)).current;
  const dashOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createLoop = (value: Animated.Value, delay = 0) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 6000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
        ]),
      );

    const loopA = createLoop(floatA);
    const loopB = createLoop(floatB, 1200);
    const dashLoop = Animated.loop(
      Animated.timing(dashOffset, {
        toValue: 100,
        duration: 4500,
        useNativeDriver: true,
      }),
    );

    loopA.start();
    loopB.start();
    dashLoop.start();

    return () => {
      loopA.stop();
      loopB.stop();
      dashLoop.stop();
    };
  }, [floatA, floatB, dashOffset]);

  const floatStyleA = {
    transform: [
      {
        translateY: floatA.interpolate({
          inputRange: [0, 1],
          outputRange: [-10, 12],
        }),
      },
    ],
  };

  const floatStyleB = {
    transform: [
      {
        translateY: floatB.interpolate({
          inputRange: [0, 1],
          outputRange: [15, -15],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#001524', '#002B36', '#014D40']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View style={[styles.pulseCircle, styles.circleOne, floatStyleA]} />
      <Animated.View style={[styles.pulseCircle, styles.circleTwo, floatStyleB]} />
      <Animated.View style={[styles.pulseCircle, styles.circleThree]} />

      <View pointerEvents="none" style={styles.heartLineWrapper}>
        <Svg width="260" height="130" viewBox="0 0 260 130">
          <AnimatedPath
            d="M0 70 L30 70 L55 20 L75 110 L105 45 L130 90 L155 40 L185 110 L215 55 L245 70"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="12 10"
            strokeDashoffset={dashOffset}
          />
        </Svg>
      </View>

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001524',
  },
  pulseCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.16,
    backgroundColor: '#0EF1B5',
  },
  circleOne: {
    top: -60,
    right: -40,
  },
  circleTwo: {
    bottom: 20,
    left: -80,
    backgroundColor: '#1FA9FF',
  },
  circleThree: {
    bottom: 120,
    right: 10,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F97316',
    opacity: 0.18,
  },
  heartLineWrapper: {
    position: 'absolute',
    top: 120,
    right: -40,
    opacity: 0.4,
  },
  content: {
    flex: 1,
  },
});

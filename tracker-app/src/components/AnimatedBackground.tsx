import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AnimatedBackgroundProps {
  icons?: Array<{
    name: string;
    color: string;
    left: string;
    top: string;
  }>;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  icons = [
    { name: 'dumbbell', color: '#ef4444', left: '10%', top: '15%' },
    { name: 'heart-pulse', color: '#ec4899', left: '80%', top: '25%' },
    { name: 'apple', color: '#10b981', left: '15%', top: '60%' },
    { name: 'run', color: '#3b82f6', left: '75%', top: '70%' },
    { name: 'meditation', color: '#8b5cf6', left: '50%', top: '40%' },
  ]
}) => {
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

  const animatedIcons = [
    { ...icons[0], anim: floatAnim1 },
    { ...icons[1], anim: floatAnim2 },
    { ...icons[2], anim: floatAnim3 },
    { ...icons[3], anim: floatAnim4 },
    { ...icons[4], anim: floatAnim5 },
  ];

  return (
    <View style={styles.floatingBackground}>
      {animatedIcons.map((icon, index) => (
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

const styles = StyleSheet.create({
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
    zIndex: 0,
  },
});

export default AnimatedBackground;

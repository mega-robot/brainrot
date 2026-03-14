import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '../theme';

const BrainCharacter = ({ state = 'Focused', index = 100 }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset animations
    bounceAnim.setValue(0);
    shakeAnim.setValue(0);

    if (state === 'Focused' || state === 'Drifting') {
      // Happy Bouncing
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -15, // bounce up
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Shaking dizzy animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, { // Pause between shakes
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          })
        ])
      ).start();
    }
  }, [state, bounceAnim, shakeAnim]);

  const getEmoji = () => {
    if (state === 'Focused') return '😊';
    if (state === 'Drifting') return '🫤';
    if (state === 'Distracted') return '😵‍💫';
    return '🤯'; // Doomscrolling
  };

  const getColor = () => {
    if (state === 'Focused') return colors.primary;
    if (state === 'Drifting') return colors.warning;
    if (state === 'Distracted') return colors.accent;
    return colors.textLight; // Grey/Drain out
  };

  return (
    <View style={styles.container}>
      {/* Halo effect behind the brain based on index */}
      <View style={[styles.halo, { backgroundColor: getColor(), opacity: index / 200 }]} />
      
      <Animated.View
        style={[
          styles.brainContainer,
          {
            backgroundColor: getColor(),
            transform: [
              { translateY: bounceAnim },
              { translateX: shakeAnim },
            ],
          },
        ]}
      >
        <Text style={styles.brainTexture}>🧠</Text>
        <Text style={styles.face}>{getEmoji()}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
  },
  halo: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 200,
    width: 250,
    height: 250,
    alignSelf: 'center',
    transform: [{ scale: 1.2 }],
  },
  brainContainer: {
    width: 140,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  brainTexture: {
    fontSize: 80,
    position: 'absolute',
    opacity: 0.6,
  },
  face: {
    fontSize: 45,
    marginTop: 15, // position eyes lower on the brain
  },
});

export default BrainCharacter;

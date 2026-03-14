import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import BrainCharacter from '../components/BrainCharacter';
import DoomscrollingDetector from '../native/DoomscrollingDetector';
import { colors, globalStyles } from '../theme';

const HomeScreen = ({ navigation }) => {
  const [index, setIndex] = useState(100);
  const [stateCat, setStateCat] = useState('Focused');
  
  // Fade anim for prompts
  const promptFade = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Listen to mock doomscrolling detector
    const handleDetection = (currentIndex, category) => {
      setIndex(Math.floor(currentIndex));
      setStateCat(category);
      
      // If we entered Doomscrolling state, gently interrupt
      if (category === 'Doomscrolling' && currentIndex < 10) {
        showGentlePrompt();
      }
    };
    DoomscrollingDetector.addListener(handleDetection);

    return () => DoomscrollingDetector.removeListener(handleDetection);
  }, []);

  const showGentlePrompt = () => {
    Animated.timing(promptFade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const hidePromptAndRecover = () => {
    Animated.timing(promptFade, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    // Reward for stopping doomscrolling
    DoomscrollingDetector.updateIndex(30); 
  };

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>Hey there! ✨</Text>
        <Text style={globalStyles.subtitle}>Your Brainrot Index: {index}/100</Text>
      </View>

      <BrainCharacter state={stateCat} index={index} />

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>{stateCat}</Text>
        <Text style={styles.statusDesc}>
          {stateCat === 'Focused' && "Your mind feels clear and present!"}
          {stateCat === 'Drifting' && "Getting a bit foggy... Need a break?"}
          {stateCat === 'Distracted' && "You're constantly switching contexts."}
          {stateCat === 'Doomscrolling' && "You seem stuck in a loop. Let's pause."}
        </Text>
      </View>

      <Animated.View style={[styles.promptCard, { opacity: promptFade }]}>
         <Text style={styles.promptTitle}>Wait a second... 🌿</Text>
         <Text style={styles.promptDesc}>It looks like you've been scrolling a bit too long without a clear goal. Is this what you intended to do?</Text>
         <TouchableOpacity style={styles.promptButton} onPress={hidePromptAndRecover}>
           <Text style={styles.promptBtnText}>Take a breath & Stop</Text>
         </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity 
        style={styles.focusButton} 
        onPress={() => navigation.navigate('FocusSession')}
      >
        <Text style={styles.focusButtonText}>Start Focus Session 🌙</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statusCard: {
    ...globalStyles.card,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  statusTitle: {
    ...globalStyles.title,
    fontSize: 22,
    color: colors.accent,
  },
  statusDesc: {
    ...globalStyles.subtitle,
    textAlign: 'center',
    marginTop: 5,
  },
  promptCard: {
    position: 'absolute',
    top: 200,
    left: 20,
    right: 20,
    backgroundColor: colors.warning,
    padding: 20,
    borderRadius: 24,
    shadowColor: colors.shadow,
    elevation: 10,
    alignItems: 'center',
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  promptDesc: {
    textAlign: 'center',
    color: colors.text,
    marginBottom: 20,
    fontSize: 15,
  },
  promptButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  promptBtnText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  focusButton: {
    backgroundColor: colors.accent,
    marginHorizontal: 20,
    marginTop: 30,
    padding: 18,
    borderRadius: 25,
    alignItems: 'center',
  },
  focusButtonText: {
    ...globalStyles.buttonText,
  }
});

export default HomeScreen;

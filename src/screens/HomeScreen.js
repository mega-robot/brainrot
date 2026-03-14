import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, TextInput, KeyboardAvoidingView, ScrollView } from 'react-native';
import BrainCharacter from '../components/BrainCharacter';
import DoomscrollingDetector from '../native/DoomscrollingDetector';
import { colors, globalStyles } from '../theme';

const HomeScreen = ({ navigation }) => {
  const [index, setIndex] = useState(100);
  const [stateCat, setStateCat] = useState('Focused');
  const [threshold, setThreshold] = useState('5'); // Default string input
  
  // Fade anim for prompts
  const promptFade = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Read the current threshold from the native mock once it loads
    setThreshold(DoomscrollingDetector.thresholdMinutes.toString());

    // Listen to mock doomscrolling detector
    const handleDetection = (data) => {
      // First, handle if we should go to intervention screen immediately
      if (data.type === 'INTERVENTION') {
        navigation.navigate('InterventionScreen');
        return;
      }
      
      if (data.type === 'STATE_UPDATE') {
        setIndex(Math.floor(data.index));
        setStateCat(data.category);
        
        // If we entered Doomscrolling state naturally via points, gently interrupt
        if (data.category === 'Doomscrolling' && data.index < 10) {
          showGentlePrompt();
        }
      }
    };

    DoomscrollingDetector.addListener(handleDetection);

    return () => {
      // DoomscrollingDetector is a singleton, remove listener cleanup
      DoomscrollingDetector.removeListener(handleDetection);
    };
  }, [navigation]);

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
    DoomscrollingDetector.updateIndex(30); 
  };

  const handleUpdateThreshold = (val) => {
    setThreshold(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      DoomscrollingDetector.setThreshold(num);
    }
  };

  return (
    <KeyboardAvoidingView style={globalStyles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.scroll}>
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

        <Animated.View style={[styles.promptCard, { opacity: promptFade }]} pointerEvents={index < 10 ? 'auto' : 'none'}>
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

        {/* Scroll Limit Configuration */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsLabel}>App Limit Tracker 🛡️</Text>
          <Text style={styles.settingsDesc}>Notify me and trigger an intervention check-in if I scroll another app for over:</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.thresholdInput}
              keyboardType="number-pad"
              value={threshold}
              onChangeText={handleUpdateThreshold}
            />
            <Text style={styles.minutesLabel}>Minutes</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  statusCard: {
    ...globalStyles.card,
    marginHorizontal: 20,
    marginTop: 10,
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
    top: 250,
    left: 20,
    right: 20,
    backgroundColor: colors.warning,
    padding: 20,
    borderRadius: 24,
    shadowColor: colors.shadow,
    elevation: 20,
    alignItems: 'center',
    zIndex: 100,
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
    marginTop: 20,
    padding: 18,
    borderRadius: 25,
    alignItems: 'center',
  },
  focusButtonText: {
    ...globalStyles.buttonText,
  },
  settingsCard: {
    ...globalStyles.card,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
  },
  settingsLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  settingsDesc: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thresholdInput: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 15,
    width: 60,
    padding: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent,
  },
  minutesLabel: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  }
});

export default HomeScreen;

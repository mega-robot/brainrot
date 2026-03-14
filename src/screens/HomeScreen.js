import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, TextInput, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import BrainCharacter from '../components/BrainCharacter';
import DoomscrollingDetector from '../native/DoomscrollingDetector';
import { colors, globalStyles } from '../theme';
import { useAlert } from '../context/AlertContext';
import { useTokens } from '../context/TokenContext';

const HomeScreen = ({ navigation }) => {
  const [index, setIndex] = useState(100);
  const [stateCat, setStateCat] = useState('Focused');
  const [threshold, setThreshold] = useState('5'); // Default string input

  // Fade anim for prompts
  const promptFade = useState(new Animated.Value(0))[0];
  const showAlert = useAlert();
  const { tokens } = useTokens();

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

  const handleSetThreshold = () => {
    const num = parseFloat(threshold);
    if (!isNaN(num) && num > 0) {
      DoomscrollingDetector.setThreshold(num);
      showAlert("Limit Set 🛡️", `Tracker will alert you after ${num} minutes of continuous scrolling outside this app. If you don't return before then, you'll trigger an intervention!`);
    } else {
      showAlert("Invalid Input", "Please enter a valid number of minutes.");
    }
  };

  return (
    <KeyboardAvoidingView style={globalStyles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={globalStyles.title}>Hey there! ✨</Text>
              <Text style={globalStyles.subtitle}>Your Brainrot Index: {index}/100</Text>
              <Text style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>Powered by your On-Chain Mental Ledger</Text>
            </View>
            <View style={styles.tokenBadge}>
              <Text style={styles.tokenText}>{tokens} ✨</Text>
            </View>
          </View>
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

        {/* Scroll Limit Configuration - Main Focus */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsLabel}>Doomscrolling Limit 🌀</Text>
          <Text style={styles.settingsDesc}>We will trigger an intervention check-in if you doomscroll short-form content (like YT Shorts, IG Reels etc) over your set limit:</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.thresholdInput}
              keyboardType="number-pad"
              value={threshold}
              onChangeText={setThreshold}
            />
            <Text style={styles.minutesLabel}>Minutes</Text>
            <TouchableOpacity style={styles.setButton} onPress={handleSetThreshold}>
              <Text style={styles.setButtonText}>Set Limit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Focus Study Sessions - Secondary Focus */}
        <TouchableOpacity
          style={styles.focusButton}
          onPress={() => navigation.navigate('FocusSession')}
        >
          <Text style={styles.focusButtonText}>Start Focus Session 🌙 </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4, textAlign: 'center' }}>Mine Proof-of-Focus algorithms</Text>
        </TouchableOpacity>
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
  tokenBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tokenText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
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
    marginRight: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  setButton: {
    backgroundColor: colors.success,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  setButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default HomeScreen;

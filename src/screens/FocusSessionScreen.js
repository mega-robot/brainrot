import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView } from 'react-native';
import DoomscrollingDetector from '../native/DoomscrollingDetector';
import BrainCharacter from '../components/BrainCharacter';
import { colors, globalStyles } from '../theme';

const FocusSessionScreen = ({ navigation }) => {
  const [isActive, setIsActive] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  
  // Custom Time Setup
  const [inputMinutes, setInputMinutes] = useState('25');
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  useEffect(() => {
    let interval = null;
    if (isActive && !isFailed && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive && !isFailed) {
      clearInterval(interval);
      handleSuccess();
    }
    return () => clearInterval(interval);
  }, [isActive, isFailed, timeLeft]);

  useEffect(() => {
    // Listen for failure event
    const handleDetection = (data) => {
      if (data.type === 'SESSION_FAILED' && isActive) {
        setIsActive(false);
        setIsFailed(true);
        DoomscrollingDetector.setSessionActive(false);
      }
    };
    DoomscrollingDetector.addListener(handleDetection);

    return () => DoomscrollingDetector.removeListener(handleDetection);
  }, [isActive]);

  const startTimer = () => {
    const mins = parseInt(inputMinutes, 10);
    if (isNaN(mins) || mins <= 0) {
      Alert.alert("Invalid Time", "Please enter a valid number of minutes.");
      return;
    }
    Alert.alert(
      "Start Focus 🌙", 
      "If you exit this app or switch to another one, your session will immediately terminate. Are you ready?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Fully Commit", onPress: () => {
            setTimeLeft(mins * 60);
            setIsActive(true);
            setIsFailed(false);
            DoomscrollingDetector.setSessionActive(true);
        }}
      ]
    );
  };

  const stopTimer = () => {
    setIsActive(false);
    setIsFailed(true);
    DoomscrollingDetector.setSessionActive(false);
  };

  const handleSuccess = () => {
    setIsActive(false);
    DoomscrollingDetector.setSessionActive(false);
    DoomscrollingDetector.updateIndex(60); 
    Alert.alert(
      "Focus Complete! 🌟", 
      "You earned 15 Focus Tokens for an uninterrupted session!",
      [{ text: "Awesome!", onPress: () => navigation.goBack() }]
    );
  };

  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <KeyboardAvoidingView style={globalStyles.container} behavior="padding">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        
        {isFailed ? (
          // FAILED STATE - SAD FACE
          <View style={styles.failedContainer}>
             <BrainCharacter state="Distracted" index={15} />
             <Text style={styles.failedTitle}>Session Terminated. Ouch.</Text>
             <Text style={styles.failedDesc}>
               You exited the app and broke your focus early. No rewards were earned for this session. It's okay, let's try again when you're ready.
             </Text>
             <TouchableOpacity 
                style={styles.retryBtn} 
                onPress={() => {
                  setIsFailed(false);
                  setIsActive(false);
                  setTimeLeft(parseInt(inputMinutes, 10) * 60);
                }}
              >
                <Text style={styles.retryBtnText}>Reset Session</Text>
             </TouchableOpacity>
          </View>
        ) : (

          // ACTIVE OR SETUP STATE
          <View style={styles.activeWrapper}>
            {!isActive ? (
              <View style={styles.setupCard}>
                <Text style={styles.setupTitle}>How long will you focus?</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.minutesInput}
                    keyboardType="number-pad"
                    value={inputMinutes}
                    onChangeText={setInputMinutes}
                    maxLength={3}
                  />
                  <Text style={styles.minutesLabel}>Minutes</Text>
                </View>
              </View>
            ) : null}

            <View style={[styles.timerCircle, isActive && styles.activeCircle]}>
              <Text style={styles.timerText}>{isActive ? formatTime() : `${inputMinutes}:00`}</Text>
              <Text style={styles.timerSubText}>
                {isActive ? "Do not switch apps..." : "Ready to focus?"}
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.toggleBtn, isActive && styles.stopBtn]} 
              onPress={isActive ? stopTimer : startTimer}
            >
              <Text style={styles.toggleBtnText}>
                {isActive ? "Give up & Stop 🛑" : "Start Focus 🌙"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: {
    fontSize: 18,
    color: colors.textLight,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeWrapper: {
    alignItems: 'center',
  },
  setupCard: {
    marginBottom: 40,
    alignItems: 'center',
  },
  setupTitle: {
    fontSize: 20,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minutesInput: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 15,
    width: 80,
    padding: 10,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accent,
  },
  minutesLabel: {
    marginLeft: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 8,
    borderColor: colors.primary,
  },
  activeCircle: {
    borderColor: colors.success,
  },
  timerText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: colors.text,
  },
  timerSubText: {
    ...globalStyles.subtitle,
    marginTop: 10,
    color: colors.textLight,
  },
  toggleBtn: {
    marginTop: 60,
    backgroundColor: colors.accent,
    paddingVertical: 18,
    paddingHorizontal: 35,
    borderRadius: 30,
    shadowColor: colors.shadow,
    elevation: 8,
  },
  stopBtn: {
    backgroundColor: colors.danger,
  },
  toggleBtnText: {
    ...globalStyles.buttonText,
    fontSize: 20,
  },
  failedContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  failedTitle: {
    ...globalStyles.title,
    color: colors.danger,
    marginTop: 20,
  },
  failedDesc: {
    ...globalStyles.subtitle,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  retryBtnText: {
    ...globalStyles.buttonText,
  }
});

export default FocusSessionScreen;

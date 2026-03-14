import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import DoomscrollingDetector from '../native/DoomscrollingDetector';
import { colors, globalStyles } from '../theme';

const FocusSessionScreen = ({ navigation }) => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(interval);
      handleSuccess();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    // Listen for failure (App went to background)
    const handleDetection = (index, state) => {
      if (state === 'SESSION_FAILED' && isActive) {
        setIsActive(false);
        DoomscrollingDetector.setSessionActive(false);
        Alert.alert(
          "Focus Broken 💔",
          "You opened another app! This session is terminated and no tokens were earned.",
          [{ text: "Okay", onPress: () => navigation.goBack() }]
        );
      }
    };
    DoomscrollingDetector.addListener(handleDetection);

    return () => DoomscrollingDetector.removeListener(handleDetection);
  }, [isActive]);

  const toggleTimer = () => {
    if (!isActive) {
      Alert.alert(
        "Start Focus 🌙", 
        "If you close this app or switch to another one, your session will be instantly terminated. Ready?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Yes, fully commit", onPress: () => {
              setIsActive(true);
              DoomscrollingDetector.setSessionActive(true);
          }}
        ]
      );
    } else {
      // Manual stop
      setIsActive(false);
      DoomscrollingDetector.setSessionActive(false);
      Alert.alert("Stopped", "Session paused early. No rewards.");
    }
  };

  const handleSuccess = () => {
    setIsActive(false);
    DoomscrollingDetector.setSessionActive(false);
    DoomscrollingDetector.updateIndex(50); // huge recovery
    Alert.alert(
      "Focus Complete! 🌟", 
      "You earned 10 Focus Tokens for your uninterrupted focus!",
      [{ text: "Collect Rewards", onPress: () => navigation.navigate("Rewards") }]
    );
  };

  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.timerCircle, isActive && styles.activeCircle]}>
          <Text style={styles.timerText}>{formatTime()}</Text>
          <Text style={styles.timerSubText}>
            {isActive ? "Do not switch apps..." : "Ready to focus?"}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.toggleBtn, isActive && styles.stopBtn]} 
          onPress={toggleTimer}
        >
          <Text style={styles.toggleBtnText}>
            {isActive ? "Give up & Stop 🛑" : "Start 25m Focus 🌙"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  }
});

export default FocusSessionScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, ScrollView } from 'react-native';
import DoomscrollingDetector from '../native/DoomscrollingDetector';
import BrainCharacter from '../components/BrainCharacter';
import { colors, globalStyles } from '../theme';
import { useAlert } from '../context/AlertContext';
import { useTokens } from '../context/TokenContext';

const SquadSessionScreen = ({ route, navigation }) => {
  const { squadName, membersCount } = route.params || { squadName: "Unknown Squad", membersCount: 1 };

  const [isActive, setIsActive] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [failReason, setFailReason] = useState("");

  const [inputMinutes, setInputMinutes] = useState('25');
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  const showAlert = useAlert();
  const { addTokens } = useTokens();

  useEffect(() => {
    let interval = null;
    let failTimeout = null;

    if (isActive && !isFailed) {
      interval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(interval);
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      // Randomly simulate a teammate failing during the session
      // 15% chance someone fails
      const mightFail = Math.random() < 0.15;
      if (mightFail) {
        // Pick a random time to fail
        const failInMs = Math.random() * (timeLeft * 1000 * 0.8);
        failTimeout = setTimeout(() => {
          handleTeammateFailed();
        }, failInMs);
      }
    }

    return () => {
      clearInterval(interval);
      clearTimeout(failTimeout);
    };
  }, [isActive, isFailed]); // Run interval once when started

  useEffect(() => {
    if (timeLeft === 0 && isActive && !isFailed) {
      handleSuccess();
    }
  }, [timeLeft, isActive, isFailed]);

  // Real user failure
  useEffect(() => {
    const handleDetection = (data) => {
      if (data.type === 'SESSION_FAILED' && isActive) {
        setIsActive(false);
        setIsFailed(true);
        setFailReason("You broke focus! You let the squad down. 🤕");
        DoomscrollingDetector.setSessionActive(false);
      }
    };
    DoomscrollingDetector.addListener(handleDetection);
    return () => DoomscrollingDetector.removeListener(handleDetection);
  }, [isActive]);

  const handleTeammateFailed = () => {
    setIsActive(false);
    setIsFailed(true);
    DoomscrollingDetector.setSessionActive(false);
    setFailReason(`Oh no! A teammate in ${squadName} got distracted and opened an app. The squad session is terminated!`);
  };

  const startTimer = () => {
    const mins = parseInt(inputMinutes, 10);
    if (isNaN(mins) || mins <= 0) {
      showAlert("Invalid Time", "Please enter a valid number of minutes.");
      return;
    }
    showAlert(
      `Start ${squadName} Consensus 🚀`,
      `All ${membersCount} nodes are ready! If ANY of you switch apps, the ENTIRE SQUAD fails the block. Ready to fully commit?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Commit", onPress: () => {
            setTimeLeft(mins * 60);
            setIsActive(true);
            setIsFailed(false);
            setFailReason("");
            DoomscrollingDetector.setSessionActive(true);
          }
        }
      ]
    );
  };

  const handleSuccess = () => {
    setIsActive(false);
    DoomscrollingDetector.setSessionActive(false);
    DoomscrollingDetector.updateIndex(60);

    const mins = parseInt(inputMinutes, 10);
    // Reward multiplier: (squad size * time) / 2
    const tokensEarned = Math.floor((membersCount * mins) / 2);

    addTokens(tokensEarned);

    showAlert(
      "Consensus Reached! 🎉",
      `All ${membersCount} nodes held their focus seamlessly! Each of you minted ${tokensEarned} Soulbound Tokens!`,
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
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.topSquadText}>{squadName} Session 🌟</Text>

          {isFailed ? (
            <View style={styles.failedContainer}>
              <BrainCharacter state="Distracted" index={15} />
              <Text style={styles.failedTitle}>Consensus Broken. Ouch.</Text>
              <Text style={styles.failedDesc}>{failReason}</Text>

              <Text style={styles.failStats}>
                Tokens Minted: 0 (Squads require perfect sync!)
              </Text>

              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => {
                  setIsFailed(false);
                  setIsActive(false);
                  setTimeLeft(parseInt(inputMinutes, 10) * 60);
                }}
              >
                <Text style={styles.retryBtnText}>Gather Squad & Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.activeWrapper}>
              {!isActive ? (
                <View style={styles.setupCard}>
                  <Text style={styles.setupTitle}>Squad Focus Block time</Text>
                  <Text style={styles.setupSubtitle}>Tokens = (members * time) / 2</Text>
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
              ) : (
                <View style={styles.liveUsers}>
                  <Text style={styles.liveText}>🟢 {membersCount}/{membersCount} Connected & Focused</Text>
                </View>
              )}

              <View style={[styles.timerCircle, isActive && styles.activeCircle]}>
                <Text style={styles.timerText}>{isActive ? formatTime() : `${inputMinutes}:00`}</Text>
                <Text style={styles.timerSubText}>
                  {isActive ? "Hold the line..." : "Awaiting nodes..."}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.toggleBtn, isActive && styles.stopBtn]}
                onPress={isActive ? () => {
                  showAlert("Abandon squad?", "Stopping now breaks consensus for everyone. Sure?", [
                    { text: "No", style: "cancel" },
                    {
                      text: "Yes, quit", style: "destructive", onPress: () => {
                        setIsActive(false);
                        setIsFailed(true);
                        setFailReason("You forcibly ended the session early. The squad gets nothing!");
                        DoomscrollingDetector.setSessionActive(false);
                      }
                    }
                  ]);
                } : startTimer}
              >
                <Text style={styles.toggleBtnText}>
                  {isActive ? "Ragequit Squad 🛑" : "Sync & Start 🌙"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

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
  backBtn: {
    fontSize: 18,
    color: colors.textLight,
  },
  topSquadText: {
    ...globalStyles.title,
    textAlign: 'center',
    color: colors.accent,
    marginBottom: 20,
    fontSize: 24,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeWrapper: {
    alignItems: 'center',
  },
  setupCard: {
    marginBottom: 30,
    alignItems: 'center',
  },
  setupTitle: {
    fontSize: 20,
    color: colors.text,
    fontWeight: 'bold',
  },
  setupSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 10,
  },
  liveUsers: {
    backgroundColor: colors.success,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  liveText: {
    color: colors.white,
    fontWeight: 'bold',
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
    paddingHorizontal: 30,
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
    marginBottom: 15,
  },
  failStats: {
    fontSize: 16,
    color: colors.danger,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
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

export default SquadSessionScreen;

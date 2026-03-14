import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import BrainCharacter from '../components/BrainCharacter';
import DoomscrollingDetector from '../native/DoomscrollingDetector';
import { colors, globalStyles } from '../theme';

const InterventionScreen = ({ navigation }) => {
  const [reason, setReason] = useState('');

  const submitReflection = () => {
    if (reason.trim().length === 0) {
      Alert.alert('Try to reflect', 'Please write a small sentence about why you were scrolling or what distracted you.');
      return;
    }
    Alert.alert(
      "Good Job Reflecting! ✨", 
      "We've rewarded you with +30 focus points and 5 Tokens for catching yourself avoiding the void. Let's get back on track!",
      [{ text: "Okay", onPress: () => {
         DoomscrollingDetector.updateIndex(50);
         navigation.goBack();
      }}]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={globalStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
         <BrainCharacter state="Doomscrolling" index={5} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Your brain is exhausted. 🤯</Text>
        <Text style={styles.description}>
          You surpassed your self-imposed scroll limit! Let's pause and breathe.
        </Text>
        
        <Text style={styles.prompt}>Why were you scrolling just now?</Text>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="I was bored... I felt anxious... I just opened the app on muscle memory..."
          placeholderTextColor={colors.textLight}
          value={reason}
          onChangeText={setReason}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={submitReflection}>
          <Text style={styles.submitBtnText}>Acknowledge & Stop Scrolling</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 80,
    alignItems: 'center',
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    ...globalStyles.title,
    textAlign: 'center',
    color: colors.danger,
    marginTop: 10,
  },
  description: {
    ...globalStyles.subtitle,
    textAlign: 'center',
    color: colors.text,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  prompt: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginLeft: 5,
  },
  textInput: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    color: colors.text,
    shadowColor: colors.shadow,
    elevation: 5,
    marginBottom: 25,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: colors.shadow,
    elevation: 8,
    width: '100%',
    alignItems: 'center',
  },
  submitBtnText: {
    ...globalStyles.buttonText,
    fontSize: 18,
  }
});

export default InterventionScreen;

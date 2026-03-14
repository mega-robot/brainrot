import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { colors, globalStyles } from '../theme';

const ReflectionScreen = () => {
  const [entry, setEntry] = useState('');
  const [history, setHistory] = useState([
    { id: '0', text: 'I felt really overwhelmed by the news feed today. Sticking to my goals.', date: 'Today' }
  ]);

  const saveEntry = () => {
    if (entry.trim().length === 0) return;
    setHistory([{ id: Date.now().toString(), text: entry, date: 'Just now' }, ...history]);
    setEntry('');
    Alert.alert("Saved 📝", "Your vent is safely stored in this ephemeral space. It is completely private.");
  };

  return (
    <KeyboardAvoidingView 
      style={globalStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={globalStyles.title}>Private Space ☁️</Text>
        <Text style={globalStyles.subtitle}>Vent here. We won't keep it if you don't want us to.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="How are you feeling right now? Stressed? Scrolling to numb it out?"
            placeholderTextColor={colors.textLight}
            value={entry}
            onChangeText={setEntry}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={saveEntry}>
            <Text style={styles.saveBtnText}>Release Thoughts 🍃</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.historyTitle}>Your Recent Thoughts</Text>
        {history.map(item => (
          <View key={item.id} style={styles.historyCard}>
            <Text style={styles.historyText}>{item.text}</Text>
            <Text style={styles.historyDate}>{item.date}</Text>
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: colors.shadow,
    elevation: 8,
    marginBottom: 30,
  },
  textInput: {
    height: 150,
    textAlignVertical: 'top',
    fontSize: 16,
    color: colors.text,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  historyCard: {
    ...globalStyles.card,
    marginVertical: 8,
    shadowOpacity: 0.05,
    elevation: 2,
    marginTop: 0,
  },
  historyText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  historyDate: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 10,
    textAlign: 'right',
  }
});

export default ReflectionScreen;

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { colors, globalStyles } from '../theme';

const SquadsScreen = () => {
  const [squads, setSquads] = useState([
    { id: '1', name: 'Study Buddies 📚', members: 4, hours: 120 },
    { id: '2', name: 'Anti-Doomscroll Club 🛡️', members: 12, hours: 450 },
  ]);

  const joinSquad = () => {
    Alert.prompt(
      "Join Squad 🤝",
      "Enter Invite Code:",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Join", onPress: code => Alert.alert("Joined!", `Welcome to squad ${code}`) }
      ]
    );
  };

  const startGroupSession = (squadName) => {
    Alert.alert(
      "Sync Focus Session 🌙", 
      `Start a 1 hour focus session with ${squadName}? If anyone scrolls, the squad loses their streak!`,
      [
        { text: "Not yet", style: "cancel" },
        { text: "Yes, start", onPress: () => Alert.alert("Session Started! No distractions!") }
      ]
    );
  };

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>Focus Squads 🐾</Text>
        <Text style={globalStyles.subtitle}>Stay accountable with friends!</Text>
      </View>

      <TouchableOpacity style={styles.joinBtn} onPress={joinSquad}>
        <Text style={styles.joinBtnText}>+ Join or Create Squad</Text>
      </TouchableOpacity>

      <FlatList
        data={squads}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[globalStyles.card, { marginHorizontal: 20 }]}>
            <Text style={styles.squadName}>{item.name}</Text>
            <Text style={styles.squadDesc}>{item.members} members • {item.hours} hrs focused</Text>
            
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => startGroupSession(item.name)}
            >
              <Text style={styles.actionBtnText}>Start Sync Session 🚀</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  joinBtn: {
    backgroundColor: colors.success,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: colors.shadow,
    elevation: 8,
  },
  joinBtnText: {
    ...globalStyles.buttonText,
  },
  squadName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  squadDesc: {
    ...globalStyles.subtitle,
    marginTop: 5,
    marginBottom: 15,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
  },
  actionBtnText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default SquadsScreen;

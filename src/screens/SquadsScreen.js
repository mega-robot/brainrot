import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, globalStyles } from '../theme';
import { useAlert } from '../context/AlertContext';

const SquadsScreen = ({ navigation }) => {
  const [squads, setSquads] = useState([
    { id: '1', name: 'Study Buddies 📚', members: 4, hours: 120 },
    { id: '2', name: 'Anti-Doomscroll Club 🛡️', members: 12, hours: 450 },
  ]);
  const showAlert = useAlert();

  const joinSquad = () => {
    showAlert("Joined! 🤝", "You successfully joined the new squad!");
  };

  const startGroupSession = (item) => {
    showAlert(
      "Sync Focus Session 🌙", 
      `Start a focus session with ${item.name}? If anyone scrolls, the squad loses their streak!`,
      [
        { text: "Not yet", style: "cancel" },
        { text: "Yes, start", onPress: () => navigation.navigate('SquadSession', { squadName: item.name, membersCount: item.members }) }
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
              onPress={() => startGroupSession(item)}
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

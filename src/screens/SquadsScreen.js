import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, globalStyles } from '../theme';
import { useAlert } from '../context/AlertContext';

const SquadsScreen = ({ navigation }) => {
  const [squads, setSquads] = useState([]);
  
  // Modals state
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  
  const [squadName, setSquadName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const showAlert = useAlert();

  useEffect(() => {
    loadSquads();
  }, []);

  const loadSquads = async () => {
    try {
      const stored = await AsyncStorage.getItem('userSquads');
      if (stored) {
        setSquads(JSON.parse(stored));
      }
    } catch (e) {
      console.log('Error loading squads', e);
    }
  };

  const saveSquads = async (newSquads) => {
    setSquads(newSquads);
    try {
      await AsyncStorage.setItem('userSquads', JSON.stringify(newSquads));
    } catch (e) {}
  };

  const handleCreateSquad = () => {
    if (squadName.trim().length === 0) {
      showAlert("Oops!", "Please enter a name for your squad.");
      return;
    }
    
    // Generate a 6-character random alphanumeric code
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newSquad = {
      id: newCode,
      code: newCode,
      name: squadName.trim(),
      members: 1,
      hours: 0
    };

    const updatedSquads = [newSquad, ...squads];
    saveSquads(updatedSquads);
    
    setShowCreate(false);
    setSquadName('');
    
    showAlert("Squad Created! 🎉", `Your squad is ready. Share this invite code with friends: ${newCode}`);
  };

  const handleJoinSquad = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length === 0) {
      showAlert("Oops!", "Please enter a valid invite code.");
      return;
    }

    if (squads.find(s => s.code === code)) {
      showAlert("Already joined!", "You are already a member of this squad.");
      return;
    }

    // Simulate joining an existing squad from someone else
    const newSquad = {
      id: code,
      code: code,
      name: `Squad ${code}`,
      members: Math.floor(Math.random() * 5) + 2, // mock members
      hours: Math.floor(Math.random() * 50)
    };

    const updatedSquads = [newSquad, ...squads];
    saveSquads(updatedSquads);
    
    setShowJoin(false);
    setJoinCode('');
    
    showAlert("Joined! 🤝", `You successfully joined the squad!`);
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

  const emptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>You haven't joined any squads yet! Create or join one to focus together.</Text>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>Focus Squads 🐾</Text>
        <Text style={globalStyles.subtitle}>Stay accountable with friends!</Text>
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)}>
          <Text style={styles.btnText}>Create Squad ✏️</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.joinBtn} onPress={() => setShowJoin(true)}>
          <Text style={styles.btnText}>Join Squad 🤝</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={squads}
        keyExtractor={item => item.id}
        ListEmptyComponent={emptyComponent}
        renderItem={({ item }) => (
          <View style={[globalStyles.card, { marginHorizontal: 20 }]}>
            <View style={styles.cardHeader}>
               <Text style={styles.squadName}>{item.name}</Text>
               <Text style={styles.squadCode}>Code: {item.code}</Text>
            </View>
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

      {/* CREATE MODAL */}
      <Modal transparent visible={showCreate} animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <Text style={styles.modalTitle}>Create New Squad</Text>
             <Text style={styles.modalSub}>Give your focus group a cool name!</Text>
             
             <TextInput 
               style={styles.modalInput}
               placeholder="e.g. Study Buddies 📚"
               placeholderTextColor={colors.textLight}
               value={squadName}
               onChangeText={setSquadName}
               maxLength={25}
             />
             
             <View style={styles.modalActions}>
               <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowCreate(false)}>
                 <Text style={styles.cancelBtnText}>Cancel</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleCreateSquad}>
                 <Text style={styles.confirmBtnText}>Create</Text>
               </TouchableOpacity>
             </View>
           </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* JOIN MODAL */}
      <Modal transparent visible={showJoin} animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <Text style={styles.modalTitle}>Join Squad</Text>
             <Text style={styles.modalSub}>Enter the 6-character invite code from your friend.</Text>
             
             <TextInput 
               style={styles.modalInput}
               placeholder="e.g. X92BDZ"
               placeholderTextColor={colors.textLight}
               value={joinCode}
               onChangeText={setJoinCode}
               maxLength={6}
               autoCapitalize="characters"
             />
             
             <View style={styles.modalActions}>
               <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowJoin(false)}>
                 <Text style={styles.cancelBtnText}>Cancel</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleJoinSquad}>
                 <Text style={styles.confirmBtnText}>Join</Text>
               </TouchableOpacity>
             </View>
           </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  btnRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  createBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: colors.shadow,
    elevation: 4,
  },
  joinBtn: {
    flex: 1,
    backgroundColor: colors.success,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: colors.shadow,
    elevation: 4,
  },
  btnText: {
    ...globalStyles.buttonText,
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...globalStyles.subtitle,
    textAlign: 'center',
    lineHeight: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  squadName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  squadCode: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
    backgroundColor: '#F0F0FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  squadDesc: {
    ...globalStyles.subtitle,
    marginTop: 5,
    marginBottom: 15,
  },
  actionBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
  },
  actionBtnText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    width: '100%',
    maxWidth: 340,
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 4,
    borderColor: colors.primary,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  modalSub: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 15,
    padding: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 25,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.textLight,
  },
  confirmBtn: {
    backgroundColor: colors.success,
  },
  cancelBtnText: {
    fontWeight: 'bold',
    color: colors.textLight,
    fontSize: 16,
  },
  confirmBtnText: {
    fontWeight: 'bold',
    color: colors.white,
    fontSize: 16,
  }
});

export default SquadsScreen;

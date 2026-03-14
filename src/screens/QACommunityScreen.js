import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, ScrollView, Modal, Platform } from 'react-native';
import { colors, globalStyles } from '../theme';
import { useAlert } from '../context/AlertContext';
import { useTokens } from '../context/TokenContext';

const QACommunityScreen = () => {
  const [questions, setQuestions] = useState([
    { id: '1', author: 'Anon_0x45', text: 'How do you guys stop scrolling right before bed? I keep losing sleep.', bounty: 10, answers: [
       { id: 'a1', author: 'User_X99', text: 'I put my phone in another room and bought a physical alarm clock!', helpful: false }
    ], solved: false },
    { id: '2', author: 'FocusMage', text: 'Does anyone else feel physically anxious when trying to focus without music?', bounty: 5, answers: [], solved: false }
  ]);
  
  const [askMode, setAskMode] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  
  const [answerMode, setAnswerMode] = useState(null); // stores question ID
  const [newAnswer, setNewAnswer] = useState('');

  const { tokens, spendTokens, addTokens, walletConnected } = useTokens();
  const showAlert = useAlert();

  const handleAsk = () => {
    if (!walletConnected) {
       showAlert("Web3 Required 🔒", "Connect your Phantom wallet in the Rewards or Profile tab to post anonymously to the ledger.");
       return;
    }
    const cost = 5;
    if (newQuestion.trim().length === 0) return;

    if (tokens >= cost) {
       spendTokens(cost);
       setQuestions([{
         id: Date.now().toString(),
         author: 'You (Anon)',
         text: newQuestion,
         bounty: cost,
         answers: [],
         solved: false
       }, ...questions]);
       setAskMode(false);
       setNewQuestion('');
       showAlert("Posted securely! 🌐", `Your question was encrypted and posted to the DAO with a ${cost} token bounty.`);
    } else {
       showAlert("Not enough tokens", `You need ${cost} tokens to post this bounty.`);
    }
  };

  const handleAnswer = () => {
    if (!walletConnected) {
       showAlert("Web3 Required 🔒", "Connect your Phantom wallet in the Rewards or Profile tab to interact.");
       return;
    }
    if (newAnswer.trim().length === 0) return;

    const updated = questions.map(q => {
       if (q.id === answerMode) {
         return {
           ...q,
           answers: [...q.answers, { id: Date.now().toString(), author: 'You (Anon)', text: newAnswer, helpful: false }]
         };
       }
       return q;
    });
    setQuestions(updated);
    setAnswerMode(null);
    setNewAnswer('');
    showAlert("Answer Submitted 📝", "If the author marks this as helpful, you'll earn the token bounty!");
  };

  const markHelpful = (qId, aId, bounty) => {
    // Only the author should do this, but for prototype we let anyone do it
    const qIndex = questions.findIndex(q => q.id === qId);
    if (questions[qIndex].solved) return;

    showAlert(
      "Mark as Helpful? 🌟",
      `This will transfer the ${bounty} Token bounty to the author of this answer and close the thread.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Award Tokens", onPress: () => {
           // Theoretically sending tokens
           addTokens(bounty); // Mocking that the user earned them for demo purposes, even if they asked.
           
           const updated = [...questions];
           updated[qIndex].solved = true;
           const aIndex = updated[qIndex].answers.findIndex(a => a.id === aId);
           updated[qIndex].answers[aIndex].helpful = true;
           
           setQuestions(updated);
           showAlert("Bounty Awarded! 💸", `Smart contract executed. Tokens transferred successfully.`);
        }}
      ]
    );
  };

  const renderQuestion = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.authorBadge}>{item.author}</Text>
        <Text style={styles.bountyBadge}>💎 {item.bounty} Tokens</Text>
      </View>
      <Text style={styles.questionText}>{item.text}</Text>
      
      {item.solved && (
        <View style={styles.solvedBar}>
          <Text style={styles.solvedText}>✅ Resolved via DAO Consensus</Text>
        </View>
      )}

      {item.answers.map(ans => (
        <View key={ans.id} style={[styles.answerBox, ans.helpful && styles.helpfulAnswerBox]}>
          <Text style={styles.answerAuthor}>{ans.author} {ans.helpful && '🏆'}</Text>
          <Text style={styles.answerText}>{ans.text}</Text>
          
          {!item.solved && (
            <TouchableOpacity style={styles.helpfulBtn} onPress={() => markHelpful(item.id, ans.id, item.bounty)}>
              <Text style={styles.helpfulBtnText}>Thank You (Award Bounty)</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {!item.solved && (
        <TouchableOpacity style={styles.replyBtn} onPress={() => setAnswerMode(item.id)}>
           <Text style={styles.replyBtnText}>Write Answer ✍️</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>DAO Network 🌐</Text>
        <Text style={globalStyles.subtitle}>Anonymous Web3 Focus Community</Text>
      </View>

      <TouchableOpacity style={styles.askBtn} onPress={() => setAskMode(true)}>
         <Text style={styles.askBtnText}>+ Ask Question (Costs 5 Tokens)</Text>
      </TouchableOpacity>

      <FlatList
        data={questions}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={renderQuestion}
      />

      {/* Ask Modal */}
      <Modal transparent visible={askMode} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <Text style={styles.modalTitle}>Ask the DAO 🧠</Text>
             <Text style={styles.modalSub}>Encrypt and post your focus struggle.</Text>
             
             <TextInput 
               style={styles.modalInputLarge}
               placeholder="What are you struggling with?"
               placeholderTextColor={colors.textLight}
               value={newQuestion}
               onChangeText={setNewQuestion}
               multiline
             />
             
             <View style={styles.bountyRow}>
               <Text style={styles.bountyLabel}>Fixed Bounty:</Text>
               <Text style={styles.bountyTokens}>5 ✨</Text>
             </View>
             
             <View style={styles.modalActions}>
               <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setAskMode(false)}>
                 <Text style={styles.cancelBtnText}>Cancel</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleAsk}>
                 <Text style={styles.confirmBtnText}>Post to Chain</Text>
               </TouchableOpacity>
             </View>
           </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Answer Modal */}
      <Modal transparent visible={!!answerMode} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <Text style={styles.modalTitle}>Provide Insights 💡</Text>
             <Text style={styles.modalSub}>If the author finds this helpful, you win the bounty!</Text>
             
             <TextInput 
               style={styles.modalInputLarge}
               placeholder="Share your advice..."
               placeholderTextColor={colors.textLight}
               value={newAnswer}
               onChangeText={setNewAnswer}
               multiline
             />
             
             <View style={styles.modalActions}>
               <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setAnswerMode(null)}>
                 <Text style={styles.cancelBtnText}>Cancel</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleAnswer}>
                 <Text style={styles.confirmBtnText}>Submit Answer</Text>
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
    paddingBottom: 10,
  },
  askBtn: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: colors.shadow,
    elevation: 5,
  },
  askBtnText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    ...globalStyles.card,
    marginHorizontal: 0,
    padding: 20,
    marginTop: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorBadge: {
    backgroundColor: '#F5F5ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  bountyBadge: {
    backgroundColor: '#FFFBE6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  questionText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 15,
  },
  solvedBar: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  solvedText: {
    color: colors.success,
    fontWeight: 'bold',
    fontSize: 12,
  },
  answerBox: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderColor: '#DDDDDD',
  },
  helpfulAnswerBox: {
    backgroundColor: '#FFFDF0',
    borderColor: '#FFD700',
  },
  answerAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 5,
  },
  answerText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  replyBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#F0F0FF',
    borderRadius: 15,
    marginTop: 5,
  },
  replyBtnText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  helpfulBtn: {
    marginTop: 10,
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  helpfulBtnText: {
    color: colors.success,
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    width: '100%',
    borderRadius: 30,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInputLarge: {
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  bountyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  bountyLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 10,
  },
  bountyInput: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 10,
    width: 60,
    paddingVertical: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent,
  },
  bountyTokens: {
    fontSize: 18,
    marginLeft: 5,
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
    backgroundColor: colors.primary,
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

export default QACommunityScreen;

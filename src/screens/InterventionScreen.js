import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import BrainCharacter from '../components/BrainCharacter';
import DoomscrollingDetector from '../native/DoomscrollingDetector';
import { colors, globalStyles } from '../theme';
import { useAlert } from '../context/AlertContext';
import { useTokens } from '../context/TokenContext';
import { GoogleGenerativeAI } from '@google/generative-ai';

const InterventionScreen = ({ navigation }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', role: 'brain', text: "Hey! You've been scrolling endlessly. I'm exhausted... 🤕 Why are we doomscrolling right now?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();
  const showAlert = useAlert();
  const { addTokens, walletConnected, connectWallet } = useTokens();

  // Initialize Chat Session securely
  const getChatSession = () => {
    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("No Gemini API key found in env variables!");
        throw new Error("No API key");
      }
      
      const genAI = new GoogleGenerativeAI(apiKey);
      // gemini-1.5-flash is the currently stable and supported general chat model in the SDK
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const chat = model.startChat({
        systemInstruction: `You are the user's cute, slightly exhausted brain. 
The user was just caught doomscrolling on short-form content apps. 
Your goal is to gently ask them why they were scrolling and help them reflect. 
Be concise, warm, but firm about getting them to stop. Use emojis.
CRITICAL INSTRUCTION: Once the user provides a good reflection and explicitly agrees to stop scrolling, you must reply thanking them and include the exact phrase "READY_TO_STOP". Do not say this phrase until they genuinely reflect on their behavior and agree to stop.`
      });
      return chat;
    } catch (e) {
      console.warn("Failed to init Chat:", e);
      return null;
    }
  };

  const [chatSession, setChatSession] = useState(null);

  useEffect(() => {
    setChatSession(getChatSession());
  }, []);

  const endIntervention = () => {
    addTokens(5);
    showAlert(
      "Good Job Reflecting! ✨", 
      "You talked it out with your brain! We've rewarded you with +30 focus points and 5 Tokens for breaking the cycle. Let's get back on track!",
      [{ text: "Okay", onPress: () => {
         DoomscrollingDetector.updateIndex(30);
         navigation.goBack();
      }}]
    );
  };

  const sendMessage = async () => {
    if (inputText.trim().length === 0) return;
    
    // Safety check - make sure chat is initialized
    if (!chatSession) {
      showAlert("Brain Connection Error", "Gemini API Key is missing from the .env file. Please restart Expo server to load it!");
      return;
    }

    const userMessage = inputText.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMessage }]);
    setInputText('');
    setIsTyping(true);

    try {
      const result = await chatSession.sendMessage(userMessage);
      const responseText = result.response.text();
      
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'brain', text: responseText.replace('READY_TO_STOP', '').trim() }]);
      setIsTyping(false);

      if (responseText.includes("READY_TO_STOP")) {
        // The Brain is satisfied and authorizes the user to leave!
        setTimeout(() => {
          endIntervention();
        }, 1500);
      }

    } catch (error) {
      setIsTyping(false);
      showAlert("Brain Connection Error", "Couldn't talk to Gemini right now. Check your API key.");
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'brain', text: "I'm having a brain freeze... couldn't reach the AI." }]);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={globalStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
         <BrainCharacter state="Doomscrolling" index={5} />
         <Text style={styles.title}>Your brain is exhausted. 🤯</Text>
      </View>

      {!walletConnected ? (
        <View style={styles.lockedContainer}>
           <Text style={styles.lockedTitle}>Auth Required 🔒</Text>
           <Text style={styles.lockedDesc}>You entered a doomscroll loop. To decrypt your intervention chat and regain access, verify your on-chain identity.</Text>
           <TouchableOpacity style={styles.verifyBtn} onPress={connectWallet}>
              <Text style={styles.verifyBtnText}>Sign via Wallet 👻</Text>
           </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView 
            style={styles.chatContainer} 
            contentContainerStyle={{ paddingBottom: 20 }}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg) => (
              <View key={msg.id} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.brainBubble]}>
                <Text style={[styles.messageText, msg.role === 'user' && styles.userMessageText]}>
                   {msg.role === 'brain' ? '🧠 ' : ''}{msg.text}
                </Text>
              </View>
            ))}
            {isTyping && (
              <View style={[styles.messageBubble, styles.brainBubble]}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            )}
          </ScrollView>

          <View style={styles.inputArea}>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="I was feeling bored..."
              placeholderTextColor={colors.textLight}
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity style={styles.submitBtn} onPress={sendMessage} disabled={isTyping}>
              <Text style={styles.submitBtnText}>Talk</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    alignItems: 'center',
    paddingBottom: 10,
    backgroundColor: colors.background,
    shadowColor: colors.shadow,
    elevation: 5,
    zIndex: 10,
  },
  title: {
    ...globalStyles.title,
    textAlign: 'center',
    color: colors.danger,
    marginTop: 10,
    fontSize: 22,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 5,
  },
  brainBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEEEEE',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.white,
    fontWeight: '500',
  },
  inputArea: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: '#EEEEEE',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    color: colors.text,
    marginRight: 10,
  },
  submitBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FAF9FF',
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  lockedDesc: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.textLight,
    lineHeight: 24,
    marginBottom: 30,
  },
  verifyBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: colors.shadow,
    elevation: 5,
  },
  verifyBtnText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  }
});

export default InterventionScreen;

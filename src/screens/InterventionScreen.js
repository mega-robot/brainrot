import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import BrainCharacter from "../components/BrainCharacter";
import DoomscrollingDetector from "../native/DoomscrollingDetector";
import { colors, globalStyles } from "../theme";
import { useAlert } from "../context/AlertContext";
import { useTokens } from "../context/TokenContext";

const InterventionScreen = ({ navigation }) => {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "brain",
      text: "Hey! You've been scrolling endlessly. I'm exhausted... 🤕 Why are we doomscrolling right now?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const scrollViewRef = useRef();

  const showAlert = useAlert();
  const { addTokens, walletConnected, connectWallet } = useTokens();

  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      console.warn("Gemini API key missing!");
    }
  }, []);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const endIntervention = () => {
    addTokens(5);

    showAlert(
      "Good Job Reflecting! ✨",
      "You talked it out with your brain! We've rewarded you with +30 focus points and 5 Tokens.",
      [
        {
          text: "Okay",
          onPress: () => {
            DoomscrollingDetector.updateIndex(30);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const sendMessage = async () => {
    if (inputText.trim().length === 0) return;

    if (!apiKey) {
      showAlert(
        "Brain Connection Error",
        "Gemini API Key missing. Check your .env file."
      );
      return;
    }

    const userMessage = inputText.trim();

    const newUserMsg = {
      id: Date.now().toString(),
      role: "user",
      text: userMessage,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const prompt = `
You are the user's cute but slightly exhausted brain.

The user was just caught doomscrolling on short-form content apps.

Your job:
- Ask why they were scrolling
- Encourage reflection
- Be warm but firm
- Use emojis

IMPORTANT:
If the user genuinely reflects AND agrees to stop scrolling,
respond with a thank you and include the phrase READY_TO_STOP.
Do not include READY_TO_STOP otherwise.

User message:
${userMessage}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();

      const responseText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Hmm... my brain froze for a second.";

      const cleanedText = responseText.replace(/READY_TO_STOP/gi, "").trim();

      const brainMsg = {
        id: Date.now().toString(),
        role: "brain",
        text: cleanedText,
      };

      setMessages((prev) => [...prev, brainMsg]);
      setIsTyping(false);

      scrollToBottom();

      if (responseText.toUpperCase().includes("READY_TO_STOP")) {
        setTimeout(() => {
          endIntervention();
        }, 1500);
      }
    } catch (error) {
      console.log(error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "brain",
          text: "I'm having a brain freeze... couldn't reach the AI.",
        },
      ]);

      setIsTyping(false);

      showAlert(
        "Brain Connection Error",
        "Couldn't talk to Gemini right now."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={styles.header}>
        <BrainCharacter state="Doomscrolling" index={5} />
        <Text style={styles.title}>Your brain is exhausted 🤯</Text>
      </View>

      {!walletConnected ? (
        <View style={styles.lockedContainer}>
          <Text style={styles.lockedTitle}>Auth Required 🔒</Text>

          <Text style={styles.lockedDesc}>
            You entered a doomscroll loop. Verify your identity to continue the
            intervention.
          </Text>

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
            onContentSizeChange={scrollToBottom}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.role === "user" ? styles.userBubble : styles.brainBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.role === "user" && styles.userMessageText,
                  ]}
                >
                  {msg.role === "brain" ? "🧠 " : ""}
                  {msg.text}
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

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={sendMessage}
              disabled={isTyping}
            >
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
    alignItems: "center",
    paddingBottom: 10,
    backgroundColor: colors.background,
    elevation: 5,
  },

  title: {
    ...globalStyles.title,
    textAlign: "center",
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
    maxWidth: "85%",
    padding: 15,
    borderRadius: 20,
    marginVertical: 5,
  },

  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
    borderBottomRightRadius: 5,
  },

  brainBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#EEEEEE",
    borderBottomLeftRadius: 5,
  },

  messageText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },

  userMessageText: {
    color: colors.white,
    fontWeight: "500",
  },

  inputArea: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: "#EEEEEE",
    alignItems: "center",
  },

  textInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
  },

  submitBtnText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },

  lockedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#FAF9FF",
  },

  lockedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
  },

  lockedDesc: {
    fontSize: 16,
    textAlign: "center",
    color: colors.textLight,
    lineHeight: 24,
    marginBottom: 30,
  },

  verifyBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },

  verifyBtnText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default InterventionScreen;

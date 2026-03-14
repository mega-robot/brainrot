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
  const [personality, setPersonality] = useState("supportive");
  const [isTyping, setIsTyping] = useState(false);

  const personalities = {
    supportive: { name: "Supportive 💖", prompt: "You are the user's cute, slightly tired, and supportive brain. Be warm, empathetic, and encouraging. Help them reflect on why they were scrolling." },
    strict: { name: "Strict 💂‍♂️", prompt: "You are the user's strict, no-nonsense brain. Be firm, slightly authoritative, and stop the excuses. Tell them to get back to work immediately." },
    sarcastic: { name: "Sarcastic 🙄", prompt: "You are the user's sarcastic and witty brain. Use dry humor and teasing about their scrolling habits. Be funny but helpful." },
    optimistic: { name: "Optimistic 🌟", prompt: "You are the user's high-energy, optimistic brain. Focus on the amazing things the user can do once they stop scrolling. Be extremely hype." },
    wise: { name: "Grandpa 👴", prompt: "You are a wise, loving, and patient grandfatherly brain. Give perspective on how fast time flies and why focus matters." }
  };

  const scrollViewRef = useRef();

  const showAlert = useAlert();
  const { addTokens, walletConnected, connectWallet } = useTokens();

  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      console.warn("Gemini API key missing in environment!");
    } else {
      console.log("Gemini API Key detected (First 8 chars):", apiKey.substring(0, 8) + "...");
    }
  }, [apiKey]);

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
      const selectedPersonality = personalities[personality] || personalities.supportive;

      const payload = {
        system_instruction: {
          parts: [{
            text: `${selectedPersonality.prompt} 
            
            OPERATIONAL INSTRUCTIONS:
            1. You are talking to a user who was caught doomscrolling. 
            2. Gently (or based on your personality) ask why they were scrolling.
            3. Encourage deep reflection.
            4. Use emojis.
            5. BE CONCISE: Keep responses to 2-3 short paragraphs max.
            6. NEVER STOP MID-SENTENCE: Ensure every response is a complete thought.
            7. CRITICAL: If the user genuinely reflects and agrees to stop, include the exact phrase 'READY_TO_STOP' in your final response to authorize them to leave.`
          }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1000,
        }
      };

      // Ensure we hit the 2.5-flash model endpoint specifically
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.error) {
        console.error("API Response Error Object:", data.error);
        throw new Error(data.error.message || "API Rejected request");
      }

      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm drawing a blank... maybe refresh?";

      // Secondary check: If the user genuinely reflects, we need to end the intervention.
      // We'll use a hidden prompt check or look for our magic phrase.
      const cleanedText = responseText.replace(/READY_TO_STOP/gi, "").trim();

      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "brain",
        text: cleanedText,
      }]);

      setIsTyping(false);
      scrollToBottom();

      if (responseText.toUpperCase().includes("READY_TO_STOP")) {
        setTimeout(() => endIntervention(), 1500);
      }

    } catch (error) {
      console.error("Gemini Fetch Error:", error);
      setIsTyping(false);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "brain",
          text: "I'm having a brain freeze... couldn't reach the AI.",
        },
      ]);

      showAlert("Connection Error", "Check your .env or internet connection.");
    }
  };

  const headerScale = Math.max(0.35, 1 - (messages.length - 1) * 0.2);
  const headerHeight = Math.max(40, 180 - (messages.length - 1) * 45);

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={[styles.header, { height: headerHeight, paddingTop: messages.length > 2 ? 30 : 60 }]}>
        <View style={{ transform: [{ scale: headerScale }] }}>
          <BrainCharacter state="Doomscrolling" index={5} />
        </View>
        {messages.length < 5 && (
          <Text style={[styles.title, { fontSize: Math.max(14, 22 - (messages.length - 1) * 2) }]}>
            Your brain is exhausted 🤯
          </Text>
        )}
      </View>

      {walletConnected && messages.length === 1 && (
        <View style={styles.personalityPicker}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerScroll}>
            {Object.keys(personalities).map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.personalityBtn, personality === key && styles.activePersonalityBtn]}
                onPress={() => setPersonality(key)}
              >
                <Text style={[styles.personalityBtnText, personality === key && styles.activePersonalityBtnText]}>
                  {personalities[key].name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    elevation: 5,
    overflow: 'hidden',
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
  personalityPicker: {
    backgroundColor: colors.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  pickerScroll: {
    paddingHorizontal: 15,
  },
  personalityBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  activePersonalityBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  personalityBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
  },
  activePersonalityBtnText: {
    color: colors.white,
  },
});

export default InterventionScreen;

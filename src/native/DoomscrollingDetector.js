import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notifications to show even when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class DoomscrollingDetector {
  constructor() {
    this.brainrotIndex = 100; // 100 = Focused/Happy, 0 = Doomscrolling/Burnout
    this.listeners = [];
    this.mockTimer = null;
    this.currentState = AppState.currentState;
    
    // Focus Session state
    this.isSessionActive = false;
    
    // Tracking Variables
    this.thresholdMinutes = 5; // User-defined threshold
    this.backgroundTime = null;
    this.notificationId = null;

    this.loadSettings();

    // Note: To capture app state reliably without react hooks
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  async loadSettings() {
    try {
      const storedThreshold = await AsyncStorage.getItem('doomscrollThreshold');
      if (storedThreshold) {
        this.thresholdMinutes = parseInt(storedThreshold, 10);
      }
    } catch (e) {
      console.log('Error loading settings', e);
    }
  }

  async setThreshold(minutes) {
    this.thresholdMinutes = minutes;
    try {
      await AsyncStorage.setItem('doomscrollThreshold', minutes.toString());
    } catch (e) {}
  }

  _handleAppStateChange = async (nextAppState) => {
    // Going from inactive/background -> active
    if (this.currentState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App Foregrounded');

      if (this.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(this.notificationId);
        this.notificationId = null;
      }

      // Check if they were scrolling for too long based on our threshold
      if (this.backgroundTime) {
        const timeSpentAwayMs = Date.now() - this.backgroundTime;
        const thresholdMs = this.thresholdMinutes * 60 * 1000;
        
        if (timeSpentAwayMs >= thresholdMs) {
          // Trigger Intervention Event
          this.notifyIntervention();
          this.updateIndex(-40);
        } else {
          // Small recovery if they just quickly replied to a message
          this.updateIndex(5);
        }
      }

      this.backgroundTime = null;
    } 
    // Going from active -> background
    else if (this.currentState === 'active' && nextAppState.match(/inactive|background/)) {
      console.log('App Backgrounded');
      this.backgroundTime = Date.now();

      // If a focus session is active, instant failure!
      if (this.isSessionActive) {
        this.notifySessionFailed();
      }

      // Schedule "Brain is tired" notification after threshold minutes
      this.notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Are you okay? 🧠",
          body: `You've been scrolling for over ${this.thresholdMinutes} minutes. Tap me to check in with your brain.`,
        },
        trigger: {
          seconds: this.thresholdMinutes * 60,
        },
      });
    }

    this.currentState = nextAppState;
  };

  updateIndex(amount) {
    this.brainrotIndex = Math.min(100, Math.max(0, this.brainrotIndex + amount));
    this.notifyListeners();
  }

  getAttentionState() {
    if (this.brainrotIndex > 70) return 'Focused';
    if (this.brainrotIndex > 40) return 'Drifting';
    if (this.brainrotIndex > 10) return 'Distracted';
    return 'Doomscrolling';
  }

  setSessionActive(isActive) {
    this.isSessionActive = isActive;
  }

  addListener(callback) {
    this.listeners.push(callback);
    callback(this.brainrotIndex, this.getAttentionState());
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  notifyListeners() {
    const state = this.getAttentionState();
    this.listeners.forEach(cb => cb({
      type: 'STATE_UPDATE',
      index: this.brainrotIndex,
      category: state
    }));
  }

  notifySessionFailed() {
    this.listeners.forEach(cb => cb({ type: 'SESSION_FAILED' }));
  }

  notifyIntervention() {
    this.listeners.forEach(cb => cb({ type: 'INTERVENTION' }));
  }

  async requestAndroidPermissions() {
    if (Platform.OS === 'android') {
      // Real android OS permission prompting mock
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    }
    return true;
  }
}

export default new DoomscrollingDetector();

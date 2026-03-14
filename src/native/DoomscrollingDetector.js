import { AppState, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as IntentLauncher from 'expo-intent-launcher';

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
        this.thresholdMinutes = parseFloat(storedThreshold);
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

      // Clear potentially scheduled timers if they existed
      this.notificationId = null;

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

      // Note: expo-notifications doesn't work in Expo Go SDK 53+. 
      // We rely completely on the time difference check in App Foregrounded now!
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
      // Notifications are not supported in Expo Go SDK 53+, so we skip Push request
      // and only handle our deep system tracking alert.
      // 2. Open Native App Usage Stats Settings (Usage Access)
      // This is necessary for deep Android inspection!
      try {
        Alert.alert(
          "Enable App Tracking 📱",
          "On the next screen, please select 'Brainrot' or 'Expo Go' and turn ON 'Permit usage access' so we can accurately detect when you scroll other apps.",
          [{ 
             text: "Open Settings", 
             onPress: () => {
               IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.USAGE_ACCESS_SETTINGS).catch(e => console.log(e));
             }
          }]
        );
      } catch (e) {
        console.log("Failed to open usage settings", e);
      }
      
      return true;
    }
    return true;
  }
}

export default new DoomscrollingDetector();

/**
 * Mock representation of an Android Native Module using AccessibilityService
 * In a real application, this module would:
 * 1. Request Accessibility permissions (to track `AccessibilityEvent.TYPE_VIEW_SCROLLED`).
 * 2. Request UsageStats permissions (to track app switching).
 * 3. Send events over the React Native bridge.
 */
import { AppState, Platform } from 'react-native';

class DoomscrollingDetector {
  constructor() {
    this.brainrotIndex = 100; // 100 = Focused/Happy, 0 = Doomscrolling/Burnout
    this.listeners = [];
    this.mockTimer = null;
    this.currentState = AppState.currentState;
    this.isSessionActive = false; // "Focus Session"

    // Simulate native Android accessibility events
    this.startMockingNativeEvents();

    AppState.addEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = nextAppState => {
    if (this.currentState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!');
      // Recover some focus slightly when opening the app
      this.updateIndex(10);
    } else if (this.currentState === 'active' && nextAppState.match(/inactive|background/)) {
      console.log('App went to background');
      // If a focus session is active and app is closed, it's a failure (checking other apps)
      if (this.isSessionActive) {
        this.notifySessionFailed();
      }
    }
    this.currentState = nextAppState;
  };

  startMockingNativeEvents() {
    // Every 5 seconds, simulate user scrolling externally
    this.mockTimer = setInterval(() => {
      // In a real app, native module would push 'SCROLL_EVENT'
      const isExternal = this.currentState !== 'active';
      if (isExternal) {
        // Decrease index if scrolling outside
        this.updateIndex(-3);
      } else {
        // Increase index slowly when inside Brainrot App focusing
        this.updateIndex(1);
      }
    }, 5000);
  }

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
    this.listeners.forEach(cb => cb(this.brainrotIndex, state));
  }

  notifySessionFailed() {
    this.listeners.forEach(cb => cb(-1, 'SESSION_FAILED'));
  }

  /**
   * Request Native Accessibility/UsageStats permissions (Mocked)
   */
  async requestAndroidPermissions() {
    if (Platform.OS === 'android') {
      console.log('Requesting Accessibility & UsageStatsPermissions...');
      return new Promise(resolve => setTimeout(() => resolve(true), 1000));
    }
    return true;
  }
}

export default new DoomscrollingDetector();

import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { colors, globalStyles } from '../theme';

const KawaiiAlert = ({ visible, title, message, buttons, onClose }) => {
  if (!visible) return null;

  // Defaults if no buttons provided
  const safeButtons = buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }];

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}
          
          <View style={styles.buttonContainer}>
            {safeButtons.map((btn, index) => {
              const isCancel = btn.style === 'cancel' || btn.style === 'destructive';
              const buttonStyle = isCancel ? styles.cancelButton : styles.primaryButton;
              const textStyle = isCancel ? styles.cancelButtonText : styles.primaryButtonText;

              return (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.button, buttonStyle, safeButtons.length === 2 && styles.halfButton]}
                  onPress={() => {
                    if (btn.onPress) btn.onPress();
                    onClose();
                  }}
                >
                  <Text style={[styles.buttonText, textStyle]}>{btn.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertBox: {
    backgroundColor: colors.white,
    borderRadius: 30,
    padding: 25,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 4,
    borderColor: colors.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  halfButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.textLight,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  primaryButtonText: {
    color: colors.white,
  },
  cancelButtonText: {
    color: colors.textLight,
  }
});

export default KawaiiAlert;

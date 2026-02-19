import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Platform,
} from 'react-native';
import { Colors } from '../constants/colors';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              testID="confirm-modal-cancel-btn"
              style={styles.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="confirm-modal-confirm-btn"
              style={[styles.confirmBtn, destructive && styles.destructiveBtn]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={[styles.confirmText, destructive && styles.destructiveText]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  dialog: {
    backgroundColor: Colors.elevatedSurface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: Colors.subtleBorder,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primaryText,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.inputField,
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primaryText,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: Colors.inputField,
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveBtn: {
    backgroundColor: Colors.fireRed,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primaryText,
  },
  destructiveText: {
    color: Colors.primaryBg,
  },
});

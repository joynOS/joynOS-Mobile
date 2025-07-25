import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface PhoneAuthProps {
  phone: string;
  setPhone: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const PhoneAuth = ({ phone, setPhone, onSubmit, onBack }: PhoneAuthProps) => {
  return (
    <>
      <Text style={styles.prompt}>Enter your phone number</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone number"
        placeholderTextColor="#aaa"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TouchableOpacity style={styles.submit} onPress={onSubmit}>
        <Text style={styles.submitText}>Send Verification Code</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.back} onPress={onBack}>
        <Text style={styles.backText}>Back to other options</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  prompt: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  submit: {
    backgroundColor: '#1EC28B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  back: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  backText: {
    color: '#aaa',
    fontSize: 14,
  },
});

export default PhoneAuth;

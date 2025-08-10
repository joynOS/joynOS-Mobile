import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

interface PhoneAuthProps {
  phone: string;
  setPhone: (value: string) => void;
  onRequestPhone: (phone: string) => Promise<void>;
  onVerifyPhone: (phone: string, code: string, name?: string) => Promise<void>;
  onBack: () => void;
}

const PhoneAuth = ({
  phone,
  setPhone,
  onRequestPhone,
  onVerifyPhone,
  onBack,
}: PhoneAuthProps) => {
  const [requested, setRequested] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <>
      {!requested ? (
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
          <TouchableOpacity
            style={styles.submit}
            onPress={async () => {
              setLoading(true);
              try {
                await onRequestPhone(phone);
                setRequested(true);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || !phone}
          >
            <Text style={styles.submitText}>
              {loading ? "Sending…" : "Send Verification Code"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.back} onPress={onBack}>
            <Text style={styles.backText}>Back to other options</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.prompt}>Enter the code sent to your phone</Text>
          <TextInput
            style={styles.input}
            placeholder="4-digit code"
            placeholderTextColor="#aaa"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
          />
          <Text style={[styles.prompt, { marginTop: 12 }]}>
            Your name (optional)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />
          <TouchableOpacity
            style={styles.submit}
            onPress={async () => {
              setLoading(true);
              try {
                await onVerifyPhone(phone, code, name || undefined);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || code.length === 0}
          >
            <Text style={styles.submitText}>
              {loading ? "Verifying…" : "Verify & Continue"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.back}
            onPress={() => setRequested(false)}
          >
            <Text style={styles.backText}>Change phone number</Text>
          </TouchableOpacity>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  prompt: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  submit: {
    backgroundColor: "#1EC28B",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  back: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  backText: {
    color: "#aaa",
    fontSize: 14,
  },
});

export default PhoneAuth;

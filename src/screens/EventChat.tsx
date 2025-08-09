import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';

export default function EventChat() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'EventDetail'>>();
  const { id } = route.params;

  const [messages, setMessages] = useState<{ id: string; text: string; from: 'me' | 'other' }[]>([
    { id: '1', text: 'Welcome to the lobby! Say hi 👋', from: 'other' },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: `${Date.now()}`, text: input.trim(), from: 'me' }]);
    setInput('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.from === 'me' ? styles.me : styles.other]}>
              <Text style={styles.bubbleText}>{item.text}</Text>
            </View>
          )}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={send}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  flex: { flex: 1 },
  list: { padding: 16 },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 10,
  },
  me: { alignSelf: 'flex-end', backgroundColor: '#00C48C' },
  other: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.1)' },
  bubbleText: { color: '#fff' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  input: { flex: 1, color: '#fff', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, marginRight: 8 },
  sendBtn: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: '#fff', borderRadius: 10 },
  sendText: { color: '#fff', fontWeight: '700' },
});
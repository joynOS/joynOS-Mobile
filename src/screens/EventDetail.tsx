import React, { useMemo, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Platform, TextInput, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import type { Event } from '../shared/shared';
import { computeMatchScore } from '../shared/match';
import { Ionicons } from '@expo/vector-icons';

export default function EventDetail() {
  const route = useRoute<RouteProp<RootStackParamList, 'EventDetail'>>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { id, event } = route.params;

  const e: Event = event;
  const title = e.title;
  const imageUrl = e.imageUrl || `https://source.unsplash.com/collection/190727/1200x1600?sig=${id}`;
  const vibeScore = computeMatchScore(e);
  const vibeText = e.aiVibeAnalysis || 'High-energy match based on timing, interests, and location radius.';
  const tags = e.tags || ['NYC'];
  const attendees = useMemo(() => (
    Array.from({ length: Math.min(12, e.currentAttendees ?? 8) }).map((_, i) => ({
      id: i + 1,
      avatar: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${(i * 7) % 90}.jpg`,
    }))
  ), [e.currentAttendees]);

  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<{ id: string; text: string; from: 'me' | 'other' }[]>([]);
  const [input, setInput] = useState('');

  const seedMessages = () => {
    setMessages([
      { id: 'sys1', text: 'Welcome to the lobby! 🎉', from: 'other' },
      { id: 'sys2', text: 'Say hi and coordinate arrivals.', from: 'other' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={{ uri: imageUrl }} style={styles.headerImage} imageStyle={styles.headerImageStyle}>
        <View style={styles.headerOverlay} />
        <View style={styles.headerContent}>
          <View style={[styles.scorePill, { backgroundColor: '#00C48C' }]}>
            <Text numberOfLines={1} style={styles.scorePillText}>{vibeScore}%</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <ScrollView contentContainerStyle={[styles.contentContainer, { paddingBottom: (joined ? 160 : 100) + insets.bottom }]} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Vibe analysis</Text>
          <Text style={styles.sectionText}>{vibeText}</Text>

          <View style={styles.tagsRow}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Who’s going</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarsRow}>
            {attendees.map((a) => (
              <ImageBackground key={a.id} source={{ uri: a.avatar }} style={styles.avatar} imageStyle={styles.avatarImage} />
            ))}
          </ScrollView>
        </View>

        {joined && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Messages</Text>
            {messages.map((m) => (
              <View key={m.id} style={[styles.chatBubble, m.from === 'me' ? styles.chatMe : styles.chatOther]}>
                <Text style={styles.chatText}>{m.text}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {!joined && (
        <View style={styles.footerActions}>
          <TouchableOpacity style={[styles.footerButton, styles.footerButtonGhost]} onPress={() => { setJoined(true); seedMessages(); }}>
            <Text style={styles.footerButtonText}>Join now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.footerButton, styles.footerButtonGhost]} onPress={() => navigation.goBack()}>
            <Text style={styles.footerButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}

      {joined && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.chatContainer}>
          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Message..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity
              style={styles.chatSend}
              onPress={() => {
                if (!input.trim()) return;
                setMessages((prev) => [...prev, { id: `${Date.now()}`, text: input.trim(), from: 'me' }]);
                setInput('');
              }}
            >
              <Text style={styles.chatSendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerImage: {
    height: 340,
    justifyContent: 'flex-end',
  },
  headerImageStyle: {
    resizeMode: 'cover',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  headerContent: {
    padding: 16,
    paddingTop: 24,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  backBtnText: { color: '#fff', fontWeight: '700' },
  scoreBadge: {
    backgroundColor: '#00C48C',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  scorePill: {
    alignSelf: 'flex-start',
    minWidth: 48,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scorePillText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  avatarsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarImage: {
    borderRadius: 20,
    resizeMode: 'cover',
  },
  footerActions: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
  },
  footerButtonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  chatContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  chatList: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, maxHeight: 240 },
  chatBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  chatMe: { alignSelf: 'flex-end', backgroundColor: '#00C48C' },
  chatOther: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.1)' },
  chatText: { color: '#fff' },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  chatInput: { flex: 1, color: '#fff', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, marginRight: 8 },
  chatSend: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: '#fff', borderRadius: 10 },
  chatSendText: { color: '#fff', fontWeight: '700' },
});
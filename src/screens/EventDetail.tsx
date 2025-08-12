import React, { useMemo, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Platform, TextInput, KeyboardAvoidingView, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { eventsService } from '../services/events';
import type { EventDetail as EventDetailType } from '../types/api';
import { Ionicons } from '@expo/vector-icons';

export default function EventDetail() {
  const route = useRoute<RouteProp<RootStackParamList, 'EventDetail'>>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  const [e, setE] = React.useState<EventDetailType | null>(null);
  const [plans, setPlans] = React.useState<EventDetailType['plans']>([]);
  const [booking, setBooking] = React.useState<{ externalBookingUrl: string | null; selectedPlan: EventDetailType['plans'][number] | null } | null>(null);
  const [isBookingConfirmed, setIsBookingConfirmed] = React.useState(false);
  React.useEffect(() => {
    (async () => {
      const data = await eventsService.getById(id);
      setE(data);
      setPlans(data.plans || []);
      // Prefer backend flag for membership state
      setJoined(!!data.isMember);
      try {
        const b = await eventsService.bookingInfo(id);
        setBooking(b);
      } catch {}
    })();
  }, [id]);
  const title = e?.title ?? '';
  const imageUrl = e?.imageUrl || `https://source.unsplash.com/collection/190727/1200x1600?sig=${id}`;
  const vibeScore = e ? Math.max(70, Math.min(95, Math.floor(80 + (e.tags?.length || 0) * 3))) : 0;
  const vibeText = 'High-energy match based on timing, interests, and location radius.';
  const tags = e?.tags || ['NYC'];
  const attendees = useMemo(() => (
    Array.from({ length: 8 }).map((_, i) => ({
      id: i + 1,
      avatar: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${(i * 7) % 90}.jpg`,
    }))
  ), [e?.id]);
  const attendeeCount = attendees.length;

  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<{ id: string; text: string; from: 'me' | 'other' }[]>([]);
  const [input, setInput] = useState('');
  const [voteCountdown, setVoteCountdown] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!e?.votingEndsAt || e.votingState !== 'OPEN') { setVoteCountdown(null); return; }
    const end = new Date(e.votingEndsAt).getTime();
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      const mm = String(Math.floor(diff / 60)).padStart(2, '0');
      const ss = String(diff % 60).padStart(2, '0');
      setVoteCountdown(`${mm}:${ss}`);
      if (diff <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [e?.votingEndsAt, e?.votingState]);

  React.useEffect(() => {
    let plansTimer: any;
    let eventTimer: any;
    let chatTimer: any;
    if (joined) {
      chatTimer = setInterval(async () => {
        const list = await eventsService.chatList(id, { limit: 30 });
        setMessages(list.items.map((m) => ({ id: m.id, text: m.text, from: 'other' })));
      }, 5000);
    }
    if (e?.votingState === 'OPEN') {
      plansTimer = setInterval(async () => {
        const p = await eventsService.getPlans(id);
        setPlans(p);
      }, 5000);
      eventTimer = setInterval(async () => {
        const data = await eventsService.getById(id);
        setE(data);
        if (data.votingState !== 'OPEN') {
          clearInterval(plansTimer);
          clearInterval(eventTimer);
          const b = await eventsService.bookingInfo(id);
          setBooking(b);
        }
      }, 7000);
    }
    return () => {
      if (plansTimer) clearInterval(plansTimer);
      if (eventTimer) clearInterval(eventTimer);
      if (chatTimer) clearInterval(chatTimer);
    };
  }, [joined, e?.votingState, id]);

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
          <View style={styles.headerChipsRow}>
            {e?.votingState === 'OPEN' && (
              <View style={styles.chip}><Text style={styles.chipText}>Voting</Text></View>
            )}
            {e?.votingState === 'CLOSED' && (
              <View style={styles.chip}><Text style={styles.chipText}>Voting complete</Text></View>
            )}
            {(isBookingConfirmed) && (
              <View style={styles.chip}><Text style={styles.chipText}>Reservation ✓</Text></View>
            )}
          </View>
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
          <Text style={styles.sectionTitle}>Who’s going ({attendeeCount} {attendeeCount === 1 ? 'person' : 'people'})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarsRow}>
            {attendees.map((a) => (
              <ImageBackground key={a.id} source={{ uri: a.avatar }} style={styles.avatar} imageStyle={styles.avatarImage} />
            ))}
          </ScrollView>
        </View>

        {!joined && plans.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Plan Options</Text>
            {plans.map((p) => (
              <View key={p.id} style={styles.planRow}>
                <View style={styles.planLeft}>
                  <Text style={styles.planEmoji}>{p.emoji ?? '🎯'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planTitle}>{p.title}</Text>
                    {typeof (p as any).votes === 'number' && (
                      <Text style={styles.planSub}>{(p as any).votes} votes</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {joined && e?.votingState === 'OPEN' && (
          <View style={styles.card}>
            <View style={styles.voteHeaderRow}>
              <Text style={styles.sectionTitle}>Vote on Plans</Text>
              <Text style={styles.countdown}>{voteCountdown ?? ''}</Text>
            </View>
            {plans.map((p) => (
              <TouchableOpacity key={p.id} style={styles.planRow} onPress={async () => {
                setSelectedPlanId(p.id);
                try { await eventsService.votePlan(id, p.id); } catch {}
              }}>
                <View style={styles.planLeft}>
                  <Text style={styles.planEmoji}>{p.emoji ?? '🎯'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planTitle}>{p.title}</Text>
                    <Text style={styles.planSub}>{p.votes} votes</Text>
                  </View>
                </View>
                <View style={[styles.radio, selectedPlanId === p.id && styles.radioSelectedOuter]}>
                  {selectedPlanId === p.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {joined && e?.votingState === 'CLOSED' && (
          <View style={styles.card}>
            {plans.filter((p) => p.isSelected).map((p) => (
              <View key={p.id} style={styles.selectedPlanCard}>
                <Text style={styles.planTitle}>✓ {p.title}</Text>
                <Text style={styles.planSub}>Voting complete</Text>
              </View>
            ))}
          </View>
        )}

        {joined && e?.votingState === 'CLOSED' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Book Your Spot</Text>
            <View style={styles.bookingCard}>
              <Text style={styles.bookingTitle}>Reserve Your Table</Text>
              <Text style={styles.bookingSub}>To secure your spot for tonight</Text>
              <View style={styles.bookingActions}>
                <TouchableOpacity style={[styles.primaryBtn]} onPress={async () => { if (booking?.externalBookingUrl) await WebBrowser.openBrowserAsync(booking.externalBookingUrl); }}>
                  <Text style={styles.primaryBtnText}>Book Now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.ghostBtn]} onPress={async () => { await eventsService.bookingConfirm(id); setIsBookingConfirmed(true); }}>
                  <Text style={styles.ghostBtnText}>Already Booked</Text>
                </TouchableOpacity>
              </View>
              {isBookingConfirmed && (
                <Text style={styles.successText}>Reservation confirmed</Text>
              )}
            </View>
          </View>
        )}

        {joined && (
          <View style={styles.card}>
            {messages.map((m) => (
              <View key={m.id} style={[styles.chatBubble, m.from === 'me' ? styles.chatMe : styles.chatOther]}>
                <Text style={styles.chatText}>{m.text}</Text>
              </View>
            ))}
          </View>
        )}

        {joined && e?.votingState === 'CLOSED' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Commit to Attend?</Text>
            <View style={styles.commitRow}>
              <TouchableOpacity style={styles.primaryBtn} onPress={async () => { await eventsService.commit(id, 'IN'); }}>
                <Text style={styles.primaryBtnText}>I’m In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={async () => { await eventsService.commit(id, 'OUT'); }}>
                <Text style={styles.ghostBtnText}>Can’t Make It</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {!joined && (
        <View style={styles.footerActions}>
          <TouchableOpacity style={[styles.footerButton, styles.footerButtonGhost]} onPress={async () => { await eventsService.join(id); setJoined(true); seedMessages(); }}>
            <Text style={styles.footerButtonText}>Join now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.footerButton, styles.footerButtonGhost]} onPress={() => navigation.goBack()}>
            <Text style={styles.footerButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}

      {joined && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.chatContainer}>
          <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {['I’m so excited! 🎉', 'Count me in!', 'Ready to dance! 💃'].map((q) => (
                <TouchableOpacity key={q} style={styles.quickReply} onPress={() => setInput(q)}>
                  <Text style={styles.quickReplyText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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
              onPress={async () => {
                if (!input.trim()) return;
                const sent = await eventsService.chatSend(id, input.trim());
                setMessages((prev) => [...prev, { id: sent.id, text: sent.text, from: 'me' }]);
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
  headerChipsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  chip: { backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  chipText: { color: '#fff', fontSize: 12, fontWeight: '600' },
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
  quickReply: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  quickReplyText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },
  voteHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  countdown: { color: '#fff', fontWeight: '700' },
  planRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  planEmoji: { fontSize: 18, marginRight: 8 },
  planTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
  planSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  radioSelectedOuter: { borderColor: '#00C48C' },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00C48C' },
  selectedPlanCard: { backgroundColor: 'rgba(255,255,255,0.06)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  bookingCard: { backgroundColor: 'rgba(255,255,255,0.06)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 8 },
  bookingTitle: { color: '#fff', fontWeight: '700' },
  bookingSub: { color: 'rgba(255,255,255,0.8)' },
  bookingActions: { flexDirection: 'row', gap: 8, marginTop: 6 },
  primaryBtn: { backgroundColor: '#00C48C', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  primaryBtnText: { color: '#000', fontWeight: '700' },
  ghostBtn: { borderWidth: 1, borderColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  ghostBtnText: { color: '#fff', fontWeight: '700' },
  successText: { color: '#00C48C', fontWeight: '700', marginTop: 6 },
  commitRow: { flexDirection: 'row', gap: 10 },
});
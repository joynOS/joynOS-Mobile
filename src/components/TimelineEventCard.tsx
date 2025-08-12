import React, { memo, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type TimelineEvent = {
  id: string | number;
  title?: string;
  imageUrl?: string | null;
  venue?: string | null;
  startTime?: string | Date;
  status?: 'attending' | 'interested' | 'attended';
  vibeScore?: number;
  userRating?: number;
  attendees?: number;
  maxAttendees?: number;
};

type Props = {
  event: TimelineEvent;
  onPress: () => void;
  style?: ViewStyle;
};

const formatDateTime = (dt?: string | Date) => {
  if (!dt) return '';
  const d = typeof dt === 'string' ? new Date(dt) : dt;
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const TimelineEventCard: React.FC<Props> = ({ event, onPress, style }) => {
  const title = event.title || 'Untitled Event';
  const venue = event.venue || '';
  const dateLine = useMemo(() => formatDateTime(event.startTime), [event.startTime]);
  const image = event.imageUrl ?? "";
  const statusLabel = event.status === 'attending' ? 'Joined' : event.status === 'interested' ? 'Interested' : 'Attended';
  const vibe = Math.max(70, Math.min(99, Math.floor(event.vibeScore ?? 88)));

  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, style]} activeOpacity={0.88}>
      <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      <LinearGradient colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.85)']} style={styles.overlay} />

      <View style={styles.topRow}>
        <View style={styles.titlePill}>
          <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
          {!!venue && <Text numberOfLines={1} style={styles.venueText}>{venue}</Text>}
        </View>
        <View style={styles.rightChips}>
          <View style={styles.statusChip}><Text style={styles.statusText}>{statusLabel}</Text></View>
          <View style={styles.vibeChip}><Text style={styles.vibeChipText}>{vibe}%</Text></View>
        </View>
      </View>

      <View style={styles.midRow}>
        {!!dateLine && <Text style={styles.dateLine}>{dateLine}</Text>}
      </View>

      <View style={styles.bottomRow}>
        {event.status === 'attended' && typeof event.userRating === 'number' && (
          <View style={styles.ratingRow}>
            <View style={styles.dotsRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <View key={i} style={[styles.dot, i < (event.userRating || 0) ? styles.dotOn : styles.dotOff]} />
              ))}
            </View>
            <Text style={styles.ratedText}>Rated</Text>
          </View>
        )}
        {(typeof event.attendees === 'number' && typeof event.maxAttendees === 'number') && (
          <Text style={styles.peopleText}>{event.attendees}/{event.maxAttendees} people</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default memo(TimelineEventCard);

const styles = StyleSheet.create({
  card: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(40,40,40,1)',
  },
  image: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject },
  topRow: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titlePill: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: '60%',
  },
  titleText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  venueText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  rightChips: { alignItems: 'flex-end', gap: 8 },
  statusChip: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  statusText: { color: '#fff', fontWeight: '700' },
  vibeChip: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  vibeChipText: { color: '#fff', fontWeight: '700' },
  midRow: { position: 'absolute', left: 16, right: 16, top: 90 },
  dateLine: { color: '#fff', fontSize: 18, fontWeight: '700' },
  bottomRow: { position: 'absolute', left: 16, right: 16, bottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotOn: { backgroundColor: '#F2C94C' },
  dotOff: { backgroundColor: 'rgba(255,255,255,0.5)' },
  ratedText: { color: '#fff', fontWeight: '600' },
  peopleText: { color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
});


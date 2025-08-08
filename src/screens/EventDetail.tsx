import React from 'react';
import { View, Text, ImageBackground, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { Badge } from '../components/Badge';

export default function EventDetail() {
  const route = useRoute<RouteProp<RootStackParamList, 'EventDetail'>>();
  const navigation = useNavigation();
  const { id } = route.params;

  const title = `Event #${id}`;
  const imageUrl = `https://source.unsplash.com/random/1200x1600/?nyc,nightlife&sig=${id}`;
  const vibeScore = 80 + (id % 15);
  const vibeText = 'High-energy match based on timing, interests, and location radius.';
  const tags = ['Nightlife', 'NYC', 'Live music', 'Casual'];
  const attendees = Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    avatar: `https://images.unsplash.com/photo-15${(i + 10) * 10}90108755-2616b612b8e5?w=60&h=60&fit=crop&crop=face&sig=${i}`,
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={{ uri: imageUrl }} style={styles.headerImage} imageStyle={styles.headerImageStyle}>
        <View style={styles.headerOverlay} />
        <View style={styles.headerContent}>
          <Badge
            variant="default"
            style={styles.scoreBadge}
            textStyle={styles.scoreBadgeText}
          >
            {vibeScore}%
          </Badge>
          <Text style={styles.title}>{title}</Text>
        </View>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.contentContainer}>
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
          <View style={styles.avatarsRow}>
            {attendees.map((a) => (
              <ImageBackground key={a.id} source={{ uri: a.avatar }} style={styles.avatar} imageStyle={styles.avatarImage} />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footerActions}>
        <TouchableOpacity style={[styles.footerButton, styles.footerButtonGhost]} onPress={() => navigation.goBack()}>
          <Text style={styles.footerButtonText}>Close</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerButton, styles.footerButtonGhost]} onPress={() => {}}>
          <Text style={styles.footerButtonText}>Join now</Text>
        </TouchableOpacity>
      </View>
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
  },
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
});
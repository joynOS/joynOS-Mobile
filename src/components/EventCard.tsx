import React, { useState } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import { Badge } from '../components/Badge';
import type { EventDetail as ApiEvent } from '../types/api';
import { Clock, MapPin } from 'lucide-react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import type { Event } from '../shared/shared'; 


interface EventCardProps {
    event: any | ApiEvent | Event;
    isActive?: boolean;
    onTap?: () => void;
    variant?: 'card' | 'full';
}

export default function EventCard({ event, onTap, variant = 'card' }: EventCardProps) {
    const navigation = useNavigation();
    const tagCount = Array.isArray((event as any).tags) ? (event as any).tags.length : 0;
    const compatibilityScore = (event as any).vibeMatchScoreEvent || Math.max(70, Math.min(95, Math.floor(80 + tagCount * 3)));
    const memberCount = (event as any).interestedCount || Math.floor(Math.random() * 20) + 5;

    const [liked, setLiked] = useState(false);
    const [favorited, setFavorited] = useState(false);

    const handleJoinEvent = () => {
        //navigation.navigate('EventLobby', { eventId: event.id } as never); Sem tela
        console.log('Join event clicked:', event.id); 
    };

    const formatEventTime = (input: any) => {
        const d = new Date(input);
        return d.toLocaleString('en-US', {
            weekday: 'short',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const getCompatibilityColor = (score: number) => {
        if (score >= 67) return '#cc5c24';
        if (score >= 33) return '#22c55e';
        return '#3b82f6';
    };

    const imageUri = (event as any).imageUrl || `https://source.unsplash.com/collection/190727/800x1200?sig=${(event as any).id}`;

    return (
        <View style={[styles.cardContainer, variant === 'full' && styles.cardContainerFull]}>
            <ImageBackground
                source={{ uri: imageUri }}
                style={styles.imageBackground}
                imageStyle={[styles.image, variant === 'full' && styles.imageFull]}
            >
                {/* Gradient Overlay */}
                <View style={styles.gradientOverlay} />

                {/* Content Overlay */}
                <View style={[styles.contentOverlay, variant === 'full' && styles.contentOverlayFull]}>
                    <View style={styles.headerRow}>
                        <View style={[styles.scorePill, { backgroundColor: getCompatibilityColor(compatibilityScore) }]}>
                            <Text style={styles.scorePillText} numberOfLines={1}>
                                {compatibilityScore}%
                            </Text>
                        </View>
                        <Text style={styles.title}>{event.title}</Text>
                    </View>

                    <View style={styles.metaInfo}>
                        <View style={styles.metaItem}>
                            <Clock size={16} color="white" />
                            <Text style={styles.metaText}>{formatEventTime((event as any).startTime)}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <MapPin size={16} color="white" />
                            <Text style={styles.metaText}>
                                {(event as any).venue || (event as any).location?.venue || 'TBD'}
                            </Text>
                        </View>
                    </View>

                    <Text numberOfLines={2} style={styles.description}>
                        {(event as any).description || ''}
                    </Text>

                    {/* Members */}
                    <View style={styles.membersRow}>
                        <View style={styles.avatars}>
                            {((event as any).participants || []).slice(0, 3).map((participant: any, idx: number) => (
                                participant.avatar ? (
                                    <Image
                                        key={participant.id}
                                        source={{ uri: participant.avatar }}
                                        style={styles.avatar}
                                    />
                                ) : (
                                    <View key={participant.id} style={[styles.avatar, styles.avatarInitial]}>
                                        <Text style={styles.avatarInitialText}>
                                            {participant.name?.charAt(0)?.toUpperCase() || '?'}
                                        </Text>
                                    </View>
                                )
                            ))}
                            {memberCount > 3 && (
                                <View style={styles.avatarMore}>
                                    <Text style={styles.avatarMoreText}>+{Math.max(0, memberCount - 3)}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.memberText}>{memberCount} interested</Text>
                    </View>

                    {variant !== 'full' && (
                        <View style={styles.buttonRow}>
                            <Button title="Join Now" onPress={handleJoinEvent} />
                            <Button title="Learn More" onPress={onTap} />
                        </View>
                    )}
                </View>

                {/* Side Actions */}
                <View style={[styles.sideActions, variant === 'full' && styles.sideActionsFull]}>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setLiked((v) => !v)}
                        style={[styles.iconButton, liked && styles.iconButtonActive]}
                    >
                        <AntDesign name={liked ? 'heart' : 'hearto'} size={26} color={liked ? '#EF4444' : '#FFFFFF'} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={async () => {
                            try {
                                await Share.share({
                                    message: `${event.title} — ${event.location?.venue ?? ''}`.trim(),
                                });
                            } catch {}
                        }}
                        style={styles.iconButton}
                    >
                        <Ionicons name="share-social-outline" size={26} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setFavorited((v) => !v)}
                        style={[styles.iconButton, favorited && styles.iconButtonActive]}
                    >
                        <Ionicons name={favorited ? 'bookmark' : 'bookmark-outline'} size={26} color={favorited ? '#F2C94C' : '#FFFFFF'} />
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
        height: 400,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    cardContainerFull: {
        height: '100%',
        borderRadius: 0,
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: '#000',
    },
    image: {
        resizeMode: 'cover',
        backgroundColor: '#111',
    },
    imageFull: {
        // Ensures full-bleed coverage in full variant
        resizeMode: 'cover',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    contentOverlay: {
        padding: 20,
        zIndex: 2,
    },
    contentOverlayFull: {
        paddingBottom: 32,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        color: 'white',
        fontSize: 22,
        fontWeight: '700',
        marginLeft: 12,
        flexShrink: 1,
    },
    scorePill: {
        minWidth: 44,
        height: 28,
        paddingHorizontal: 10,
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scorePillText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '800',
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    metaInfo: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 20,
        marginBottom: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginRight: 16,
    },
    metaText: {
        color: 'white',
        fontSize: 13,
        opacity: 0.9,
    },
    description: {
        color: 'white',
        fontSize: 13,
        opacity: 0.8,
        marginBottom: 16,
    },
    membersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatars: {
        flexDirection: 'row',
        marginRight: 10,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'white',
        marginRight: -8,
    },
    avatarMore: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#7e22ce',
        borderWidth: 2,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -8,
    },
    avatarMoreText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    avatarInitial: {
        backgroundColor: '#7e22ce',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitialText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    memberText: {
        color: 'white',
        opacity: 0.8,
        fontSize: 13,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    sideActions: {
        position: 'absolute',
        right: 16,
        top: '50%',
        transform: [{ translateY: -60 }],
        zIndex: 3,
        alignItems: 'center',
        gap: 12,
    },
    sideActionsFull: {
        top: '45%',
    },
    iconButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconButtonActive: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderColor: 'rgba(255,255,255,0.3)',
    },
});

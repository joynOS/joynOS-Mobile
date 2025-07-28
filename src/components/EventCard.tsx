import React from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import { Badge } from '../components/Badge';
import { Heart, Share2, Bookmark, Clock, MapPin } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import type { Event } from '../shared/shared'; 


interface EventCardProps {
    event: Event;
    isActive?: boolean;
    onTap?: () => void;
}

export default function EventCard({ event, onTap }: EventCardProps) {
    const navigation = useNavigation();
    const compatibilityScore = Math.floor(Math.random() * 20) + 80;
    const memberCount = Math.floor(Math.random() * 20) + 5;

    const handleJoinEvent = () => {
        //navigation.navigate('EventLobby', { eventId: event.id } as never); Sem tela
        console.log('Join event clicked:', event.id); 
    };

    const formatEventTime = (date: Date) => {
        return new Date(date).toLocaleString('en-US', {
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

    return (
        <View style={styles.cardContainer}>
            <ImageBackground
                source={{
                    uri:
                        event.imageUrl ||
                        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=1200&fit=crop',
                }}
                style={styles.imageBackground}
                imageStyle={styles.image}
            >
                {/* Gradient Overlay */}
                <View style={styles.gradientOverlay} />

                {/* Content Overlay */}
                <View style={styles.contentOverlay}>
                    <View style={styles.headerRow}>
                        <Badge
                            variant="default"
                            style={{
                                backgroundColor: getCompatibilityColor(compatibilityScore),
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: 0,
                            }}
                            textStyle={{
                                color: 'white',
                                fontSize: 12,
                                fontWeight: '700',
                            }}
                        >
                            {compatibilityScore}%
                        </Badge>
                        <Text style={styles.title}>{event.title}</Text>
                    </View>

                    <View style={styles.metaInfo}>
                        <View style={styles.metaItem}>
                            <Clock size={16} color="white" />
                            <Text style={styles.metaText}>{formatEventTime(event.startTime)}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <MapPin size={16} color="white" />
                            <Text style={styles.metaText}>
                                {event.location?.venue || 'TBD'}
                            </Text>
                        </View>
                    </View>

                    <Text numberOfLines={2} style={styles.description}>
                        {event.description}
                    </Text>

                    {/* Members */}
                    <View style={styles.membersRow}>
                        <View style={styles.avatars}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b8e5?w=60&h=60&fit=crop&crop=face' }}
                                style={styles.avatar}
                            />
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face' }}
                                style={styles.avatar}
                            />
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face' }}
                                style={styles.avatar}
                            />
                            <View style={styles.avatarMore}>
                                <Text style={styles.avatarMoreText}>+{Math.max(0, memberCount - 3)}</Text>
                            </View>
                        </View>
                        <Text style={styles.memberText}>{memberCount} interested</Text>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <Button title="Join Now" onPress={handleJoinEvent} />
                        <Button title="Learn More" onPress={onTap} />
                    </View>
                </View>

                {/* Side Actions */}
                <View style={styles.sideActions}>
                    {/* <TouchableOpacity style={styles.iconButton}>
                        <Heart size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Share2 size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Bookmark size={20} color="white" />
                    </TouchableOpacity> */}

                    <BlurView style={styles.iconButton}>
                        <Heart size={20} color="white" />
                    </BlurView>
                    <BlurView style={styles.iconButton}>
                        <Share2 size={20} color="white" />
                    </BlurView>
                    <BlurView style={styles.iconButton}>
                        <Bookmark size={20} color="white" />
                    </BlurView>
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
    imageBackground: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    image: {
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
});

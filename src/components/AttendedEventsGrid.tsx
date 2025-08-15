import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { Star, Calendar } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { profileService } from '../services/profile';
import type { AttendedEvent } from '../types/api';

export default function AttendedEventsGrid() {
  const navigation = useNavigation();
  const [events, setEvents] = useState<AttendedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await profileService.getAttendedEvents(cursor);
      
      if (cursor) {
        setEvents(prev => [...prev, ...response.items]);
      } else {
        setEvents(response.items);
      }
      
      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error('Failed to load attended events:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      loadEvents(nextCursor);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    
    return (
      <View className="flex-row gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            color={star <= rating ? '#FFD700' : '#666'}
            fill={star <= rating ? '#FFD700' : 'transparent'}
          />
        ))}
      </View>
    );
  };

  const renderEventCard = ({ item }: { item: AttendedEvent }) => (
    <TouchableOpacity
      onPress={() => (navigation as any).navigate('EventDetail', { id: item.eventId })}
      className="bg-[#121212] rounded-xl overflow-hidden mb-4 mx-2"
      style={{ width: 160 }}
    >
      <Image
        source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4' }}
        className="w-full h-24"
        resizeMode="cover"
      />
      
      <View className="p-3">
        <Text className="text-white text-sm font-semibold mb-1" numberOfLines={2}>
          {item.title}
        </Text>
        
        <View className="flex-row items-center gap-1 mb-2">
          <Calendar size={12} color="#cc5c24" />
          <Text className="text-white/60 text-xs">
            {formatDate(item.startTime)}
          </Text>
        </View>
        
        <Text className="text-white/60 text-xs mb-2" numberOfLines={1}>
          {item.venue}
        </Text>
        
        {(item.myPlaceRating || item.myPlanRating) && (
          <View className="gap-1">
            {item.myPlaceRating && (
              <View className="flex-row items-center gap-2">
                <Text className="text-white/60 text-xs">Place:</Text>
                {renderStars(item.myPlaceRating)}
              </View>
            )}
            {item.myPlanRating && (
              <View className="flex-row items-center gap-2">
                <Text className="text-white/60 text-xs">Plan:</Text>
                {renderStars(item.myPlanRating)}
              </View>
            )}
          </View>
        )}
        
        {!item.myPlaceRating && !item.myPlanRating && (
          <View className="bg-yellow-500/20 px-2 py-1 rounded">
            <Text className="text-yellow-500 text-xs font-medium">
              Needs Review
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="py-8">
        <ActivityIndicator size="large" color="#cc5c24" />
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View className="py-8 items-center">
        <Text className="text-white/60 text-base">No attended events yet</Text>
      </View>
    );
  }

  return (
    <View>
      <View className="flex-row justify-between items-center px-4 mb-4">
        <Text className="text-white text-lg font-semibold">Attended Events</Text>
        <Text className="text-white/60 text-sm">{events.length} events</Text>
      </View>
      
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={events}
        keyExtractor={(item) => item.eventId}
        renderItem={renderEventCard}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          loadingMore ? (
            <View className="justify-center items-center w-16">
              <ActivityIndicator size="small" color="#cc5c24" />
            </View>
          ) : null
        }
      />
    </View>
  );
}
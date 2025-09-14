import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { MapPin, Star } from 'lucide-react-native';
import { profileService } from '../services/profile';
import type { VisitedPlace } from '../types/api';

export default function VisitedPlacesGrid() {
  const [places, setPlaces] = useState<VisitedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await profileService.getVisitedPlaces(cursor);
      
      if (cursor) {
        setPlaces(prev => [...prev, ...response.items]);
      } else {
        setPlaces(response.items);
      }
      
      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error('Failed to load visited places:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      loadPlaces(nextCursor);
    }
  };

  const formatLastVisit = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const renderPlaceCard = ({ item }: { item: VisitedPlace }) => (
    <TouchableOpacity className="bg-[#121212] rounded-xl p-4 mb-4 mx-2" style={{ width: 180 }}>
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-white text-sm font-semibold mb-1" numberOfLines={2}>
            {item.venue}
          </Text>
          <View className="flex-row items-center gap-1">
            <MapPin size={12} color="#cc5c24" />
            <Text className="text-white/60 text-xs flex-1" numberOfLines={1}>
              {item.address}
            </Text>
          </View>
        </View>
      </View>
      
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-1">
          <Star size={12} color="#FFD700" fill="#FFD700" />
          <Text className="text-white text-xs font-medium">
            {item.avgPlaceRating.toFixed(1)}
          </Text>
        </View>
        
        <Text className="text-white/60 text-xs">
          {item.visits} visit{item.visits !== 1 ? 's' : ''}
        </Text>
      </View>
      
      <Text className="text-white/40 text-xs">
        Last: {formatLastVisit(item.lastVisitedAt)}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="py-8">
        <ActivityIndicator size="large" color="#cc5c24" />
      </View>
    );
  }

  if (places.length === 0) {
    return (
      <View className="py-8 items-center">
        <MapPin size={48} color="#666" />
        <Text className="text-white/60 text-base mt-4">No places visited yet</Text>
        <Text className="text-white/40 text-sm text-center mt-2 px-8">
          Start attending events to discover new places
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View className="flex-row justify-between items-center px-4 mb-4">
        <Text className="text-white text-lg font-semibold">Places Visited</Text>
        <Text className="text-white/60 text-sm">{places.length} places</Text>
      </View>
      
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={places}
        keyExtractor={(item, index) => `${item.venue}-${index}`}
        renderItem={renderPlaceCard}
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
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { Users } from 'lucide-react-native';
import { profileService } from '../services/profile';
import type { CircleConnection } from '../types/api';

export default function CircleGrid() {
  const [connections, setConnections] = useState<CircleConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await profileService.getCircle(cursor);
      
      if (cursor) {
        setConnections(prev => [...prev, ...response.items]);
      } else {
        setConnections(response.items);
      }
      
      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error('Failed to load circle connections:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      loadConnections(nextCursor);
    }
  };

  const getMatchColor = (percent: number) => {
    if (percent >= 90) return '#4CAF50';
    if (percent >= 75) return '#8BC34A';
    if (percent >= 60) return '#FFC107';
    return '#FF5722';
  };

  const renderConnectionCard = ({ item }: { item: CircleConnection }) => (
    <TouchableOpacity className="bg-[#121212] rounded-xl overflow-hidden mb-4 mx-2 items-center p-4" style={{ width: 120 }}>
      {item.avatar ? (
        <Image
          source={{ uri: item.avatar }}
          className="w-16 h-16 rounded-full border-2 border-white mb-3"
        />
      ) : (
        <View className="w-16 h-16 rounded-full border-2 border-white bg-[#cc5c24] justify-center items-center mb-3">
          <Text className="text-white text-xl font-semibold">
            {item.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
      )}
      
      <Text className="text-white text-sm font-semibold text-center mb-1" numberOfLines={1}>
        {item.name}
      </Text>
      
      {item.tagline && (
        <Text className="text-white/60 text-xs text-center mb-2" numberOfLines={2}>
          {item.tagline}
        </Text>
      )}
      
      <View 
        className="px-2 py-1 rounded-full"
        style={{ backgroundColor: `${getMatchColor(item.matchPercent)}20` }}
      >
        <Text 
          className="text-xs font-semibold"
          style={{ color: getMatchColor(item.matchPercent) }}
        >
          {item.matchPercent}% match
        </Text>
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

  if (connections.length === 0) {
    return (
      <View className="py-8 items-center">
        <Users size={48} color="#666" />
        <Text className="text-white/60 text-base mt-4">No connections yet</Text>
        <Text className="text-white/40 text-sm text-center mt-2 px-8">
          Connect with people at events to build your circle
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View className="flex-row justify-between items-center px-4 mb-4">
        <Text className="text-white text-lg font-semibold">Your Circle</Text>
        <Text className="text-white/60 text-sm">{connections.length} connections</Text>
      </View>
      
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={connections}
        keyExtractor={(item) => item.userId}
        renderItem={renderConnectionCard}
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
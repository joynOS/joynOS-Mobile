import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { profileService } from '../services/profile';
import type { ProfileSummary as ProfileSummaryType } from '../types/api';

export default function ProfileSummary() {
  const [summary, setSummary] = useState<ProfileSummaryType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await profileService.getSummary();
      setSummary(data);
    } catch (error) {
      console.error('Failed to load profile summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !summary) {
    return (
      <View className="flex-row justify-center items-center py-6">
        <Text className="text-white/60 text-base">Loading...</Text>
      </View>
    );
  }

  const commitPercentage = Math.round(summary.commitScore * 100);

  return (
    <View className="flex-row justify-center items-center py-6 px-4">
      <View className="flex-1 items-center">
        <Text className="text-white text-2xl font-bold">{summary.eventsCount}</Text>
        <Text className="text-white/60 text-sm font-medium">Events</Text>
      </View>
      
      <View className="flex-1 items-center">
        <Text className="text-white text-2xl font-bold">{summary.circleCount}</Text>
        <Text className="text-white/60 text-sm font-medium">Circle</Text>
      </View>
      
      <View className="flex-1 items-center">
        <Text className="text-white text-2xl font-bold">{commitPercentage}%</Text>
        <Text className="text-white/60 text-sm font-medium">Commit</Text>
      </View>
    </View>
  );
}
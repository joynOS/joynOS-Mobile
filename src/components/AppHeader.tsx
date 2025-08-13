import React from 'react';
import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { User, ArrowUpDown } from 'lucide-react-native';

type Props = {
  logoUri?: string;
  activeTab: 'Timeline' | 'Feed' | 'Discovery';
  onTabPress: (tab: 'Timeline' | 'Feed' | 'Discovery') => void;
  onProfilePress: () => void;
  sortBy: 'date' | 'activity';
  onSortToggle: () => void;
};
const AppHeader: React.FC<Props> = ({
  logoUri,
  activeTab,
  onTabPress,
  onProfilePress,
  sortBy,
  onSortToggle
}) => {
  return (
    <View className="absolute top-0 left-0 right-0 z-20 px-4 pt-12 pb-4 bg-gradient-to-b from-black/40 to-transparent">
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <Image
            source={require("../../assets/JoynOS_Logo.png")}
            className="w-7 h-7 rounded-md mr-3"
          />
          
          <View className="flex-row items-center bg-white/10 rounded-xl overflow-hidden">
            {['Timeline', 'Feed', 'Discovery'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => onTabPress(tab as any)}
                className={`px-3 py-1.5 ${
                  activeTab === tab 
                    ? 'bg-white/20 border border-white/20 rounded-xl' 
                    : ''
                }`}
              >
                <Text className={`text-xs font-medium ${
                  activeTab === tab ? 'text-white' : 'text-white/80'
                }`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={onProfilePress}
          className="w-8 h-8 rounded-lg justify-center items-center border border-white/10 bg-transparent"
        >
          <User size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View className="items-center mb-4">
        <TouchableOpacity
          onPress={onSortToggle}
          className="flex-row items-center px-4 py-2 bg-white/10 rounded-full border border-white/10"
        >
          <ArrowUpDown size={14} color="white" />
          <Text className="text-white/90 text-sm font-medium ml-2">
            Sort by {sortBy === 'date' ? 'Date' : 'Activity'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AppHeader;
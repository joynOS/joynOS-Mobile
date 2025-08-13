import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Grid3X3, UserCheck, Bookmark, Heart, Search } from 'lucide-react-native';

type FilterType = 'all' | 'joined' | 'saved' | 'liked';

type Props = {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onSearchToggle: () => void;
  isSearchOpen: boolean;
  searchQuery: string;
};

const FloatingFilters: React.FC<Props> = ({ 
  activeFilter, 
  onFilterChange, 
  onSearchToggle, 
  isSearchOpen, 
  searchQuery 
}) => {
  return (
    <View className="absolute right-4 top-1/2 -translate-y-32 flex-col items-center gap-3">
      <TouchableOpacity
        onPress={() => onFilterChange('all')}
        className={`w-10 h-10 rounded-lg justify-center items-center border border-white/10 ${
          activeFilter === 'all' ? 'bg-white/20' : 'bg-white/5'
        }`}
      >
        <Grid3X3 size={20} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onFilterChange('joined')}
        className={`w-10 h-10 rounded-lg justify-center items-center border ${
          activeFilter === 'joined' 
            ? 'border-green-500/30 bg-green-500/20' 
            : 'border-white/10 bg-white/5'
        }`}
      >
        <UserCheck size={20} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onFilterChange('saved')}
        className={`w-10 h-10 rounded-lg justify-center items-center border ${
          activeFilter === 'saved' 
            ? 'border-yellow-500/30 bg-yellow-500/20' 
            : 'border-white/10 bg-white/5'
        }`}
      >
        <Bookmark size={20} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onFilterChange('liked')}
        className={`w-10 h-10 rounded-lg justify-center items-center border ${
          activeFilter === 'liked' 
            ? 'border-purple-500/30 bg-purple-500/20' 
            : 'border-white/10 bg-white/5'
        }`}
      >
        <Heart size={20} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSearchToggle}
        className={`w-10 h-10 rounded-lg justify-center items-center border ${
          isSearchOpen || searchQuery 
            ? 'border-blue-500/30 bg-blue-500/20' 
            : 'border-white/10 bg-white/5'
        }`}
      >
        <Search size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default FloatingFilters;
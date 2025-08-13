import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  placeholder?: string;
};

const SearchInput: React.FC<Props> = ({ 
  value, 
  onChangeText, 
  onClose, 
  placeholder = "Search events..." 
}) => {
  return (
    <View className="absolute top-14 left-4 right-4 z-30">
      <View className="relative flex-row items-center">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.6)"
          className="flex-1 h-12 pl-12 pr-12 bg-black/80 border border-white/20 rounded-2xl text-white text-base"
          autoFocus
        />
        <Search 
          size={20} 
          color="rgba(255,255,255,0.6)" 
          className="absolute left-4"
        />
        <TouchableOpacity
          onPress={onClose}
          className="absolute right-2 w-8 h-8 rounded-lg justify-center items-center"
        >
          <X size={16} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchInput;
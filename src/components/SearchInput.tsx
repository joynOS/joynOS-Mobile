import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Search, X } from "lucide-react-native";
import { BlurView } from "expo-blur";

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
  placeholder = "Search events...",
}) => {
  return (
    <View className="absolute top-14 left-4 right-4 z-30">
      <View className="relative">
        <BlurView
          intensity={14}
          tint="dark"
          className="rounded-2xl overflow-hidden bg-black/40 border border-white/20"
        >
          <View className="relative flex-row items-center px-6 py-3">
            <Search
              size={20}
              color="rgba(255,255,255,0.6)"
              style={{
                position: "absolute",
                left: 20,
                zIndex: 1,
              }}
            />
            <TextInput
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor="rgba(255,255,255,0.6)"
              className="flex-1 pl-10 pr-10 py-1 bg-transparent text-white text-base"
              autoFocus
            />
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-2 w-8 h-8 rounded-lg justify-center items-center hover:bg-white/10"
            >
              <X size={16} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </View>
  );
};

export default SearchInput;

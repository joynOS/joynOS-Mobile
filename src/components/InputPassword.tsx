import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ViewStyle } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputPasswordProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export default function InputPassword({ 
  value, 
  onChangeText, 
  placeholder = "Enter password",
  style 
}: InputPasswordProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="bg-white/10 border border-white/20 rounded-lg relative" style={style}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        secureTextEntry={!showPassword}
        textAlignVertical="center"
        className="h-14 px-4 pr-12 text-white text-base"
      />
      <TouchableOpacity
        onPress={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-1/2 -translate-y-2.5 w-5 h-5 justify-center items-center"
      >
        {showPassword ? (
          <EyeOff size={20} color="rgba(255,255,255,0.6)" />
        ) : (
          <Eye size={20} color="rgba(255,255,255,0.6)" />
        )}
      </TouchableOpacity>
    </View>
  );
}
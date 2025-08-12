import React from "react";
import { TextInput, TextInputProps } from "react-native";

export const Input: React.FC<TextInputProps> = (props) => {
  return (
    <TextInput
      className="bg-white/10 border border-white/20 rounded-lg h-14 px-4 text-white text-base"
      placeholderTextColor="rgba(255, 255, 255, 0.5)"
      textAlignVertical="center"
      {...props}
    />
  );
};

export default Input;

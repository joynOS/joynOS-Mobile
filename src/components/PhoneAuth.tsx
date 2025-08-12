import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import CountrySelector, { defaultCountry } from './CountrySelector';

interface PhoneAuthProps {
  phone: string;
  setPhone: (value: string) => void;
  onRequestPhone: (phone: string) => Promise<void>;
  onVerifyPhone: (phone: string, code: string, name?: string) => Promise<void>;
  onBack: () => void;
}

const PhoneAuth = ({
  phone,
  setPhone,
  onRequestPhone,
  onVerifyPhone,
  onBack,
}: PhoneAuthProps) => {
  const [requested, setRequested] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);

  return (
    <>
      {!requested ? (
        <>
          <Text className="text-white text-base text-center mb-4">Enter your phone number</Text>
          
          <View className="flex-row gap-3 mb-4">
            <CountrySelector
              selectedCountry={selectedCountry}
              onSelect={setSelectedCountry}
            />
            <View className="flex-1">
              <TextInput
                className="bg-white/10 border border-white/20 rounded-lg h-14 px-4 text-white text-base"
                placeholder="Phone number"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                textAlignVertical="center"
              />
            </View>
          </View>
          <TouchableOpacity
            className="bg-green-500 py-4 rounded-lg items-center mb-3"
            onPress={async () => {
              setLoading(true);
              try {
                const fullPhone = selectedCountry.dialCode + phone;
                await onRequestPhone(fullPhone);
                setRequested(true);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || !phone}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? "Sending…" : "Send Verification Code"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-3 items-center" onPress={onBack}>
            <Text className="text-white/60 text-sm">Back to other options</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text className="text-white text-base text-center mb-4">Enter the code sent to your phone</Text>
          <TextInput
            className="bg-white/10 border border-white/20 rounded-lg h-14 px-4 text-white text-base mb-4"
            placeholder="4-digit code"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
            textAlignVertical="center"
          />
          <Text className="text-white text-base text-center mb-2">
            Your name (optional)
          </Text>
          <TextInput
            className="bg-white/10 border border-white/20 rounded-lg h-14 px-4 text-white text-base mb-4"
            placeholder="Your name"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={name}
            onChangeText={setName}
            textAlignVertical="center"
          />
          <TouchableOpacity
            className="bg-green-500 py-4 rounded-lg items-center mb-3"
            onPress={async () => {
              setLoading(true);
              try {
                const fullPhone = selectedCountry.dialCode + phone;
                await onVerifyPhone(fullPhone, code, name || undefined);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || code.length === 0}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? "Verifying…" : "Verify & Continue"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="py-3 items-center"
            onPress={() => setRequested(false)}
          >
            <Text className="text-white/60 text-sm">Change phone number</Text>
          </TouchableOpacity>
        </>
      )}
    </>
  );
};


export default PhoneAuth;

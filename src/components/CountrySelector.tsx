import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native';
import { ChevronDown, Search } from 'lucide-react-native';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

const countries: Country[] = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', dialCode: '+51', flag: '🇵🇪' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
];

interface CountrySelectorProps {
  selectedCountry: Country;
  onSelect: (country: Country) => void;
}

export default function CountrySelector({ selectedCountry, onSelect }: CountrySelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery)
  );

  const handleSelect = (country: Country) => {
    onSelect(country);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-white/10 border border-white/20 rounded-lg px-3 py-4 flex-row items-center justify-between min-w-[100px]"
      >
        <View className="flex-row items-center">
          <Text className="text-lg mr-2">{selectedCountry.flag}</Text>
          <Text className="text-white text-base">{selectedCountry.dialCode}</Text>
        </View>
        <ChevronDown size={16} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black">
          <View className="px-4 py-6 border-b border-white/10">
            <Text className="text-white text-xl font-bold text-center mb-4">Select Country</Text>
            
            <View className="bg-white/10 border border-white/20 rounded-lg flex-row items-center px-3">
              <Search size={20} color="rgba(255,255,255,0.6)" />
              <TextInput
                className="flex-1 h-12 px-3 text-white text-base"
                placeholder="Search countries..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                textAlignVertical="center"
              />
            </View>
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                className="px-4 py-4 border-b border-white/5 flex-row items-center"
              >
                <Text className="text-2xl mr-3">{item.flag}</Text>
                <View className="flex-1">
                  <Text className="text-white text-base font-medium">{item.name}</Text>
                  <Text className="text-white/60 text-sm">{item.dialCode}</Text>
                </View>
                {selectedCountry.code === item.code && (
                  <View className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />

          <View className="p-4 border-t border-white/10">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-white/10 border border-white/20 rounded-lg py-3"
            >
              <Text className="text-white text-center text-base font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

export const defaultCountry: Country = {
  code: 'US',
  name: 'United States',
  dialCode: '+1',
  flag: '🇺🇸'
};
import React from 'react';
import Slider from '@react-native-community/slider';
import { View, StyleSheet } from 'react-native';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function DistanceSlider({ value, onChange }: Props) {
  return (
    <View>
      <Slider
        style={{ width: '100%' }}
        minimumValue={1}
        maximumValue={50}
        step={1}
        minimumTrackTintColor="#00C48C"
        maximumTrackTintColor="#666"
        thumbTintColor="#00C48C"
        value={value}
        onValueChange={onChange}
      />
    </View>
  );
}

export default DistanceSlider;
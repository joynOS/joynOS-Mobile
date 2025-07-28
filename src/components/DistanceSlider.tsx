import React from 'react';
import Slider from '@react-native-community/slider';
import { View, StyleSheet } from 'react-native';


interface Props {
  value: number | number[];
  onChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
}


// interface Props {
//     //value: number;
//     value: number | number[];
//     onChange: (value: number) => void;
// }

export function DistanceSlider({ value, onChange }: Props) {
    const normalizedValue = Array.isArray(value) ? value[0] : value;

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
                value={normalizedValue}
                onValueChange={onChange}
            />
        </View>
    );
}

export default DistanceSlider;
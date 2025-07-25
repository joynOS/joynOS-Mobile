import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

type SpinnerSize = 'sm' | 'md' | 'lg';

const sizeMap = {
  sm: 20,
  md: 36,
  lg: 56,
};

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: string;
}

const LoadingSpinner = ({ size = 'md', color = '#1EC28B' }: LoadingSpinnerProps) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={sizeMap[size]} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingSpinner;

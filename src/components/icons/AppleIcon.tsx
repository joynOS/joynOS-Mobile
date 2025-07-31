import React from 'react';
import { View, Image } from 'react-native';

const AppleIcon = () => (
  <View style={{ marginRight: 8 }}>
    <Image
      source={require('../../../assets/apple1.png')}
      style={{ width: 20, height: 20, tintColor: 'white' }}
      resizeMode="contain"
    />
  </View>
);

export default AppleIcon;
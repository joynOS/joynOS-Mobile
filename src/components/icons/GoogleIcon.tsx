import React from 'react';
import { View, Image } from 'react-native';

const GoogleIcon = () => (
  <View style={{ marginRight: 8 }}>
    <Image
      source={require('../../../assets/google1.png')}
      style={{ width: 20, height: 20, tintColor: 'white' }}
      resizeMode="contain"
    />
  </View>
);

export default GoogleIcon;
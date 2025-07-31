import React from 'react';
import { View, Image } from 'react-native';

const FacebookIcon = () => (
  <View style={{ marginRight: 8 }}>
    <Image
      source={require('../../../assets/facebook2.png')}
      style={{ width: 25, height: 25, tintColor: 'white' }}
      resizeMode="contain"
    />
  </View>
);

export default FacebookIcon;